// Transplanted verbatim from src/listgrid/utils/PhoneUtil.ts (0.3.x) —
// only the piece the phone/telephone validations need. React-free.

/**
 * Strips hyphens from a phone number string.
 * @example removePhoneNumberHyphens("010-1234-5678") => "01012345678"
 * @example removePhoneNumberHyphens("01012345678") => "01012345678"
 */
export function removePhoneNumberHyphens(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/-/g, '');
}
