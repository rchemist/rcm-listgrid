// ViewEntityForm — messages banner render (W2-3, spec §6.1). Proves the
// component reads `store.messages` (not the old inert `formErrors`) and
// renders each entry's text + severity; an empty channel renders no banner
// at all. The controller that WRITES messages (server field-errors/cancel
// reason) is W2-5 — this test drives the channel directly via the store's
// addMessage/clearMessages actions, the same surface a future controller
// will call.

import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

function widgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

function renderForm(entityForm: EntityForm) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('ViewEntityForm — messages banner (W2-3)', () => {
  it('renders no banner when messages is empty', () => {
    renderForm(widgetForm());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders each message text + severity once messages are populated', async () => {
    const { store } = renderForm(widgetForm());

    store.getState().addMessage({ key: 'server-error', severity: 'error', text: 'Save failed' });
    store.getState().addMessage({ key: 'stale-warn', severity: 'warning', text: 'Data is stale' });

    const banner = await screen.findByRole('alert');
    expect(banner).toBeInTheDocument();
    expect(screen.getByText('Save failed')).toHaveAttribute('data-severity', 'error');
    expect(screen.getByText('Data is stale')).toHaveAttribute('data-severity', 'warning');
  });

  it('clearing messages removes the banner', async () => {
    const { store } = renderForm(widgetForm());

    store.getState().addMessage({ key: 'server-error', severity: 'error', text: 'Save failed' });
    await screen.findByRole('alert');

    store.getState().clearMessages({ includePersistent: true });
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
