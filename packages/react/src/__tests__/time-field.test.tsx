// EA-A fan-out — TimeFieldRenderer integration test (PART 2 §Time). Real DOM
// render through EntityForm → createFormStore → provider stack (field-a11y
// pattern), registering ONLY the 'time' renderer directly here
// (default-renderers.tsx untouched — fan-out contract). Covers the field's
// distinctive old-engine behavior called out in the briefing's pitfalls: the
// `'now'` sentinel is resolved to the current formatted time AT RENDER TIME,
// renderer-side (Conductor decision ⑤), for both the plain and `range` shapes
// — and that user edits write real HH:mm values (or tuples) through the
// store, never React state.

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
// TimeField isn't exported from the schema-core barrel yet (barrel edits are
// the orchestrator's job — fan-out contract); import the class directly from
// its source file (a straight relative path, not a package subpath import —
// @listgrid/schema-core's package.json `exports` map only publishes ".").
import { TimeField } from '../../../schema-core/src/field/time-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { TimeFieldRenderer } from '../registry/time-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('time', TimeFieldRenderer);

function shiftForm(opts: { range?: boolean; defaultValue?: string } = {}): EntityForm {
  const field = new TimeField('startTime', 1, undefined, opts.range).withLabel('Start Time');
  if (opts.defaultValue !== undefined) field.withDefaultValue(opts.defaultValue);
  return new EntityForm('ShiftEntityForm', '/shift').addFields({ items: [field] });
}

function renderForm(entityForm: EntityForm) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('TimeFieldRenderer — plain (non-range) input', () => {
  it('renders a native time input and writes a user edit through the store (never React state)', async () => {
    const { store } = renderForm(shiftForm());
    const input = (await screen.findByLabelText(/^Start Time/)) as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'time');

    fireEvent.change(input, { target: { value: '10:15' } });

    expect(input.value).toBe('10:15');
    expect(store.getState().fields.startTime.current).toBe('10:15');
  });
});

describe("TimeFieldRenderer — 'now' sentinel resolution (renderer-side, Conductor decision ⑤)", () => {
  beforeEach(() => {
    // Fake ONLY Date (not setTimeout/MutationObserver) — testing-library's
    // findBy*/waitFor helpers poll on real timers, so a full
    // vi.useFakeTimers() would deadlock them.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 6, 11, 9, 5, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a stored "now" value displays as the current HH:mm, not the literal string', async () => {
    renderForm(shiftForm({ defaultValue: 'now' }));
    const input = (await screen.findByLabelText(/^Start Time/)) as HTMLInputElement;
    expect(input.value).toBe('09:05');
  });

  it('the store slice itself still holds the literal "now" sentinel (only the DISPLAY resolves)', async () => {
    const { store } = renderForm(shiftForm({ defaultValue: 'now' }));
    await screen.findByLabelText(/^Start Time/);
    expect(
      store.getState().fields.startTime.current ?? store.getState().fields.startTime.default,
    ).toBe('now');
  });

  it('range=true resolves "now" to [now, now+12h] (verified against the real getFormattedTime(new Date(), 12) call — the 2nd arg is hourOffset, not minutes)', async () => {
    renderForm(shiftForm({ range: true, defaultValue: 'now' }));
    const startInput = (await screen.findByLabelText(/^Start Time/)) as HTMLInputElement;
    const endInput = (await screen.findByLabelText('종료 시각')) as HTMLInputElement;
    expect(startInput.value).toBe('09:05');
    expect(endInput.value).toBe('21:05');
  });
});

describe('TimeFieldRenderer — range mode editing', () => {
  it('editing the start input preserves the end value in the written tuple; editing end preserves start', async () => {
    const { store } = renderForm(shiftForm({ range: true }));
    const startInput = (await screen.findByLabelText(/^Start Time/)) as HTMLInputElement;
    const endInput = (await screen.findByLabelText('종료 시각')) as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '08:00' } });
    expect(store.getState().fields.startTime.current).toEqual(['08:00', '']);

    fireEvent.change(endInput, { target: { value: '17:30' } });
    expect(store.getState().fields.startTime.current).toEqual(['08:00', '17:30']);
  });
});
