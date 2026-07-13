// W3-1 (spec §3.2, CAP-02/CAP-03) — tab/group `requiredPermissions`
// consumption + hasVisibleContent derivation (react layer). Structure mirrors
// tab-hidden.test.tsx: AuthProvider injects a session, ViewEntityForm renders,
// assertions read the DOM (tab buttons / group legends / field inputs), never
// the derivation functions directly.

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EntityForm, StringField, type Session } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

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

// Three tabs: 'main' carries no requiredPermissions (control — always
// visible, keeps the tab bar itself rendered across every scenario below,
// since ViewEntityForm's tab bar unmounts entirely at <=1 visible tab);
// 'admin' requires 'ADMIN'; 'superadmin' requires 'SUPERADMIN'.
function TabPermissionForm(): EntityForm {
  return new EntityForm('TabPermEntityForm', '/tab-perm')
    .addFields({
      items: [new StringField('name', 1).withLabel('Name')],
      tab: { id: 'main', label: 'Main', order: 0 },
    })
    .addFields({
      items: [new StringField('adminField', 2).withLabel('AdminField')],
      tab: { id: 'admin', label: 'Admin', order: 1, requiredPermissions: ['ADMIN'] },
    })
    .addFields({
      items: [new StringField('superField', 3).withLabel('SuperField')],
      tab: { id: 'superadmin', label: 'SuperAdmin', order: 2, requiredPermissions: ['SUPERADMIN'] },
    });
}

describe('CAP-02 — TabDef.requiredPermissions filters the tab bar', () => {
  it('a tab requiring a permission the session lacks has no tab button', async () => {
    renderForm(TabPermissionForm(), { roles: ['ADMIN'] });
    await screen.findByRole('tab', { name: 'Main' });
    expect(screen.queryByRole('tab', { name: 'SuperAdmin' })).not.toBeInTheDocument();
  });

  it('contrast: a tab requiring a permission the session HOLDS renders its tab button', async () => {
    renderForm(TabPermissionForm(), { roles: ['ADMIN'] });
    expect(await screen.findByRole('tab', { name: 'Admin' })).toBeInTheDocument();
  });
});

// One tab, two groups: 'basic' carries no requiredPermissions (control);
// 'secret' requires 'HR'.
function GroupPermissionForm(): EntityForm {
  return new EntityForm('GroupPermEntityForm', '/group-perm')
    .addFields({
      items: [new StringField('name', 1).withLabel('Name')],
      tab: { id: 'main', order: 0 },
      group: { id: 'basic', label: 'Basic', order: 0 },
    })
    .addFields({
      items: [new StringField('salary', 2).withLabel('Salary')],
      tab: { id: 'main', order: 0 },
      group: { id: 'secret', label: 'Secret', order: 1, requiredPermissions: ['HR'] },
    });
}

describe('CAP-02 — FieldGroupDef.requiredPermissions filters the group panel', () => {
  it('a group requiring a permission the session lacks renders neither its legend nor its fields', async () => {
    renderForm(GroupPermissionForm(), { roles: ['ADMIN'] });
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Salary/)).not.toBeInTheDocument();
  });

  it('contrast: a group requiring a permission the session HOLDS renders', async () => {
    renderForm(GroupPermissionForm(), { roles: ['HR'] });
    expect(await screen.findByText('Secret')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Salary/)).toBeInTheDocument();
  });
});

describe('FieldGroupDef.open controls the initial collapsible group state', () => {
  function CollapsibleGroupForm(open: boolean): EntityForm {
    return new EntityForm('GroupOpenEntityForm', '/group-open')
      .addFields({
        items: [new StringField('name', 1).withLabel('Name')],
        group: { id: 'collapsible', label: 'Collapsible', order: 0 },
      })
      .withGroup('ignored-tab', 'collapsible', { open });
  }

  it('open:false starts collapsed and the legend control reveals the fields', async () => {
    renderForm(CollapsibleGroupForm(false));
    const toggle = await screen.findByRole('button', { name: 'Collapsible' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByLabelText(/^Name/)).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText(/^Name/)).toBeVisible();
  });

  it('open:true starts expanded', async () => {
    renderForm(CollapsibleGroupForm(true));
    expect(await screen.findByRole('button', { name: 'Collapsible' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByLabelText(/^Name/)).toBeVisible();
  });
});

// One tab, two groups, NEITHER carrying group-level requiredPermissions:
// 'basic' holds an always-visible field; 'hrOnly' holds a single FIELD-level
// gated field (`withRequiredPermissions`) — proving CAP-03's
// hasVisibleContent (not CAP-02's group-level gate) is what suppresses it.
function EmptyGroupForm(): EntityForm {
  return new EntityForm('EmptyGroupEntityForm', '/empty-group')
    .addFields({
      items: [new StringField('name', 1).withLabel('Name')],
      tab: { id: 'main', order: 0 },
      group: { id: 'basic', label: 'Basic', order: 0 },
    })
    .addFields({
      items: [new StringField('salary', 2).withLabel('Salary').withRequiredPermissions('hr:read')],
      tab: { id: 'main', order: 0 },
      group: { id: 'hrOnly', label: 'HrOnlyGroup', order: 1 },
    });
}

describe('CAP-03 — hasVisibleContent hides a group whose only field is unpermitted', () => {
  it('a group whose sole field is unpermitted is not rendered at all (empty-content suppression)', async () => {
    renderForm(EmptyGroupForm());
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByText('HrOnlyGroup')).not.toBeInTheDocument();
  });

  it('contrast: once the session holds the field-level permission, the group (and its field) renders', async () => {
    renderForm(EmptyGroupForm(), { roles: ['hr:read'] });
    expect(await screen.findByText('HrOnlyGroup')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Salary/)).toBeInTheDocument();
  });
});
