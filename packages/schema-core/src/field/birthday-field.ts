import { FormField } from './form-field';

// Birthday field (EA-B fan-out, ea-b-scout-briefing.md PART C §Birthday).
// Transplant of 0.3.x `src/listgrid/components/fields/BirthdayField.tsx`
// (class :229-298, base `ListableFormField`, old `type='custom'` reuse) onto
// the new engine's dedicated FieldType `'birthday'` (EA-B0, charter C4 +4).
//
// Value shape: `string`, either `YYYYMMDD` (includeHyphen=false, default) or
// `YYYY-MM-DD` (includeHyphen=true) — the return-value format switch old
// `getReturnValue` (BirthdayField.tsx renderer :157-162) applied.
//
// Per the briefing's Conductor-settled decision (PART C §Birthday row): NO
// entityForm-level validate override here — the old class had none either
// (validation was 100% renderer-local UI state, `validateDate`
// BirthdayField.tsx:64-131), so this class inherits FormField.validate
// verbatim (required-blank + declared `validations` only). The date-shape
// validation itself is ported into the renderer (`@listgrid/react`'s
// birthday-renderer.tsx), not here — schema-core stays React-free and has no
// instance-level runtime-value hook for this (ADR-0002 precedent, same
// posture as TimeField's 'now' sentinel).
export class BirthdayField extends FormField<string> {
  /** Return-value format switch: false (default) -> `YYYYMMDD`, true -> `YYYY-MM-DD`. */
  includeHyphen: boolean;

  constructor(name: string, order: number, includeHyphen: boolean = false) {
    super(name, order, 'birthday');
    this.includeHyphen = includeHyphen;
    // Transplant of the old ctor's unconditional default helpText
    // (BirthdayField.tsx:234) — overridable via withHelpText() same as any
    // other declared field.
    this.helpText = '생년월일 8자리를 입력해 주세요 (예: 19900101)';
  }

  /** Transplant of `BirthdayField.withIncludeHyphen` (:266-269). */
  withIncludeHyphen(includeHyphen: boolean): this {
    this.includeHyphen = includeHyphen;
    return this;
  }
}
