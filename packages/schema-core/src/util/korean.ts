// Korean object-particle (을/를) selector — transplanted intent of the 0.3.x
// addKoreanWordPostfix('1', ...) used in FormField.validate's required message.
// Hangul syllable has a final consonant (받침) iff (code - 0xAC00) % 28 !== 0.

export function koreanObjectParticle(word: string): string {
  if (!word) return '';
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return '를'; // non-hangul → default
  return (last - 0xac00) % 28 !== 0 ? '을' : '를';
}

/** Korean topic-particle (은/는) selector. */
export function koreanTopicParticle(word: string): string {
  if (!word) return '는';
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return '는';
  return (last - 0xac00) % 28 !== 0 ? '은' : '는';
}

export type RequiredMessageFormatter = (label: string) => string;

/** The default required-blank message retained for hosts that do not configure labels. */
export function defaultRequiredMessage(label: string): string {
  return `${label}${koreanTopicParticle(label)} 필수 값입니다.`;
}

let requiredMessageFormatter: RequiredMessageFormatter = defaultRequiredMessage;

/** Install the host's locale-aware required-field message formatter. */
export function configureRequiredMessage(formatter: RequiredMessageFormatter): void {
  requiredMessageFormatter = formatter;
}

/** The active required-blank message. */
export function requiredMessage(label: string): string {
  return requiredMessageFormatter(label);
}
