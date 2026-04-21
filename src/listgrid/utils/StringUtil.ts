import { stringify } from './jsonUtils';
import { isTrue } from './BooleanUtil';

export function isBlank(data: unknown): boolean {
  return data === undefined || data === null || data === '';
}

export function appendString(
  str: string | null | undefined,
  added: string[] | string | null | undefined,
  splitter?: string,
): string {
  str = str === null || str === undefined ? '' : str;

  const split = splitter === undefined ? ' ' : splitter;
  if (isBlank(added)) {
    return str;
  }

  if (Array.isArray(added)) {
    for (const add of added) {
      str += split + add;
    }
  } else {
    str += split + added;
  }

  return str;
}

export function subStringBeforeLast(value: string, splitCode: string): string {
  if (!value.includes(splitCode)) {
    return value;
  }
  const split = value.split(splitCode);
  let result = '';
  for (let i = 0; i < split.length - 1; i++) {
    result += split[i];
    if (i < split.length - 2) {
      result += splitCode;
    }
  }
  return result;
}

export function subStringBefore(value: string, splitCode: string): string {
  if (!value.includes(splitCode)) {
    return value;
  }
  const split = value.split(splitCode);
  return defaultString(split[0]);
}

export function subStringAfterLast(value: string, splitCode: string): string {
  if (!value.includes(splitCode)) {
    return value;
  }
  const split = value.split(splitCode);
  return defaultString(split[split.length - 1]);
}

export function subStringAfter(value: string, splitCode: string): string {
  if (!value.includes(splitCode)) {
    return value;
  }
  const split = value.split(splitCode);
  let str = '';
  for (let i = 1; i < split.length; i++) {
    str += split[i];
    if (i < split.length - 1) {
      str += splitCode;
    }
  }
  return str;
}

export function subStringBetween(value: string, startCode: string, endCode: string): string {
  return subStringBefore(subStringAfter(value, startCode), endCode);
}

export function subStringBetweenLast(value: string, startCode: string, endCode: string): string {
  return subStringBeforeLast(subStringAfterLast(value, startCode), endCode);
}

export function defaultString(value: unknown, defaultValue: string = ''): string {
  if (isBlank(value)) {
    return defaultValue;
  } else {
    if (typeof value === 'string') {
      return value;
    } else {
      return String(value);
    }
  }
}

export function appendPrefix(str: string, prefix: string, split?: string) {
  if (!isBlank(split)) {
    prefix = prefix + split;
  }
  if (str.startsWith(prefix)) {
    return str;
  }

  if (!isBlank(split) && str.startsWith(split!)) {
    str = str.substring(split!.length);
  }

  return prefix + str;
}

export function appendSuffix(str: string, suffix: string, split?: string) {
  if (!isBlank(split)) {
    suffix = split + suffix;
  }
  if (str.endsWith(suffix)) {
    return str;
  }
  if (!isBlank(split) && str.endsWith(split!)) {
    str = str.substring(0, str.length - split!.length);
  }
  return str + suffix;
}

export function removePrefix(str: string, prefix: string, split?: string) {
  if (!isBlank(split)) {
    prefix = prefix + split;
  }
  if (!str.startsWith(prefix)) {
    return str;
  }
  return subStringAfter(str, prefix);
}

export function removeSuffix(str: string, suffix: string, split?: string) {
  if (!isBlank(split)) {
    suffix = split + suffix;
  }
  if (!str.endsWith(suffix)) {
    return str;
  }
  return subStringBeforeLast(str, suffix);
}

export function appendPrefixSuffix(str: string, prefix: string, suffix: string, split?: string) {
  return appendSuffix(appendPrefix(str, prefix, split), suffix, split);
}

export function getHashCode(data: unknown): number {
  if (data === null || data === undefined) {
    return 0;
  }

  if (typeof data === 'string') {
    let hash = 0;
    if (data.length === 0) {
      return hash;
    }
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  } else {
    return getHashCode(stringify(data));
  }
}

export function removeTrailingSeparator(input: string, separator: string): string {
  const parts: string[] = input.split(separator);

  // 배열의 마지막 요소를 가져옵니다.
  const lastPart: string = parts[parts.length - 1]!;

  // 마지막 요소가 공백이 아니라면 '/'를 포함한 부분을 제거하고 반환합니다.
  if (lastPart.trim() !== '') {
    return input.slice(0, input.lastIndexOf(separator));
  } else {
    // 마지막 요소가 공백이라면 입력값을 그대로 반환합니다.
    return input;
  }
}

export function startsWith(value: string, prefix: string, ignoreCase?: boolean): boolean {
  if (value === undefined || prefix === undefined) return false;
  if (isTrue(ignoreCase)) {
    return value.toLowerCase().startsWith(prefix.toLowerCase());
  } else {
    return value.startsWith(prefix);
  }
}

export function endsWith(value?: string, postFix?: string, ignoreCase?: boolean): boolean {
  if (value === undefined || postFix === undefined) return false;
  if (isTrue(ignoreCase)) {
    return value.toLowerCase().endsWith(postFix.toLowerCase()) ?? false;
  } else {
    return value.endsWith(postFix) ?? false;
  }
}

