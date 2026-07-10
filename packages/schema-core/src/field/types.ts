// Field primitive types — the pure, React-free vocabulary every field meta is
// built from. Transplanted verbatim from src/listgrid/config/Config.ts (0.3.x).

/**
 * The 28 built-in field types (charter C4). `type` is a pure meta discriminant
 * here; render dispatch on it moves to the FieldRenderer registry (ADR-0003).
 * Transplanted verbatim from Config.ts:12-41.
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'manyToOne'
  | 'email'
  | 'phone'
  | 'time'
  | 'month'
  | 'tag'
  | 'file'
  | 'year'
  | 'checkbox'
  | 'multiselect'
  | 'textarea'
  | 'password'
  | 'image'
  | 'html'
  | 'markdown'
  | 'inlineMap'
  | 'hidden'
  | 'custom'
  | 'xrefMapping'
  | 'xrefPriorityMapping'
  | 'xrefAvailableMapping'
  | 'revision'
  | 'contentAsset'
  | 'subCollection'
  | 'link'
  | 'colorPreset'
  | 'messageView'
  | 'profile'
  | 'mappedJoin'
  // EA-B0 additions (charter C4 +4 — Birthday/TelephoneNumber/Color/
  // CustomOption, ea-b-scout-briefing.md PART D item 2). 'telephoneNumber'
  // is distinct from the existing 'phone' (PhoneNumberField already owns
  // that type; TelephoneNumberField's validation/format differ).
  | 'birthday'
  | 'telephoneNumber'
  | 'color'
  | 'customOption'
  // EA-C0 addition (upload fan-out pre-stage — 'file'/'image'/'contentAsset'
  // already existed; MultipleAssetField is the only genuinely new field type
  // in the upload batch, ea-c-scout-briefing.md PART D "MultipleAsset").
  | 'multipleAsset'
  // EB1 addition (Phase EB — Daum 우편번호 주소, plan §EB). 0.3.x reused the
  // generic 'custom' type for AddressMapField; the new registry's
  // one-type-one-renderer dispatch needs its own dedicated string.
  | 'address';

/** The create/update discriminant threaded through every conditional resolution. */
export type RenderType = 'create' | 'update';

/**
 * The declaration value seed (charter C1 — a field can be declared with a
 * default; fetched is filled at load; current tracks edits). Transplanted
 * verbatim from Config.ts:80-84 — three fields, unchanged.
 */
export interface FieldValue<TValue = unknown> {
  current?: TValue;
  fetched?: TValue;
  default?: TValue;
}

/**
 * A field-scoped error (charter C5 — errors are attributed per field, and
 * server validation errors map to the same channel). `code` carries the
 * optional backend error code for BackendAdapter mapping (ADR-0005).
 */
export interface FieldError {
  message: string;
  code?: string;
}

/**
 * The runtime per-field state slice held by the form store (ADR-0002 §Decision
 * 1: `fields: Record<name, {current, fetched, default, errors, dirty}>`).
 *
 * Widens the {@link FieldValue} seed with the two pieces of derived state that
 * used to live OUTSIDE `value` in the 0.3.x engine:
 *   - `dirty` was computed on demand by EntityField.isDirty() (FormField.tsx:542-590)
 *   - error state lived in the sibling `validationState` field + transient
 *     validate() returns (EntityField.ts:30-33)
 * The store now CACHES both inside the slice; the computation of `dirty`
 * (empty-value normalization, collection equality — the charter-C4 micro
 * decisions) is transplanted faithfully under the P2 oracle in P4, not here.
 */
export interface FieldValueSlice<TValue = unknown> extends FieldValue<TValue> {
  errors?: FieldError[];
  dirty?: boolean;
}
