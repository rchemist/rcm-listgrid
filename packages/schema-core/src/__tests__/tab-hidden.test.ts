import { describe, expect, it } from 'vitest';
import { EntityForm, StringField } from '../index';

// EC3-0 — tab-level hidden (schema-core layer). Covers: TabDef.hidden
// declared via addFields({tab: {..., hidden}}), EntityForm.withTab({hidden})
// (the pre-store mutation an onInitialize handler uses), and clone()
// carrying tab defs (including hidden) — the runtime store slice
// (@listgrid/state) and the tab-bar filter (@listgrid/react) are covered in
// their own packages.

function TwoTabForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
    tab: { id: 'main', label: 'Main', order: 0 },
  });
}

describe('TabDef.hidden (declaration-time)', () => {
  it('addFields({tab: {hidden: true}}) declares the tab hidden', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1)],
      tab: { id: 'graduate', label: 'Graduate', order: 0, hidden: true },
    });
    const tab = form.getTabs().find((t) => t.id === 'graduate');
    expect(tab?.hidden).toBe(true);
  });

  it('a tab with no hidden declared has hidden undefined (not false)', () => {
    const form = TwoTabForm();
    const tab = form.getTabs().find((t) => t.id === 'main');
    expect(tab?.hidden).toBeUndefined();
  });

  it('only the FIRST addFields call targeting a tab id sets its hidden — later calls do not overwrite (label/order parity)', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new StringField('name', 1)],
        tab: { id: 'main', order: 0, hidden: true },
      })
      .addFields({
        items: [new StringField('other', 2)],
        tab: { id: 'main', order: 0, hidden: false },
      });
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBe(true);
  });
});

describe('EntityForm.withTab({hidden}) (EC3-0 — onInitialize mutation)', () => {
  it('overrides hidden on an already-declared tab', () => {
    const form = TwoTabForm();
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBeUndefined();

    form.withTab('main', { hidden: true });
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBe(true);

    form.withTab('main', { hidden: false });
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBe(false);
  });

  it('preserves the tab label/order when toggling hidden', () => {
    const form = TwoTabForm();
    form.withTab('main', { hidden: true });
    const tab = form.getTabs().find((t) => t.id === 'main');
    expect(tab).toMatchObject({ id: 'main', label: 'Main', order: 0, hidden: true });
  });

  it('creates a stub TabDef when tabId was never declared', () => {
    const form = TwoTabForm();
    form.withTab('never-declared', { hidden: true });
    const tab = form.getTabs().find((t) => t.id === 'never-declared');
    expect(tab).toBeDefined();
    expect(tab?.hidden).toBe(true);
  });

  it('is chainable (returns this)', () => {
    const form = TwoTabForm();
    const result = form.withTab('main', { hidden: true });
    expect(result).toBe(form);
  });
});

describe('clone() carries tab defs, including hidden (EC3-0)', () => {
  it('clone() preserves a declared hidden tab', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1)],
      tab: { id: 'graduate', hidden: true, order: 0 },
    });
    const cloned = form.clone();
    expect(cloned.getTabs().find((t) => t.id === 'graduate')?.hidden).toBe(true);
  });

  it('clone() copies are independent — mutating the clone does not affect the original', () => {
    const form = TwoTabForm();
    const cloned = form.clone();
    cloned.withTab('main', { hidden: true });
    expect(cloned.getTabs().find((t) => t.id === 'main')?.hidden).toBe(true);
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBeUndefined();
  });
});

// W1-5 — net-new structural members (spec §3.2): withoutField/withoutTab/
// withTab/withGroup.
describe('EntityForm.withoutField', () => {
  it('removes the named field from getFields()', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1), new StringField('note', 2)],
      tab: { id: 'main', order: 0 },
    });
    expect(form.getFields().map((f) => f.getName())).toEqual(['name', 'note']);

    form.withoutField('note');
    expect(form.getFields().map((f) => f.getName())).toEqual(['name']);
  });

  it('is a no-op when the named field is not declared', () => {
    const form = TwoTabForm();
    const before = form.getFields().map((f) => f.getName());
    form.withoutField('does-not-exist');
    expect(form.getFields().map((f) => f.getName())).toEqual(before);
  });

  it('is chainable (returns this)', () => {
    const form = TwoTabForm();
    expect(form.withoutField('name')).toBe(form);
  });
});

