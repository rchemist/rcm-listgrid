import { describe, expect, it, vi } from 'vitest';
import {
  EntityForm,
  StringField,
  type BackendAdapter,
  type BackendError,
} from '@listgrid/schema-core';
import { initializeFormStore } from '../initialize-form-store';

// EF3/EF7 — initializeFormStore pipe. Covers: dispatch order (BIND before
// onFetchData before onInitialize before REBIND/build — src/listgrid/config/
// EntityForm.tsx:162-306 successor), handler-returns-new-EntityForm respected,
// onInitialize per-handler try/catch (259-264 parity), dynamically-added
// fields getting first-class store slices + fetched values (flat AND dotted
// names), initialData bypassing the adapter, fetch-error short-circuit
// (198-203 parity), create mode, and the EF2 dispatch-isolation invariant
// (BIND seeding must not fire onChanges handlers). The 'EF7' describe block
// below covers the hook-setValue-overrides-fetched-value reorder fix.

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

describe('initializeFormStore (EF3)', () => {
  it('pipeline order: onFetchData runs before onInitialize', async () => {
    const calls: string[] = [];
    const form = WidgetForm()
      .withOnFetchData((ef) => {
        calls.push('onFetchData');
        return ef;
      })
      .withOnInitialize((ef) => {
        calls.push('onInitialize');
        return ef;
      });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'fetched' }));

    await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(calls).toEqual(['onFetchData', 'onInitialize']);
  });

  it('a handler returning a NEW EntityForm is respected — later handlers see the replacement, not the original', async () => {
    const seenTitles: (string | undefined)[] = [];
    const form = WidgetForm()
      .withTitle('Original')
      .withOnFetchData((ef) => ef.clone().withTitle('Replaced'))
      .withOnInitialize((ef) => {
        seenTitles.push(ef.getTitle());
        return ef;
      });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'x' }));

    const result = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(seenTitles).toEqual(['Replaced']);
    expect(result.entityForm.getTitle()).toBe('Replaced');
  });

  it('onInitialize handler throw is caught (logged) and remaining handlers still run', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const calls: string[] = [];
    const form = WidgetForm()
      .withOnInitialize(() => {
        calls.push('first');
        throw new Error('boom');
      })
      .withOnInitialize((ef) => {
        calls.push('second');
        return ef;
      });

    const result = await initializeFormStore({ entityForm: form });
    expect(calls).toEqual(['first', 'second']);
    expect(consoleError).toHaveBeenCalled();
    expect(result.error).toBeUndefined();
    consoleError.mockRestore();
  });

  it('a field dynamically added inside onInitialize gets a store slice AND its fetched value (flat name)', async () => {
    const form = WidgetForm().withOnInitialize((ef) =>
      ef.addFields({ items: [new StringField('extra', 2).withLabel('Extra')] }),
    );
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'x', extra: 'added-value' }));

    const { store, entityForm } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(entityForm.getField('extra')).toBeDefined();
    expect(store.getState().fields.extra).toBeDefined();
    expect(store.getState().getValue('extra')).toBe('added-value');
  });

  it('a field dynamically added inside onInitialize with a dotted name resolves a nested path', async () => {
    const form = WidgetForm().withOnInitialize((ef) =>
      ef.addFields({ items: [new StringField('a.b', 2).withLabel('Nested')] }),
    );
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
      .withOnFetchData((ef) => {
        calls.push('onFetchData');
        return ef;
      })
      .withOnInitialize((ef) => {
        calls.push('onInitialize');
        return ef;
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

  it('create mode (no id, no initialData): onInitialize runs, onFetchData does not', async () => {
    const calls: string[] = [];
    const form = WidgetForm()
      .withOnFetchData((ef) => {
        calls.push('onFetchData');
        return ef;
      })
      .withOnInitialize((ef) => {
        calls.push('onInitialize');
        return ef;
      });

    const result = await initializeFormStore({ entityForm: form });
    expect(calls).toEqual(['onInitialize']);
    expect(result.error).toBeUndefined();
    expect(result.store.getState().renderType).toBe('create');
  });

  it('hydrate seeding does NOT trigger EF2 onChanges dispatch', async () => {
    const onChangesCalls: string[] = [];
    const form = WidgetForm().withOnChanges((_m, changedField) => {
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

  it('an onFetchData handler that throws is caught (logged) and does not abort the pipe — remaining onFetchData handlers and onInitialize still run', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const calls: string[] = [];
    const form = WidgetForm()
      .withOnFetchData(() => {
        calls.push('first');
        throw new Error('boom');
      })
      .withOnFetchData((ef) => {
        calls.push('second');
        return ef;
      })
      .withOnInitialize((ef) => {
        calls.push('onInitialize');
        return ef;
      });
    const adapter = fakeAdapter(async () => ({ id: '1', name: 'fetched' }));

    const result = await initializeFormStore({ entityForm: form, adapter, id: '1' });
    expect(calls).toEqual(['first', 'second', 'onInitialize']);
    expect(consoleError).toHaveBeenCalled();
    expect(result.error).toBeUndefined();
    // store is still usable.
    expect(() => result.store.getState().setValue('name', 'x')).not.toThrow();
    expect(result.store.getState().getValue('name')).toBe('x');
    consoleError.mockRestore();
  });

  // EF7 — the core fix: onInitialize/onFetchData setValue must OVERRIDE the
  // bound fetched value, not be clobbered by it (regression: an earlier pipe
  // ordering ran hooks -> build -> hydrate, so hydrate ran LAST and silently
  // won over any hook-set value).
  describe('EF7 — hook setValue overrides the fetched value', () => {
    function ContractedForm(): EntityForm {
      return new EntityForm('EnrollmentEntityForm', '/enrollment').addFields({
        items: [new StringField('contracted', 1).withLabel('Contracted')],
      });
    }

    it('onInitialize setValue overrides a boolean fetched value with a derived string', async () => {
      const form = ContractedForm().withOnInitialize((ef) => {
        const fetchedContracted = ef.getField('contracted')?.value?.current;
        return ef.setValue('contracted', fetchedContracted ? 'CONTRACTED' : 'GENERAL');
      });
      const adapter = fakeAdapter(async () => ({ id: '1', contracted: true }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().getValue('contracted')).toBe('CONTRACTED');
    });

    it('onFetchData setValue also overrides the fetched value', async () => {
      const form = ContractedForm().withOnFetchData((ef, data) => {
        return ef.setValue('contracted', data.contracted ? 'CONTRACTED' : 'GENERAL');
      });
      const adapter = fakeAdapter(async () => ({ id: '1', contracted: true }));

      const { store } = await initializeFormStore({ entityForm: form, adapter, id: '1' });
      expect(store.getState().getValue('contracted')).toBe('CONTRACTED');
    });

    it('precedence: hook setValue > fetched record > declared default', async () => {
      const base = () =>
        new EntityForm('WidgetEntityForm', '/widget').addFields({
          items: [new StringField('name', 1).withDefaultValue('D')],
        });

      // hook wins over record.
      const withHook = base().withOnInitialize((ef) => ef.setValue('name', 'H'));
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

    it('a field ADDED by an onInitialize handler gets its fetched value from the record (rebind)', async () => {
      const form = ContractedForm().withOnInitialize((ef) =>
        ef.addFields({ items: [new StringField('extra', 2)] }),
      );
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
        .withOnInitialize((ef) => ef.setValue('absentField', 'hook-set'));
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
});
