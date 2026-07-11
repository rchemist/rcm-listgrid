// EA-B fan-out — TelephoneNumberFieldRenderer integration test (PART C
// §TelephoneNumber). Real DOM render through EntityForm → createFormStore →
// provider stack (field-a11y/time-field pattern), registering ONLY the
// 'telephoneNumber' renderer directly here (default-renderers.tsx untouched
// — fan-out contract).
//
// Covers the field's distinctive old-engine behavior (Conductor decision
// ⑥): store value is ALWAYS digits-only (renderer strips hyphens before
// write), display is formatted every render, intermediate keystrokes write
// with `{cascade:false}` (asserted via an onChanges spy that must stay
// empty through intermediate changes and fire exactly once on blur — same
// oracle shape as color-field.test.tsx's onChangeEnd parity test), and a
// mount-time fetched/hydrated value is NOT hyphen-normalized (round-trip
// preserved).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EntityForm, TelephoneNumberValidation, type FormMutator } from '@listgrid/schema-core';
// TelephoneNumberField isn't exported from the schema-core barrel yet
// (barrel edits are the orchestrator's job — fan-out contract); import the
// class directly from its source file (a straight relative path, not a
// package subpath import — @listgrid/schema-core's package.json `exports`
// map only publishes ".").
import { TelephoneNumberField } from '../../../schema-core/src/field/telephone-number-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { TelephoneNumberFieldRenderer } from '../registry/telephone-number-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('telephoneNumber', TelephoneNumberFieldRenderer);

function widgetForm(options?: {
  onChangesSpy?: (changedField: string) => void;
  defaultValue?: string;
  withValidation?: boolean;
}): EntityForm {
  const field = new TelephoneNumberField(
    'phone',
    1,
    options?.withValidation ? [new TelephoneNumberValidation()] : undefined,
  ).withLabel('Phone');
  if (options?.defaultValue !== undefined) field.withDefaultValue(options.defaultValue);
  const form = new EntityForm('WidgetEntityForm', '/widget').addFields({ items: [field] });
  if (options?.onChangesSpy) {
    form.onChange((_m: FormMutator, changedField: string) => options.onChangesSpy!(changedField));
  }
  return form;
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

describe('TelephoneNumberFieldRenderer — basic wiring', () => {
  it('renders a text input labeled, displaying the formatted (hyphenated) value from a digits-only default', async () => {
    const { store } = renderForm(widgetForm({ defaultValue: '01012345678' }));
    const input = (await screen.findByLabelText(/^Phone/)) as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'text');
    expect(input.value).toBe('010-1234-5678');
    // the store itself stays digits-only (conductor decision ⑥).
    expect(store.getState().fields.phone.default).toBe('01012345678');
  });

  it('does NOT normalize a hyphenated mount-time value — the raw store value round-trips untouched, only the display is formatted', async () => {
    const { store } = renderForm(widgetForm({ defaultValue: '010-1234-5678' }));
    const input = (await screen.findByLabelText(/^Phone/)) as HTMLInputElement;
    // display formats to the same hyphenated string (formatPhoneNumber is
    // idempotent on already-formatted input) ...
    expect(input.value).toBe('010-1234-5678');
    // ... but the underlying store slice was never rewritten to strip it.
    expect(store.getState().fields.phone.default).toBe('010-1234-5678');
    expect(store.getState().fields.phone.current).toBe('010-1234-5678');
  });

  it('forwards required/invalid/describedBy a11y attributes', async () => {
    const field = new TelephoneNumberField('phone', 1).withLabel('Phone').withRequired(true);
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({ items: [field] });
    renderForm(form);
    const input = await screen.findByLabelText(/^Phone/);
    await vi.waitFor(() => expect(input).toHaveAttribute('aria-required', 'true'));

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    await vi.waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(input.getAttribute('aria-describedby')).toBe('phone-error');
  });
});

describe('TelephoneNumberFieldRenderer — store write is always digits-only', () => {
  it('typing a hyphenated-looking value strips hyphens before writing to the store, and the input displays the reformatted value', async () => {
    const { store } = renderForm(widgetForm());
    const input = (await screen.findByLabelText(/^Phone/)) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '010-1234-5678' } });

    expect(store.getState().fields.phone.current).toBe('01012345678');
    expect(input.value).toBe('010-1234-5678');
  });

  it('truncates input to 11 digits (old renderer parity, TelephoneNumberField.tsx:66)', async () => {
    const { store } = renderForm(widgetForm());
    const input = (await screen.findByLabelText(/^Phone/)) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '0101234567890000' } });

    expect(store.getState().fields.phone.current).toBe('01012345678');
  });
});

describe('TelephoneNumberFieldRenderer — cascade parity (Birthday-same pattern, Conductor decision ⑥)', () => {
  it('writes the live value on every keystroke but suppresses the onChanges cascade until blur', async () => {
    const calls: string[] = [];
    const { store } = renderForm(widgetForm({ onChangesSpy: (f) => calls.push(f) }));
    const input = (await screen.findByLabelText(/^Phone/)) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '010' } });
    expect(store.getState().fields.phone.current).toBe('010');
    expect(calls).toEqual([]);

    fireEvent.change(input, { target: { value: '01012345678' } });
    expect(store.getState().fields.phone.current).toBe('01012345678');
    expect(calls).toEqual([]);

    // blur commits — cascade fires exactly once.
    fireEvent.blur(input);
    expect(calls).toEqual(['phone']);
    expect(store.getState().fields.phone.current).toBe('01012345678');
  });

  it('a blur with no prior change still commits (dispatches) once', async () => {
    const calls: string[] = [];
    const { store } = renderForm(
      widgetForm({ onChangesSpy: (f) => calls.push(f), defaultValue: '01012345678' }),
    );
    const input = await screen.findByLabelText(/^Phone/);

    fireEvent.blur(input);
    expect(calls).toEqual(['phone']);
    expect(store.getState().fields.phone.current).toBe('01012345678');
  });
});

describe('TelephoneNumberFieldRenderer — TelephoneNumberValidation reuse (save-time)', () => {
  it('an invalid digits-only value fails validation at save time when TelephoneNumberValidation is attached', async () => {
    const { store } = renderForm(widgetForm({ withValidation: true }));
    const input = (await screen.findByLabelText(/^Phone/)) as HTMLInputElement;
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.blur(input);
    fireEvent.click(saveButton);

    await vi.waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(document.getElementById('phone-error')).toHaveTextContent(
      '전화번호 형식이 올바르지 않습니다',
    );
    expect(store.getState().fields.phone.current).toBe('123');
  });

  it('a valid 11-digit value passes validation and reaches onSave', async () => {
    const field = new TelephoneNumberField('phone', 1, [new TelephoneNumberValidation()]).withLabel(
      'Phone',
    );
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({ items: [field] });
    const onSave = vi.fn();
    const store = createFormStore(form);
    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={form} store={store} onSave={onSave} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );
    const input = await screen.findByLabelText(/^Phone/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(input, { target: { value: '01012345678' } });
    fireEvent.blur(input);
    fireEvent.click(saveButton);

    await vi.waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});
