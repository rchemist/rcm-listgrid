import { describe, it, expect } from 'vitest';
import { normalizeUrl, removeTrailingSeparator, isExternalUrl } from '../url';

describe('normalizeUrl', () => {
  it('leaves absolute http(s) URLs unchanged', () => {
    expect(normalizeUrl('http://example.com/x')).toBe('http://example.com/x');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('prefixes / for relative paths', () => {
    expect(normalizeUrl('foo/bar')).toBe('/foo/bar');
  });

  it('leaves existing / prefixes intact', () => {
    expect(normalizeUrl('/foo/bar')).toBe('/foo/bar');
  });

  it('trims whitespace', () => {
    expect(normalizeUrl('  foo  ')).toBe('/foo');
  });

  it('passes through blank input', () => {
    expect(normalizeUrl('')).toBe('');
  });
});

describe('removeTrailingSeparator', () => {
  it('drops the last path segment when present', () => {
    expect(removeTrailingSeparator('a/b/c', '/')).toBe('a/b');
  });

  it('preserves trailing-separator inputs (last segment is blank)', () => {
    expect(removeTrailingSeparator('a/b/', '/')).toBe('a/b/');
  });
});

describe('isExternalUrl', () => {
  it('detects http(s) absolute URLs (and only those)', () => {
    expect(isExternalUrl('https://example.com/a.png')).toBe(true);
    expect(isExternalUrl('http://example.com')).toBe(true);
    expect(isExternalUrl('  https://example.com  ')).toBe(true);
    expect(isExternalUrl('/files/photo.jpg')).toBe(false);
    expect(isExternalUrl('photo.jpg')).toBe(false);
    expect(isExternalUrl('ftp://example.com')).toBe(false);
    expect(isExternalUrl(null)).toBe(false);
    expect(isExternalUrl(undefined)).toBe(false);
    expect(isExternalUrl('')).toBe(false);
  });
});
