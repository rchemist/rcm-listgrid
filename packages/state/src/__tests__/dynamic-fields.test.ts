import { describe, expect, it } from 'vitest';
import { EntityForm, StringField, type FormMutator } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

// EF4 — runtime field add/remove + structure-version. Covers: addField slice
// creation (default seed + fetched rebind, flat AND dotted-path), duplicate-
// name replace, removeField slice/error deletion + nonexistent-name no-op,
// structureVersion bump semantics (add/remove bump it, a value edit never
// does), the FormMutator wiring (an onChanges handler calling addField/
// removeField, loop-guard intact), and validate() participation.

function TwoFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('name', 1).withLabel('Name'),
      new StringField('kind', 2).withLabel('Kind'),
    ],
  });
}

describe('form-store.addField (EF4)', () => {
  it('creates a value slice seeded from the field default; bumps structureVersion', () => {
    const store = createFormStore(TwoFieldForm());
    expect(store.getState().structureVersion).toBe(0);

    const extra = new StringField('extra', 3).withDefaultValue('fallback');
    store.getState().addField(extra);

    expect(store.getState().getValue('extra')).toBe('fallback');
    expect(store.getState().fieldDefs['extra']).toBe(extra);
    expect(store.getState().structureVersion).toBe(1);
  });

  it('rebinds a flat-named field from a retained hydrate() payload (late-added-field parity)', () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().hydrate({ name: 'Ada', kind: 'admin', extra: 'from-record' });

    store.getState().addField(new StringField('extra', 3));

    expect(store.getState().getValue('extra')).toBe('from-record');
    expect(store.getState().fields['extra']?.dirty).toBe(false);
  });

  it('rebinds a dotted-named field from a retained hydrate() payload (nested object walk)', () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().hydrate({ name: 'Ada', kind: 'admin', user: { state: 'CA' } });

    store.getState().addField(new StringField('user.state', 3));

    expect(store.getState().getValue('user.state')).toBe('CA');
    expect(store.getState().fields['user.state']?.dirty).toBe(false);
  });

  it('a field absent from the hydrated payload keeps its declared default (no rebind)', () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().hydrate({ name: 'Ada', kind: 'admin' });

    store.getState().addField(new StringField('extra', 3).withDefaultValue('seed'));

    expect(store.getState().getValue('extra')).toBe('seed');
  });

  it('duplicate name: replaces the field definition and resets its slices wholesale', () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().setValue('name', 'edited');
    expect(store.getState().getValue('name')).toBe('edited');

    const replacement = new StringField('name', 1).withDefaultValue('replaced-default');
    store.getState().addField(replacement);

    expect(store.getState().fieldDefs['name']).toBe(replacement);
    // wholesale slice reset: the prior edit is gone, replaced by the new
    // definition's seed (0.3.x `fields.set` parity).
    expect(store.getState().getValue('name')).toBe('replaced-default');
    expect(store.getState().fields['name']?.dirty).toBeFalsy();
  });

  it('a value edit (setValue) never bumps structureVersion', () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().setValue('name', 'x');
    store.getState().setValue('kind', 'y');
    expect(store.getState().structureVersion).toBe(0);
  });
});

describe('form-store.removeField (EF4)', () => {
  it('deletes the value slice, meta override, and bumps structureVersion', async () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().setMeta('kind', { required: true });
    await store.getState().validateField('kind'); // populate errors so we can assert they're gone too
    store.getState().setValue('kind', '');
    await store.getState().validateField('kind');
    expect(store.getState().fields['kind']?.errors?.length).toBeGreaterThan(0);

    store.getState().removeField('kind');

    expect(store.getState().fields['kind']).toBeUndefined();
    expect(store.getState().fieldDefs['kind']).toBeUndefined();
    expect(store.getState().getMeta('kind')).toBeUndefined();
    expect(store.getState().structureVersion).toBe(1);
  });

  it('a nonexistent name is a silent no-op — no structureVersion bump', () => {
    const store = createFormStore(TwoFieldForm());
    expect(() => store.getState().removeField('does-not-exist')).not.toThrow();
    expect(store.getState().structureVersion).toBe(0);
  });
});

describe('FormMutator.addField/removeField via onChanges (EF4)', () => {
  it('an onChanges handler can add a field mid-cascade; it does not retro-fire dispatch for itself', () => {
    const dispatched: string[] = [];
    const form = TwoFieldForm().onChange((m: FormMutator, changedField) => {
      dispatched.push(changedField);
      if (changedField === 'kind' && m.getValue('kind') === 'extended') {
        m.addField(new StringField('extra', 3).withDefaultValue('added'));
      }
    });
    const store = createFormStore(form);

    store.getState().setValue('kind', 'extended');

    expect(store.getState().fieldDefs['extra']).toBeDefined();
    expect(store.getState().getValue('extra')).toBe('added');
    expect(store.getState().structureVersion).toBe(1);
    // addField must not itself dispatch onChanges for 'extra' — only 'kind' was dispatched.
    expect(dispatched).toEqual(['kind']);
  });

  it('an onChanges handler can remove a field mid-cascade', () => {
    const form = TwoFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'kind' && m.getValue('kind') === 'minimal') {
        m.removeField('name');
      }
    });
    const store = createFormStore(form);

    store.getState().setValue('kind', 'minimal');

    expect(store.getState().fieldDefs['name']).toBeUndefined();
    expect(store.getState().structureVersion).toBe(1);
  });

  it('addField inside a handler does not enter the setValue loop-guard batch', () => {
    // regression guard: addField/removeField are plain `set()` calls, not
    // routed through performSetValue's dispatchBatch — a version bump must
    // never suppress or be suppressed by the synchronous setValue loop-guard.
    let bDispatchCount = 0;
    const form = TwoFieldForm().onChange((m: FormMutator, changedField) => {
      if (changedField === 'name') {
        m.addField(new StringField('extra', 3));
        m.setValue('kind', 'from-name');
      } else if (changedField === 'kind') {
        bDispatchCount++;
      }
    });
    const store = createFormStore(form);
    store.getState().setValue('name', 'go');

    expect(store.getState().fieldDefs['extra']).toBeDefined();
    expect(store.getState().getValue('kind')).toBe('from-name');
    expect(bDispatchCount).toBe(1);
  });
});

describe('validate() participation (EF4)', () => {
  it('a dynamically added required field participates in validateAll', async () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().addField(new StringField('extra', 3).withRequired());

    const valid = await store.getState().validateAll();

    expect(valid).toBe(false);
    expect(store.getState().fields['extra']?.errors?.length).toBeGreaterThan(0);
  });

  it("a removed field's errors are gone and it no longer blocks validateAll", async () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().addField(new StringField('extra', 3).withRequired());
    expect(await store.getState().validateAll()).toBe(false);

    store.getState().removeField('extra');

    expect(store.getState().fields['extra']).toBeUndefined();
    expect(await store.getState().validateAll()).toBe(true);
  });
});
