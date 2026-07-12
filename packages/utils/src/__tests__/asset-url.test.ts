import { describe, expect, it } from 'vitest';
import {
  ASSET_PREFIX,
  ASSET_SERVER_URL,
  isExternalUrl,
  removeAssetServerPrefix,
  resolveAssetUrl,
  validatedAssetFileName,
} from '../asset-url';

// Pure resolver (documents/plans/asset-url-resolution-design.md §1) — the base
// is always an explicit argument; there is no module-global state.
describe('resolveAssetUrl (pure — explicit base)', () => {
  const base = 'https://cdn.example.com';

  it('null/undefined/empty → ""', () => {
    expect(resolveAssetUrl('')).toBe('');
    expect(resolveAssetUrl(null)).toBe('');
    expect(resolveAssetUrl(undefined)).toBe('');
  });

  it('relative path + base → base + prefix + path', () => {
    expect(resolveAssetUrl('photo.png', base)).toBe(
      'https://cdn.example.com/static-resource/photo.png',
    );
    expect(resolveAssetUrl('/uploads/x.png', base)).toBe(
      'https://cdn.example.com/static-resource/uploads/x.png',
    );
  });

  it('relative path + EMPTY base → root-relative /static-resource/<path> (design D15)', () => {
    expect(resolveAssetUrl('photo.png', '')).toBe('/static-resource/photo.png');
    expect(resolveAssetUrl('photo.png')).toBe('/static-resource/photo.png');
  });

  it('foreign absolute http(s) URL → passthrough untouched (no double-encode)', () => {
    expect(resolveAssetUrl('https://other.cdn/a/b c.png?v=2', base)).toBe(
      'https://other.cdn/a/b c.png?v=2',
    );
    expect(resolveAssetUrl('http://x.com/y.png')).toBe('http://x.com/y.png');
  });

  it('own-server absolute URL → normalized, idempotent for ASCII segments', () => {
    const own = 'https://cdn.example.com/static-resource/uploads/x.png';
    const out = resolveAssetUrl(own, base);
    expect(out).toBe('https://cdn.example.com/static-resource/uploads/x.png');
    expect(resolveAssetUrl(out, base)).toBe(out); // fixed point
  });

  it('data:/blob:/protocol-relative → passthrough', () => {
    expect(resolveAssetUrl('data:image/png;base64,AAAA', base)).toBe('data:image/png;base64,AAAA');
    expect(resolveAssetUrl('blob:https://app/uuid', base)).toBe('blob:https://app/uuid');
    expect(resolveAssetUrl('//cdn/x.png', base)).toBe('//cdn/x.png');
  });

  it('trailing slash on base is normalized once', () => {
    expect(resolveAssetUrl('photo.png', 'https://cdn.example.com/')).toBe(
      'https://cdn.example.com/static-resource/photo.png',
    );
  });

  it('encodes path segments (space/Korean), keeps "/" separators', () => {
    expect(resolveAssetUrl('a b/한글.png', base)).toBe(
      `https://cdn.example.com/static-resource/a%20b/${encodeURIComponent('한글.png')}`,
    );
  });

  it('is deterministic (same inputs → same output, hydration-safe)', () => {
    expect(resolveAssetUrl('/a.png', base)).toBe(resolveAssetUrl('/a.png', base));
  });
});

describe('removeAssetServerPrefix (pure)', () => {
  it('strips explicit base + prefix, encodes segments', () => {
    expect(removeAssetServerPrefix('https://cdn/static-resource/x.png', 'https://cdn')).toBe(
      'x.png',
    );
  });
  it('no base → encodes segments only', () => {
    expect(removeAssetServerPrefix('a/b.png')).toBe('a/b.png');
  });
  it('null/empty → ""', () => {
    expect(removeAssetServerPrefix(null)).toBe('');
    expect(removeAssetServerPrefix('')).toBe('');
  });
});

describe('kept constants + helpers (unchanged)', () => {
  it('ASSET_PREFIX', () => expect(ASSET_PREFIX).toBe('/static-resource/'));
  it('ASSET_SERVER_URL is a string', () => expect(typeof ASSET_SERVER_URL).toBe('string'));
  it('isExternalUrl', () => {
    expect(isExternalUrl('https://x')).toBe(true);
    expect(isExternalUrl('/rel')).toBe(false);
    expect(isExternalUrl(null)).toBe(false);
  });
  it('validatedAssetFileName replaces spaces/Korean with _', () => {
    expect(validatedAssetFileName('a b.png')).toBe('a_b.png');
    expect(validatedAssetFileName('한글.png')).toBe('__.png');
  });
});
