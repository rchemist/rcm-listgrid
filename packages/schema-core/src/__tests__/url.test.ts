// EA-C0 pre-stage — isExternalUrl (transplant of 0.3.x
// src/listgrid/misc/index.ts:486-490, verified byte-for-byte before this
// test was written). Semantics: only an absolute http(s):// URL (after
// trim) counts as external; everything else — relative paths,
// protocol-relative URLs, other schemes, empty/nullish — is not.

import { describe, expect, it } from 'vitest';
import { isExternalUrl } from '../util/url';

describe('isExternalUrl (0.3.x misc/index.ts:486-490 parity)', () => {
  it('accepts an absolute http:// URL', () => {
    expect(isExternalUrl('http://example.com/a.png')).toBe(true);
  });

  it('accepts an absolute https:// URL', () => {
    expect(isExternalUrl('https://example.com/a.png')).toBe(true);
  });

  it('accepts after trimming surrounding whitespace', () => {
    expect(isExternalUrl('  https://example.com/a.png  ')).toBe(true);
  });

  it('rejects a relative path', () => {
    expect(isExternalUrl('/assets/a.png')).toBe(false);
  });

  it('rejects a protocol-relative URL', () => {
    expect(isExternalUrl('//example.com/a.png')).toBe(false);
  });

  it('rejects a non-http(s) scheme', () => {
    expect(isExternalUrl('ftp://example.com/a.png')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isExternalUrl('')).toBe(false);
  });

  it('rejects undefined and null', () => {
    expect(isExternalUrl(undefined)).toBe(false);
    expect(isExternalUrl(null)).toBe(false);
  });
});
