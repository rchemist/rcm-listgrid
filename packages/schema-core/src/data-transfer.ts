// EntityForm data-transfer DECLARATION surface (spec §3.5, CAP-16; W6-1) —
// pure schema types only (L6: schema-core React/runtime 0). Value-transform
// logic (0.3.x `DataField.getValueOnExport`/`getValueOnImport`) and xlsx
// I/O are the `/excel` package's job (W6-2), not this one — this file only
// carries the shapes `EntityForm.withDataTransfer`/`getDataTransfer`
// (entity-form.ts) accept/return.

import type { EntityField } from './field/entity-field';
import type { FieldType } from './field/types';

/**
 * A single export/import column declaration (spec §3.5 W6-entry, confirmed
 * 2026-07-12). Successor to the 0.3.x `DataField` MINUS its runtime
 * `getValueOnExport`/`getValueOnImport` methods (spec §3.5 decision 1,
 * entityform-api-implementation-waves.md W6 decision 1) — those become
 * `/excel`'s value-transform switch, keyed off {@link type}.
 */
export interface DataFieldSpec {
  name: string;
  /**
   * Column header. When a `DataFieldSpec` is AUTO-DERIVED (see
   * {@link DataTransferSpec} doc), this is the declared field's
   * `getLabel()` — but ONLY when that resolves to a plain `string`; a
   * `ReactNode`/`false` label is dropped (L6 — a ReactNode cannot cross into
   * this pure-schema type), leaving `label` `undefined` for that field.
   */
  label?: string | undefined;
  /**
   * Value-transform switch key for `/excel` (select/multiselect/date/
   * datetime/boolean/html/markdown etc., spec §3.5). When auto-derived, this
   * is the declared field's `type` verbatim.
   */
  type?: FieldType | undefined;
}

/**
 * `EntityForm.withDataTransfer`'s INPUT shape (spec §3.5) — `fields` is
 * OPTIONAL on both sides, the auto-derive trigger: unset or an empty array
 * means "derive from the form's declared fields" (see
 * {@link DataTransferSpec}'s doc for the resolved shape `getDataTransfer()`
 * hands back). NOT barrel-exported (`schema-core/src/index.ts`) — only the
 * resolved {@link DataTransferSpec} is a consumer-facing return type;
 * `EntityForm.withDataTransfer`'s parameter type inlines this shape
 * directly (`entity-form.ts`).
 */
export interface DataTransferInput {
  export?: { fields?: DataFieldSpec[] | undefined; fileName?: string | undefined } | undefined;
  import?: { fields?: DataFieldSpec[] | undefined } | undefined;
}

/**
 * `EntityForm.getDataTransfer()`'s RETURN shape (spec §3.5 W6-entry) —
 * fully RESOLVED: whenever `export`/`import` is present, its `fields` is
 * ALWAYS populated (either the caller's verbatim declaration or the
 * auto-derived snapshot, see {@link resolveDataTransferSpec}) — never
 * unset/empty. `export`/`import` being `undefined` still means "that side
 * was never declared" (distinct from "declared with 0 fields", which
 * `getDataTransfer()` cannot produce — an empty `fields` array is always
 * the auto-derive TRIGGER, never itself the resolved value, spec §3.5
 * "auto-derive(구 getDataFieldsFromFields 계승)").
 */
export interface DataTransferSpec {
  export?: { fields: DataFieldSpec[]; fileName?: string | undefined } | undefined;
  import?: { fields: DataFieldSpec[] } | undefined;
}

/**
 * Auto-derive a `DataFieldSpec[]` snapshot from a form's declared fields, in
 * DECLARATION ORDER (spec §3.5 "auto-derive... `this.getFields()`를 선언
 * 순서로 스냅샷" — `EntityForm.getFields()` already returns fields
 * order-sorted, so this simply maps over its result without re-sorting).
 * `label` is included only when `getLabel()` resolves to a plain `string`
 * (see {@link DataFieldSpec.label} doc); `type` is the field's declared
 * `type` verbatim. Shared by BOTH the export and import sides via
 * {@link resolveTransferFields} — this is the single source of "what does
 * auto-derive mean", so export and import can never silently diverge.
 *
 * Deliberately NO composite-type filtering here (entityform-api-
 * implementation-waves.md W6 decision 5 — "정확 제외 목록은 W6-2서 확정"):
 * every declared field, of every `FieldType`, is included. The `/excel`
 * value-transform switch (W6-2) is what decides which types have no flat
 * xlsx-cell representation and warns; this pure declaration layer does not
 * pre-empt that decision.
 */
function deriveDataFields(fields: readonly EntityField[]): DataFieldSpec[] {
  return fields.map((field) => {
    const spec: DataFieldSpec = { name: field.getName() };
    const label = field.getLabel();
    if (typeof label === 'string') spec.label = label;
    if (field.type !== undefined) spec.type = field.type;
    return spec;
  });
}

/**
 * The SHARED symmetric fallback helper (spec §3.5 ":448 fix" — entityform-
 * api-implementation-waves.md W6 decision 2) — resolves ONE side's
 * (export's OR import's) declared `fields` against ONLY that same side's
 * declared `fields`, ever. Its signature has no parameter through which the
 * OTHER side's fields could be reached, which is what makes the old bug
 * (0.3.x `EntityFormActions.tsx:448` — import's fallback checked
 * `export?.fields` emptiness instead of `import`'s own) STRUCTURALLY
 * impossible here, not merely avoided by convention: `getDataTransfer()`
 * below calls this once for `export.fields` and once for `import.fields`,
 * each call closed over that side's own declared fields only.
 */
function resolveTransferFields(
  declaredFields: DataFieldSpec[] | undefined,
  deriveFields: () => DataFieldSpec[],
): DataFieldSpec[] {
  return declaredFields !== undefined && declaredFields.length > 0
    ? declaredFields
    : deriveFields();
}

/**
 * Resolve a stored {@link DataTransferInput} (`EntityForm.withDataTransfer`'s
 * storage) into the fully-derived {@link DataTransferSpec} `getDataTransfer()`
 * returns — SYNCHRONOUS (spec §3.5: the 0.3.x `Promise` return existed only
 * because the old getter awaited each field's `isRequired()`; the new
 * `DataFieldSpec` carries no `required`, so there is nothing left to await).
 * `declaredFields` is the form's OWN declared fields (`EntityForm.getFields()`
 * at call time) — passed in rather than closed over so this stays a pure
 * function, independently testable of `EntityForm`.
 */
export function resolveDataTransferSpec(
  input: DataTransferInput,
  declaredFields: readonly EntityField[],
): DataTransferSpec {
  const result: DataTransferSpec = {};
  const deriveFields = () => deriveDataFields(declaredFields);

  if (input.export !== undefined) {
    const fields = resolveTransferFields(input.export.fields, deriveFields);
    result.export =
      input.export.fileName !== undefined
        ? { fields, fileName: input.export.fileName }
        : { fields };
  }

  if (input.import !== undefined) {
    const fields = resolveTransferFields(input.import.fields, deriveFields);
    result.import = { fields };
  }

  return result;
}
