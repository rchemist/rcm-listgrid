import type { FieldType } from '@listgrid/schema-core';

// Per-type export/import value transforms for the `/excel` runtime (spec
// §3.5 decision 5, entityform-api-implementation-waves.md W6-2 착수 노트
// "값변환 tiers"). Ported & adapted from the 0.3.x `DataField.getValueOnExport`
// / `getValueOnImport` switch (`src/listgrid/transfer/Type.ts:531-620`) plus
// its helpers (`fDate`/`fDateTime`/range parsers at `Type.ts:747-815`,
// `getPlainText`, `isTrue`) — see each helper's doc comment below for the
// exact source line range it transplants.
//
// Three tiers (W6-2 착수 노트, do NOT extend without a spec/plan update):
//   TIER 1 — select/multiselect/date/datetime/boolean/html/markdown: real
//     value transforms (this file's `exportValue`/`importValue` switch).
//   TIER 2 — every other FieldType: scalar passthrough
//     (export = `value==null ? '' : String(value)`, import = identity).
//   TIER 3 — subCollection/contentAsset/multipleAsset/file/image/inlineMap/
//     mappedJoin: no flat xlsx-cell representation. `isAutoDeriveExcluded`
//     flags these for the auto-derive step (governs INCLUSION in an
//     auto-derived DataFieldSpec[] list, not the transform switch itself —
//     if one of these types is ever passed to `exportValue`/`importValue`
//     explicitly, it simply falls through to the TIER 2 passthrough case
//     below, same as any other type not in the TIER 1 switch).

// -- date/datetime formatting -----------------------------------------------
// No reusable date-formatting util exists in this package's dependency graph
// (`@listgrid/schema-core` only — searched `packages/schema-core/src` and
// `packages/*/src` for `date-fns`/`fDate`/format helpers: none reachable;
// `packages/react/src/registry/datetime-renderer.tsx` hand-rolls its own
// zero-pad formatter for the SAME reason stated in its own comment — "no
// date-fns dep in this package"). Following that established new-engine
// precedent, `fDate`/`fDateTime` below are a hand-rolled port of the 0.3.x
// originals (`src/listgrid/misc/index.ts:49-65`, both backed by date-fns
// `format`) reproducing ONLY their DEFAULT-format output — the sole way
// they're invoked from the range helpers this module ports
// (`Type.ts:747-815` never passes a custom `dateFormat`/`newFormat`
// argument), so no general-purpose format-string parameter is carried over.

/** Zero-pad to 2 digits (mirrors `datetime-renderer.tsx`'s `pad2`). */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** `undefined` for anything that isn't (or doesn't parse to) a valid `Date` —
 *  mirrors the old `fDate`/`fDateTime`'s `try { ... } catch { return '' }`
 *  plus their `date ? format(...) : ''` falsy guard, collapsed into one
 *  shared parse step. */
function toValidDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const d = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Port of `fDate`'s default format `'yyyy-MM-dd'` (`misc/index.ts:49-56`). */
function fDate(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Port of `fDateTime`'s default format `'yyyy-MM-dd p'` (`misc/index.ts:58-65`)
 *  — date-fns's `p` token: 12-hour clock, no leading zero on the hour,
 *  English AM/PM (the old call site passes no locale, so `p` renders in
 *  date-fns's default English form, e.g. `2026-07-12 3:04 PM`). */
function fDateTime(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return '';
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${fDate(d)} ${hours12}:${pad2(d.getMinutes())} ${ampm}`;
}

/** Port of `getRangeDateValue`/`getRangeDatetimeValue` (`Type.ts:747-775`):
 *  a 2-element array formats as `"${fmt(a)} ~ ${fmt(b)}"`, a 1-element array
 *  formats its sole element, anything else formats as a single value
 *  (the old code returned a non-array `value` UNCHANGED — since this
 *  module's `exportValue` must return a `string`, a bare scalar is instead
 *  formatted directly, which is the natural single-value case the old
 *  length-1-array branch already covers). */
function formatDateRangeExport(value: unknown, fmt: (v: unknown) => string): string {
  if (Array.isArray(value)) {
    if (value.length === 2) return `${fmt(value[0])} ~ ${fmt(value[1])}`;
    if (value.length === 1) return fmt(value[0]);
    return '';
  }
  return fmt(value);
}

/** Port of `getImportedRangeDateValue`/`getImportedRangeDatetimeValue`
 *  (`Type.ts:777-815`): splits on `' ~ '`, then bare `'~'`, then `','` (first
 *  match wins, in that order) into a 2-element `[fmt(a), fmt(b)]`; no
 *  separator found → single formatted value. */
function importDateRangeValue(value: unknown, fmt: (v: unknown) => string): unknown {
  if (value === undefined) return value;
  const s = `${value}`;
  for (const sep of [' ~ ', '~', ',']) {
    if (s.includes(sep)) {
      const parts = s.split(sep);
      return [fmt(parts[0]), fmt(parts[1])];
    }
  }
  return fmt(value);
}

// -- boolean ------------------------------------------------------------
/** Port of `isTrue` (`src/listgrid/utils/BooleanUtil.ts:1-12`, verbatim). */
function isTrue(value: unknown, defaultValue?: boolean): boolean {
  if (value === undefined || value === null || value === '') {
    return defaultValue ?? false;
  }
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1' || value === 'on' || value === 'yes' || value === '예';
}

// -- html/markdown --------------------------------------------------------
/** Port of `getPlainText` (`src/listgrid/ui/UIProvider.tsx:411-414`,
 *  verbatim tag-strip regex). */
function getPlainText(html: unknown): string {
  if (html === undefined || html === null || html === '') return '';
  return String(html).replace(/<[^>]*>/g, '');
}

// -- select options carried in from the field declaration --------------------
/** Minimal option shape `exportValue`/`importValue` need — looser than
 *  `@listgrid/schema-core`'s `SelectOption` (`value: string | number |
 *  boolean`) since this module has no reason to import a schema-core type
 *  just to narrow one field. */
export interface ValueTransformOption {
  value: unknown;
  label: string;
}

export interface ValueTransformOptions {
  options?: ValueTransformOption[] | undefined;
}

/**
 * Export a field's runtime value to its xlsx-cell string representation,
 * keyed off `type` (TIER 1 switch; everything else is TIER 2 passthrough —
 * see file header). `options` carries the field's declared `SelectOption[]`
 * for `select`/`multiselect` (`Type.ts:540-564`); omit for every other type.
 */
export function exportValue(
  type: FieldType,
  value: unknown,
  options?: ValueTransformOptions,
): string {
  if (value === undefined || value === null) return '';

  switch (type) {
    case 'select': {
      const opts = options?.options;
      const found = opts?.find((o) => o.value === value);
      return found ? found.label : String(value);
    }
    case 'multiselect': {
      // The runtime value is a `'|||'`-joined string (0.3.x wire encoding,
      // Type.ts:545-564) — the new engine's `MultiSelectField` runtime value
      // is a plain `string[]` (multi-select-field.ts), so bridging that
      // array to/from this string encoding is the export/import CORE's job
      // (W6-2b), not this pure per-type switch's.
      const val = String(value);
      if (val === '') return '';
      const pieces = val.includes('|||') ? val.split('|||') : [val];
      const opts = options?.options;
      return pieces
        .map((piece) => {
          const found = opts?.find((o) => String(o.value) === piece);
          return found ? found.label : piece;
        })
        .join('|||');
    }
    case 'date':
      return formatDateRangeExport(value, fDate);
    case 'datetime':
      return formatDateRangeExport(value, fDateTime);
    case 'boolean':
      return isTrue(value) ? '예' : '아니오';
    case 'html':
    case 'markdown':
      return getPlainText(value);
    default:
      return String(value);
  }
}

/**
 * Import an xlsx-cell value back to a field's runtime value, keyed off
 * `type` (TIER 1 switch; everything else is TIER 2 passthrough).
 *
 * Deviation from the brief's literal 2-arg signature
 * (`importValue(type, value): unknown`): the TIER 1 spec explicitly requires
 * `select`/`multiselect` label→value resolution ("needs the field's options
 * passed in"), which is impossible without the option list, and the
 * mandated export+import round-trip tests for those two types cannot pass
 * without it. `options` is added as an optional 3rd parameter (same shape as
 * `exportValue`'s) rather than silently leaving those two types unable to
 * invert their own export — flagged in the handoff report as a
 * needs_decision-style deviation, not a silent invention.
 */
export function importValue(
  type: FieldType,
  value: unknown,
  options?: ValueTransformOptions,
): unknown {
  switch (type) {
    case 'select': {
      const opts = options?.options;
      const found = opts?.find((o) => o.label === value);
      return found ? found.value : value;
    }
    case 'multiselect': {
      const val = value === undefined || value === null ? '' : String(value);
      if (val === '') return '';
      const pieces = val.includes('|||') ? val.split('|||') : [val];
      const opts = options?.options;
      return pieces
        .map((piece) => {
          const found = opts?.find((o) => o.label === piece);
          return found ? String(found.value) : piece;
        })
        .join('|||');
    }
    case 'date':
      return importDateRangeValue(value, fDate);
    case 'datetime':
      return importDateRangeValue(value, fDateTime);
    case 'boolean':
      return isTrue(value);
    case 'html':
    case 'markdown':
      return value;
    default:
      return value;
  }
}

// -- TIER 3: auto-derive exclusion -------------------------------------------

/** Composite `FieldType`s with no flat xlsx-cell representation (W6-2 착수
 *  노트 값변환 tiers, TIER 3 — exact list, do NOT extend without a spec/plan
 *  update). Governs auto-derive INCLUSION only (spec §3.5: "소비자가
 *  export.fields에 명시하면 그대로 전달") — a consumer that explicitly lists
 *  one of these in `export.fields`/`import.fields` still gets it transformed
 *  (falling through to the TIER 2 passthrough case in the switches above). */
const AUTO_DERIVE_EXCLUDED_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  'subCollection',
  'contentAsset',
  'multipleAsset',
  'file',
  'image',
  'inlineMap',
  'mappedJoin',
]);

/** `true` iff `type` has no flat xlsx-cell representation and must be
 *  dropped from an AUTO-DERIVED `DataFieldSpec[]` list (TIER 3, see above). */
export function isAutoDeriveExcluded(type: FieldType): boolean {
  return AUTO_DERIVE_EXCLUDED_TYPES.has(type);
}

/**
 * Logs a `console.warn` when an auto-derive step encounters a TIER 3 type —
 * called by the export/import CORE's auto-derive loop (W6-2b, this package;
 * NOT the schema-core auto-derive in `data-transfer.ts`, which stays pure
 * declaration and never imports `/excel`, L6/ADR-0003). No-op for any other
 * type. Not barrel-exported (`index.ts`) — a sibling module inside this same
 * package imports it directly; it isn't part of `@listgrid/excel`'s public
 * surface.
 */
export function warnAutoDeriveExcluded(fieldName: string, type: FieldType): void {
  if (!isAutoDeriveExcluded(type)) return;
  console.warn(
    `[@listgrid/excel] auto-derive: field "${fieldName}" has type "${type}", which has ` +
      'no flat xlsx-cell representation and was excluded. Declare it explicitly in ' +
      'export.fields/import.fields to include it anyway.',
  );
}
