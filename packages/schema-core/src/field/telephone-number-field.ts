import type { Validation } from '../validation';
import { FormField } from './form-field';

// TelephoneNumberField (EA-B fan-out, ea-b-scout-briefing.md PART C
// §TelephoneNumber). Transplant of 0.3.x
// `src/listgrid/components/fields/TelephoneNumberField.tsx:107-115`
// (`ListableFormField`, old `type='text'`) — this class carries only the
// constructor's optional `validations` passthrough; every other 0.3.x
// instance method on that class (renderInstance, getDisplayValue,
// getSaveValue, renderListItemInstance) was rendering/formatting concerns
// that moved to `@listgrid/react`'s telephone-number-renderer.tsx
// (ADR-0003 — schema-core is pure meta, React-free).
//
// Distinct FieldType `'telephoneNumber'` (already declared in ./types.ts,
// EA-B0 PART D item 2) — deliberately NOT the pre-existing `'phone'` type,
// which `PhoneNumberField` (basic-fields.ts) already owns with different
// validation/format behavior (conductor decision, briefing PART C).
//
// Value shape: `string`, ALWAYS digits-only in the store (conductor decision
// ⑥) — the renderer's onChange strips hyphens via `removePhoneNumberHyphens`
// before writing; display formatting (`formatPhoneNumber`) happens only in
// the renderer, every render, never mutating the stored value. This class
// has no getDisplayValue/getSaveValue hook (schema-core has none, ADR-0002)
// and does not normalize the value itself.
//
// Ctor semantics are a FAITHFUL transplant of the old ctor
// (TelephoneNumberField.tsx:110-115): `validations` is OPTIONAL and, unlike
// sibling classes EmailField/PhoneNumberField (basic-fields.ts), is NOT
// auto-attached with a default `TelephoneNumberValidation` — the old ctor
// only assigns `this.validations` when the caller passes them explicitly.
// `TelephoneNumberValidation` already exists in the schema-core validations
// barrel (`validations/telephone-number-validation.ts`) for a caller who
// wants it: `new TelephoneNumberField(name, order, [new
// TelephoneNumberValidation()])`.
export class TelephoneNumberField extends FormField<string> {
  constructor(name: string, order: number, validations?: Validation[]) {
    super(name, order, 'telephoneNumber');
    if (validations !== undefined) {
      this.validations = validations;
    }
  }
}
