import type { InlineMapConfig, InlineMapField, KeyValue } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// InlineMap renderer (EA-D — single delegate, conductor-settled pendingRef
// redesign; ea-d-scout-briefing.md PART B/D). UX intent transplanted from
// 0.3.x `InlineMapField.tsx:1-150` / host reference `gjcu
// packages/ui/form/InlineMap.tsx:1-362` (key-value row editor, 3 resultType
// shapes) — the pendingRef instance side-channel is DELIBERATELY NOT
// transplanted; see `inline-map-field.ts`'s class header for the full
// argument (old issue #1289 + clone reference-sharing, both structurally
// gone under this redesign). This renderer writes straight through
// `store.getState().setValue(name, buildResult())` on EVERY change from the
// `UIComponents.InlineMap` slot — same posture as every other array/object-
// valued renderer in this registry (Tag/MultiSelect/File) — so the generic
// `isBlank`/`isDirty` (schema-core `field/value.ts`) read the real, current
// value with no override needed.
//
// Value shape: 3 resultTypes (host reference gjcu InlineMap.tsx:33,157-174)
// — 'Object' (default, `Record<string,string>`) / 'KeyValue'
// (`{key,value}[]`) / 'Map' (`Map<string,string>`). The ui-default
// `InlineMap` slot only ever speaks `Record<string,string>` at its
// value/onChange boundary (task scope — "keep the slot dumb"); this
// renderer is where the resultType conversion happens both ways (store →
// slot via `toRecord`, slot → store via `buildResult`).
//
// Map resultType — NARROWED to a plain Record on write (recorded deviation,
// verified round-trip: `inline-map-field.test.tsx`
// "Map resultType narrows to Record"). schema-core's generic dirty/blank
// compare (`util/compare.ts` `isEquals`/`normalizeEmptyValue`) keys off
// `Object.keys()`, which is ALWAYS `[]` for a `Map` instance (a Map's
// entries are not the object's own enumerable string-keyed properties) — so
// a REAL `Map` sitting in the store slice reads as blank-equal to every
// other Map regardless of content (isDirty/isBlank silently wrong), and it
// does not survive `toSaveData()` → JSON serialization
// (`JSON.stringify(new Map([...]))` is unconditionally `"{}"`, content
// lost — the exact "round-trip through toSaveData/hydrate" failure the task
// asked to check for). Both gaps are pre-existing, general-purpose holes in
// schema-core's Object.keys-based compare helpers (not this field's to fix
// — a cross-cutting change), so per the task's explicit fallback: 'Map'
// stays a valid `resultType` a form author can declare
// (`.useResultMap()`), but the value actually written to — and read back
// from — the store is a plain `Record<string,string>`, identical to
// 'Object'. A host that truly needs a live `Map` in save-time output must
// convert once more at its own `onSave` boundary.
//
// Empty-row write-back — a completed row set of ZERO entries is written as
// `undefined`, NOT an empty container, for 'Object'/'Map' (narrowed): the
// generic `isBlank` (`value.ts`) only special-cases arrays/`undefined`/
// `null`/`''`, so an empty `Record` (`{}`) would read as NOT blank (silent
// required-check bypass — exactly the #1289 failure mode this redesign
// exists to prevent). `'KeyValue'` instead writes a real empty array `[]`
// (matching the established array-field convention, EA-B1's
// normalizeEmptyValue extension in `value.ts`) since the generic `isBlank`
// already special-cases arrays directly — using a real `[]` there (rather
// than `undefined`) also keeps `isDirty`'s create-mode branch reachable when
// a non-empty declared default exists (the `slice.current === undefined`
// top-level "never touched" short-circuit in `value.ts`'s `isDirty` would
// otherwise misfire).

type ResolvedResultType = 'Object' | 'KeyValue' | 'Map';

function toRecord(value: unknown, resultType: ResolvedResultType): Record<string, string> {
  if (value === undefined || value === null) return {};
  if (resultType === 'KeyValue') {
    if (!Array.isArray(value)) return {};
    const record: Record<string, string> = {};
    for (const item of value as KeyValue[]) {
      if (item && typeof item === 'object' && 'key' in item) {
        record[String(item.key)] = String((item as KeyValue).value ?? '');
      }
    }
    return record;
  }
  // 'Object' and 'Map' (narrowed) both read a plain Record off the slice —
  // a raw `Map` instance is still accepted here (e.g. an un-edited
  // `withDefaultValue(new Map(...))` seed) for read-compatibility, even
  // though this renderer never WRITES one back (see file header).
  if (value instanceof Map) {
    const record: Record<string, string> = {};
    value.forEach((v, k) => {
      record[k] = v;
    });
    return record;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as Record<string, string>) };
  }
  return {};
}

function buildResult(
  record: Record<string, string>,
  resultType: ResolvedResultType,
): Record<string, string> | KeyValue[] | undefined {
  const entries = Object.entries(record);
  if (resultType === 'KeyValue') {
    return entries.length === 0 ? [] : entries.map(([key, value]) => ({ key, value }));
  }
  // 'Object' (default) and 'Map' (narrowed): plain Record, undefined when empty.
  return entries.length === 0 ? undefined : record;
}

export function InlineMapFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { InlineMap } = useUI();
  const store = useFormStore();
  const inlineMapField = field as InlineMapField;
  const config: InlineMapConfig | undefined = inlineMapField.config;
  const resultType: ResolvedResultType = config?.resultType ?? 'Object';

  const rawValue = useFieldValue<unknown>(name);
  const value = toRecord(rawValue, resultType);

  const keys = config?.keys?.map((k) => ({
    key: k.key,
    ...(k.label !== undefined ? { label: k.label } : {}),
    ...(k.required !== undefined ? { required: k.required } : {}),
  }));

  // NOTE: `minRows`/`maxRows` only matter in FREE mode (the ui-default slot
  // never offers a remove affordance in fixed-keys mode at all — see
  // InlineMapProps doc comment), which by construction means `config.keys`
  // is unset/empty here — so a per-key `required` flag (which only exists
  // alongside a non-empty `keys`) can never coexist with a live minRows
  // floor. `limit.min`/`limit.max` (free-mode-only knobs, independent of
  // `keys`) are the only source for these.
  const minRows = config?.limit?.min;
  const maxRows = config?.limit?.max;

  function handleChange(record: Record<string, string>) {
    store.getState().setValue(name, buildResult(record, resultType));
  }

  return (
    <InlineMap
      id={name}
      value={value}
      onChange={handleChange}
      {...(keys !== undefined ? { keys } : {})}
      {...(minRows !== undefined ? { minRows } : {})}
      {...(maxRows !== undefined ? { maxRows } : {})}
      {...(config?.label?.key !== undefined ? { keyLabel: config.label.key } : {})}
      {...(config?.label?.value !== undefined ? { valueLabel: config.label.value } : {})}
      {...(readOnly !== undefined ? { readOnly } : {})}
      {...(required ? { required: true } : {})}
      {...(invalid ? { invalid: true } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}
