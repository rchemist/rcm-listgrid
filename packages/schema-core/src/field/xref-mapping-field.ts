import type { EntityForm } from '../entity-form';
import type { FilterItem } from '../search/search-form';
import { FormField } from './form-field';

// XrefMappingField (EA-D2-1 — plain view only, ea-d2-xref-major-briefing.md
// §1/§2/§4). Transplant of 0.3.x
// `src/listgrid/components/fields/XrefMappingField.tsx` NARROWED to the
// subset every real Major consumer (professors/staffs/degrees/
// graduationSubjects — the briefing's sole audited usages) actually needs:
// `supportPriority` is NOT ported (the type `'xrefPriorityMapping'` stays
// renderer-less — 0/4 Major xrefs and every other audited consumer use it,
// briefing §1/§5), and `add` (0.3.x's separate "create a new target entity
// inline" affordance) is dropped too — distinct from the always-present
// "선택" picker button, `add` is unconditionally `false` across every Major
// xref and has no other audited caller (briefing §1 "4개 xref 전부
// supportPriority·excludeId·add 미사용").

/**
 * Value wire (briefing §4 — pass-through, no EF6 submit-transform needed;
 * `form-store.ts` `toSaveData()` only special-cases `field.type ===
 * 'manyToOne'`, so this object reaches the save payload verbatim under the
 * field's own name, matching the backend's `XrefMappingForm<ID>{mapped,
 * deleted}` / the flat `professors`/`staffs`/`degrees` MajorUpdateForm keys).
 */
export interface XrefMappingValue {
  mapped?: string[];
  deleted?: string[];
}

export interface XrefMappingConfig {
  /** lazy reference to the target entity's form (ManyToOneConfig.entityForm
   *  parity, D1 — defers construction so a mutual-recursion cycle between
   *  two EntityForms never eagerly instantiates). */
  entityForm: () => EntityForm;
  /**
   * Resolved fresh every time the renderer needs it (picker open AND
   * display-grid rebuild on a mapped-id-set change) — the returned
   * `FilterItem[]` is AND-ed into BOTH the display grid's IN query and the
   * picker's NOT_IN query (re-verified old `XrefMappingView.tsx:100-103` —
   * `filters` applies to `viewSearchForm` too, not just the picker's
   * `searchForm`; a domain filter like staffs' `assistant=true` must also
   * gate what's shown as already-mapped, not just what's pickable).
   *
   * SINGLE FUNCTION FORM ONLY (briefing §1 anomaly, decision ③) — the 0.3.x
   * `FilterItem[] | ((entityForm, parentEntityForm?) => Promise<FilterItem[]>)`
   * union is COLLAPSED here: a static array wraps trivially
   * (`() => Promise.resolve([...])`), and this corrects the gjcu
   * `degrees` field's real bug (passing `filters: [fn]` — an array
   * containing one function — which the old `typeof === 'function'` check
   * missed, so the function value leaked into `withFilter` as if it were a
   * `FilterItem`). Zero-arg (not `(entityForm, parentEntityForm?)`) — same
   * `ManyToOneConfig.filter` narrowing rationale (many-to-one-field.ts):
   * no renderer-context `EntityForm` reference is threadable here either.
   */
  filters?: () => Promise<FilterItem[]>;
  /** id excluded from every request (both grids) — e.g. a self-referencing
   *  xref's own record id. Unused by every audited Major consumer but ported
   *  1:1 (0.3.x `excludeId`) since a future self-ref xref may need it. */
  excludeId?: string;
}

/**
 * Mapped/deleted id-list xref (0.3.x `XrefMappingField`, `supportPriority`
 * dropped — type `'xrefMapping'`).
 *
 * REQUIRED POSTURE (R3): requiredness uses the SAME generic required-blank
 * path as every other field (`form-field.ts` `validate()` →
 * `isBlank(ctx.value, ctx.renderType, this.type)`). `isBlank` is xref-aware
 * (`./value.ts`, guarded by `fieldType`): the `{mapped, deleted}` envelope —
 * deliberately kept as a non-null object so `deleted` survives an emptied
 * `mapped` (the save wire needs it to tell the backend which mappings to
 * sever) — counts as blank iff it has no `mapped` rows. Because the generic
 * path already honors the EF1 store override (`override?.required ??
 * isRequired`), `setMeta({required})` is authoritative for this field in BOTH
 * directions at runtime; no field-local `CustomValidation` is attached (an
 * earlier design did, but it read declaration-only `isRequired` and so could
 * neither enable nor relax requiredness from a runtime override).
 */
export class XrefMappingField extends FormField<XrefMappingValue> {
  config: XrefMappingConfig;

  constructor(name: string, order: number, config: XrefMappingConfig) {
    super(name, order, 'xrefMapping');
    this.config = config;
  }

  /** Resolve the target entity's form (calls the thunk). */
  getEntityForm(): EntityForm {
    return this.config.entityForm();
  }
  getExcludeId(): string | undefined {
    return this.config.excludeId;
  }
}