describe('EntityForm.withoutTab', () => {
  it('removes the tab from getTabs() AND cascades to remove its fields from getFields() — structural removal, distinct from withTab({hidden}) which only hides', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new StringField('name', 1)],
        tab: { id: 'main', order: 0 },
      })
      .addFields({
        items: [new StringField('thesis', 2)],
        tab: { id: 'graduate', order: 1 },
      });
    expect(form.getTabs().map((t) => t.id)).toEqual(['main', 'graduate']);
    expect(form.getFields().map((f) => f.getName())).toEqual(['name', 'thesis']);

    form.withoutTab('graduate');
    expect(form.getTabs().map((t) => t.id)).toEqual(['main']);
    expect(form.getFields().map((f) => f.getName())).toEqual(['name']);

    // contrast: withTab({hidden}) keeps the tab AND its fields declared —
    // only the effective visibility changes, not the structure.
    const hiddenForm = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new StringField('name', 1)],
        tab: { id: 'main', order: 0 },
      })
      .addFields({
        items: [new StringField('thesis', 2)],
        tab: { id: 'graduate', order: 1 },
      });
    hiddenForm.withTab('graduate', { hidden: true });
    expect(hiddenForm.getTabs().map((t) => t.id)).toEqual(['main', 'graduate']);
    expect(hiddenForm.getFields().map((f) => f.getName())).toEqual(['name', 'thesis']);
  });

  it('is a no-op when the tab was never declared', () => {
    const form = TwoTabForm();
    const tabsBefore = form.getTabs();
    const fieldsBefore = form.getFields();
    form.withoutTab('does-not-exist');
    expect(form.getTabs()).toEqual(tabsBefore);
    expect(form.getFields()).toEqual(fieldsBefore);
  });

  it('is chainable (returns this)', () => {
    const form = TwoTabForm();
    expect(form.withoutTab('main')).toBe(form);
  });
});

describe('EntityForm.withTab (label/order adjustment)', () => {
  it('adjusts label/order on an already-declared tab', () => {
    const form = TwoTabForm();
    form.withTab('main', { label: 'Renamed', order: 5 });
    const tab = form.getTabs().find((t) => t.id === 'main');
    expect(tab).toMatchObject({ id: 'main', label: 'Renamed', order: 5 });
  });

  it("withTab('undeclared', {hidden:true}) stub-creates a hidden tab, distinct from withoutTab's structural removal", () => {
    const form = TwoTabForm();
    form.withTab('never-declared', { hidden: true });
    const tab = form.getTabs().find((t) => t.id === 'never-declared');
    expect(tab).toBeDefined();
    expect(tab?.hidden).toBe(true);
    // the declared 'main' tab is untouched by the stub-create.
    expect(form.getTabs().find((t) => t.id === 'main')).toBeDefined();
  });
});

// W3-1 (spec §3.2, CAP-02) — addFields propagates TabInput/GroupInput's
// requiredPermissions onto the created TabDef/FieldGroupDef, symmetric with
// the already-working label/order/hidden copy above. Consumption (permission
// gating the tab bar/group panel) lives in @listgrid/react's ViewEntityForm.
describe('addFields requiredPermissions propagation (W3-1)', () => {
  it('TabInput.requiredPermissions ⇒ TabDef.requiredPermissions', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1)],
      tab: { id: 'admin', order: 0, requiredPermissions: ['ADMIN'] },
    });
    expect(form.getTabs().find((t) => t.id === 'admin')?.requiredPermissions).toEqual(['ADMIN']);
  });

  it('GroupInput.requiredPermissions ⇒ FieldGroupDef.requiredPermissions', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1)],
      tab: { id: 'main', order: 0 },
      group: { id: 'secret', order: 0, requiredPermissions: ['SUPERADMIN'] },
    });
    expect(form.getFieldGroups('main').find((g) => g.id === 'secret')?.requiredPermissions).toEqual(
      ['SUPERADMIN'],
    );
  });

  it('a tab/group with no requiredPermissions declared stays undefined (not [])', () => {
    const form = TwoTabForm();
    expect(form.getTabs().find((t) => t.id === 'main')?.requiredPermissions).toBeUndefined();
  });
});

describe('EntityForm.withGroup', () => {
  function GroupedForm(): EntityForm {
    return new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1)],
      tab: { id: 'main', order: 0 },
      group: { id: 'basic', label: 'Basic', order: 0 },
    });
  }

  it('adjusts label/open on an already-declared group', () => {
    const form = GroupedForm();
    form.withGroup('main', 'basic', { label: 'Renamed', open: false });
    const group = form.getFieldGroups().find((g) => g.id === 'basic');
    expect(group).toMatchObject({ id: 'basic', label: 'Renamed', open: false });
  });

  it('stub-creates a group when groupId was never declared — a later addFields() targeting that group id does not overwrite the stub (same non-clobber contract as tab stub-create)', () => {
    const form = GroupedForm();
    form.withGroup('main', 'extra', { label: 'Extra', open: true });
    // getFieldGroups() only surfaces groups a field actually references, so
    // route a field into the stub to observe it via the public query surface.
    form.addFields({
      items: [new StringField('note', 2)],
      tab: { id: 'main', order: 0 },
      group: { id: 'extra' },
    });
    const group = form.getFieldGroups('main').find((g) => g.id === 'extra');
    expect(group).toMatchObject({ id: 'extra', label: 'Extra', open: true });
  });

  it('is chainable (returns this)', () => {
    const form = GroupedForm();
    expect(form.withGroup('main', 'basic', { label: 'X' })).toBe(form);
  });
});
