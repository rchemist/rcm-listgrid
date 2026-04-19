import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import {
  RegexPhoneNumber,
  RegexEmailAddress,
  RegexKoreanName,
  RegexLoginName,
  fDate,
  fDateTime,
  fTimestamp,
  fToNow,
  formatYearMonth,
  getCurrentYear,
  getCurrentYearMonth,
  getCurrentHour,
  getCurrentMonth,
  getFormattedTime,
  formatPrice,
  isNulls,
  isEquals,
  isEqualsIgnoreCase,
  isEqualCollection,
  isEmpty,
  isPositive,
  isNegative,
  normalizeUrl,
  removeTrailingSeparator,
  stringify,
  parse,
  setLocalStorageItem,
  getLocalStorageItem,
  removeLocalStorageItem,
  getLocalStorageObject,
  setSessionStorageItem,
  getSessionStorageItem,
  removeSessionStorageItem,
  getSessionStorageObject,
  configureAssetServerUrl,
  configureAssetPrefix,
  getAccessableAssetUrl,
  removeAssetServerPrefix,
  validatedAssetFileName,
  getDefinedDates,
} from './index';

/**
 * The misc barrel re-exports a large surface of string/date/url/storage
 * helpers. Tests focus on the input/output contract — edge cases around
 * nullish values and boundaries, not the internal Intl.NumberFormat or
 * date-fns wiring.
 */

describe('regex exports', () => {
  it('RegexPhoneNumber matches 10-11 digit strings', () => {
    expect(RegexPhoneNumber.test('01012345678')).toBe(true);
    expect(RegexPhoneNumber.test('0123456789')).toBe(true);
    expect(RegexPhoneNumber.test('123')).toBe(false);
    expect(RegexPhoneNumber.test('abc')).toBe(false);
  });

  it('RegexEmailAddress matches basic emails', () => {
    expect(RegexEmailAddress.test('a@b.co')).toBe(true);
    expect(RegexEmailAddress.test('bad')).toBe(false);
  });

  it('RegexKoreanName matches 2-5 Korean characters', () => {
    expect(RegexKoreanName.test('홍길동')).toBe(true);
    expect(RegexKoreanName.test('김')).toBe(false);
    expect(RegexKoreanName.test('Alice')).toBe(false);
  });

  it('RegexLoginName enforces lowercase-start + alnum', () => {
    expect(RegexLoginName.test('abcde')).toBe(true);
    expect(RegexLoginName.test('1abcde')).toBe(false);
    expect(RegexLoginName.test('ABCDE')).toBe(false);
  });
});

