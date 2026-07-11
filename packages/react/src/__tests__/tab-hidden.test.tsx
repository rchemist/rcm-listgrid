// EC3-0 — tab-level hidden (react layer). Covers: the tab BUTTON disappears/
// reappears as the store's tabHidden slice changes (declared AND runtime,
// via a real onChanges-driven user edit — not by poking the store
// directly), the active-tab falls back to the first visible tab when it
// becomes hidden, a value edit on an unrelated field does NOT re-derive the
// tab bar (D4 — same DOM-node-identity technique as the EF4 dynamic-fields
// react test), and a declared-hidden tab (set via onInitialize, through the
// real initializeFormStore pipe) is already gone on FIRST paint.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  EntityForm,
  SelectField,
  StringField,
  type BackendAdapter,
  type FormMutator,
} from '@listgrid/schema-core';
import { createFormStore, initializeFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

// Three tabs: 'main' and 'other' are always visible (so the tab bar itself
// stays rendered — ViewEntityForm's `tabs.length > 1` gate — across every
// scenario below, isolating the assertions to 'graduate' specifically);
// 'graduate' starts declared hidden:true and 'kind' === 'grad' toggles it
// hidden off (visible) via a real onChanges-driven setTabHidden call.
function threeTabForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget')
    .addFields({
      items: [
        new StringField('name', 1).withLabel('Name'),
        new SelectField('kind', 2, [
          { value: 'undergrad', label: 'Undergrad' },
          { value: 'grad', label: 'Grad' },
        ]).withLabel('Kind'),
      ],
      tab: { id: 'main', label: 'Main', order: 0 },
    })
    .addFields({
      items: [new StringField('note', 3).withLabel('Note')],
      tab: { id: 'other', label: 'Other', order: 1 },
    })
    .addFields({
      items: [new StringField('thesis', 4).withLabel('Thesis')],
      tab: { id: 'graduate', label: 'Graduate', order: 2, hidden: true },
    })
    .withOnChanges((m: FormMutator, changedField) => {
      if (changedField !== 'kind') return;
      m.setTabHidden('graduate', m.getValue('kind') !== 'grad');
    });
}

function renderForm(entityForm: EntityForm, store = createFormStore(entityForm)) {
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

describe('EC3-0 — tab-hidden filters the tab bar', () => {
  it('a tab declared hidden:true has no tab button on first paint', async () => {
    renderForm(threeTabForm());
    await screen.findByRole('tab', { name: 'Main' });
    expect(screen.queryByRole('tab', { name: 'Graduate' })).not.toBeInTheDocument();
  });

  it('setTabHidden via onChanges shows/hides the tab button through a real user edit', async () => {
    renderForm(threeTabForm());
    await screen.findByRole('tab', { name: 'Main' });
    expect(screen.queryByRole('tab', { name: 'Graduate' })).not.toBeInTheDocument();

    const kindSelect = screen.getByLabelText(/^Kind/);
    fireEvent.change(kindSelect, { target: { value: 'grad' } });

    await waitFor(() => expect(screen.getByRole('tab', { name: 'Graduate' })).toBeInTheDocument());

    fireEvent.change(kindSelect, { target: { value: 'undergrad' } });
    await waitFor(() =>
      expect(screen.queryByRole('tab', { name: 'Graduate' })).not.toBeInTheDocument(),
    );
  });

  it('when the ACTIVE tab becomes hidden, the view falls back to the first visible tab', async () => {
    const { store } = renderForm(threeTabForm());
    const kindSelect = screen.getByLabelText(/^Kind/);
    fireEvent.change(kindSelect, { target: { value: 'grad' } });
    const graduateTab = await screen.findByRole('tab', { name: 'Graduate' });

    fireEvent.click(graduateTab);
    await waitFor(() => expect(store.getState().tabIndex).toBe('graduate'));
    expect(await screen.findByLabelText(/^Thesis/)).toBeInTheDocument();

    // hide the currently-active 'graduate' tab — must fall back to 'main'.
    // Driven via store.setValue (same onChanges dispatch path
    // fireEvent.change goes through) rather than a simulated keystroke on
    // the 'Kind' <select>, because that field lives under 'main' and is NOT
    // in the DOM while 'graduate' is the active tab (only the active tab's
    // fields render) — a fireEvent on a detached node would be a no-op.
    store.getState().setValue('kind', 'undergrad');

    await waitFor(() =>
      expect(screen.queryByRole('tab', { name: 'Graduate' })).not.toBeInTheDocument(),
    );
    // 'main' (order 0) is the first remaining visible tab — the fallback
    // must have landed there: the Kind field (main tab) is visible again,
    // Thesis (graduate, now hidden) is gone.
    expect(screen.getByLabelText(/^Kind/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Thesis/)).not.toBeInTheDocument();
  });

  it('a value edit on an unrelated field does not re-derive the tab bar (D4)', async () => {
    renderForm(threeTabForm());
    const mainTabBefore = await screen.findByRole('tab', { name: 'Main' });
    const nameInput = screen.getByLabelText(/^Name/) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'unrelated-edit' } });
    expect(nameInput.value).toBe('unrelated-edit');

    // same DOM node identity for the tab button — a re-derivation driven by
    // this edit would remount the tab bar (it does not, since 'name' never
    // touches tabHidden/structureVersion).
    expect(screen.getByRole('tab', { name: 'Main' })).toBe(mainTabBefore);
  });
});

describe('EC3-0 — declared hidden survives onInitialize through initializeFormStore', () => {
  /** Minimal BackendAdapter double — only getOne is exercised (initialize-form-store.test.ts precedent). */
  function fakeAdapter(): BackendAdapter {
    return {
      list: vi.fn(),
      getOne: async () => ({ id: '1', name: 'x', kind: 'undergrad' }),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
  }

  it('an onInitialize handler UN-hiding a declared-hidden tab shows it on FIRST paint', async () => {
    // 'graduate' is declared hidden:true (threeTabForm) — an onInitialize
    // handler flips it visible via the pre-store EntityForm.setTabHidden
    // mutation, proving it flows through initializeFormStore's
    // build-after-hooks pipe into the store's seeded tabHidden slice,
    // correct on the very first render (no user action needed).
    const form = threeTabForm().withOnInitialize((ef) => ef.setTabHidden('graduate', false));
    const { store, entityForm } = await initializeFormStore({
      entityForm: form,
      adapter: fakeAdapter(),
      id: '1',
    });

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    expect(await screen.findByRole('tab', { name: 'Main' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Graduate' })).toBeInTheDocument();
  });

  it('WITHOUT the onInitialize override, the declared-hidden tab stays hidden on first paint (control)', async () => {
    const { store, entityForm } = await initializeFormStore({
      entityForm: threeTabForm(),
      adapter: fakeAdapter(),
      id: '1',
    });

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    expect(await screen.findByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Graduate' })).not.toBeInTheDocument();
  });
});
