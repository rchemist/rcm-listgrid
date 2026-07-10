// ViewEntityForm — JSDOM render test (task item 7). "Mini-College": two
// required StringFields + one defaulted BooleanField, driven through the real
// provider stack (UIProvider → AuthProvider → FormStoreProvider →
// ViewEntityForm) with @listgrid/ui-default's unstyled primitives — proving
// the renderer layer (registry dispatch, store subscription, validate-then-
// save) end to end without any host app.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BooleanField, EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('Name'),
      new StringField('englishName', 110).withRequired(true).withLabel('English Name'),
      new BooleanField('active', 900).withLabel('Active').withDefaultValue(true),
    ],
  });
}

describe('ViewEntityForm (JSDOM render)', () => {
  it('renders inputs with labels, writes keystrokes to the store, validates required fields, and saves', async () => {
    const entityForm = collegeForm();
    const store = createFormStore(entityForm);
    const onSave = vi.fn();

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    // --- inputs render with labels ---
    const nameInput = await screen.findByLabelText(/^Name/);
    const englishNameInput = await screen.findByLabelText(/^English Name/);
    const activeInput = await screen.findByLabelText(/^Active/);
    expect(nameInput).toBeInTheDocument();
    expect(englishNameInput).toBeInTheDocument();
    expect(activeInput).toBeChecked(); // withDefaultValue(true)

    // --- typing updates the store ---
    fireEvent.change(nameInput, { target: { value: 'Engineering' } });
    expect(store.getState().getValue('name')).toBe('Engineering');

    // --- Save with englishName blank shows the required error ---
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    // --- filling both required fields then Save calls onSave with toSaveData ---
    fireEvent.change(englishNameInput, { target: { value: 'College of Engineering' } });
    fireEvent.click(saveButton);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Engineering',
        englishName: 'College of Engineering',
        active: true,
      }),
    );
  });
});
