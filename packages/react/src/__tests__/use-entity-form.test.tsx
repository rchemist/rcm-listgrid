// useEntityForm (spec §7; W2-7) — proves the bundled contract: (1) once the
// initializeFormStore pipe resolves, `store`/`entityForm` are defined and
// `controller` is built iff an adapter was supplied (no adapter => no
// save/delete transport => controller stays undefined); (2) the
// cancellation-safety inherited from useEntityFormInitializer (EF3) still
// holds through the composition — unmounting before the pipe resolves must
// not setState after unmount (no React act-warning via console.error).

import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { EntityForm, StringField, type BackendAdapter } from '@listgrid/schema-core';
import { useEntityForm } from '../hooks/use-entity-form';

function widgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

function fakeAdapter(): BackendAdapter {
  return {
    list: async () => ({ content: [], totalElements: 0, totalPages: 0 }),
    getOne: async () => ({ id: '1', name: 'Widget One' }),
    create: async () => ({}),
    update: async () => ({}),
    remove: async () => {},
  };
}

describe('useEntityForm (W2-7)', () => {
  it('builds a controller once store+entityForm resolve AND an adapter is supplied; no adapter => controller stays undefined', async () => {
    const adapter = fakeAdapter();
    // hoisted (created ONCE, outside the render callback) — a fresh
    // widgetForm() per render would change `entityForm` identity every
    // render, which re-triggers useEntityFormInitializer's effect (keyed on
    // entityForm/adapter/id identity) forever (see the cancellation test's
    // stable-identity note, mirrored from use-entity-form-initializer.test.tsx).
    const entityFormWithAdapter = widgetForm();
    const entityFormWithoutAdapter = widgetForm();

    const withAdapter = renderHook(() =>
      useEntityForm({ entityForm: entityFormWithAdapter, adapter, id: '1' }),
    );
    await waitFor(() => expect(withAdapter.result.current.loading).toBe(false));
    expect(withAdapter.result.current.store).toBeDefined();
    expect(withAdapter.result.current.entityForm).toBeDefined();
    expect(withAdapter.result.current.controller).toBeDefined();
    expect(typeof withAdapter.result.current.controller?.save).toBe('function');
    expect(typeof withAdapter.result.current.controller?.delete).toBe('function');

    const withoutAdapter = renderHook(() =>
      useEntityForm({ entityForm: entityFormWithoutAdapter }),
    );
    await waitFor(() => expect(withoutAdapter.result.current.loading).toBe(false));
    expect(withoutAdapter.result.current.store).toBeDefined();
    expect(withoutAdapter.result.current.entityForm).toBeDefined();
    expect(withoutAdapter.result.current.controller).toBeUndefined();
  });

  it('the same controller instance persists across re-renders (memoized) once resolved', async () => {
    const adapter = fakeAdapter();
    const entityForm = widgetForm();

    const { result, rerender } = renderHook(
      (props: { adapter: BackendAdapter }) =>
        useEntityForm({ entityForm, adapter: props.adapter, id: '1' }),
      { initialProps: { adapter } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    const firstController = result.current.controller;

    rerender({ adapter });
    expect(result.current.controller).toBe(firstController);
  });

  it('cancellation-safe (inherited from useEntityFormInitializer, EF3) — unmounting before the pipe resolves does not setState after unmount', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let resolveGetOne!: (data: Record<string, unknown>) => void;
    const adapter: BackendAdapter = {
      list: async () => ({ content: [], totalElements: 0, totalPages: 0 }),
      getOne: () =>
        new Promise((resolve) => {
          resolveGetOne = resolve;
        }),
      create: async () => ({}),
      update: async () => ({}),
      remove: async () => {},
    };

    const entityForm = widgetForm();
    const { result, unmount } = renderHook(() => useEntityForm({ entityForm, adapter, id: '1' }));
    expect(result.current.loading).toBe(true);

    unmount();
    resolveGetOne({ id: '1', name: 'Widget One' });
    await new Promise((r) => setTimeout(r, 0));

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
