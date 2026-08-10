import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm, StringField, TextareaField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { ViewEntityForm } from '../components/ViewEntityForm';
import { AuthProvider } from '../providers/auth';
import { FormStoreProvider } from '../providers/form-store';
import { UIProvider } from '../providers/ui';
import { registerDefaultRenderers } from '../registry/default-renderers';

registerDefaultRenderers();

function renderForm(entityForm: EntityForm, renderType: 'create' | 'update' = 'create') {
  const store = createFormStore(entityForm, { renderType });
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return store;
}

function formWithFields({ helpText = true, required = false } = {}): EntityForm {
  const name = new StringField('name', 10)
    .withLabel('Name')
    .withPlaceholder({ onCreate: 'Create name', onUpdate: 'Update name' });
  if (helpText) {
    name.withHelpText({ onCreate: 'Create help', onUpdate: 'Update help' });
  }
  if (required) name.withRequired(true);

  return new EntityForm('ProfileEntityForm', '/profile').addFields({
    items: [
      name,
      new TextareaField('bio', 20, 4).withLabel('Bio').withPlaceholder('Write a biography'),
    ],
  });
}

describe('FieldRenderer helpText', () => {
  it('renders resolved helpText in .rcm-field-help for the active render mode', async () => {
    renderForm(formWithFields(), 'update');

    const help = await screen.findByText('Update help');
    expect(help).toHaveClass('rcm-field-help');
    expect(help).toHaveAttribute('id', 'name-help');
    expect(screen.queryByText('Create help')).not.toBeInTheDocument();
  });

  it('renders no help element when helpText is absent', async () => {
    renderForm(formWithFields({ helpText: false }));

    await screen.findByLabelText('Name');
    await waitFor(() => expect(document.querySelector('.rcm-field-help')).toBeNull());
  });

  it('connects the input to the help id through aria-describedby', async () => {
    renderForm(formWithFields());

    const input = await screen.findByLabelText('Name');
    await screen.findByText('Create help');
    await waitFor(() => expect(input).toHaveAttribute('aria-describedby', 'name-help'));
  });

  it('includes both help and error ids in aria-describedby when validation fails', async () => {
    renderForm(formWithFields({ required: true }));

    const input = await screen.findByLabelText(/^Name/);
    await screen.findByText('Create help');
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(input).toHaveAttribute('aria-describedby', 'name-help name-error');
    expect(document.getElementById('name-help')).toHaveTextContent('Create help');
    expect(document.getElementById('name-error')).toHaveTextContent(/필수 값입니다/);
  });
});

describe('default text renderers placeholder pass-through', () => {
  it('passes resolved placeholders to TextInput and Textarea', async () => {
    renderForm(formWithFields(), 'update');

    const input = await screen.findByLabelText('Name');
    const textarea = await screen.findByLabelText('Bio');
    await waitFor(() => expect(input).toHaveAttribute('placeholder', 'Update name'));
    expect(textarea).toHaveAttribute('placeholder', 'Write a biography');
  });
});
