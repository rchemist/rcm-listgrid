import { OptionsField } from './options-field';

// CustomOptionField (EA-B fan-out — ea-b-scout-briefing.md PART C
// §CustomOption). Transplant of 0.3.x
// `src/listgrid/components/fields/CustomOptionField.tsx:34-210` — re-verified
// against source 2026-07-11 — META ONLY (charter C4); everything that used to
// live on the class around fetching/rendering moves out:
//   - fetch: 0.3.x fetched the alias's option list itself
//     (`getCustomOptionValues`, module-scope Map cache, :212-233) the first
//     time `renderInstance` ran with `options === undefined`. The new engine
//     renderer (custom-option-renderer.tsx) does this instead, through
//     `useCustomOptions()` (CustomOptionProvider, EA-B0 PART D item 4) — this
//     class never fetches and carries no fetch/cache state.
//   - render: 0.3.x's 4-branch `renderInstance` (combo&multiple->CheckBox /
//     combo&!multiple->RadioInput / !combo&multiple->MultiSelectBox /
//     !combo&!multiple->SelectBox) is DESCOPED to 2 branches in the renderer
//     (multiple->checkbox-group / !multiple->SelectBox) — no combo/radio
//     primitive exists in the new engine (same MultiSelect/Checkbox
//     precedent, multi-select-renderer.tsx header). `combo` is still carried
//     as a field property below (EA-A0's shared OptionsField base excluded it
//     as a UX-variant knob; CustomOption re-introduces its own copy the way
//     CheckboxField does, checkbox-field.ts CheckboxComboProps) even though
//     the renderer does not currently read it.
//   - isDirty: 0.3.x's own override (:182-209 — a multiple-empty-array
//     short-circuit + `isEquals` against fetched/default) is NOT
//     re-implemented here. The systemic gap it worked around (empty arrays
//     not normalized to "empty" for dirty comparison) is fixed once at the
//     shared value.ts layer for every array-valued field (EA-B1,
//     `normalizeEmptyValue`) — CustomOption-multiple included, per the
//     briefing banner decision ④ and PART B closing note. There is no
//     instance-level `isDirty()` method on the new engine's FormField at all
//     (dirty is a pure function over the store slice, ADR-0002 §Decision 1),
//     so there is nothing to override.
//   - list rendering: 0.3.x's `useListField()` (:171-174, forces
//     `sortable: false`) and the `renderListItemInstance`/`createCacheKey`
//     list-cell path (:141-162) are dropped — list-cell rendering is globally
//     deferred for this port (task hard rules), and the new engine's
//     FormField has no `listConfig` surface for a field to opt into yet.
//
// DROPPED (0.3.x dead code, conductor decision ⑤ — briefing banner):
// `withFetchUrl`/`withBulkFetchUrl`/`getFetchUrl`/`getBulkFetchUrl`
// (CustomOptionField.tsx :47-65) — the briefing's full-repo grep found no
// caller (the free-function fetch path, `getCustomOptionValues`, has no
// access to a field instance and never read them).
//
// `static create(props)` (0.3.x :164-169, a `copyFields`-based factory) is
// also not carried — the new engine has no generic `copyFields` reflection
// helper (none of the FormField/OptionsField ports transplanted one), and the
// MessageViewField precedent (message-view-field.ts) already establishes
// dropping a 0.3.x `static create` relic in favor of `new Field(...)` +
// chaining as the new-engine posture, not a CustomOption-specific deviation.

/**
 * Layout hint (0.3.x `FieldLayoutType`, `FormField.tsx:90` — `'auto' | 'full'
 * | 'half'`). The new engine's shared FormField base carries no `layout`
 * member (no consumer yet — list/grid layout is out of this port's scope),
 * so it is declared directly on this class to preserve the 0.3.x
 * constructor's `layout = 'half'` default (CustomOptionField.tsx:44) as
 * inspectable meta, ready for a future layout-aware form-grid renderer.
 */
export type CustomOptionLayout = 'auto' | 'full' | 'half';

/**
 * Row/column layout hint for the (currently renderer-unread) combo branch —
 * same shape as 0.3.x `ComboProps` (config/Config.ts:441-444). Reintroduced
 * directly on this class rather than the shared OptionsField base, mirroring
 * CheckboxField's own copy (checkbox-field.ts `CheckboxComboProps`) — the
 * EA-A0 pre-stage deliberately excluded `combo` from the shared base as a
 * UX-variant knob (options-field.ts header).
 */
export interface CustomOptionComboProps {
  direction?: 'row' | 'column';
  columns?: number;
}

/**
 * Alias-backed option field (0.3.x `CustomOptionField`, type 'customOption'
 * — already in {@link FieldType}). Renders from a SERVER-fetched option list
 * keyed by `alias`, unlike SelectField's statically-declared list.
 * valueShape: `multiple=false` -> scalar (`string | number | boolean`) /
 * `multiple=true` -> array of the same. base: {@link OptionsField} (NOT
 * MultiOptionsField — 0.3.x CustomOptionField has no min/max-selected-count
 * `validate()` override, so the limit machinery does not apply).
 */
export class CustomOptionField extends OptionsField<
  string | number | boolean | Array<string | number | boolean>
> {
  alias: string;
  // `| undefined` spelled out (not just `?`) so `withMultiple()` can
  // explicitly assign `undefined` under the root tsconfig's
  // `exactOptionalPropertyTypes` — 0.3.x parity (CustomOptionField.tsx:176-179,
  // `withMultiple(multiple?: boolean)` unconditionally assigns, including
  // the no-argument/undefined case).
  multiple?: boolean | undefined;
  combo?: CustomOptionComboProps;
  layout?: CustomOptionLayout;

  constructor(name: string, order: number, alias: string, multiple?: boolean) {
    super(name, order, 'customOption');
    this.alias = alias;
    this.multiple = multiple ?? false;
    this.layout = 'half';
  }

  /** Transplant of `CustomOptionField.withMultiple` (0.3.x :176-179) — note
   *  `withMultiple()` with no argument sets `multiple` to `undefined`
   *  (distinct from the ctor's `multiple ?? false` default), faithfully
   *  preserved from 0.3.x. */
  withMultiple(multiple?: boolean): this {
    this.multiple = multiple;
    return this;
  }

  /** Transplant of `OptionalField.withComboType:80-84` (0.3.x CustomOptionField
   *  inherited this through OptionalField) — carried but not currently read
   *  by the renderer (2-branch descope, class header above). */
  withComboType(props?: CustomOptionComboProps): this {
    if (props !== undefined) this.combo = props;
    else delete this.combo;
    return this;
  }

  /** Transplant of `FormField.withLayout` (0.3.x `FormField.tsx:473-476`). */
  withLayout(layout: CustomOptionLayout): this {
    this.layout = layout;
    return this;
  }
}
