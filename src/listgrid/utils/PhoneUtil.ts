/**
 * 전화번호에서 하이픈을 제거합니다.
 * @param phoneNumber 전화번호 문자열 (하이픈 포함 가능)
 * @returns 하이픈이 제거된 숫자만 있는 문자열
 * @example removePhoneNumberHyphens("010-1234-5678") => "01012345678"
 * @example removePhoneNumberHyphens("01012345678") => "01012345678"
 */
export function removePhoneNumberHyphens(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/-/g, '');
}

/**
 * 전화번호를 하이픈이 포함된 형식으로 포맷팅합니다.
 * 10자리: 000-0000-0000 (예: 02-1234-5678)
 * 11자리: 000-0000-0000 (예: 010-1234-5678)
 * @param phoneNumber 전화번호 문자열 (숫자만)
 * @returns 하이픈이 포함된 전화번호 문자열
 * @example formatPhoneNumber("01012345678") => "010-1234-5678"
 * @example formatPhoneNumber("0212345678") => "02-1234-5678"
 * @example formatPhoneNumber("010-1234-5678") => "010-1234-5678" (이미 포맷팅된 경우)
 */
export function formatPhoneNumber(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';

  // 이미 하이픈이 포함되어 있으면 제거 후 다시 포맷팅
  const digitsOnly = removePhoneNumberHyphens(phoneNumber);

  if (digitsOnly.length === 10) {
    // 10자리: 000-0000-0000 형식
    return `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}`;
  } else if (digitsOnly.length === 11) {
    // 11자리: 000-0000-0000 형식
    return `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3, 7)}-${digitsOnly.substring(7)}`;
  }

  // 10자리 또는 11자리가 아닌 경우 원본 반환 (검증은 별도로 처리)
  return digitsOnly;
}
