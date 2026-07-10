// Birthday renderer — JSDOM render test (EA-B fan-out,
// ea-b-scout-briefing.md PART C §Birthday). Registers BirthdayFieldRenderer
// directly (default-renderers.tsx is off-limits to fan-out agents), then
// drives the real provider stack (UIProvider → AuthProvider →
// FormStoreProvider → ViewEntityForm), same harness style as
// field-a11y.test.tsx / month-field.test.tsx.
//
// Distinctive pitfall under test (briefing PART A / EA-B0 seam): intermediate
// keystrokes commit via `setValue(name, v, { cascade: false })` — old
// commit=false/propagation=false parity — while blur commits with the
// default (cascading) `setValue`. A `withOnChanges` spy handler proves the
// cascade is actually skipped mid-typing and actually fires on blur, not
// just that the store value looks right.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
// BirthdayField is imported directly from its declaring module rather than
// the @listgrid/schema-core barrel: index.ts export wiring for fan-out field
// classes is the orchestrator's job (manifest-driven), not this agent's — see
// task hard rules ("Do NOT edit ... index.ts").
import { BirthdayField } from '../../../schema-core/src/field/birthday-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { BirthdayFieldRenderer } from '../registry/birthday-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('birthday', BirthdayFieldRenderer);

function birthdayForm(includeHyphen = false, required = false): EntityForm {
  const field = new BirthdayField('birthDate', 100, includeHyphen).withLabel('Birth Date');
  if (required) field.withRequired(true);
  return new EntityForm('StudentEntityForm', '/student').addFields({ items: [field] });
}

function renderForm(entityForm: EntityForm, onSave = vi.fn()) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store, onSave };
}

describe('BirthdayFieldRenderer (JSDOM render)', () => {
  it('renders a raw numeric text input, labeled, maxLength 10', async () => {
    renderForm(birthdayForm());
    const input = await screen.findByLabelText(/^Birth Date/);
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('maxlength', '10');
  });

  it('typing 8 digits live-masks to YYYY-MM-DD and stores digits-only when includeHyphen=false', async () => {
    const { store } = renderForm(birthdayForm(false));
    const input = await screen.findByLabelText(/^Birth Date/);

    fireEvent.change(input, { target: { value: '19900101' } });

    expect((input as HTMLInputElement).value).toBe('1990-01-01');
    await waitFor(() => expect(store.getState().getValue('birthDate')).toBe('19900101'));
  });

  it('stores YYYY-MM-DD (hyphenated) when includeHyphen=true', async () => {
    const { store } = renderForm(birthdayForm(true));
    const input = await screen.findByLabelText(/^Birth Date/);

    fireEvent.change(input, { target: { value: '19900101' } });

    expect((input as HTMLInputElement).value).toBe('1990-01-01');
    await waitFor(() => expect(store.getState().getValue('birthDate')).toBe('1990-01-01'));
  });

  it('non-digit characters are stripped and input is truncated to 8 digits', async () => {
    const { store } = renderForm(birthdayForm(false));
    const input = await screen.findByLabelText(/^Birth Date/);

    fireEvent.change(input, { target: { value: '1990a01b01extra' } });

    expect((input as HTMLInputElement).value).toBe('1990-01-01');
    await waitFor(() => expect(store.getState().getValue('birthDate')).toBe('19900101'));
  });

  it('backspace right after a hyphen deletes the hyphen + preceding digit together', async () => {
    const { store } = renderForm(birthdayForm(false));
    const input = (await screen.findByLabelText(/^Birth Date/)) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '199001' } }); // -> displayValue "1990-01"
    expect(input.value).toBe('1990-01');

    input.setSelectionRange(5, 5); // cursor right after the hyphen (index 4)
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(input.value).toBe('1990-0');
    await waitFor(() => expect(store.getState().getValue('birthDate')).toBe('19900'));
  });

  it('shows a Korean validation message for an out-of-range month, cleared once corrected', async () => {
    renderForm(birthdayForm(false));
    const input = await screen.findByLabelText(/^Birth Date/);

    fireEvent.change(input, { target: { value: '199013' } }); // month=13
    expect(screen.getByRole('alert')).toHaveTextContent('올바른 월을 입력해 주세요 (01~12)');

    fireEvent.change(input, { target: { value: '199012' } }); // month=12, valid so far
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('EA-B0 seam: intermediate typing does NOT fire a withOnChanges handler; blur commit DOES', async () => {
    const calls: string[] = [];
    const field = new BirthdayField('birthDate', 100).withLabel('Birth Date');
    const entityForm = new EntityForm('StudentEntityForm', '/student')
      .addFields({ items: [field] })
      .withOnChanges((_mutator, changedField) => {
        calls.push(changedField);
      });

    renderForm(entityForm);
    const input = await screen.findByLabelText(/^Birth Date/);

    fireEvent.change(input, { target: { value: '1990' } });
    fireEvent.change(input, { target: { value: '19900101' } });
    expect(calls).toEqual([]); // cascade:false on every keystroke commit

    fireEvent.blur(input);
    await waitFor(() => expect(calls).toEqual(['birthDate'])); // blur commit cascades
  });

  it('required + blank fails save with the Korean required message (FieldRenderer wrapper, not renderer-local)', async () => {
    const { onSave } = renderForm(birthdayForm(false, true));
    const input = await screen.findByLabelText(/^Birth Date/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.click(saveButton);

    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe('birthDate-error');
    expect(document.getElementById(describedBy as string)).toHaveTextContent('필수 값입니다');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('a filled required field passes save-time validation and reaches onSave', async () => {
    const { onSave } = renderForm(birthdayForm(false, true));
    const input = await screen.findByLabelText(/^Birth Date/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(input, { target: { value: '19900101' } });
    fireEvent.blur(input);
    fireEvent.click(saveButton);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('readOnly is forwarded to the raw input', async () => {
    const field = new BirthdayField('birthDate', 100).withLabel('Birth Date').withReadOnly(true);
    renderForm(new EntityForm('StudentEntityForm', '/student').addFields({ items: [field] }));
    const input = await screen.findByLabelText(/^Birth Date/);
    await waitFor(() => expect(input).toHaveAttribute('readonly'));
  });
});
