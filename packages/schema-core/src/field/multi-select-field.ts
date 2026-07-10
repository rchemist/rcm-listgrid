import type { MinMaxLimit, SelectOption } from './basic-fields';
import { MultiOptionsField } from './options-field';

// MultiSelect (0.3.x MultiSelectField,
// src/listgrid/components/fields/MultiSelectField.tsx:37-168 — type
// 'multiselect', already in FieldType). valueShape: `string[]` (a multi
// checkbox/select-box group — NOT a single Boolean; the field's own
// MultipleOptionalField-descended base owns all the array handling, so this
// class must not be treated like BooleanField). base: MultiOptionsField
// (EA-A0 pre-stage transplant of 0.3.x MultipleOptionalField,
// abstract/OptionalField.tsx:210-345 — options + selected-count limit
// validate() only, options-field.ts).
//
// Conductor decision ④ (briefing banner, PART 2 §MultiSelect): the
// status-change trio — enableImmediateChange/reason/validateStatusChange
// (MultiSelectField.tsx:38-45, withImmediateChange/withReason/
// withValidateStatusChange :144-167) — is DESCOPED. Those fields/builders
// existed to drive an immediate-API-call status-change UX coupled to
// SelectField's status-change machinery (StatusChangeReason/
// StatusChangeValidation, SelectField.tsx) which itself has not been
// transplanted; carrying the trio here with nothing to consume it would be
// dead meta. If SelectField's status-change machinery is ever transplanted,
// this is the point to re-add the trio (PART 3 "명시 연기").
//
// Task-scope descope (explicit instruction: "minimal options+limit render
// via existing primitives"): the 0.3.x dual CheckBoxChip/MultiSelectBox
// render modes — `combo`/`chipConfig`-driven (OptionalField.withComboType/
// useChip, OptionalField.tsx:71-110) — are NOT carried onto this class
// either, beyond what the EA-A0 shared base already declined to include
// (options-field.ts header: "combo/chipConfig/preservedOptions/singleFilter
// ... EXCLUDED"). The new engine has no chip/combo-aware UI primitive
// (packages/ui-default/src/types.ts UIComponents) to drive them, and the
// renderer (multi-select-renderer.tsx) is a plain checkbox-per-option group —
// see that file's header for the renderer-side rationale. Recorded as a
// deviation from the briefing's PART 2 builder list (which named
// withComboType/useChip as surviving), not as a silent drop.
export class MultiSelectField extends MultiOptionsField<string[]> {
  constructor(name: string, order: number, options: SelectOption[] = [], limit?: MinMaxLimit) {
    super(name, order, 'multiselect');
    this.options = [...options];
    if (limit !== undefined) this.limit = limit;
  }
}
