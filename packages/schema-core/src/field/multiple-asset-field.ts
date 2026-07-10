import { FormField } from './form-field';

// MultipleAssetField (EA-C fan-out) — transplant of 0.3.x
// `src/listgrid/components/fields/MultipleAssetField.tsx:27-67` (class) +
// `MultipleAssetFieldView` (`:101-407`, named-slot grid + add/edit Modal) +
// `view/MultipleAssetUpload.tsx:1-63` (upload-squash-to-url helper). Re-
// verified against source 2026-07-11.
//
// Old engine: `super(name, order, 'custom')` (:33) — reused the generic
// 'custom' type string, so the new registry's one-type-one-renderer dispatch
// needs a dedicated discriminant. `'multipleAsset'` is EA-C0's one genuinely
// new `FieldType` (ea-c-scout-briefing.md PART D "MultipleAsset" / PART E
// item 2) — already declared in `./types`.
//
// Value shape (conductor decision ④, briefing banner + PART D): old
// `MultipleAssetForm { assets?: AssetItem[]; preferred?: string }` wrapper is
// REMOVED. The new value is a bare `AssetItem[]` — an empty array is "blank"
// under the generic `isBlank`/`isDirty` free functions in `./value` (EA-B1
// array-normalization, already handles empty-array-as-blank generically, no
// per-field override needed here). The old `preferred` slot-name string
// (which named-slot's tag held the "current featured asset") becomes a
// per-item `primary?: boolean` flag — semantically equivalent (at most one
// asset may be primary at a time; the renderer enforces single-primary on
// toggle, since there is no longer a single top-level `preferred` string to
// naturally enforce it).
//
// Constructor keeps 0.3.x parity: `(name, order, tags?, fileTypes?)` — no
// chaining builders (old class had none; `static create(props)` is dropped
// per this port's established convention, see TagField/MappedJoinField
// siblings). `tags` are the fixed named slots the renderer's grid iterates
// (:159, 'Primary' held as a special slot name, :165). `fileTypes` threads
// through to the upload seam (MIME allow-list) exactly like the File/Image
// `AssetConfig.fileTypes` member — kept as a bare array here (not the shared
// `AssetConfig` type) because 0.3.x's own constructor signature never wired
// the rest of `IAssetConfig` (maxSize/maxCount/extensions) into this field,
// only `fileTypes` (:32,34).

/**
 * One asset in a MultipleAssetField's value (0.3.x `AssetItem`,
 * `MultipleAssetField.tsx:74-78`, plus the `primary` flag that replaces the
 * old wrapper's top-level `preferred` slot-name string — conductor decision
 * ④). `url` is the only required member; `name` is the named-slot tag this
 * item is filed under (e.g. `'Primary'`, or a custom `RegexLowerEnglishNumber`
 * key the user typed in the add dialog).
 */
export interface AssetItem {
  name?: string;
  description?: string;
  url: string;
  primary?: boolean;
}

/**
 * Named-slot multi-asset upload field (0.3.x MultipleAssetField, type
 * `'multipleAsset'`). Value: `AssetItem[]`. `tags` fixes which named slots
 * the grid offers up front (0.3.x default-populates one empty `AssetItem`
 * per tag on first render when there's no existing value, :122-130 — that
 * behavior is renderer-side, not field-meta, since it only matters for the
 * empty-value bootstrap a component performs on mount).
 */
export class MultipleAssetField extends FormField<AssetItem[]> {
  tags?: string[] | undefined;
  fileTypes?: string[] | undefined;

  constructor(name: string, order: number, tags?: string[], fileTypes?: string[]) {
    super(name, order, 'multipleAsset');
    this.tags = tags;
    this.fileTypes = fileTypes;
  }
}
