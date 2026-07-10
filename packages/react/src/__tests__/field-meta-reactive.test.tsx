// EF1 reactivity — a per-field META override set imperatively via
// store.getState().setMeta(...) must re-render the field it targets: the
// renderer subscribes to state.meta[name] (useFieldMeta) and the override
// WINS over the declared/predicate-resolved value. Same harness style as
// field-a11y.test.tsx: real ui-default primitives + registerDefaultRenderers
// + the full provider stack, JSDOM render.

import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntityForm, SelectField, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

// 'name' is NOT required/hidden by declaration, so the override is the only
// thing that can make it required/hidden — isolating EF1 from H2 predicate
// resolution. 'plan' is a SelectField with a small declared option list.
function widgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('name', 1).withLabel('Name'),
      new SelectField('plan', 2, [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ]).withLabel('Plan'),
    ],
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

describe('EF1 — reactive field meta override', () => {
  it('setMeta({required: true}) adds aria-required; setMeta({required: false}) removes it', async () => {
    const { store } = renderForm(widgetForm());
    const nameInput = await screen.findByLabelText(/^Name/);

    // Declared not-required — H2's async predicate resolves to false.
    await waitFor(() => expect(nameInput).not.toHaveAttribute('aria-required'));

    store.getState().setMeta('name', { required: true });
    await waitFor(() => expect(nameInput).toHaveAttribute('aria-required', 'true'));

    store.getState().setMeta('name', { required: false });
    await waitFor(() => expect(nameInput).not.toHaveAttribute('aria-required'));
  });

  it('setMeta({hidden: true}) removes the field from the DOM; clearing it restores the field', async () => {
    const { store } = renderForm(widgetForm());
    await screen.findByLabelText(/^Name/);

    store.getState().setMeta('name', { hidden: true });
    await waitFor(() => expect(screen.queryByLabelText(/^Name/)).not.toBeInTheDocument());

    store.getState().setMeta('name', { hidden: false });
    await waitFor(() => expect(screen.queryByLabelText(/^Name/)).toBeInTheDocument());
  });

  it('setMeta({options}) on a SelectField renders an option that was not declared', async () => {
    const { store } = renderForm(widgetForm());
    const planSelect = await screen.findByLabelText(/^Plan/);
    expect(screen.queryByRole('option', { name: 'XX' })).not.toBeInTheDocument();

    store.getState().setMeta('plan', { options: [{ value: 'x', label: 'XX' }] });

    await waitFor(() => expect(screen.getByRole('option', { name: 'XX' })).toBeInTheDocument());
    // the declared 'A' option is gone — the override replaces, not merges.
    expect(screen.queryByRole('option', { name: 'A' })).not.toBeInTheDocument();
    expect(planSelect).toBeInTheDocument();
  });
});
