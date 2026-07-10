// EA-B fan-out — DatetimeFieldRenderer integration test (PART C §Datetime).
// Real DOM render through EntityForm → createFormStore → provider stack
// (field-a11y pattern), registering ONLY the 'datetime' renderer directly
// here (default-renderers.tsx untouched — fan-out contract; it currently
// still has the 'datetime' → DateRenderer placeholder, swapped by the
// orchestrator, not by this test). Covers the field's distinctive old-engine
// behavior called out in the briefing's pitfalls: the `'today'` sentinel is
// resolved to the current formatted date/time AT RENDER TIME, renderer-side
// (Conductor decision ⑦), for both the plain and `range` shapes — and that
// user edits write real datetime-local values (or tuples) through the store,
// never React state.

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
// DatetimeField isn't exported from the schema-core barrel yet (barrel edits
// are the orchestrator's job — fan-out contract); import the class directly
// from its source file (a straight relative path, not a package subpath
// import — @listgrid/schema-core's package.json `exports` map only publishes
// ".").
import { DatetimeField } from '../../../schema-core/src/field/datetime-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { DatetimeFieldRenderer } from '../registry/datetime-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('datetime', DatetimeFieldRenderer);

function meetingForm(opts: { range?: boolean; defaultValue?: string } = {}): EntityForm {
  const field = new DatetimeField('startAt', 1, undefined, opts.range).withLabel('Start At');
  if (opts.defaultValue !== undefined) field.withDefaultValue(opts.defaultValue);
  return new EntityForm('MeetingEntityForm', '/meeting').addFields({ items: [field] });
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

describe('DatetimeFieldRenderer — plain (non-range) input', () => {
  it('renders a native datetime-local input and writes a user edit through the store (never React state)', async () => {
    const { store } = renderForm(meetingForm());
    const input = (await screen.findByLabelText(/^Start At/)) as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'datetime-local');

    fireEvent.change(input, { target: { value: '2026-08-01T10:15' } });

    expect(input.value).toBe('2026-08-01T10:15');
    expect(store.getState().fields.startAt.current).toBe('2026-08-01T10:15');
  });
});

describe("DatetimeFieldRenderer — 'today' sentinel resolution (renderer-side, Conductor decision ⑦)", () => {
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

  it('a stored "today" value displays as the current date/time (T-separated), not the literal string', async () => {
    renderForm(meetingForm({ defaultValue: 'today' }));
    const input = (await screen.findByLabelText(/^Start At/)) as HTMLInputElement;
    expect(input.value).toBe('2026-07-11T09:05');
  });

  it('the store slice itself still holds the literal "today" sentinel (only the DISPLAY resolves)', async () => {
    const { store } = renderForm(meetingForm({ defaultValue: 'today' }));
    await screen.findByLabelText(/^Start At/);
    expect(store.getState().fields.startAt.current ?? store.getState().fields.startAt.default).toBe(
      'today',
    );
  });

  it('range=true resolves "today" to [today, tomorrow] (verified against the real DatetimeField.tsx:27-41 — the range branch source builds a SPACE-separated string ("yyyy-MM-dd HH:mm"), unlike the single-value branch\'s "T"-separated one; the datetime-renderer preserves that discrepancy verbatim (faithful transplant), but the native datetime-local input\'s value-sanitization algorithm (jsdom + real browsers alike) normalizes the separator to "T" on assignment, so the DOM-observable value is "T"-separated either way — asserted here against that normalized value)', async () => {
    renderForm(meetingForm({ range: true, defaultValue: 'today' }));
    const startInput = (await screen.findByLabelText(/^Start At/)) as HTMLInputElement;
    const endInput = (await screen.findByLabelText('종료 일시')) as HTMLInputElement;
    expect(startInput.value).toBe('2026-07-11T09:05');
    expect(endInput.value).toBe('2026-07-12T09:05');
  });
});

describe('DatetimeFieldRenderer — range mode editing', () => {
  it('editing the start input preserves the end value in the written tuple; editing end preserves start', async () => {
    const { store } = renderForm(meetingForm({ range: true }));
    const startInput = (await screen.findByLabelText(/^Start At/)) as HTMLInputElement;
    const endInput = (await screen.findByLabelText('종료 일시')) as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2026-08-01T08:00' } });
    expect(store.getState().fields.startAt.current).toEqual(['2026-08-01T08:00', '']);

    fireEvent.change(endInput, { target: { value: '2026-08-02T17:30' } });
    expect(store.getState().fields.startAt.current).toEqual([
      '2026-08-01T08:00',
      '2026-08-02T17:30',
    ]);
  });
});
