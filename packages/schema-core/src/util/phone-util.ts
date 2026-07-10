// Transplanted verbatim from src/listgrid/utils/PhoneUtil.ts (0.3.x) — pure,
// React-free (EA-B0 PART D item 5; consumer: TelephoneNumberField's renderer,
// EA-B fan-out). `removePhoneNumberHyphens` already lives in `./phone` (used
// by the phone/telephone-number validations) — re-exported here rather than
// re-implemented (search-first / no duplicate impl), so both functions ship
// from this one module at the path the EA-B briefing names for downstream
// consumers.
export { removePhoneNumberHyphens } from './phone';

import { removePhoneNumberHyphens } from './phone';

/**
 * Formats a phone number string (digits-only, or already hyphenated — either
 * is accepted, hyphens are stripped first) into hyphenated display form.
 * 10 digits -> `000-0000-0000` (e.g. landline), 11 digits -> `000-0000-0000`
 * (e.g. mobile). Any other digit length returns the digits-only string
 * unchanged (validation of length is handled separately, by
 * TelephoneNumberValidation). Transplant of
 * src/listgrid/utils/PhoneUtil.ts formatPhoneNumber, verbatim.
 *
 * @example formatPhoneNumber("01012345678") => "010-1234-5678"
 * @example formatPhoneNumber("0212345678") => "021-234-5678" (blind 3-3-4
 *   split for any 10-digit input — 0.3.x does not special-case the 2-digit
 *   Seoul area code; the 0.3.x source's own doc comment example here was
 *   wrong, not the code, and this transplant follows the CODE verbatim)
 * @example formatPhoneNumber("010-1234-5678") => "010-1234-5678" (already formatted)
 */
export function formatPhoneNumber(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';

  const digitsOnly = removePhoneNumberHyphens(phoneNumber);

  if (digitsOnly.length === 10) {
    return `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}`;
  } else if (digitsOnly.length === 11) {
    return `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3, 7)}-${digitsOnly.substring(7)}`;
  }

  return digitsOnly;
}
