import type { EntityForm } from '../entity-form';
import type { FilterItem } from '../search/search-form';
import { FormField } from './form-field';

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

/**
 * Preferred-flagged mapping xref (0.3.x `XrefPreferMappingField`, type
 * `'xrefPreferMapping'`).
 *
 * REQUIRED POSTURE (R3): identical mechanism to `XrefMappingField` — the
 * generic required-blank path drives requiredness, with `isBlank`
 * (`./value.ts`, guarded by `fieldType`) treating the `{mapped}` envelope as
 * blank iff it has no rows. The generic path honors the EF1 store override
 * (`override?.required ?? isRequired`), so runtime `setMeta({required})` is
 * authoritative in both directions; no field-local `CustomValidation` is
 * attached.
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
}
