import { FormField } from './form-field';
import type { MinMaxLimit } from './basic-fields';

// InlineMapField (EA-D — single delegate, ea-d-scout-briefing.md PART B/D).
// Transplant of 0.3.x `src/listgrid/components/fields/InlineMapField.tsx:1-150`
// (re-verified against source 2026-07-11) + `InlineMapConfig`/`MapKey` types
// (0.3.x `Config.ts:446-449`) — this file carries the config/type half only;
// the actual key-value row editor lives in `@listgrid/ui-default`'s
// `UIComponents.InlineMap` slot + the `@listgrid/react`
// `inline-map-renderer.tsx` (schema-core stays render-free, charter C4).
//
// pendingRef — DELIBERATELY NOT TRANSPLANTED (conductor-settled redesign,
// briefing PART B/D ②). 0.3.x carried an instance-held mutable side-channel
// (`pendingRef: { current: { value, modified } }`) that the renderer
// reassigned on every keystroke, with `getSaveValue`/`isDirty`/`isBlank` ALL
// overridden to prefer `pendingRef.current` over the declared `FormField`
// value plumbing when `modified` was true. Two hazards followed directly
// from that shape:
//   1. **Old issue #1289** — `isBlank` (and therefore the required-blank
//      check) only consulted `pendingRef` when `modified` was `true`; a
//      caller that read blank-ness through any other path (or a renderer
//      variant that never set `modified`) silently saw a stale/blank read
//      even though the user had typed a value, letting REQUIRED validation
//      pass or fail incorrectly depending on which override happened to run
//      (`__tests__/InlineMapField.test.ts:44-61` in the 0.3.x suite).
//   2. **clone reference-sharing** — `createInstance` (0.3.x :92-96) did
//      `instance.pendingRef = this.pendingRef`, handing every
//      `EntityForm.clone(true)` copy (the exact path every Xref child-form
//      view takes) the SAME mutable cell as the original. Editing a clone's
//      InlineMap could mutate the parent's in-flight pending value out from
//      under it.
// The new engine has no per-instance render-time mutable state to begin with
// (ADR-0002 — the form STORE is the only value channel; a field class is
// pure declarative meta, structurally cloneable with no instance-held
// runtime cell to accidentally share). The redesign the briefing settled on
// is store-direct-write: the renderer calls
// `store.getState().setValue(name, buildResult())` on EVERY change, so the
// value the generic `isBlank`/`isDirty`/`getCurrentValue` free functions
// (`./value.ts`) read IS the real, current, un-stale value — no pendingRef,
// no override, both hazards structurally gone rather than patched. That is
// why this class declares NO `isBlank`/`isDirty`/`getSaveValue` overrides
// (same posture FileField already established for EA-C, `file-field.ts`
// header comment) — see `inline-map-renderer.tsx` for the write-back half of
// this argument (in particular why an EMPTY row set must be written back as
// `undefined`, not an empty container, for the generic `isBlank` to see it
// correctly for the non-array 'Object'/'Map' result shapes).

/** One fixed/suggested key the InlineMap editor may offer (0.3.x `MapKey`,
 *  `Config.ts:446`). */
export type MapKey = { key: string; label?: string; required?: boolean };

/** One free-form key-value row (0.3.x `KeyValue`, `ui.ts` — used by the
 *  `'KeyValue'` result shape and by `withDefaultValue`). */
export interface KeyValue {
  key: string;
  value: string;
}

/**
 * InlineMap editor configuration (0.3.x `InlineMapConfig`, `Config.ts:447-449`,
 * member-for-member parity):
 *   - `keys` — when set (non-empty), the editor runs in FIXED-KEYS mode: one
 *     row per declared key, value-only editing, no add/remove. Unset/empty =
 *     FREE mode (add/remove rows freely, subject to `limit`).
 *   - `limit` — row-count bound (free mode only; fixed mode's row count is
 *     the length of `keys`).
 *   - `resultType` — the value SHAPE written to the store: `'KeyValue'` →
 *     `KeyValue[]`; `'Map'` → `Map<string,string>` (see
 *     `inline-map-renderer.tsx` for why this is NARROWED to a plain
 *     `Record<string,string>` at write time — round-trip verified, recorded
 *     deviation); unset → `'Object'` (default), a plain
 *     `Record<string,string>`.
 *   - `label` — column header override for the key/value columns.
 */
