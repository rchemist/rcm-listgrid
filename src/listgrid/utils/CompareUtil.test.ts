import { describe, it, expect } from 'vitest';
import {
  isNulls,
  isEquals,
  isEqualsIgnoreCase,
  isEqualCollection,
  isEmpty,
  isPositive,
  isNegative,
} from './CompareUtil';

describe('CompareUtil', () => {
  describe('isNulls', () => {
    it('returns true for both undefined', () => {
      expect(isNulls(undefined, undefined)).toBe(true);
    });

    it('returns true for undefined vs null/empty-string', () => {
      expect(isNulls(undefined, null)).toBe(true);
      expect(isNulls(undefined, '')).toBe(true);
      expect(isNulls(null, undefined)).toBe(true);
      expect(isNulls('', undefined)).toBe(true);
    });

    it('returns false for non-nullish values', () => {
      expect(isNulls('a', 'b')).toBe(false);
      expect(isNulls(0, 0)).toBe(false);
    });
  });

  describe('isEquals', () => {
    it('returns true for strictly equal primitives', () => {
      expect(isEquals(1, 1)).toBe(true);
      expect(isEquals('a', 'a')).toBe(true);
    });

    it('returns true for both nullish', () => {
      expect(isEquals(null, undefined)).toBe(true);
    });

    it('performs deep equality on plain objects', () => {
      expect(isEquals({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
      expect(isEquals({ a: 1 }, { a: 2 })).toBe(false);
      expect(isEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('returns false for different primitives', () => {
      expect(isEquals(1, 2)).toBe(false);
      expect(isEquals('a', 'b')).toBe(false);
    });
  });

  describe('isEqualsIgnoreCase', () => {
    it('matches regardless of case', () => {
      expect(isEqualsIgnoreCase('Hello', 'HELLO')).toBe(true);
    });

    it('treats both-nullish as equal', () => {
      expect(isEqualsIgnoreCase(null, undefined)).toBe(true);
    });

    it('returns false for different text', () => {
      expect(isEqualsIgnoreCase('abc', 'xyz')).toBe(false);
    });
  });

  describe('isEqualCollection', () => {
    it('returns true for equal ordered arrays', () => {
      expect(isEqualCollection([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns false when lengths differ', () => {
      expect(isEqualCollection([1], [1, 2])).toBe(false);
    });

    it('returns false for different ordered arrays', () => {
      expect(isEqualCollection([1, 2, 3], [3, 2, 1])).toBe(false);
    });

    it('returns true for same-content unordered arrays when ignoreOrder=true', () => {
      expect(isEqualCollection([1, 2, 3], [3, 2, 1], true)).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('returns true for null/undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('returns true for empty array/map, false when non-empty', () => {
      expect(isEmpty([])).toBe(true);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty(new Map())).toBe(true);
      const m = new Map<string, number>();
      m.set('a', 1);
      expect(isEmpty(m)).toBe(false);
    });
  });

  describe('isPositive / isNegative', () => {
    it('identifies positive values', () => {
      expect(isPositive(1)).toBe(true);
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-1)).toBe(false);
      expect(isPositive(undefined)).toBe(false);
    });

    it('identifies negative values', () => {
      expect(isNegative(-1)).toBe(true);
      expect(isNegative(0)).toBe(false);
      expect(isNegative(1)).toBe(false);
      expect(isNegative(undefined)).toBe(false);
    });
  });
});
