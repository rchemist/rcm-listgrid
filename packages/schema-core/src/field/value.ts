import { isEqualCollection, isEquals } from '../util/compare';
import type { FieldValue, FieldValueSlice, RenderType } from './types';

// Pure value-slice operations — the runtime value lives in the form store
// (ADR-0002 §Decision 1), so these are FREE FUNCTIONS over a FieldValueSlice
// rather than methods on the field instance (the field is pure meta). All three
// are transplanted verbatim from the 0.3.x FormField base
// (src/listgrid/components/fields/abstract/FormField.tsx:526-606,726-767) — the
// charter-C4 dirty/blank/current micro-decisions, unchanged.

/**
 * The effective current value for a render mode. If `current` is explicitly
 * present (even as undefined) it wins; otherwise fall back to default (create)
 * or fetched (update). Transplant of FormField.getCurrentValue:726-737.
 */
export function getCurrentValue<T>(
  slice: FieldValue<T> | undefined,
  renderType: RenderType = 'create',
): T | undefined {
  if (slice === undefined) return undefined;
  if (Object.prototype.hasOwnProperty.call(slice, 'current')) {
    return slice.current;
  }
  return renderType === 'create' ? slice.default : slice.fetched;
}

/** Transplant of FormField.isBlank:531-539 — empty array / undefined / null / ''. */
export function isBlank(slice: FieldValue | undefined, renderType: RenderType = 'create'): boolean {
  const value = getCurrentValue(slice, renderType);
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value === undefined || value === null || value === '';
}

/**
 * Normalize '', null, undefined, and empty-object to undefined for dirty
 * comparison. Transplant of FormField.normalizeEmptyValue:596-606.
 */
export function normalizeEmptyValue(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
    return undefined;
  }
  return value;
}

/**
 * Structural dirty check. Transplant of FormField.isDirty:542-590 — the exact
 * create-mode (fetched undefined) vs update-mode branch split, empty
 * normalization, and order-insensitive collection equality.
 */
export function isDirty(slice: FieldValue | undefined): boolean {
  if (!slice) return false;

  // neither fetched nor current set → field never touched → not dirty
  if (slice.fetched === undefined && slice.current === undefined) {
    return false;
  }

  // create mode: fetched undefined, compare current vs default
  if (slice.fetched === undefined && slice.current !== undefined) {
    const normalizedCurrent = normalizeEmptyValue(slice.current);
    const normalizedDefault = normalizeEmptyValue(slice.default);

    if (normalizedCurrent === undefined && normalizedDefault === undefined) return false;
    if (normalizedCurrent === normalizedDefault) return false;
    if (Array.isArray(normalizedCurrent) && Array.isArray(normalizedDefault)) {
      return !isEqualCollection(normalizedCurrent, normalizedDefault, true);
    }
    if (
      typeof normalizedCurrent === 'object' &&
      normalizedCurrent !== null &&
      typeof normalizedDefault === 'object' &&
      normalizedDefault !== null
    ) {
      return !isEquals(normalizedCurrent, normalizedDefault);
    }
    return true;
  }

  // update mode: compare original (fetched ?? default) vs current
  const originalValue = slice.fetched !== undefined ? slice.fetched : slice.default;
  const currentValue = slice.current;

  if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
    return !isEqualCollection(originalValue, currentValue, true);
  }
  return !isEquals(originalValue, currentValue);
}

/**
 * Reset current back to the mode's baseline (update→fetched, create→default).
 * Returns a NEW slice (immutable — the store replaces the slice). Transplant of
 * FormField.resetValue:757-767.
 */
export function resetValue<T>(
  slice: FieldValueSlice<T>,
  renderType: RenderType = 'create',
): FieldValueSlice<T> {
  const resetTo = renderType === 'update' ? slice.fetched : slice.default;
  const next: FieldValueSlice<T> = { ...slice };
  if (resetTo === undefined) {
    delete next.current;
  } else {
    next.current = resetTo;
  }
  next.dirty = false;
  delete next.errors;
  return next;
}