export type InlineMapConfig = {
  keys?: MapKey[];
  limit?: MinMaxLimit;
  resultType?: 'KeyValue' | 'Map';
  label?: { key?: string; value?: string };
};

/** The value shape this field's store slice can hold across all three
 *  `resultType`s (the DECLARED shape — see `inline-map-renderer.tsx` for the
 *  narrower shape actually WRITTEN for 'Map'). */
export type InlineMapValue = Record<string, string> | KeyValue[] | Map<string, string>;

/**
 * Key-value row editor (0.3.x InlineMapField, type `'inlineMap'`). Value
 * shape is one of `Record<string,string>` (default) / `KeyValue[]` /
 * `Map<string,string>`, selected via `config.resultType` — see
 * {@link InlineMapConfig}.
 */
export class InlineMapField extends FormField<InlineMapValue> {
  config?: InlineMapConfig | undefined;

  constructor(name: string, order: number, config?: InlineMapConfig) {
    super(name, order, 'inlineMap');
    this.config = config;
  }

  /**
   * Set the fixed key list (undefined/empty ⇒ free mode). Transplant of
   * `InlineMapField.withKeys:98-105` — shallow-merges `keys` into the
   * existing config, preserving `limit`/`resultType`. NOTE (faithful
   * transplant of a 0.3.x quirk, not fixed here): like every sibling builder
   * below, this rebuilds `config` from scratch and does NOT carry `label`
   * across the call — calling any of these builders after `withConfig`'s
   * `label` was set drops it. Preserved as-is for behavioral parity with
   * `InlineMapField.tsx:98-145`; a caller that needs `label` to survive
   * should set it last via `withConfig`.
   */
  withKeys(keys?: MapKey[]): this {
    this.config = {
      ...(keys !== undefined ? { keys } : {}),
      ...(this.config?.limit !== undefined ? { limit: this.config.limit } : {}),
      ...(this.config?.resultType !== undefined ? { resultType: this.config.resultType } : {}),
    };
    return this;
  }

  /** Select the `'Map'` result shape. Transplant of `useResultMap:107-114`. */
  useResultMap(): this {
    this.config = {
      ...(this.config?.keys !== undefined ? { keys: this.config.keys } : {}),
      ...(this.config?.limit !== undefined ? { limit: this.config.limit } : {}),
      resultType: 'Map',
    };
    return this;
  }

  /** Select the `'KeyValue'` result shape. Transplant of `useKeyValue:116-123`. */
  useKeyValue(): this {
    this.config = {
      ...(this.config?.keys !== undefined ? { keys: this.config.keys } : {}),
      ...(this.config?.limit !== undefined ? { limit: this.config.limit } : {}),
      resultType: 'KeyValue',
    };
    return this;
  }

  /** Set the row-count bound (free mode). Transplant of `withLimit:125-132`. */
  withLimit(limit?: MinMaxLimit): this {
    this.config = {
      ...(this.config?.keys !== undefined ? { keys: this.config.keys } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(this.config?.resultType !== undefined ? { resultType: this.config.resultType } : {}),
    };
    return this;
  }

  /** Replace the whole config in one call. Transplant of `withConfig:134-137`. */
  withConfig(config?: InlineMapConfig): this {
    this.config = config;
    return this;
  }

  /**
   * Declared default. Transplant of `withDefaultValue:143-145` — WIDENED
   * (deviation, additive-only) to also accept a plain `Record<string,string>`
   * so a default can be declared for the (default) `'Object'` result shape
   * without reaching for `withValue` — 0.3.x's signature only covered
   * `KeyValue[] | Map<string,string>`, an apparent oversight given `'Object'`
   * was always the default `resultType`.
   */
  withDefaultValue(value: InlineMapValue): this {
    return super.withDefaultValue(value);
  }
}
