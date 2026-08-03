import type { StoreApi } from 'zustand/vanilla';
import type { FormStoreState } from './form-store';

export type BufferedSubCollectionRow = Record<string, unknown>;

// Create-screen child rows are transport state, not part of the public form
// state shape. Keeping them in a WeakMap preserves the exact observable store
// contract for the default embedded mode and releases them with the store.
const buffers = new WeakMap<StoreApi<FormStoreState>, Map<string, BufferedSubCollectionRow[]>>();

export function setBufferedSubCollectionRows(
  store: StoreApi<FormStoreState>,
  fieldName: string,
  rows: BufferedSubCollectionRow[],
): void {
  let byField = buffers.get(store);
  if (byField === undefined) {
    byField = new Map();
    buffers.set(store, byField);
  }
  if (rows.length === 0) {
    byField.delete(fieldName);
    if (byField.size === 0) buffers.delete(store);
    return;
  }
  byField.set(fieldName, [...rows]);
}

export function getBufferedSubCollectionRows(
  store: StoreApi<FormStoreState>,
  fieldName: string,
): BufferedSubCollectionRow[] {
  return [...(buffers.get(store)?.get(fieldName) ?? [])];
}
