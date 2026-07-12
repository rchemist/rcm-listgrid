import { describe, it, expect } from 'vitest';
import {
  RegexKoreanName,
  RegexLoginName,
  RegexLoginNameForSignIn,
  RegexStudentLoginName,
  RegexAlias,
  RegexUrlBody,
  RegexDomain,
  RegexLowerEnglish,
  RegexLowerEnglishNumber,
  RegexEnglishNumber,
  RegexNumber,
} from '../regex';

describe('RegexKoreanName', () => {
  it('matches 2-5 Korean characters', () => {
    expect(RegexKoreanName.test('홍길동')).toBe(true);
    expect(RegexKoreanName.test('가나')).toBe(true);
  });
  it('rejects out-of-range / non-Korean input', () => {
    expect(RegexKoreanName.test('김')).toBe(false);
    expect(RegexKoreanName.test('가나다라마바')).toBe(false);
    expect(RegexKoreanName.test('Alice')).toBe(false);
  });
});

describe('RegexLoginName', () => {
  it('requires lowercase-start + alnum, 5-24 chars', () => {
    expect(RegexLoginName.test('abcde')).toBe(true);
    expect(RegexLoginName.test('a2345678901234567890123')).toBe(true);
  });
  it('rejects digit-start / uppercase / too short', () => {
    expect(RegexLoginName.test('1abcde')).toBe(false);
    expect(RegexLoginName.test('ABCDE')).toBe(false);
    expect(RegexLoginName.test('abcd')).toBe(false);
  });
});

describe('RegexLoginNameForSignIn', () => {
  it('allows letter-start with letters/digits/._- , 2-24 chars', () => {
    expect(RegexLoginNameForSignIn.test('Ab')).toBe(true);
    expect(RegexLoginNameForSignIn.test('a.b-c_1')).toBe(true);
  });
  it('rejects digit-start', () => {
    expect(RegexLoginNameForSignIn.test('1ab')).toBe(false);
  });
});

describe('RegexStudentLoginName', () => {
  it('matches exactly 10 digits', () => {
    expect(RegexStudentLoginName.test('2020020135')).toBe(true);
  });
  it('rejects other lengths / non-digits', () => {
    expect(RegexStudentLoginName.test('202002013')).toBe(false);
    expect(RegexStudentLoginName.test('20200201356')).toBe(false);
    expect(RegexStudentLoginName.test('abcdefghij')).toBe(false);
  });
});

describe('RegexAlias', () => {
  it('matches 3-24 lowercase/digit/dash/underscore', () => {
    expect(RegexAlias.test('ab-c_1')).toBe(true);
  });
  it('rejects too short / uppercase', () => {
    expect(RegexAlias.test('ab')).toBe(false);
    expect(RegexAlias.test('ABC')).toBe(false);
  });
});

describe('RegexUrlBody', () => {
  it('matches alnum/dash/slash/Korean path segments', () => {
    expect(RegexUrlBody.test('foo/bar-baz')).toBe(true);
    expect(RegexUrlBody.test('경로/이름')).toBe(true);
  });
  it('rejects a single character (below the 2-char floor)', () => {
    expect(RegexUrlBody.test('a')).toBe(false);
  });
});

describe('RegexDomain', () => {
  it('matches http(s) URLs with a host and no trailing slash/query-fragment edge', () => {
    expect(RegexDomain.test('https://example.com/path')).toBe(true);
  });
  it('rejects non-http(s) schemes', () => {
    expect(RegexDomain.test('ftp://example.com/path')).toBe(false);
  });
});

describe('RegexLowerEnglish / RegexLowerEnglishNumber / RegexEnglishNumber / RegexNumber', () => {
  it('RegexLowerEnglish matches lowercase-only', () => {
    expect(RegexLowerEnglish.test('abc')).toBe(true);
    expect(RegexLowerEnglish.test('aBc')).toBe(false);
  });
  it('RegexLowerEnglishNumber matches lowercase+digit', () => {
    expect(RegexLowerEnglishNumber.test('abc123')).toBe(true);
    expect(RegexLowerEnglishNumber.test('ABC123')).toBe(false);
  });
  it('RegexEnglishNumber matches mixed-case letters+digits', () => {
    expect(RegexEnglishNumber.test('AbC123')).toBe(true);
    expect(RegexEnglishNumber.test('AbC-123')).toBe(false);
  });
  it('RegexNumber matches digits only', () => {
    expect(RegexNumber.test('12345')).toBe(true);
    expect(RegexNumber.test('12a45')).toBe(false);
  });
});
