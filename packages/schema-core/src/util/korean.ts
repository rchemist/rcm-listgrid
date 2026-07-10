// Korean object-particle (을/를) selector — transplanted intent of the 0.3.x
// addKoreanWordPostfix('1', ...) used in FormField.validate's required message.
// Hangul syllable has a final consonant (받침) iff (code - 0xAC00) % 28 !== 0.

export function koreanObjectParticle(word: string): string {
  if (!word) return '';
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return '를'; // non-hangul → default
  return (last - 0xac00) % 28 !== 0 ? '을' : '를';
}

/** The required-blank message, matching 0.3.x FormField.validate:803. */
export function requiredMessage(label: string): string {
  return `${label}${koreanObjectParticle(label)}  필수 값입니다.`;
}
