import { createContext, useContext, type ReactNode } from 'react';
import { useStore, type StoreApi } from 'zustand';
import {
  getCurrentValue,
  type FieldMetaOverride,
  type FieldValueSlice,
} from '@listgrid/schema-core';
import type { FormStoreState } from '@listgrid/state';

// FormStoreProvider — threads the per-instance form StoreApi (ADR-0002) down
// to FieldRenderer/ViewEntityForm. This is a REQUIRED wiring seam: rendering
// any field without a store to read/write its value slice is a host bug, so
// (unlike RouterProvider) the hook throws when the provider is missing.

const FormStoreContext = createContext<StoreApi<FormStoreState> | undefined>(undefined);

export interface FormStoreProviderProps {
  store: StoreApi<FormStoreState>;
  children?: ReactNode;
}

export function FormStoreProvider({ store, children }: FormStoreProviderProps) {
  return <FormStoreContext.Provider value={store}>{children}</FormStoreContext.Provider>;
}

/** Returns the injected form StoreApi. Throws a clear error if unwired. */
export function useFormStore(): StoreApi<FormStoreState> {
  const ctx = useContext(FormStoreContext);
  if (ctx === undefined) {
    throw new Error(
      '[@listgrid/react] useFormStore() was called without a <FormStoreProvider> ancestor. ' +
        'Wrap your form in <FormStoreProvider store={createFormStore(entityForm)}>.',
    );
  }
  return ctx;
}

const EMPTY_SLICE: FieldValueSlice = {};

/**
 * Subscribes to ONE field's value slice — `state.fields[name]` — so a
 * keystroke re-renders only the field being edited, not the whole form
 * (decision D4, the critical guarantee this whole layer exists to preserve;
 * the 0.3.x `entityForm.clone(true)` full-tree re-render path is gone).
 */
export function useFormField(name: string): FieldValueSlice {
  const store = useFormStore();
  return useStore(store, (s) => s.fields[name] ?? EMPTY_SLICE);
}

const EMPTY_META: FieldMetaOverride = {};

/**
 * Subscribes to ONE field's imperative meta override (EF1) —
 * `state.meta[name]`. setMeta re-renders only that field, mirroring
 * useFormField's D4 granularity guarantee.
 */
export function useFieldMeta(name: string): FieldMetaOverride {
  const store = useFormStore();
  return useStore(store, (s) => s.meta[name] ?? EMPTY_META);
}

/**
 * Convenience on top of {@link useFormField} — the field's resolved current
 * value (create→default, update→fetched, else explicit `current`), reactive
 * to both this field's slice and the store's renderType.
 */
export function useFieldValue<T = unknown>(name: string): T | undefined {
  const store = useFormStore();
  return useStore(store, (s) =>
    getCurrentValue<T>(s.fields[name] as FieldValueSlice<T>, s.renderType),
  );
}

/** Snapshot every field's resolved current value — used to build a FieldEvalContext. */
export function snapshotFieldValues(state: FormStoreState): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const [n, slice] of Object.entries(state.fields)) {
    values[n] = getCurrentValue(slice, state.renderType);
  }
  return values;
}
