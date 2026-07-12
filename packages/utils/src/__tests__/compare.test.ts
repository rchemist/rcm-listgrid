import { describe, it, expect } from 'vitest';
import {
  isNulls,
  isEquals,
  isEqualsIgnoreCase,
  isEqualCollection,
  isEmpty,
  isPositive,
  isNegative,
} from '../compare';

describe('isNulls — old asymmetric truth table (verbatim port, do not "fix")', () => {
  it('undefined+undefined is nullish-equal', () => {
    expect(isNulls(undefined, undefined)).toBe(true);
  });
  it('undefined treats a null OR empty-string partner as nullish-equal', () => {
    expect(isNulls(undefined, null)).toBe(true);
    expect(isNulls(undefined, '')).toBe(true);
  });
  it('null/empty-string treat an undefined partner as nullish-equal (symmetric only via undefined)', () => {
    expect(isNulls(null, undefined)).toBe(true);
    expect(isNulls('', undefined)).toBe(true);
  });
  it('ASYMMETRY: null paired with empty-string (no undefined on either side) is NOT nullish-equal', () => {
    expect(isNulls(null, '')).toBe(false);
    expect(isNulls('', null)).toBe(false);
  });
  it('rejects a value paired with a non-nullish other', () => {
    expect(isNulls('x', 'y')).toBe(false);
    expect(isNulls(null, 'x')).toBe(false);
  });
});

describe('isEquals', () => {
  it('compares primitives, nullish, and plain objects', () => {
    expect(isEquals(1, 1)).toBe(true);
    expect(isEquals('a', 'a')).toBe(true);
    expect(isEquals(null, undefined)).toBe(true);
    expect(isEquals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(isEquals({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('does not deep-compare arrays (matches 0.3.x CompareUtil.isEquals — use isEqualCollection)', () => {
    expect(isEquals([1, 2], [1, 2])).toBe(false);
  });
});

describe('isEqualsIgnoreCase', () => {
  it('returns true for same-letter strings in different case', () => {
    expect(isEqualsIgnoreCase('Hello', 'HELLO')).toBe(true);
    expect(isEqualsIgnoreCase('a', 'b')).toBe(false);
  });

  it('routes through isNulls first: (undefined, null) collapses to true', () => {
    expect(isEqualsIgnoreCase(undefined, null)).toBe(true);
  });

  it('returns false when only one side is null (and no undefined involved)', () => {
    expect(isEqualsIgnoreCase('x', null)).toBe(false);
  });
});

describe('isEqualCollection', () => {
  it('respects order by default', () => {
    expect(isEqualCollection([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isEqualCollection([1, 2, 3], [3, 2, 1])).toBe(false);
  });

  it('honours the ignoreOrder flag', () => {
    expect(isEqualCollection([1, 2, 3], [3, 1, 2], true)).toBe(true);
  });

  it('returns false for different lengths', () => {
    expect(isEqualCollection([1], [1, 2])).toBe(false);
  });
});

describe('isEmpty', () => {
  it('handles arrays, maps, null, undefined', () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Map([['a', 1]]))).toBe(false);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });
});

describe('isPositive / isNegative', () => {
  it('isPositive is only true for > 0', () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(0)).toBe(false);
    expect(isPositive(-1)).toBe(false);
    expect(isPositive(undefined)).toBe(false);
  });

  it('isNegative is only true for < 0', () => {
    expect(isNegative(-1)).toBe(true);
    expect(isNegative(0)).toBe(false);
    expect(isNegative(undefined)).toBe(false);
  });
});
