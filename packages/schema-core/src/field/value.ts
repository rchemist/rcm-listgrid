import { isEqualCollection, isEquals } from '../util/compare';
import type { FieldType, FieldValue, FieldValueSlice, RenderType } from './types';

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

/**
 * Transplant of FormField.isBlank:531-539 — empty array / undefined / null / ''.
 *
 * R3 (xref runtime-required fix): `fieldType` GUARDS an xref-only branch — for
 * the `xrefMapping`/`xrefPreferMapping` envelope (`{mapped, deleted?}` /
 * `{mapped}`, deliberately kept as a non-null object so `deleted` survives an
 * emptied `mapped`, hence never blank under the generic object check below)
 * blank means "no mapped rows". This lets the generic required-blank path
 * (`form-field.ts` `validate()`, which already reads `override?.required`)
 * govern xref requiredness like every other field, so the EF1 store override
 * (`setMeta({required})`) is authoritative in BOTH directions. Omitting
 * `fieldType` (every non-xref caller) leaves the original behavior untouched.
 */
export function isBlank(
  slice: FieldValue | undefined,
  renderType: RenderType = 'create',
  fieldType?: FieldType,
): boolean {
  const value = getCurrentValue(slice, renderType);
  if (fieldType === 'xrefMapping' || fieldType === 'xrefPreferMapping') {
    if (value === undefined || value === null) return true;
    const mapped = (value as { mapped?: unknown[] }).mapped;
    return mapped === undefined || mapped.length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value === undefined || value === null || value === '';
}

/**
 * Normalize '', null, undefined, empty-object, and (EA-B1) empty-array to
 * undefined for dirty comparison. Transplant of
 * FormField.normalizeEmptyValue:596-606, EXTENDED by EA-B1: the 0.3.x
 * original normalized empty non-array objects but never arrays, so a
 * create-mode array field (Checkbox/MultiSelect/Tag/CustomOption-multiple)
 * with `current=[]` and no declared default was misjudged dirty=true by the
 * newer engine's create-mode branch below (undefined default normalizes to
 * undefined, `[]` did not, so `normalizedCurrent !== normalizedDefault`) —
 * a systemic gap across every array-valued field, not present in 0.3.x
 * (whose FormField.isDirty ran `isEmpty(current) && isEmpty(original)` up
 * front, treating [] as empty there too). See ea-b-scout-briefing.md PART B
 * closing note + PART D item 6.
 */
export function normalizeEmptyValue(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? undefined : value;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
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
 * FormField.resetValue:757-767. W4-6 FIX #3 (phase-end hardening) — a slice
 * carrying the W4-3 `asyncState` tri-state is ALSO reset to `'unchecked'`
 * here, mirroring how `errors` is cleared just below: a reverted value is by
 * definition unchecked again (a stale 'valid'/'checking' from before the
 * reset must not linger and mislead the AsyncValidation button/status UI).
 * A slice with no `asyncState` key (no declared AsyncValidation on the
 * field) is left untouched — this must never ADD the key to a field that
 * never had one.
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
  if (next.asyncState !== undefined) {
    next.asyncState = 'unchecked';
  }
  return next;
}
