import { describe, it, expect } from 'vitest';
import { removePhoneNumberHyphens, formatPhoneNumber } from './PhoneUtil';

describe('PhoneUtil', () => {
  describe('removePhoneNumberHyphens', () => {
    it('strips all hyphens', () => {
      expect(removePhoneNumberHyphens('010-1234-5678')).toBe('01012345678');
    });

    it('returns already-clean number unchanged', () => {
      expect(removePhoneNumberHyphens('01012345678')).toBe('01012345678');
    });

    it('returns empty string for null / undefined / empty', () => {
      expect(removePhoneNumberHyphens(null)).toBe('');
      expect(removePhoneNumberHyphens(undefined)).toBe('');
      expect(removePhoneNumberHyphens('')).toBe('');
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats 11-digit mobile number', () => {
      expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
    });

    it('formats 10-digit number', () => {
      expect(formatPhoneNumber('0212345678')).toBe('021-234-5678');
    });

    it('re-formats already-hyphenated 11-digit input', () => {
      expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678');
    });

    it('returns digits when length is neither 10 nor 11', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });

    it('returns empty for null / undefined / empty', () => {
      expect(formatPhoneNumber(null)).toBe('');
      expect(formatPhoneNumber(undefined)).toBe('');
      expect(formatPhoneNumber('')).toBe('');
    });
  });
});
