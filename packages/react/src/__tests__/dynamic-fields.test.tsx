// EF4 — dynamic field add/remove + structure-version (react layer). An
// onChanges handler (registered via withOnChanges, same wiring EF2 uses)
// calls m.addField/m.removeField on a select change; asserts the new field
// APPEARS/disappears in the DOM through the real render path (not by poking
// the store directly) and — critically — that the form is NOT remounted: a
// sibling field's DOM node identity and its in-progress edit survive the
// structure-version bump (the 0.3.x shouldReload full-clone/cacheKey-remount
// path this replaces would have reset both).

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm, SelectField, StringField, type FormMutator } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

// 'kind' === 'extended' adds a fresh 'extra' field (seeded from its declared
// default); switching back to 'basic' removes it again.
function widgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget')
    .addFields({
      items: [
        new StringField('name', 1).withLabel('Name'),
        new SelectField('kind', 2, [
          { value: 'basic', label: 'Basic' },
          { value: 'extended', label: 'Extended' },
        ]).withLabel('Kind'),
      ],
    })
    .withOnChanges((m: FormMutator, changedField) => {
      if (changedField !== 'kind') return;
      if (m.getValue('kind') === 'extended') {
        m.addField(
          new StringField('extra', 3).withDefaultValue('extra-default').withLabel('Extra'),
        );
      } else {
        m.removeField('extra');
      }
    });
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

describe('EF4 — addField/removeField via onChanges drives the rendered field list', () => {
  it('selecting "extended" adds Extra with its default value; "basic" removes it; the form is not remounted', async () => {
    renderForm(widgetForm());

    const nameInput = (await screen.findByLabelText(/^Name/)) as HTMLInputElement;
    expect(screen.queryByLabelText(/^Extra/)).not.toBeInTheDocument();

    // an in-progress edit on a field UNRELATED to the structure change — must
    // survive the version bump below (a remount would reset it to '').
    fireEvent.change(nameInput, { target: { value: 'stable-edit' } });
    expect(nameInput.value).toBe('stable-edit');

    const kindSelect = screen.getByLabelText(/^Kind/);
    fireEvent.change(kindSelect, { target: { value: 'extended' } });

    const extraInput = (await screen.findByLabelText(/^Extra/)) as HTMLInputElement;
    expect(extraInput.value).toBe('extra-default');

    // not remounted: same DOM node identity for the untouched field, and its
    // typed-but-uncommitted value is still there.
    const nameAfterAdd = screen.getByLabelText(/^Name/);
    expect(nameAfterAdd).toBe(nameInput);
    expect((nameAfterAdd as HTMLInputElement).value).toBe('stable-edit');

    fireEvent.change(kindSelect, { target: { value: 'basic' } });
    await waitFor(() => expect(screen.queryByLabelText(/^Extra/)).not.toBeInTheDocument());

    expect(screen.getByLabelText(/^Name/)).toBe(nameInput);
    expect((screen.getByLabelText(/^Name/) as HTMLInputElement).value).toBe('stable-edit');
  });
});