describe('date formatters', () => {
  it('fDate formats a Date with default yyyy-MM-dd', () => {
    expect(fDate(new Date('2024-01-02T00:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('fDate returns empty string for falsy input', () => {
    expect(fDate('' as unknown as string)).toBe('');
  });

  it('fDate swallows invalid input', () => {
    // String format cannot be parsed — date-fns throws; wrapper returns ''.
    expect(fDate(new Date('invalid'))).toBe('');
  });

  it('fDateTime and fTimestamp tolerate undefined', () => {
    expect(fDateTime(undefined)).toBe('');
    expect(fTimestamp(undefined)).toBe('');
  });

  it('fTimestamp returns a numeric millisecond timestamp for a valid date', () => {
    const ts = fTimestamp(new Date('2024-01-01T00:00:00Z'));
    expect(typeof ts).toBe('number');
  });

  it('fToNow non-relative mode calls fDate', () => {
    const d = new Date('2024-01-02T00:00:00Z');
    expect(fToNow(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('fToNow returns empty for undefined', () => {
    expect(fToNow(undefined)).toBe('');
  });
});

describe('formatYearMonth', () => {
  it('converts dashed YYYY-MM to "YYYY년 MM월"', () => {
    expect(formatYearMonth('2024-03')).toBe('2024년 03월');
  });

  it('converts dotted YYYY.MM to "YYYY년 MM월"', () => {
    expect(formatYearMonth('2024.03')).toBe('2024년 03월');
  });

  it('converts 6-digit numeric input (via string coercion)', () => {
    expect(formatYearMonth(202403)).toBe('2024년 03월');
  });

  it('short inputs are returned verbatim', () => {
    expect(formatYearMonth('2024')).toBe('2024');
  });

  it('returns empty string for falsy input', () => {
    expect(formatYearMonth(undefined)).toBe('');
  });
});

describe('current-time helpers', () => {
  it('getCurrentYear returns the current year', () => {
    expect(getCurrentYear()).toBe(new Date().getFullYear());
  });

  it('getCurrentMonth returns 1-12 as a string', () => {
    const m = Number(getCurrentMonth());
    expect(m).toBeGreaterThanOrEqual(1);
    expect(m).toBeLessThanOrEqual(12);
  });

  it('getCurrentYearMonth returns YYYY-MM', () => {
    expect(getCurrentYearMonth()).toMatch(/^\d{4}-\d{2}$/);
  });

  it('getCurrentHour returns 2-digit hour', () => {
    expect(getCurrentHour()).toMatch(/^\d{2}$/);
  });
});

describe('getFormattedTime', () => {
  it('applies hour and minute offsets', () => {
    const d = new Date('2024-01-01T12:30:00');
    const s = getFormattedTime(d, 1, -5);
    expect(s).toBe('13:25');
  });

  it('pads single-digit hours/minutes to 2 chars', () => {
    const d = new Date('2024-01-01T05:07:00');
    expect(getFormattedTime(d, 0, 0)).toBe('05:07');
  });
});

describe('formatPrice', () => {
  it('formats with default en-US thousands separators', () => {
    expect(formatPrice(1234567)).toBe('1,234,567');
  });

  it('appends "원" suffix when localeCode = "원"', () => {
    expect(formatPrice(1000, '원')).toBe('1,000 원');
  });
});

describe('isNulls / isEquals / isEqualsIgnoreCase / isEqualCollection', () => {
  it('isNulls treats undefined/null/empty-string as equivalent nullish', () => {
    expect(isNulls(undefined, undefined)).toBe(true);
    expect(isNulls(undefined, null)).toBe(true);
    expect(isNulls(undefined, '')).toBe(true);
    expect(isNulls(null, undefined)).toBe(true);
    expect(isNulls('', undefined)).toBe(true);
  });

  it('isNulls rejects a value paired with a non-nullish other', () => {
    expect(isNulls('x', 'y')).toBe(false);
    expect(isNulls(null, 'x')).toBe(false);
  });

  it('isEquals compares primitives, nullish, and plain objects', () => {
    expect(isEquals(1, 1)).toBe(true);
    expect(isEquals('a', 'a')).toBe(true);
    expect(isEquals(null, undefined)).toBe(true);
    expect(isEquals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(isEquals({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('isEqualsIgnoreCase returns true for same-letter strings in different case', () => {
    expect(isEqualsIgnoreCase('Hello', 'HELLO')).toBe(true);
    expect(isEqualsIgnoreCase('a', 'b')).toBe(false);
  });

  it('isEqualsIgnoreCase treats undefined + null as nullish-equal (isNulls hit)', () => {
    // The impl routes via isNulls first: (undefined, null) collapses to true.
    expect(isEqualsIgnoreCase(undefined, null)).toBe(true);
  });

  it('isEqualsIgnoreCase returns false when only one side is null', () => {
    expect(isEqualsIgnoreCase('x', null)).toBe(false);
  });

  it('isEqualCollection respects order by default', () => {
    expect(isEqualCollection([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isEqualCollection([1, 2, 3], [3, 2, 1])).toBe(false);
  });

  it('isEqualCollection honours ignoreOrder flag', () => {
    expect(isEqualCollection([1, 2, 3], [3, 1, 2], true)).toBe(true);
  });

  it('isEqualCollection returns false for different lengths', () => {
    expect(isEqualCollection([1], [1, 2])).toBe(false);
  });
});

describe('collection / number predicates', () => {
  it('isEmpty handles arrays, maps, null, undefined', () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Map([['a', 1]]))).toBe(false);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('isPositive only true for > 0', () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(0)).toBe(false);
    expect(isPositive(-1)).toBe(false);
    expect(isPositive(undefined)).toBe(false);
  });

  it('isNegative only true for < 0', () => {
    expect(isNegative(-1)).toBe(true);
    expect(isNegative(0)).toBe(false);
    expect(isNegative(undefined)).toBe(false);
  });
});

describe('url helpers', () => {
  it('normalizeUrl leaves absolute http(s) URLs unchanged', () => {
    expect(normalizeUrl('http://example.com/x')).toBe('http://example.com/x');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('normalizeUrl prefixes / for relative paths', () => {
    expect(normalizeUrl('foo/bar')).toBe('/foo/bar');
  });

  it('normalizeUrl leaves / prefixes intact', () => {
    expect(normalizeUrl('/foo/bar')).toBe('/foo/bar');
  });

  it('normalizeUrl trims whitespace', () => {
    expect(normalizeUrl('  foo  ')).toBe('/foo');
  });

  it('normalizeUrl passes through blank input', () => {
    expect(normalizeUrl('')).toBe('');
  });

  it('removeTrailingSeparator drops the last path segment when present', () => {
    expect(removeTrailingSeparator('a/b/c', '/')).toBe('a/b');
  });

  it('removeTrailingSeparator preserves trailing-separator inputs', () => {
    expect(removeTrailingSeparator('a/b/', '/')).toBe('a/b/');
  });
});

describe('JSON helpers', () => {
  it('stringify handles plain objects', () => {
    expect(stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('stringify beautifies when beautify=true', () => {
    expect(stringify({ a: 1 }, true)).toContain('\n');
  });

  it('stringify preserves Maps as plain objects', () => {
    expect(stringify(new Map([['a', 1]]))).toBe('{"a":1}');
  });

  it('stringify preserves Sets as arrays', () => {
    expect(stringify(new Set(['a', 'b']))).toBe('["a","b"]');
  });

  it('stringify avoids infinite recursion on circular references', () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    expect(() => stringify(a)).not.toThrow();
  });

  it('parse revives dataType:"Map" envelopes into Maps', () => {
    const json = JSON.stringify({ dataType: 'Map', value: [['a', 1]] });
    const result = parse(json) as Map<string, number>;
    expect(result).toBeInstanceOf(Map);
    expect(result.get('a')).toBe(1);
  });

  it('parse returns plain objects when no Map envelope is present', () => {
    expect(parse('{"a":1}')).toEqual({ a: 1 });
  });
});

describe('localStorage helpers (jsdom-backed)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it('set + get round-trips a string value', () => {
    setLocalStorageItem('key', 'hello');
    expect(getLocalStorageItem('key')).toBe('hello');
  });

  it('removeLocalStorageItem clears the value', () => {
    setLocalStorageItem('key', 'hello');
    removeLocalStorageItem('key');
    expect(getLocalStorageItem('key')).toBeUndefined();
  });

  it('expired items return undefined', () => {
    setLocalStorageItem('key', 'hello', -1); // immediately expired
    expect(getLocalStorageItem('key')).toBeUndefined();
  });

  it('getLocalStorageItem returns undefined for a missing key', () => {
    expect(getLocalStorageItem('does-not-exist')).toBeUndefined();
  });

  it('getLocalStorageObject parses a JSON payload', () => {
    setLocalStorageItem('k', '{"a":1}');
    expect(getLocalStorageObject<{ a: number }>('k')).toEqual({ a: 1 });
  });

  it('getLocalStorageObject supports a custom parse fn', () => {
    setLocalStorageItem('k', 'plain');
    expect(getLocalStorageObject<string>('k', (v) => v.toUpperCase())).toBe('PLAIN');
  });
});

describe('sessionStorage helpers (jsdom-backed)', () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => window.sessionStorage.clear());

  it('set + get round-trips a string value', () => {
    setSessionStorageItem('key', 'hello');
    expect(getSessionStorageItem('key')).toBe('hello');
  });

  it('remove clears the value', () => {
    setSessionStorageItem('key', 'hello');
    removeSessionStorageItem('key');
    expect(getSessionStorageItem('key')).toBeUndefined();
  });

  it('getSessionStorageObject parses JSON', () => {
    setSessionStorageItem('k', '{"x":2}');
    expect(getSessionStorageObject<{ x: number }>('k')).toEqual({ x: 2 });
  });

  it('getSessionStorageObject returns undefined for missing key', () => {
    expect(getSessionStorageObject('missing')).toBeUndefined();
  });
});

describe('asset URL helpers', () => {
  afterEach(() => {
    // Reset overrides so other tests observe default behavior.
    configureAssetServerUrl('http://127.0.0.1:8320');
    configureAssetPrefix('/static-resource/');
  });

  it('returns empty string for null/undefined input', () => {
    expect(getAccessableAssetUrl(null)).toBe('');
    expect(getAccessableAssetUrl(undefined)).toBe('');
  });

  it('URL-encodes absolute http(s) inputs because removeAssetServerPrefix runs first', () => {
    // The impl feeds the input through removeAssetServerPrefix, which
    // encodeURIComponent-s each path segment. The early-return on http(s)
    // therefore never fires. We lock in the current behavior so future
    // refactors notice the quirk.
    const result = getAccessableAssetUrl('https://cdn.example.com/a.png');
    expect(result).toContain('https%3A');
    expect(result).toContain('a.png');
  });

  it('prepends server URL + prefix to relative paths', () => {
    configureAssetServerUrl('https://assets.example.com');
    configureAssetPrefix('/files/');
    expect(getAccessableAssetUrl('photo.jpg')).toBe('https://assets.example.com/files/photo.jpg');
  });

  it('removeAssetServerPrefix strips the configured server + prefix', () => {
    configureAssetServerUrl('https://assets.example.com');
    configureAssetPrefix('/files/');
    expect(removeAssetServerPrefix('https://assets.example.com/files/photo.jpg')).toBe('photo.jpg');
  });

  it('removeAssetServerPrefix URL-encodes non-separator segments', () => {
    expect(removeAssetServerPrefix('a b/c.png')).toBe('a%20b/c.png');
  });

  it('removeAssetServerPrefix returns empty string for falsy input', () => {
    expect(removeAssetServerPrefix(null)).toBe('');
  });

  it('validatedAssetFileName replaces each space and each hangul char with a single underscore', () => {
    // "내 파일 name.png" = 3 hangul chars + 2 spaces = 5 replacements.
    expect(validatedAssetFileName('내 파일 name.png')).toBe('_____name.png');
  });
});

describe('getDefinedDates', () => {
  it('returns a [start, end] pair covering today', () => {
    const [start, end] = getDefinedDates('TODAY');
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(start!.getHours()).toBe(0);
    expect(end!.getHours()).toBe(23);
  });

  it('WEEK rewinds 7 days', () => {
    const [start, end] = getDefinedDates('WEEK');
    const diff = end!.getTime() - start!.getTime();
    // around 7 days, but counting end-of-day skew we accept [6.5d, 8d].
    expect(diff).toBeGreaterThan(6 * 24 * 3600 * 1000);
    expect(diff).toBeLessThan(8 * 24 * 3600 * 1000);
  });

  it('MONTH / MONTH3 / MONTH6 / YEAR each return a start before end', () => {
    for (const t of ['MONTH', 'MONTH3', 'MONTH6', 'YEAR'] as const) {
      const [start, end] = getDefinedDates(t);
      expect(start!.getTime()).toBeLessThan(end!.getTime());
    }
  });
});
