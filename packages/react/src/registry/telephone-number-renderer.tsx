import type { ChangeEvent, FocusEvent } from 'react';
import { formatPhoneNumber, removePhoneNumberHyphens } from '@listgrid/schema-core';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// TelephoneNumber renderer (EA-B fan-out, ea-b-scout-briefing.md PART C
// §TelephoneNumber). Transplant of 0.3.x
// `src/listgrid/components/fields/TelephoneNumberField.tsx:37-105`
// (`TelephoneNumberInput`) — a raw `<input type="text">` (no ui-default
// primitive slot fits: `TextInput` (primitives.tsx) has no onBlur, and this
// field's commit-on-blur seam is load-bearing, see below), same posture as
// the old renderer's own raw `<input>`.
//
// Store/display split (conductor decision ⑥ — no getDisplayValue/
// getSaveValue hook exists in schema-core, ADR-0002):
//   - store value is ALWAYS digits-only. `onChange` strips hyphens via
//     `removePhoneNumberHyphens` (old :63, truncates to 11 digits like the
//     old renderer :66) BEFORE writing — the store never holds a hyphenated
//     value from user input.
//   - the displayed value is derived FRESH every render via
//     `formatPhoneNumber(raw)` — no local React state mirrors the old
//     renderer's `displayValue` useState (old :47,50-57,70): since the store
//     value is reactive (`useFieldValue`) and `formatPhoneNumber` is a pure
//     function of it, deriving inline keeps the value single-sourced from
//     the store per ADR-0002 (no more "two sources of truth" than the old
//     renderer's synced-via-useEffect local state had, and one hook fewer).
//   - fetched/hydrated values are NOT normalized on mount — the raw stored
//     value (hyphenated or not) round-trips untouched into `formatPhoneNumber`
//     display; only a user EDIT ever re-writes the store (Needs Review per
//     the briefing — deliberately not "fixed" here).
//
// Propagation seam (EA-B0 `setValue(name, value, {cascade})`, Birthday-same
// pattern, briefing PART A): every keystroke writes `{cascade:false}` (old
// `onChange(truncated, false)` :73 — commit=false ⇔ propagation=false, PART
// A) so onChanges cascades don't fire mid-edit while validate-on-change/
// touched/dirty still track normally (EA-B0 semantics, NOT a full skip);
// blur commits with a plain `setValue` call (old `onChange(digitsOnly,
// true)` :90).
//
// Local validation UI (old :76-91, regex-vs-RegexValidation lookup on blur,
// UI-only `onError` callback) is NOT reproduced: TelephoneNumberField
// carries no bespoke error-display hook (schema-core's async
// `field.validate()` — which runs any attached `TelephoneNumberValidation`,
// see telephone-number-field.ts's ctor doc — already surfaces failures
// through the standard aria-invalid/describedBy error-list wiring
// (FieldRenderer.tsx), so no separate local error state is needed).
export function TelephoneNumberFieldRenderer({
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const store = useFormStore();
  const raw = useFieldValue<string>(name);
  const display = formatPhoneNumber(raw);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = removePhoneNumberHyphens(e.target.value).substring(0, 11);
    store.getState().setValue(name, digitsOnly, { cascade: false });
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const digitsOnly = removePhoneNumberHyphens(e.target.value).substring(0, 11);
    store.getState().setValue(name, digitsOnly);
  };

  return (
    <input
      type="text"
      id={name}
      value={display}
      readOnly={readOnly}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
