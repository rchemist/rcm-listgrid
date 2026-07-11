import { describe, expect, it, vi } from 'vitest';
import {
  EntityForm,
  StringField,
  type BackendAdapter,
  type BackendError,
} from '@listgrid/schema-core';
import { initializeFormStore } from '../initialize-form-store';

// EF3/EF7/W2-1 — initializeFormStore pipe. Covers: dispatch order (BIND
// before onInit before REBIND/build — src/listgrid/config/EntityForm.tsx:
// 162-306 successor), onInit's data-branch contract (spec §4.2 — a single
// consolidated hook array replacing the former separate onFetchData/
// onInitialize passes), onInit per-handler try/catch (259-264 parity),
// dynamically-added fields getting first-class store slices + fetched values
// (flat AND dotted names), initialData bypassing the adapter, fetch-error
// short-circuit (198-203 parity), create mode, and the EF2 dispatch-isolation
// invariant (BIND seeding must not fire onChanges handlers). The 'EF7'
// describe block covers the hook-values.set-overrides-fetched-value reorder
// fix + precedence. The 'InitContext.values' describe block (relocated from
// the deleted packages/schema-core/src/__tests__/entity-form-value.test.ts,
// W2-1 — that file's subject, EntityForm.setValue/setFetchedValue, was
// removed per spec §3.6) covers ctx.values.set/setFetched unit-level
// semantics. The 'InitContext.setMeta' describe block is the W2-1 NEW test
// proving setMeta seeds the store's initial meta.

function WidgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

