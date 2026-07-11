import type { EntityForm } from '../entity-form';
import type { FilterItem } from '../search/search-form';
import { CustomValidation } from '../validations/custom-validation';
import { ValidateResult } from '../validation';
import { requiredMessage } from '../util/korean';
import { getCurrentValue } from './value';
import { FormField } from './form-field';
import type { RequiredType } from './conditional';
import type { FieldValue } from './types';

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

const REQUIRED_VALIDATION_ID = 'xref-mapping-required';

/**
 * Mapped/deleted id-list xref (0.3.x `XrefMappingField`, `supportPriority`
 * dropped — type `'xrefMapping'`).
 *
 * REQUIRED POSTURE (documented mechanism, EA-D2-1 decision — see the
 * `withRequired` override below): the generic required-blank check
 * (`form-field.ts` `validate()` → `isBlank(ctx.value, ctx.renderType)`,
 * `./value.ts`) can NEVER fire for this field. `isBlank` only special-cases
 * `Array`/`undefined`/`null`/`''`; `{mapped, deleted}` is always a non-null,
 * non-array OBJECT once the renderer has touched it — including the
 * "nothing mapped" state `{mapped: [], deleted: [...]}` — so `isBlank`
 * reports `false` (not blank) unconditionally (the same InlineMap-lesson
 * pitfall `inline-map-field.ts` documents for its own value shapes). The
 * envelope is deliberately ALWAYS kept as an object — `deleted` must survive
 * even when `mapped` empties out (the save wire needs it to tell the backend
 * which mappings to sever) — so the renderer never writes `undefined` to
 * "unblank" the field. `withRequired()` therefore attaches a `CustomValidation`
 * that inspects `mapped?.length` directly; THIS is the field's required
 * mechanism, not a generic-blank byproduct.
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

  /**
   * Same `withRequired` call as every other field (FormField base) PLUS the
   * `mapped?.length` `CustomValidation` this field's blank-envelope shape
   * needs (class doc above). Idempotent — calling `withRequired` more than
   * once does not stack duplicate validations (checked by id).
   */
  override withRequired(required?: RequiredType): this {
    super.withRequired(required);
    if (!(this.validations ?? []).some((v) => v.id === REQUIRED_VALIDATION_ID)) {
      this.validations = [...(this.validations ?? []), buildRequiredValidation(this)];
    }
    return this;
  }
}

function buildRequiredValidation(field: XrefMappingField): CustomValidation {
  return new CustomValidation(REQUIRED_VALIDATION_ID, async (ctx, value) => {
    // Respects a conditional `required` (a function/preset, not just a
    // static `true`) the same way the generic required-blank check would —
    // this validation only fails when the field is CURRENTLY required.
    const required = await field.isRequired(ctx);
    if (!required) return ValidateResult.success();

    const current = getCurrentValue(value as FieldValue<XrefMappingValue>, ctx.renderType);
    const mapped = current?.mapped;
    if (mapped === undefined || mapped.length === 0) {
      const label =
        typeof field.getLabel() === 'string' ? String(field.getLabel()) : field.getName();
      return ValidateResult.fail(requiredMessage(label));
    }
    return ValidateResult.success();
  });
}
