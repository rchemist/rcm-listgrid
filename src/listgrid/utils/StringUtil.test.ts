import { describe, it, expect } from 'vitest';
import {
  isBlank,
  appendString,
  subStringBeforeLast,
  subStringBefore,
  subStringAfterLast,
  subStringAfter,
  subStringBetween,
  subStringBetweenLast,
  defaultString,
  appendPrefix,
  appendSuffix,
  removePrefix,
  removeSuffix,
  appendPrefixSuffix,
  getHashCode,
  removeTrailingSeparator,
  startsWith,
  endsWith,
  convertToCamelCase,
  equalsIgnoreCase,
  addKoreanWordPostfix,
  generateSlug,
  camelCaseToSnakeCase,
  splitWithSplitCode,
  equalsIgnoreBlank,
} from './StringUtil';

describe('StringUtil', () => {
  describe('isBlank', () => {
    it('returns true for null / undefined / empty string', () => {
      expect(isBlank(null)).toBe(true);
      expect(isBlank(undefined)).toBe(true);
      expect(isBlank('')).toBe(true);
    });

    it('returns false for non-empty values', () => {
      expect(isBlank('x')).toBe(false);
      expect(isBlank(0)).toBe(false);
      expect(isBlank(false)).toBe(false);
    });
  });

  describe('appendString', () => {
    it('appends using default space splitter', () => {
      expect(appendString('foo', 'bar')).toBe('foo bar');
    });

    it('appends using custom splitter', () => {
      expect(appendString('foo', 'bar', '-')).toBe('foo-bar');
    });

    it('returns original when added is blank', () => {
      expect(appendString('foo', '')).toBe('foo');
      expect(appendString('foo', null)).toBe('foo');
      expect(appendString('foo', undefined)).toBe('foo');
    });

    it('treats null/undefined str as empty base', () => {
      expect(appendString(null, 'bar', '-')).toBe('-bar');
      expect(appendString(undefined, 'bar', '-')).toBe('-bar');
    });

    it('supports array inputs', () => {
      expect(appendString('foo', ['a', 'b'], '-')).toBe('foo-a-b');
    });
  });

  describe('subStringBefore / subStringBeforeLast', () => {
    it('returns original if separator absent', () => {
      expect(subStringBefore('foobar', '.')).toBe('foobar');
      expect(subStringBeforeLast('foobar', '.')).toBe('foobar');
    });

    it('returns part before first occurrence', () => {
      expect(subStringBefore('a.b.c', '.')).toBe('a');
    });

    it('returns part before last occurrence', () => {
      expect(subStringBeforeLast('a.b.c', '.')).toBe('a.b');
    });
  });

  describe('subStringAfter / subStringAfterLast', () => {
    it('returns original if separator absent', () => {
      expect(subStringAfter('foobar', '.')).toBe('foobar');
      expect(subStringAfterLast('foobar', '.')).toBe('foobar');
    });

    it('returns part after first occurrence', () => {
      expect(subStringAfter('a.b.c', '.')).toBe('b.c');
    });

    it('returns part after last occurrence', () => {
      expect(subStringAfterLast('a.b.c', '.')).toBe('c');
    });
  });

  describe('subStringBetween / subStringBetweenLast', () => {
    it('extracts text between markers', () => {
      expect(subStringBetween('foo[bar]baz', '[', ']')).toBe('bar');
    });

    it('extracts text between last markers', () => {
      expect(subStringBetweenLast('a[b]c[d]e', '[', ']')).toBe('d');
    });
  });

  describe('defaultString', () => {
    it('returns the string as-is when present', () => {
      expect(defaultString('hello')).toBe('hello');
    });

    it('returns default when blank', () => {
      expect(defaultString(null)).toBe('');
      expect(defaultString(undefined, 'fallback')).toBe('fallback');
      expect(defaultString('')).toBe('');
    });

    it('coerces non-string values via String()', () => {
      expect(defaultString(42)).toBe('42');
      expect(defaultString(true)).toBe('true');
    });
  });

  describe('appendPrefix / appendSuffix', () => {
    it('adds prefix when missing', () => {
      expect(appendPrefix('bar', 'foo-')).toBe('foo-bar');
    });

    it('does not double-add prefix', () => {
      expect(appendPrefix('foo-bar', 'foo-')).toBe('foo-bar');
    });

    it('adds suffix when missing', () => {
      expect(appendSuffix('foo', '-bar')).toBe('foo-bar');
    });

    it('does not double-add suffix', () => {
      expect(appendSuffix('foo-bar', '-bar')).toBe('foo-bar');
    });

    it('supports split separator', () => {
      expect(appendPrefix('bar', 'foo', '-')).toBe('foo-bar');
      expect(appendSuffix('foo', 'bar', '-')).toBe('foo-bar');
    });
  });

  describe('removePrefix / removeSuffix', () => {
    it('strips prefix when present', () => {
      expect(removePrefix('foo-bar', 'foo-')).toBe('bar');
    });

    it('returns original when prefix absent', () => {
      expect(removePrefix('hello', 'bye-')).toBe('hello');
    });

    it('strips suffix when present', () => {
      expect(removeSuffix('foo-bar', '-bar')).toBe('foo');
    });

    it('returns original when suffix absent', () => {
      expect(removeSuffix('hello', '-bye')).toBe('hello');
    });
  });

  describe('appendPrefixSuffix', () => {
    it('adds both prefix and suffix when absent', () => {
      expect(appendPrefixSuffix('core', 'foo', 'bar', '-')).toBe('foo-core-bar');
    });
  });

  describe('getHashCode', () => {
    it('returns 0 for null/undefined/empty', () => {
      expect(getHashCode(null)).toBe(0);
      expect(getHashCode(undefined)).toBe(0);
      expect(getHashCode('')).toBe(0);
    });

    it('returns deterministic integer for same string', () => {
      expect(getHashCode('abc')).toBe(getHashCode('abc'));
      expect(typeof getHashCode('hello')).toBe('number');
    });

    it('returns different hashes for different strings', () => {
      expect(getHashCode('abc')).not.toBe(getHashCode('abd'));
    });

    it('hashes objects via stringification', () => {
      expect(getHashCode({ a: 1 })).toBe(getHashCode({ a: 1 }));
    });
  });

  describe('removeTrailingSeparator', () => {
    it('removes trailing segment when last element non-blank', () => {
      expect(removeTrailingSeparator('a/b/c', '/')).toBe('a/b');
    });

    it('returns input unchanged when ends with separator (last empty)', () => {
      expect(removeTrailingSeparator('a/b/', '/')).toBe('a/b/');
    });
  });

  describe('startsWith / endsWith', () => {
    it('case-sensitive default', () => {
      expect(startsWith('Hello', 'he')).toBe(false);
      expect(startsWith('Hello', 'He')).toBe(true);
      expect(endsWith('Hello', 'LO')).toBe(false);
      expect(endsWith('Hello', 'lo')).toBe(true);
    });

    it('ignoreCase true', () => {
      expect(startsWith('Hello', 'he', true)).toBe(true);
      expect(endsWith('Hello', 'LO', true)).toBe(true);
    });

    it('returns false for undefined inputs', () => {
      expect(startsWith(undefined as any, 'a')).toBe(false);
      expect(endsWith(undefined, 'a')).toBe(false);
      expect(endsWith('a', undefined)).toBe(false);
    });
  });

  describe('convertToCamelCase', () => {
    it('lowercases first character', () => {
      expect(convertToCamelCase('Hello')).toBe('hello');
    });

    it('returns empty on blank input', () => {
      expect(convertToCamelCase('')).toBe('');
      expect(convertToCamelCase(undefined)).toBe('');
      expect(convertToCamelCase('   ')).toBe('');
    });

    it('trims leading/trailing spaces', () => {
      expect(convertToCamelCase('  Abc  ')).toBe('abc');
    });
  });

  describe('equalsIgnoreCase', () => {
    it('matches regardless of case', () => {
      expect(equalsIgnoreCase('Hello', 'hello')).toBe(true);
    });

    it('can trim', () => {
      expect(equalsIgnoreCase(' hello ', 'hello', true)).toBe(true);
      expect(equalsIgnoreCase(' hello ', 'hello', false)).toBe(false);
    });
  });

  describe('addKoreanWordPostfix', () => {
    it('returns empty on blank input', () => {
      expect(addKoreanWordPostfix('1')).toBe('');
      expect(addKoreanWordPostfix('1', '')).toBe('');
    });

    it('appends 은 for jongseong-present Korean word (type 1)', () => {
      // 책 has jongseong
      expect(addKoreanWordPostfix('1', '책')).toBe('책은');
    });

    it('appends 는 for jongseong-absent Korean word (type 1)', () => {
      // 나 has no jongseong
      expect(addKoreanWordPostfix('1', '나')).toBe('나는');
    });

    it('appends 이 for jongseong-present Korean word (type 2)', () => {
      expect(addKoreanWordPostfix('2', '책')).toBe('책이');
    });

    it('appends 가 for jongseong-absent Korean word (type 2)', () => {
      expect(addKoreanWordPostfix('2', '나')).toBe('나가');
    });

    it('handles English words by vowel heuristic', () => {
      expect(addKoreanWordPostfix('1', 'apple')).toBe('apple는');
      expect(addKoreanWordPostfix('1', 'dog')).toBe('dog은');
    });
  });

  describe('generateSlug', () => {
    it('produces a slash-prefixed slug', () => {
      expect(generateSlug('Hello World')).toBe('/hello-world');
    });

    it('strips disallowed characters', () => {
      expect(generateSlug('Hello! World?')).toBe('/hello-world');
    });

    it('returns empty for blank input', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug(undefined)).toBe('');
    });
  });

  describe('camelCaseToSnakeCase', () => {
    it('converts camelCase to snake_case (lower)', () => {
      expect(camelCaseToSnakeCase('camelCase', false)).toBe('camel_case');
    });

    it('converts camelCase to upper snake', () => {
      expect(camelCaseToSnakeCase('camelCase', true)).toBe('CAMEL_CASE');
    });

    it('replaces dashes with underscores', () => {
      expect(camelCaseToSnakeCase('foo-bar', false)).toBe('foo_bar');
    });
  });

  describe('splitWithSplitCode', () => {
    it('splits and trims parts', () => {
      expect(splitWithSplitCode('a, b , c', ',')).toEqual(['a', 'b', 'c']);
    });

    it('returns [] for blank value', () => {
      expect(splitWithSplitCode('', ',')).toEqual([]);
    });

    it('returns [value] when splitter is blank', () => {
      expect(splitWithSplitCode('abc', '')).toEqual(['abc']);
    });
  });

  describe('equalsIgnoreBlank', () => {
    it('treats both-blank as equal', () => {
      expect(equalsIgnoreBlank(null, '')).toBe(true);
      expect(equalsIgnoreBlank(undefined, null)).toBe(true);
    });

    it('one blank + one non-blank = not equal', () => {
      expect(equalsIgnoreBlank('', 'x')).toBe(false);
    });

    it('compares case-insensitively after trim', () => {
      expect(equalsIgnoreBlank(' Foo ', 'foo')).toBe(true);
      expect(equalsIgnoreBlank('foo', 'bar')).toBe(false);
    });
  });
});
