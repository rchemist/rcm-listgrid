// formatPrice — transplanted verbatim from src/listgrid/misc/index.ts (0.3.x
// NumberUtil.formatPrice). GX-3. React-free, zero runtime dependencies
// (Intl.NumberFormat/toLocaleString are native).

export function formatPrice(value: number | null | undefined, localeCode?: string): string {
  // nullish 값은 포맷 대상이 아니다 — 빈 문자열로 graceful 반환.
  // (number 도메인에서 null/undefined 는 "미설정/전체" 의 정상값이며,
  //  toLocaleString 호출 전에 걸러 런타임 throw 를 방지한다. 0 은 유효값이므로 통과.)
  if (value == null) return '';
  if (localeCode) {
    try {
      return new Intl.NumberFormat(localeCode, { style: 'currency', currency: 'KRW' }).format(
        value,
      );
    } catch {
      /* fall through */
    }
  }
  const formattedNumber = value.toLocaleString('en-US');
  if (localeCode === '원') return `${formattedNumber} 원`;
  if (localeCode) return `${localeCode}${formattedNumber}`;
  return formattedNumber;
}