/** Minimal BackendAdapter double — only getOne is exercised by these tests. */
function fakeAdapter(getOne: BackendAdapter['getOne']): BackendAdapter {
  return {
    list: vi.fn(),
    getOne,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('initializeFormStore (EF3/W2-1)', () => {
  it('pipeline order: onInit handlers run in registration order', async () => {
    const calls: string[] = [];
    const form = WidgetForm()
      .onInit(() => {
        calls.push('first');
      })
      .onInit(() => {
        calls.push('second');
      });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'fetched' }));

    await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(calls).toEqual(['first', 'second']);
  });

  // W2-1 migration (spec §9): onInit returns void — there is no more
  // "return a replacement EntityForm" escape hatch (the old onFetchData/
  // onInitialize could `return ef.clone().withTitle('X')` and later handlers
  // would see the replacement). The behavior-equivalent replacement is
  // in-place mutation of ctx.form, which this test proves propagates to a
  // later handler AND to the pipe's final result.entityForm.
  it('an onInit handler mutates ctx.form in place — a later handler and the final result see the change', async () => {
    const seenTitles: (string | undefined)[] = [];
    const form = WidgetForm()
      .withTitle('Original')
      .onInit((ctx) => {
        ctx.form.withTitle('Replaced');
      })
      .onInit((ctx) => {
        seenTitles.push(ctx.form.getTitle());
      });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'x' }));

    const result = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(seenTitles).toEqual(['Replaced']);
    expect(result.entityForm.getTitle()).toBe('Replaced');
  });

  it('onInit handler throw is caught (logged) and remaining handlers still run', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const calls: string[] = [];
    const form = WidgetForm()
      .onInit(() => {
        calls.push('first');
        throw new Error('boom');
      })
      .onInit(() => {
        calls.push('second');
      });

    const result = await initializeFormStore({ entityForm: form });
    expect(calls).toEqual(['first', 'second']);
    expect(consoleError).toHaveBeenCalled();
    expect(result.error).toBeUndefined();
    consoleError.mockRestore();
  });

  it('a field dynamically added inside onInit gets a store slice AND its fetched value (flat name)', async () => {
    const form = WidgetForm().onInit((ctx) => {
      ctx.form.addFields({ items: [new StringField('extra', 2).withLabel('Extra')] });
    });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'x', extra: 'added-value' }));

    const { store, entityForm } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(entityForm.getField('extra')).toBeDefined();
    expect(store.getState().fields.extra).toBeDefined();
    expect(store.getState().getValue('extra')).toBe('added-value');
  });

  it('a field dynamically added inside onInit with a dotted name resolves a nested path', async () => {
    const form = WidgetForm().onInit((ctx) => {
      ctx.form.addFields({ items: [new StringField('a.b', 2).withLabel('Nested')] });
    });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'x', a: { b: 'nested-value' } }));

    const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(store.getState().getValue('a.b')).toBe('nested-value');
  });

  it('initialData bypasses the adapter entirely', async () => {
    const getOne = vi.fn();
    const adapter = fakeAdapter(getOne);
    const { store } = await initializeFormStore({
      entityForm: WidgetForm(),
      adapter,
      id: '1',
      initialData: { id: '1', name: 'from-initial-data' },
    });
    expect(getOne).not.toHaveBeenCalled();
    expect(store.getState().getValue('name')).toBe('from-initial-data');
  });

  it('adapter fetch error: hooks are skipped, store is still usable, error is returned', async () => {
    const calls: string[] = [];
    const err: BackendError = { code: 'UNKNOWN', message: 'network down' };
    const form = WidgetForm()
      .onInit(() => {
        calls.push('first');
      })
      .onInit(() => {
        calls.push('second');
      });
    const adapter = fakeAdapter(async () => {
      throw err;
    });

    const result = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(calls).toEqual([]);
    expect(result.error).toEqual(err);
    // store is still usable — build succeeded, just unhydrated.
    expect(() => result.store.getState().setValue('name', 'x')).not.toThrow();
    expect(result.store.getState().getValue('name')).toBe('x');
  });

  // spec §4.2 — onInit dispatches ALWAYS (create mode too, 0.3.x
  // onInitialize parity); a handler that wants the old onFetchData-only-
  // with-data behavior branches on ctx.data itself instead of relying on the
  // engine to gate a second pass.
  it('create mode (no id, no initialData): onInit runs; a ctx.data-guarded branch does not fire', async () => {
    const calls: string[] = [];
    const form = WidgetForm().onInit((ctx) => {
      calls.push('always');
      if (ctx.data) calls.push('data-branch');
    });

    const result = await initializeFormStore({ entityForm: form });
    expect(calls).toEqual(['always']);
    expect(result.error).toBeUndefined();
    expect(result.store.getState().renderType).toBe('create');
  });

  it('hydrate seeding does NOT trigger EF2 onChanges dispatch', async () => {
    const onChangesCalls: string[] = [];
    const form = WidgetForm().onChange((_m, changedField) => {
      onChangesCalls.push(changedField);
    });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'fetched-name' }));

    const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(store.getState().getValue('name')).toBe('fetched-name');
    expect(onChangesCalls).toEqual([]);
  });

  // EF-R1 regression — clone(true) parity: declared default/current values
  // must survive the pipe's clone step and reach the store (previously
  // dropped by clone()'s default includeValue=false, which cascaded to
  // FormField.clone deleting the whole value object).
  it('create mode: a declared withDefaultValue reaches the store', async () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1).withLabel('Name').withDefaultValue('default-name')],
    });

    const { store } = await initializeFormStore({ entityForm: form });
    expect(store.getState().getValue('name')).toBe('default-name');
  });

  it('create mode: a declared withValue reaches the store', async () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1).withLabel('Name').withValue('declared-current')],
    });

    const { store } = await initializeFormStore({ entityForm: form });
    expect(store.getState().getValue('name')).toBe('declared-current');
  });

  it('edit mode: declared defaults are preserved on the clone, but hydrate still overwrites with fetched data (no regression of hydrate precedence)', async () => {
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1).withLabel('Name').withDefaultValue('default-name')],
    });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'fetched-name' }));

    const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    // hydrate wins over the declared default in edit mode.
    expect(store.getState().getValue('name')).toBe('fetched-name');
  });

  it('an onInit handler that throws is caught (logged) and does not abort the pipe — remaining handlers still run', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const calls: string[] = [];
    const form = WidgetForm()
      .onInit(() => {
        calls.push('first');
        throw new Error('boom');
      })
      .onInit(() => {
        calls.push('second');
      })
      .onInit(() => {
        calls.push('third');
      });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'fetched' }));

    const result = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(calls).toEqual(['first', 'second', 'third']);
    expect(consoleError).toHaveBeenCalled();
    expect(result.error).toBeUndefined();
    // store is still usable.
    expect(() => result.store.getState().setValue('name', 'x')).not.toThrow();
    expect(result.store.getState().getValue('name')).toBe('x');
    consoleError.mockRestore();
  });

  // EF7 — the core fix: an onInit handler's ctx.values.set must OVERRIDE the
  // bound fetched value, not be clobbered by it (regression: an earlier pipe
  // ordering ran hooks -> build -> hydrate, so hydrate ran LAST and silently
  // won over any hook-set value).
  describe('EF7 — hook ctx.values.set overrides the fetched value', () => {
    function ContractedForm(): EntityForm {
      return new EntityForm('EnrollmentEntityForm', '/enrollment').addFields({
        items: [new StringField('contracted', 1).withLabel('Contracted')],
      });
    }

    it('onInit ctx.values.set (reading via ctx.values.get) overrides a boolean fetched value with a derived string', async () => {
      const form = ContractedForm().onInit((ctx) => {
        const fetchedContracted = ctx.values.get('contracted');
        ctx.values.set('contracted', fetchedContracted ? 'CONTRACTED' : 'GENERAL');
      });
      const adapter = fakeAdapter(async () => ({ id: '1', contracted: true }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().getValue('contracted')).toBe('CONTRACTED');
    });

    it('onInit ctx.values.set (reading via ctx.data directly) also overrides the fetched value', async () => {
      const form = ContractedForm().onInit((ctx) => {
        ctx.values.set('contracted', ctx.data?.contracted ? 'CONTRACTED' : 'GENERAL');
      });
      const adapter = fakeAdapter(async () => ({ id: '1', contracted: true }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().getValue('contracted')).toBe('CONTRACTED');
    });

    it('precedence: hook ctx.values.set > fetched record > declared default', async () => {
      const base = () =>
        new EntityForm('WidgetEntityForm', '/widget').addFields({
          items: [new StringField('name', 1).withDefaultValue('D')],
        });

      // hook wins over record.
      const withHook = base().onInit((ctx) => ctx.values.set('name', 'H'));
      const adapterR = fakeAdapter(async () => ({ id: '1', name: 'R' }));
      const r1 = await initializeFormStore({ entityForm: withHook, adapter: adapterR, id: '1' });
      expect(r1.store.getState().getValue('name')).toBe('H');

      // without the hook, record wins over the declared default.
      const adapterR2 = fakeAdapter(async () => ({ id: '1', name: 'R' }));
      const r2 = await initializeFormStore({ entityForm: base(), adapter: adapterR2, id: '1' });
      expect(r2.store.getState().getValue('name')).toBe('R');

      // create mode (no record): the declared default applies.
      const r3 = await initializeFormStore({ entityForm: base() });
      expect(r3.store.getState().getValue('name')).toBe('D');
    });

    it('a field ADDED by an onInit handler gets its fetched value from the record (rebind)', async () => {
      const form = ContractedForm().onInit((ctx) => {
        ctx.form.addFields({ items: [new StringField('extra', 2)] });
      });
      const adapter = fakeAdapter(async () => ({
        id: '1',
        contracted: true,
        extra: 'from-record',
      }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().getValue('extra')).toBe('from-record');
    });

    it('a field absent from the record in edit mode has current=undefined (default dropped) unless a hook sets it', async () => {
      const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
        items: [new StringField('absentField', 1).withDefaultValue('declared-default')],
      });
      const adapter = fakeAdapter(async () => ({ id: '1' })); // no `absentField` in the record

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().getValue('absentField')).toBeUndefined();
    });

    it('a hook can set a value for a field absent from the record — its override is NOT dropped', async () => {
      const form = new EntityForm('WidgetEntityForm', '/widget')
        .addFields({
          items: [new StringField('absentField', 1).withDefaultValue('declared-default')],
        })
        .onInit((ctx) => ctx.values.set('absentField', 'hook-set'));
      const adapter = fakeAdapter(async () => ({ id: '1' }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().getValue('absentField')).toBe('hook-set');
    });

    it('dotted names bind correctly through the BIND step', async () => {
      const form = new EntityForm('WidgetEntityForm', '/widget').addFields({
        items: [new StringField('user.state', 1)],
      });
      const adapter = fakeAdapter(async () => ({ id: '1', user: { state: 'CA' } }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().getValue('user.state')).toBe('CA');
    });

    it('dirty=false and renderType="update" after a plain (no-override) init with data', async () => {
      const form = ContractedForm();
      const adapter = fakeAdapter(async () => ({ id: '1', contracted: 'x' }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().isDirty()).toBe(false);
      expect(store.getState().renderType).toBe('update');
    });

    it('renderType="create" and dirty=false in create mode', async () => {
      const { store } = await initializeFormStore({ entityForm: ContractedForm() });
      expect(store.getState().isDirty()).toBe(false);
      expect(store.getState().renderType).toBe('create');
    });

    // EF4 parity: the init pipe retains the record on the store (via
    // CreateFormStoreOptions.fetchedData) so a field added at RUNTIME (well
    // after initializeFormStore returns, e.g. from an onChanges handler)
    // still rebinds — the same mechanism a direct hydrate() call fed before
    // this reorder.
    it('a field added at runtime AFTER init still rebinds from the retained record (EF4 parity)', async () => {
      const form = ContractedForm();
      const adapter = fakeAdapter(async () => ({
        id: '1',
        contracted: 'x',
        extra: 'runtime-value',
      }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      store.getState().addField(new StringField('extra', 2));

      expect(store.getState().getValue('extra')).toBe('runtime-value');
    });
  });

  // W2-1 NEW test (spec §4.1): "ctx.setMeta accumulates into the store's
  // initial meta seed" — an onInit handler's setMeta call must be reflected
  // in store.getMeta right after the store is built, with no runtime setMeta
  // call needed.
  describe('InitContext.setMeta seeds the store (spec §4.1)', () => {
    it('onInit calling setMeta({hidden:true}) is reflected in store.getMeta', async () => {
      const form = WidgetForm().onInit((ctx) => {
        ctx.setMeta('name', { hidden: true });
      });

      const { store } = await initializeFormStore({ entityForm: form });
      expect(store.getState().getMeta('name')).toEqual({ hidden: true });
    });

    it('multiple onInit handlers setMeta-ing the same field shallow-merge, in registration order', async () => {
      const form = WidgetForm()
        .onInit((ctx) => {
          ctx.setMeta('name', { hidden: true, required: false });
        })
        .onInit((ctx) => {
          ctx.setMeta('name', { required: true });
        });

      const { store } = await initializeFormStore({ entityForm: form });
      expect(store.getState().getMeta('name')).toEqual({ hidden: true, required: true });
    });

    it('a field with no setMeta call has no meta override (undefined, not {})', async () => {
      const form = WidgetForm().onInit((ctx) => {
        ctx.setMeta('name', { hidden: true });
      });

      const { store } = await initializeFormStore({ entityForm: form });
      // 'name' is the only declared field here, but confirms the seed is
      // scoped per-field, not a blanket override.
      const unrelatedForm = WidgetForm();
      const { store: plainStore } = await initializeFormStore({ entityForm: unrelatedForm });
      expect(plainStore.getState().getMeta('name')).toBeUndefined();
      expect(store.getState().getMeta('name')).toEqual({ hidden: true });
    });

    it('does not disturb a runtime store.setMeta call made after init', async () => {
      const form = WidgetForm().onInit((ctx) => {
        ctx.setMeta('name', { hidden: true });
      });

      const { store } = await initializeFormStore({ entityForm: form });
      store.getState().setMeta('name', { required: true });
      expect(store.getState().getMeta('name')).toEqual({ hidden: true, required: true });
    });
  });

  // Relocated from the deleted packages/schema-core/src/__tests__/
  // entity-form-value.test.ts (W2-1) — EntityForm.setValue/setFetchedValue
  // are removed per spec §3.6; their behavior moves into
  // InitContext.values.set/setFetched, which only exists as a closure
  // inside this pipe (no schema-core-layer surface left to unit-test in
  // isolation), so the behavioral coverage lives here instead, exercised
  // through onInit handlers.
  describe('InitContext.values.set/setFetched (EF7, relocated)', () => {
    it('values.set UNCONDITIONALLY overwrites a pre-existing current value (override semantics), never touching fetched', async () => {
      const form = new EntityForm('WidgetEntityForm', '/widget')
        .addFields({ items: [new StringField('name', 1).withLabel('Name')] })
        .onInit((ctx) => {
          ctx.values.set('name', 'override');
        });
      const adapter = fakeAdapter(async () => ({ id: '1', name: 'record-value' }));

      const { entityForm } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(entityForm.getField('name')?.value?.current).toBe('override');
      // fetched is untouched — values.set never touches the fetched baseline.
      expect(entityForm.getField('name')?.value?.fetched).toBe('record-value');
    });

    it('values.set on a nonexistent field name is a silent no-op', async () => {
      const form = new EntityForm('WidgetEntityForm', '/widget')
        .addFields({ items: [new StringField('name', 1)] })
        .onInit((ctx) => {
          ctx.values.set('does-not-exist', 'x');
        });

      await expect(initializeFormStore({ entityForm: form })).resolves.toBeDefined();
    });

    it('values.setFetched sets the field fetched value AND current when current was undefined', async () => {
      const form = new EntityForm('WidgetEntityForm', '/widget')
        .addFields({ items: [new StringField('name', 1)] })
        .onInit((ctx) => {
          ctx.values.setFetched('name', 'from-record');
        });

      const { entityForm } = await initializeFormStore({ entityForm: form });
      expect(entityForm.getField('name')?.value?.fetched).toBe('from-record');
      expect(entityForm.getField('name')?.value?.current).toBe('from-record');
    });

    it('values.setFetched does NOT overwrite an already-set current (declared withValue / an earlier values.set wins)', async () => {
      const form = new EntityForm('WidgetEntityForm', '/widget')
        .addFields({ items: [new StringField('name', 1)] })
        .onInit((ctx) => {
          ctx.values.set('name', 'declared-current');
          ctx.values.setFetched('name', 'from-record');
        });

      const { entityForm } = await initializeFormStore({ entityForm: form });
      expect(entityForm.getField('name')?.value?.current).toBe('declared-current');
      expect(entityForm.getField('name')?.value?.fetched).toBe('from-record');
    });

    it('values.setFetched on a nonexistent field name is a silent no-op', async () => {
      const form = new EntityForm('WidgetEntityForm', '/widget')
        .addFields({ items: [new StringField('name', 1)] })
        .onInit((ctx) => {
          ctx.values.setFetched('does-not-exist', 'x');
        });

      await expect(initializeFormStore({ entityForm: form })).resolves.toBeDefined();
    });

    it("values.get reads back the field's current draft value, reflecting an earlier handler's set within the same run", async () => {
      const seen: unknown[] = [];
      const form = new EntityForm('WidgetEntityForm', '/widget')
        .addFields({ items: [new StringField('name', 1)] })
        .onInit((ctx) => {
          ctx.values.set('name', 'first-handler-value');
        })
        .onInit((ctx) => {
          seen.push(ctx.values.get('name'));
        });

      await initializeFormStore({ entityForm: form });
      expect(seen).toEqual(['first-handler-value']);
    });
  });
});
