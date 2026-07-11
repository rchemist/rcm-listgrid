import { describe, expect, it } from 'vitest';
import { EntityForm, StringField, type FormMutator } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

// EC3-0 — tab-level hidden (state layer). Covers: FormStoreState.tabHidden
// seeded from declared TabDef.hidden at store build, the runtime
// store.setTabHidden action, and the FormMutator.setTabHidden wiring an
// onChanges handler exercises through the real dispatch path (not by poking
// the store directly).

function TwoTabForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget')
    .addFields({
      items: [new StringField('name', 1).withLabel('Name')],
      tab: { id: 'main', label: 'Main', order: 0 },
    })
    .addFields({
      items: [new StringField('extra', 2).withLabel('Extra')],
      tab: { id: 'graduate', label: 'Graduate', order: 1, hidden: true },
    });
}

describe('FormStoreState.tabHidden — seeded from declaration', () => {
  it('a tab declared hidden:true seeds tabHidden[id] = true at store build', () => {
    const store = createFormStore(TwoTabForm());
    expect(store.getState().tabHidden).toEqual({ graduate: true });
  });

  it('a tab with no declared hidden gets no entry in the seed (undefined, not false)', () => {
    const store = createFormStore(TwoTabForm());
    expect(store.getState().tabHidden.main).toBeUndefined();
  });

  it('an entity form with no hidden tabs seeds an empty tabHidden record', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1)],
    });
    const store = createFormStore(form);
    expect(store.getState().tabHidden).toEqual({});
  });

  it('the initial tabIndex prefers the first non-hidden declared tab', () => {
    const form = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new StringField('a', 1)],
        tab: { id: 'firstHidden', order: 0, hidden: true },
      })
      .addFields({
        items: [new StringField('b', 2)],
        tab: { id: 'secondVisible', order: 1 },
      });
    const store = createFormStore(form);
    expect(store.getState().tabIndex).toBe('secondVisible');
  });
});

describe('store.setTabHidden (runtime override)', () => {
  it('writes tabHidden[tabId], overriding the declared value', () => {
    const store = createFormStore(TwoTabForm());
    expect(store.getState().tabHidden.graduate).toBe(true);

    store.getState().setTabHidden('graduate', false);
    expect(store.getState().tabHidden.graduate).toBe(false);
  });

  it('can hide a tab that was not declared hidden', () => {
    const store = createFormStore(TwoTabForm());
    store.getState().setTabHidden('main', true);
    expect(store.getState().tabHidden.main).toBe(true);
  });

  it('does not disturb other tabHidden entries', () => {
    const store = createFormStore(TwoTabForm());
    store.getState().setTabHidden('main', true);
    expect(store.getState().tabHidden).toEqual({ main: true, graduate: true });
  });

  it('does not bump structureVersion (not a structural EF4 mutation)', () => {
    const store = createFormStore(TwoTabForm());
    const before = store.getState().structureVersion;
    store.getState().setTabHidden('main', true);
    expect(store.getState().structureVersion).toBe(before);
  });
});

describe('FormMutator.setTabHidden — onChanges wiring (EC3-0)', () => {
  it('an onChanges handler calling m.setTabHidden updates the store tabHidden slice', () => {
    const form = TwoTabForm().onChange((m: FormMutator, changedField) => {
      if (changedField !== 'name') return;
      m.setTabHidden('graduate', m.getValue('name') === 'hide-graduate');
    });
    const store = createFormStore(form);
    expect(store.getState().tabHidden.graduate).toBe(true); // declared hidden

    store.getState().setValue('name', 'hide-graduate');
    expect(store.getState().tabHidden.graduate).toBe(true);

    store.getState().setValue('name', 'show-it');
    expect(store.getState().tabHidden.graduate).toBe(false);
  });

  it('setTabHidden from within a handler does not itself dispatch onChanges (no field changed)', () => {
    const dispatched: string[] = [];
    const form = TwoTabForm().onChange((m: FormMutator, changedField) => {
      dispatched.push(changedField);
      if (changedField === 'name') m.setTabHidden('graduate', true);
    });
    const store = createFormStore(form);
    store.getState().setValue('name', 'x');
    expect(dispatched).toEqual(['name']);
  });
});
