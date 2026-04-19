import { describe, it, expect } from 'vitest';
import { isTrue } from './BooleanUtil';

describe('BooleanUtil', () => {
  describe('isTrue', () => {
    it('returns true for boolean true', () => {
      expect(isTrue(true)).toBe(true);
    });

    it('returns false for boolean false', () => {
      expect(isTrue(false)).toBe(false);
    });

    it('recognizes "true" string variants as true', () => {
      expect(isTrue('true')).toBe(true);
      expect(isTrue('1')).toBe(true);
      expect(isTrue('on')).toBe(true);
      expect(isTrue('yes')).toBe(true);
      expect(isTrue('예')).toBe(true);
    });

    it('returns false for unrecognized strings', () => {
      expect(isTrue('false')).toBe(false);
      expect(isTrue('no')).toBe(false);
      expect(isTrue('0')).toBe(false);
      expect(isTrue('foo')).toBe(false);
    });

    it('returns default (false) for undefined / null / empty string', () => {
      expect(isTrue(undefined)).toBe(false);
      expect(isTrue(null)).toBe(false);
      expect(isTrue('')).toBe(false);
    });

    it('returns provided defaultValue when value is blank', () => {
      expect(isTrue(undefined, true)).toBe(true);
      expect(isTrue(null, true)).toBe(true);
      expect(isTrue('', true)).toBe(true);
      expect(isTrue(undefined, false)).toBe(false);
    });

    it('does not consult defaultValue when value is a defined non-blank', () => {
      expect(isTrue('false', true)).toBe(false);
      expect(isTrue(false, true)).toBe(false);
    });
  });
});
