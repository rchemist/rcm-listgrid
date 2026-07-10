import { describe, expect, it } from 'vitest';
import { formatPhoneNumber, removePhoneNumberHyphens } from '../index';

// EA-B0 PART D item 5 — phone-util.ts, transplanted verbatim from
// src/listgrid/utils/PhoneUtil.ts (0.3.x). Pure, no store/React involvement.

describe('removePhoneNumberHyphens', () => {
  it('strips hyphens from a hyphenated number', () => {
    expect(removePhoneNumberHyphens('010-1234-5678')).toBe('01012345678');
  });
  it('is a no-op on an already-digits-only number', () => {
    expect(removePhoneNumberHyphens('01012345678')).toBe('01012345678');
  });
  it('returns "" for null/undefined/empty', () => {
    expect(removePhoneNumberHyphens(null)).toBe('');
    expect(removePhoneNumberHyphens(undefined)).toBe('');
    expect(removePhoneNumberHyphens('')).toBe('');
  });
});

describe('formatPhoneNumber', () => {
  it('formats an 11-digit mobile number as 000-0000-0000', () => {
    expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
  });
  it('formats a 10-digit number as a blind 3-3-4 split (0.3.x verbatim — no Seoul-area-code special-casing)', () => {
    expect(formatPhoneNumber('0212345678')).toBe('021-234-5678');
  });
  it('is idempotent — an already-formatted number round-trips unchanged', () => {
    expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678');
    expect(formatPhoneNumber('021-234-5678')).toBe('021-234-5678');
  });
  it('strip -> format round-trips to the same hyphenated form', () => {
    const stripped = removePhoneNumberHyphens('010-1234-5678');
    expect(formatPhoneNumber(stripped)).toBe('010-1234-5678');
  });
  it('returns the digits-only string unchanged for a partial / non-10/11-digit input (validation is separate)', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('010-1234')).toBe('0101234');
    expect(formatPhoneNumber('123456789012')).toBe('123456789012'); // 12 digits
  });
  it('returns "" for null/undefined/empty', () => {
    expect(formatPhoneNumber(null)).toBe('');
    expect(formatPhoneNumber(undefined)).toBe('');
    expect(formatPhoneNumber('')).toBe('');
  });
});
