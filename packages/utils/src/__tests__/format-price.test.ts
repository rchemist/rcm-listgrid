import { describe, it, expect } from 'vitest';
import { formatPrice } from '../format-price';

describe('formatPrice', () => {
  it('formats with default en-US thousands separators', () => {
    expect(formatPrice(1234567)).toBe('1,234,567');
  });

  it('appends "원" suffix when localeCode = "원"', () => {
    expect(formatPrice(1000, '원')).toBe('1,000 원');
  });

  it('returns empty string for null / undefined without throwing (issue #8 regression)', () => {
    expect(formatPrice(null)).toBe('');
    expect(formatPrice(undefined)).toBe('');
    expect(formatPrice(null, '원')).toBe('');
  });

  it('still formats 0 (falsy but valid number)', () => {
    expect(formatPrice(0)).toBe('0');
  });

  it('prefixes an arbitrary non-"원" localeCode literally', () => {
    expect(formatPrice(1000, '$')).toBe('$1,000');
  });
});
