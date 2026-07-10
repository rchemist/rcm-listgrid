import { describe, expect, it, vi } from 'vitest';
import {
  EntityForm,
  StringField,
  type BackendAdapter,
  type BackendError,
} from '@listgrid/schema-core';
import { initializeFormStore } from '../initialize-form-store';

// EF3 — initializeFormStore pipe. Covers: dispatch order (onFetchData before
// onInitialize, both before build/hydrate — src/listgrid/config/
// EntityForm.tsx:162-306 successor), handler-returns-new-EntityForm respected,
// onInitialize per-handler try/catch (259-264 parity), dynamically-added
// fields getting first-class store slices + fetched values (flat AND dotted
// names), initialData bypassing the adapter, fetch-error short-circuit
// (198-203 parity), create mode, and the EF2 dispatch-isolation invariant
// (hydrate seeding must not fire onChanges handlers).

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
});
