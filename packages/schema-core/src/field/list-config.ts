// List/filter declaration substrate (spec §5.1; W5-1) — PURELY additive:
// this file only carries the two config shapes `withList`/`withFilter`
// (form-field.ts) accept. Nothing in schema-core or @listgrid/react consumes
// these yet — column derivation/sorting/filter-panel wiring is W5-2/W5-3.

/**
 * Per-field list-column declaration (opt-in via `FormField.withList`).
 * `order`/`label`/`align`/`width`/`sortable` all fall back to a derived
 * default (field order/label/type) at the W5-2 consumption layer — this
 * type only carries the OVERRIDE, so every member is optional.
 */
export interface FieldListConfig {
  /** Column position override; defaults to the field's own declared order. */
  order?: number | undefined;
  /** Column header override; defaults to the field's own declared label. */
  label?: string | undefined;
  align?: 'left' | 'center' | 'right' | undefined;
  /** CSS width — number = px, string = any CSS length (e.g. `'20%'`). */
  width?: number | string | undefined;
  /** Whether the list column header can trigger a sort. */
  sortable?: boolean | undefined;
}

/**
 * Per-field advanced-search participation declaration (opt-in via
 * `FormField.withFilter`). `operator` is intentionally an open `string` —
 * the advanced-search wave (W5-3) maps it onto `SearchForm`/`FilterItem`;
 * no stricter shared union is decided yet (entityform-public-api-spec.md
 * §10-A margin note — "필터 operator 유니온" is still undecomposed), so this
 * task does not invent one.
 */
export interface FieldFilterConfig {
  operator?: string | undefined;
  /** Filter-field position override within the advanced-search panel. */
  order?: number | undefined;
  /** Filter label override; defaults to the field's own declared label. */
  label?: string | undefined;
}
