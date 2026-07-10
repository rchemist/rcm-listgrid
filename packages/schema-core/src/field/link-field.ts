import { FormField } from './form-field';

// Link (0.3.x LinkField, src/listgrid/components/fields/LinkField.tsx:18-104,
// type 'text' reused there — new engine gives it a dedicated 'link' type so
// the FieldRenderer registry can dispatch it, EA-A0 pre-stage §3).
//
// 0.3.x extended CheckButtonValidationField (abstract/CheckButtonValidationField.tsx)
// purely to inherit the optional "중복확인" (duplicate-check) button flow — Link
// never actually declared a checkButtonValidation in practice, and the flow
// itself is host-UI-shaped (CheckButtonValidationInput is a host primitive).
// Conductor decision ⑧ (briefing banner): CheckButtonValidation is DESCOPED for
// the transplant — LinkField becomes a plain string field carrying the 'link'
// type discriminant, rendered as a plain text input (LinkFieldRenderer). No
// field-level meta/builders beyond the FormField base survive the descope.
//
// The 0.3.x list-cell behavior (stopPropagation + window.open(normalizeUrl(value)),
// LinkField.tsx:70-98) is explicitly deferred with the rest of list-cell
// per-type dispatch (briefing decision ⑦, PART 3 "명시 연기") — not reproduced
// here or in the renderer.
export class LinkField extends FormField<string> {
  constructor(name: string, order: number) {
    super(name, order, 'link');
  }
}
