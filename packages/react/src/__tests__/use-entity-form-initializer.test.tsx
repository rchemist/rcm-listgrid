// EF3 — useEntityFormInitializer integration (react layer). Drives the real
// initializeFormStore pipe (@listgrid/state) through a fake adapter + an
// onInitialize handler that adds a field, then renders the RESULT through
// ViewEntityForm — proving loading resolves and the dynamically-added field
// shows up in the DOM with its fetched value, not just that the pipe compiles.

import { useMemo } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntityForm, StringField, type BackendAdapter } from '@listgrid/schema-core';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';
import { useEntityFormInitializer } from '../hooks/use-entity-form-initializer';

registerDefaultRenderers();

function widgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget')
    .addFields({ items: [new StringField('name', 1).withLabel('Name')] })
    .withOnInitialize((ef) =>
      ef.addFields({ items: [new StringField('extra', 2).withLabel('Extra')] }),
    );
}

function fakeAdapter(): BackendAdapter {
  return {
    list: async () => ({ content: [], totalElements: 0, totalPages: 0 }),
    getOne: async () => ({ id: '1', name: 'Widget One', extra: 'fetched-extra-value' }),
    create: async () => ({}),
    update: async () => ({}),
    remove: async () => {},
  };
}

function Harness() {
  // stable identity across re-renders — mirrors the real call-site idiom
  // (apps/sample edit pages memoize entityForm/adapter the same way) and is
  // load-bearing here: the hook re-runs the pipe on entityForm/adapter/id
  // identity change, so an un-memoized fresh instance per render would loop.
  const entityFormDecl = useMemo(() => widgetForm(), []);
  const adapter = useMemo(() => fakeAdapter(), []);
  const { store, entityForm, loading, error } = useEntityFormInitializer({
    entityForm: entityFormDecl,
    adapter,
    id: '1',
  });

  if (loading || !store || !entityForm) return <p>loading…</p>;
  if (error) return <p>error: {error.message}</p>;

  return (
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
      </AuthProvider>
    </UIProvider>
  );
}

describe('useEntityFormInitializer (EF3 react integration)', () => {
  it('resolves loading and renders the onInitialize-added field with its fetched value', async () => {
    render(<Harness />);

    expect(screen.getByText('loading…')).toBeInTheDocument();

    const nameInput = await screen.findByLabelText(/^Name/);
    expect((nameInput as HTMLInputElement).value).toBe('Widget One');

    const extraInput = await screen.findByLabelText(/^Extra/);
    expect((extraInput as HTMLInputElement).value).toBe('fetched-extra-value');
  });
});
