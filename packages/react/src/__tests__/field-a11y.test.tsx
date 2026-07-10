// Field a11y wiring — JSDOM render test (task H2: "라벨·role·focus"). Covers
// the 4 gaps the ViewEntityForm render stack didn't close on its own:
// aria-required, aria-invalid + aria-describedby error association,
// focus-first-error on a failed submit, and Modal focus management. Driven
// through the real provider stack + @listgrid/ui-default's unstyled
// primitives, same harness style as view-entity-form.test.tsx.

import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BooleanField, EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents, Modal } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

// 'name' required + first in declaration order, 'englishName' NOT required
// (unlike view-entity-form.test.tsx's collegeForm) so gap A's "no attribute
// when falsy" branch has something to assert against.
function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('Name'),
      new StringField('englishName', 110).withLabel('English Name'),
      new BooleanField('active', 900).withLabel('Active').withDefaultValue(true),
    ],
  });
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

describe('FieldRenderer a11y wiring', () => {
  it('marks a required field aria-required="true"; a non-required field has no aria-required attribute', async () => {
    renderForm(collegeForm());
    const nameInput = await screen.findByLabelText(/^Name/);
    const englishNameInput = await screen.findByLabelText(/^English Name/);

    // required is resolved asynchronously (field.isRequired -> Promise<boolean>)
    await waitFor(() => expect(nameInput).toHaveAttribute('aria-required', 'true'));
    expect(englishNameInput).not.toHaveAttribute('aria-required');
  });

  it('marks an errored field aria-invalid + aria-describedby, pointing at an existing role=alert error list', async () => {
    renderForm(collegeForm());
    const nameInput = await screen.findByLabelText(/^Name/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.click(saveButton);

    await waitFor(() => expect(nameInput).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = nameInput.getAttribute('aria-describedby');
    expect(describedBy).toBe('name-error');

    const errorList = document.getElementById(describedBy as string);
    expect(errorList).not.toBeNull();
    expect(errorList).toHaveAttribute('role', 'alert');
    expect(errorList).toHaveTextContent(/필수 값입니다/);
  });

  it('a field with no errors carries neither aria-invalid nor aria-describedby', async () => {
    renderForm(collegeForm());
    const activeInput = await screen.findByLabelText(/^Active/);
    expect(activeInput).not.toHaveAttribute('aria-invalid');
    expect(activeInput).not.toHaveAttribute('aria-describedby');
  });
});

describe('ViewEntityForm focus-first-error', () => {
  it('moves focus to the first invalid field when submit fails validation', async () => {
    renderForm(collegeForm());
    const nameInput = await screen.findByLabelText(/^Name/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.click(saveButton);

    await waitFor(() => expect(document.activeElement).toBe(nameInput));
  });
});

describe('ui-default Modal focus management', () => {
  function ModalHarness() {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Pick one">
          <p>content</p>
        </Modal>
      </div>
    );
  }

  it('focuses the dialog on open and restores focus to the trigger on close', async () => {
    render(<ModalHarness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(document.activeElement).toBe(dialog));

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
