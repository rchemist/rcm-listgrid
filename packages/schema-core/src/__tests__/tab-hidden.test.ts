import { describe, expect, it } from 'vitest';
import { EntityForm, StringField } from '../index';

// EC3-0 — tab-level hidden (schema-core layer). Covers: TabDef.hidden
// declared via addFields({tab: {..., hidden}}), EntityForm.setTabHidden
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

describe('EntityForm.setTabHidden (EC3-0 — onInitialize mutation)', () => {
  it('overrides hidden on an already-declared tab', () => {
    const form = TwoTabForm();
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBeUndefined();

    form.setTabHidden('main', true);
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBe(true);

    form.setTabHidden('main', false);
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBe(false);
  });

  it('preserves the tab label/order when toggling hidden', () => {
    const form = TwoTabForm();
    form.setTabHidden('main', true);
    const tab = form.getTabs().find((t) => t.id === 'main');
    expect(tab).toMatchObject({ id: 'main', label: 'Main', order: 0, hidden: true });
  });

  it('creates a stub TabDef when tabId was never declared', () => {
    const form = TwoTabForm();
    form.setTabHidden('never-declared', true);
    const tab = form.getTabs().find((t) => t.id === 'never-declared');
    expect(tab).toBeDefined();
    expect(tab?.hidden).toBe(true);
  });

  it('is chainable (returns this)', () => {
    const form = TwoTabForm();
    const result = form.setTabHidden('main', true);
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
    cloned.setTabHidden('main', true);
    expect(cloned.getTabs().find((t) => t.id === 'main')?.hidden).toBe(true);
    expect(form.getTabs().find((t) => t.id === 'main')?.hidden).toBeUndefined();
  });
});
