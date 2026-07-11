// EG2 — render hard-gate (SECURITY). isPermitted (schema-core) gates
// visibility at render time, and the gate is engineered to be un-bypassable
// by EF1's imperative setMeta override: `effHidden = !permitted || (...)` —
// `!permitted` short-circuits FIRST, so setMeta(name, { hidden: false })
// can never un-hide a field the session isn't permitted for. Same harness
// idiom as field-a11y.test.tsx / field-meta-reactive.test.tsx.

import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntityForm, StringField, type Session } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

function GatedForm(): EntityForm {
  return new EntityForm('GatedEntityForm', '/gated').addFields({
    items: [
      new StringField('name', 1).withLabel('Name'),
      new StringField('salary', 2).withLabel('Salary').withRequiredPermissions('hr:read'),
    ],
  });
}

function renderForm(entityForm: EntityForm, session?: Session) {
  const store = createFormStore(entityForm, session !== undefined ? { session } : {});
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={session}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('EG2 — FieldRenderer permission hard-gate', () => {
  it('a field with no requiredPermissions renders regardless of session (no session)', async () => {
    renderForm(GatedForm());
    expect(await screen.findByLabelText(/^Name/)).toBeInTheDocument();
  });

  it('an unpermitted field renders null (no session)', async () => {
    renderForm(GatedForm());
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByLabelText(/^Salary/)).not.toBeInTheDocument();
  });

  it('a permitted field renders (session carries the required role)', async () => {
    renderForm(GatedForm(), { roles: ['hr:read'] });
    expect(await screen.findByLabelText(/^Salary/)).toBeInTheDocument();
  });

  it('an unpermitted field still renders null when the session has an unrelated role', async () => {
    renderForm(GatedForm(), { roles: ['sales:read'] });
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByLabelText(/^Salary/)).not.toBeInTheDocument();
  });

  it('setMeta(name, { hidden: false }) does NOT un-hide an unpermitted field (hard-gate order regression)', async () => {
    const { store } = renderForm(GatedForm());
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByLabelText(/^Salary/)).not.toBeInTheDocument();

    store.getState().setMeta('salary', { hidden: false });

    // give any (incorrect) re-render a chance to happen, then assert it's
    // still absent — the permission gate must win over the EF1 override.
    await waitFor(() => expect(screen.queryByLabelText(/^Salary/)).not.toBeInTheDocument());
  });
});
