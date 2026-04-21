import { describe, it, expect } from 'vitest';
import { hexHash } from './hash';

describe('hexHash', () => {
  it('returns FNV-1a offset basis for empty string', () => {
    // 0x811c9dc5 >>> 0 → 811c9dc5
    expect(hexHash('')).toBe('811c9dc5');
  });

  it('produces stable, deterministic output', () => {
    expect(hexHash('hello')).toBe(hexHash('hello'));
  });

  it('returns a lower-case hex string', () => {
    const out = hexHash('something');
    expect(out).toMatch(/^[0-9a-f]+$/);
  });

  it('produces different hashes for different inputs', () => {
    expect(hexHash('foo')).not.toBe(hexHash('bar'));
  });

  it('matches known FNV-1a 32-bit hashes', () => {
    // FNV-1a 32-bit of "a" = 0xe40c292c
    expect(hexHash('a')).toBe('e40c292c');
    // FNV-1a 32-bit of "foobar" = 0xbf9cf968
    expect(hexHash('foobar')).toBe('bf9cf968');
  });
});