export function convertToCamelCase(input?: string): string {
  // 입력이 없거나 공백인 경우
  if (!input || input.trim().length === 0) {
    return '';
  }

  // 공백 제거
  input = input.trim();

  // 문자열의 첫 글자를 소문자로 변환
  let result = input.charAt(0).toLowerCase();

  // 두 번째 글자부터 반복하여 처리
  for (let i = 1; i < input.length; i++) {
    // 현재 문자와 이전 문자가 둘 다 대문자이고, 이전 문자가 마지막 문자열이 아닐 때
    if (
      input.charAt(i).toUpperCase() === input.charAt(i) &&
      input.charAt(i - 1).toUpperCase() === input.charAt(i - 1) &&
      i !== input.length - 1
    ) {
      // 현재 문자를 소문자로 변환하여 결과에 추가
      result += input.charAt(i).toLowerCase();
    } else {
      // 그 외의 경우는 그대로 결과에 추가
      result += input.charAt(i);
    }
  }

  return result;
}

export function equalsIgnoreCase(value: string, other: string, trim?: boolean): boolean {
  if (isTrue(trim)) {
    value = value.trim();
    other = other.trim();
  }
  return value.toLowerCase() === other.toLowerCase();
}

// stripHtmlTags는 HtmlUtil에서 더 고급 버전으로 제공됩니다.
// HtmlUtil의 stripHtmlTags를 사용하세요.
function _stripHtmlTags(html: string): string {
  const regex = /<[^>]*>/g; // HTML 태그를 찾기 위한 정규식
  return html.replace(regex, ''); // HTML 태그를 빈 문자열로 대체하여 제거
}

export type WordPostfixType = '1' | '2';

/**
 * 단어 뒤에 '은', '는', '이', '가'를 선택적으로 붙여 준다.
 * 한글에 대해서 유효하며, 한글이 아닌 단어는 제대로 되지 않지만 유사하게 처리된다.
 * @param type
 * @param word
 */
export function addKoreanWordPostfix(type: WordPostfixType, word?: string): string {
  // word가 빈 문자열이거나 undefined면 빈 문자열을 리턴
  if (!word) return '';

  // 한글의 유니코드 범위
  const HANGUL_START = 0xac00;
  const HANGUL_END = 0xd7a3;

  // 단어의 마지막 글자를 가져옴
  const lastChar = word[word.length - 1]!;

  // 마지막 글자가 한글인 경우
  if (lastChar.charCodeAt(0) >= HANGUL_START && lastChar.charCodeAt(0) <= HANGUL_END) {
    const lastCharCode = lastChar.charCodeAt(0) - HANGUL_START;
    const jongseong = lastCharCode % 28;

    // 받침이 있는 경우
    const hasJongseong = jongseong !== 0;

    if (type === '1') {
      return hasJongseong ? `${word}은` : `${word}는`;
    } else if (type === '2') {
      return hasJongseong ? `${word}이` : `${word}가`;
    }
  }

  // 영어 단어인 경우
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const isLastCharVowel = vowels.includes(lastChar.toLowerCase());

  if (type === '1') {
    return isLastCharVowel ? `${word}는` : `${word}은`;
  } else if (type === '2') {
    return isLastCharVowel ? `${word}가` : `${word}이`;
  }

  return word; // 이 경우는 발생하지 않겠지만 안전성을 위해 추가
}

export function generateSlug(input?: string): string {
  if (isBlank(input) || input === undefined) {
    return '';
  }
  // 입력 문자열을 소문자로 변환
  let modifiedString = input.toLowerCase();

  // 한글, 영어, 숫자, 그리고 '-'만 남기기
  modifiedString = modifiedString.replace(/[^a-z0-9가-힣\s-]/g, '');

  // 연속된 공백을 하나의 공백으로 대체
  modifiedString = modifiedString.replace(/\s+/g, ' ');

  // 문자열에서 공백을 '-'로 대체
  modifiedString = modifiedString.replace(/\s/g, '-');

  // 변환된 문자열의 맨 앞에 '/'를 붙이되, 이미 '/'로 시작하면 추가하지 않음
  if (!modifiedString.startsWith('/')) {
    modifiedString = `/${modifiedString}`;
  }

  return modifiedString;
}

export function camelCaseToSnakeCase(camel: string, upperCase: boolean): string {
  // 먼저 "-" 문자를 "_"로 대체
  camel = camel.replace(/-/g, '_');

  let sb: string[] = [];
  const length = camel.length;

  for (let i = 0; i < length; ++i) {
    const char = camel.charAt(i);

    if (char === char.toUpperCase() && char !== '_' && sb.length > 0) {
      sb.push('_');
    }
    sb.push(upperCase ? char.toUpperCase() : char.toLowerCase());
  }

  return sb.join('');
}

export function splitWithSplitCode(value: string, split: string): string[] {
  if (isBlank(value)) {
    return [];
  }

  if (isBlank(split)) {
    return [value];
  }

  const result: string[] = [];
  for (const val of value.split(split)) {
    if (!isBlank(val)) {
      const trimmed = val.trim();
      if (!isBlank(trimmed)) {
        result.push(trimmed);
      }
    }
  }

  return result;
}

export function equalsIgnoreBlank(
  value: string | null | undefined,
  other: string | null | undefined,
): boolean {
  if (isBlank(value) && isBlank(other)) {
    return true;
  }
  if (isBlank(value) || isBlank(other)) {
    return false;
  }
  return equalsIgnoreCase(value!, other!, true);
}
