import type { EntityForm } from '../entity-form';
import type { FilterItem } from '../search/search-form';
import { CustomValidation } from '../validations/custom-validation';
import { ValidateResult } from '../validation';
import { requiredMessage } from '../util/korean';
import { getCurrentValue } from './value';
import { FormField } from './form-field';
import type { RequiredType } from './conditional';
import type { FieldValue } from './types';

// XrefPreferMappingField (EA-D2-1, ea-d2-xref-major-briefing.md §1/§4/§5) —
// NEW FieldType `'xrefPreferMapping'` (types.ts). Transplant of 0.3.x
// `src/listgrid/components/fields/XrefPreferMappingField.tsx` — narrowed the
// same way as its `XrefMappingField` sibling (`add`/`supportPriority`-shaped
// concerns don't apply here; this type never had them). `showPreferred` is
// NOT ported: it only ever toggled the mini-form's `preferred` checkbox's
// `ViewPreset` (`ALWAYS` vs `MODIFY_ONLY`, i.e. "show it read-only on the
// add step too") — a display nuance of the mini-form the renderer layer
// owns (`@listgrid/react` `xref-prefer-mapping-renderer.tsx`), not a
// schema-core config concern.

/** Value wire (briefing §4) — pass-through like `XrefMappingValue`, NO
 *  `deleted` array (re-verified: 0.3.x `XrefPreferMappingValue` only ever
 *  carried `mapped`; delete removes the row from `mapped` outright — there
 *  is no backend "sever this mapping" instruction to preserve, unlike plain
 *  xref's `deleted`). */
export interface XrefPreferMappingValue {
  mapped?: { id: string; preferred?: boolean }[];
}

export interface XrefPreferMappingConfig {
  /** lazy reference to the target entity's form (ManyToOneConfig.entityForm
   *  parity, D1). */
  entityForm: () => EntityForm;
  /**
   * Resolved fresh on every mini-form-picker open; AND-ed into the display
   * grid's IN query AND the mini-form's `mapping` M2O NOT_IN query (same
   * dual-application posture as `XrefMappingConfig.filters` — see that
   * field's doc for the re-verified old-behavior citation). Single
   * function form only (§1 decision ③, same correction as `XrefMappingField`).
   */
  filters?: () => Promise<FilterItem[]>;
  /** label for the mini-form's synthetic `preferred` BooleanField (0.3.x
   *  `preferredLabel`/`withPreferredLabel`, default '기본값'). */
  preferredLabel?: string;
}

const REQUIRED_VALIDATION_ID = 'xref-prefer-mapping-required';

/**
 * Preferred-flagged mapping xref (0.3.x `XrefPreferMappingField`, type
 * `'xrefPreferMapping'`).
 *
 * REQUIRED POSTURE: identical mechanism/rationale to `XrefMappingField`
 * (see that class's doc) — `{mapped}` is a non-array object, so the
 * generic `isBlank` required-blank check can never see it as blank;
 * `withRequired()` attaches a `CustomValidation` on `mapped?.length`
 * instead. This IS the field's documented required mechanism.
 */
export class XrefPreferMappingField extends FormField<XrefPreferMappingValue> {
  config: XrefPreferMappingConfig;

  constructor(name: string, order: number, config: XrefPreferMappingConfig) {
    super(name, order, 'xrefPreferMapping');
    this.config = config;
  }

  getEntityForm(): EntityForm {
    return this.config.entityForm();
  }
  getPreferredLabel(): string {
    return this.config.preferredLabel ?? '기본값';
  }

  /** 0.3.x parity builder (`XrefPreferMappingField.withPreferredLabel`). */
  withPreferredLabel(preferredLabel: string): this {
    this.config = { ...this.config, preferredLabel };
    return this;
  }

  override withRequired(required?: RequiredType): this {
    super.withRequired(required);
    if (!(this.validations ?? []).some((v) => v.id === REQUIRED_VALIDATION_ID)) {
      this.validations = [...(this.validations ?? []), buildRequiredValidation(this)];
    }
    return this;
  }
}

function buildRequiredValidation(field: XrefPreferMappingField): CustomValidation {
  return new CustomValidation(REQUIRED_VALIDATION_ID, async (ctx, value) => {
    const required = await field.isRequired(ctx);
    if (!required) return ValidateResult.success();

    const current = getCurrentValue(value as FieldValue<XrefPreferMappingValue>, ctx.renderType);
    const mapped = current?.mapped;
    if (mapped === undefined || mapped.length === 0) {
      const label =
        typeof field.getLabel() === 'string' ? String(field.getLabel()) : field.getName();
      return ValidateResult.fail(requiredMessage(label));
    }
    return ValidateResult.success();
  });
}
