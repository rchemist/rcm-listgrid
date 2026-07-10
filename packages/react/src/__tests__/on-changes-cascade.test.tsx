// EF2 — onChanges cascade integration (react layer). A builder from the
// schema-core catalog (changeHidden) is registered on the EntityForm via
// withOnChanges; a real user edit on one field's input drives
// store.setValue, which dispatches the cascade, which mutates a sibling
// field's EF1 meta override — and that is asserted through the actual
// useFieldMeta render path (not by calling store.getState().setMeta
// directly), demonstrating the imperative lifecycle works end-to-end, not
// just that it compiles.

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { changeHidden, EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

// 'kind' drives whether 'secret' is hidden — via the changeHidden builder,
// not a declared `hidden` predicate, isolating EF2 from H2 predicate
// resolution (same isolation strategy as field-meta-reactive.test.tsx / EF1).
function widgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget')
    .addFields({
      items: [
        new StringField('kind', 1).withLabel('Kind'),
        new StringField('secret', 2).withLabel('Secret'),
      ],
    })
    .withOnChanges(changeHidden('kind', { value: 'hide-it', result: { secret: true } }));
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

describe('EF2 — onChanges cascade drives useFieldMeta through a real user edit', () => {
  it('typing "hide-it" into Kind hides Secret; typing something else restores it', async () => {
    renderForm(widgetForm());
    const kindInput = await screen.findByLabelText(/^Kind/);
    expect(screen.queryByLabelText(/^Secret/)).toBeInTheDocument();

    fireEvent.change(kindInput, { target: { value: 'hide-it' } });
    await waitFor(() => expect(screen.queryByLabelText(/^Secret/)).not.toBeInTheDocument());

    fireEvent.change(kindInput, { target: { value: 'show-it' } });
    await waitFor(() => expect(screen.queryByLabelText(/^Secret/)).toBeInTheDocument());
  });
});
