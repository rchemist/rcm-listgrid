import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import {
  configureAssetServerUrl,
  configureAssetPrefix,
  setAssetServerBase,
  getAccessableAssetUrl,
  isExternalUrl,
  removeAssetServerPrefix,
  validatedAssetFileName,
} from '../asset-url';

describe('asset URL helpers', () => {
  afterEach(() => {
    // Reset overrides so other tests observe default behavior.
    setAssetServerBase(undefined);
    configureAssetServerUrl('http://127.0.0.1:8320');
    configureAssetPrefix('/static-resource/');
  });

  it('returns empty string for null/undefined input', () => {
    expect(getAccessableAssetUrl(null)).toBe('');
    expect(getAccessableAssetUrl(undefined)).toBe('');
  });

  it('passes external absolute URLs through untouched', () => {
    expect(getAccessableAssetUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    );
    expect(getAccessableAssetUrl('http://example.com/foo/bar.pdf')).toBe(
      'http://example.com/foo/bar.pdf',
    );
  });

  it('passes external dynamic-endpoint URLs (no extension, with query string) through untouched', () => {
    const url = 'https://cyber.gjcu.ac.kr/ajaxa/FileCpnt/FileView.do?gbn=X08&F_USER_ID=2020020135';
    expect(getAccessableAssetUrl(url)).toBe(url);
  });

  it('still applies asset prefix when the absolute URL targets our own asset server', () => {
    configureAssetServerUrl('https://assets.example.com');
    configureAssetPrefix('/files/');
    expect(getAccessableAssetUrl('https://assets.example.com/files/photo.jpg')).toBe(
      'https://assets.example.com/files/photo.jpg',
    );
  });

  it('prepends server URL + prefix to relative paths', () => {
    configureAssetServerUrl('https://assets.example.com');
    configureAssetPrefix('/files/');
    expect(getAccessableAssetUrl('photo.jpg')).toBe('https://assets.example.com/files/photo.jpg');
  });

  it('removeAssetServerPrefix strips the configured server + prefix', () => {
    configureAssetServerUrl('https://assets.example.com');
    configureAssetPrefix('/files/');
    expect(removeAssetServerPrefix('https://assets.example.com/files/photo.jpg')).toBe(
      'photo.jpg',
    );
  });

  it('removeAssetServerPrefix URL-encodes non-separator segments', () => {
    expect(removeAssetServerPrefix('a b/c.png')).toBe('a%20b/c.png');
  });

  it('removeAssetServerPrefix returns empty string for falsy input', () => {
    expect(removeAssetServerPrefix(null)).toBe('');
  });

  it('validatedAssetFileName replaces each space and each hangul char with a single underscore', () => {
    // "내 파일 name.png" = 3 hangul chars + 2 spaces = 5 replacements.
    expect(validatedAssetFileName('내 파일 name.png')).toBe('_____name.png');
  });

  it('isExternalUrl detects http(s) absolute URLs (and only those)', () => {
    expect(isExternalUrl('https://example.com/a.png')).toBe(true);
    expect(isExternalUrl('http://example.com')).toBe(true);
    expect(isExternalUrl('/files/photo.jpg')).toBe(false);
    expect(isExternalUrl(null)).toBe(false);
  });
});

describe('setAssetServerBase — GX-3 adapter-injection seam precedence', () => {
  afterEach(() => {
    setAssetServerBase(undefined);
    configureAssetServerUrl('http://127.0.0.1:8320');
    configureAssetPrefix('/static-resource/');
  });

  it('an injected base takes precedence over configureAssetServerUrl', () => {
    configureAssetServerUrl('https://global.example.com');
    configureAssetPrefix('/files/');
    setAssetServerBase('https://injected.example.com');
    expect(getAccessableAssetUrl('photo.jpg')).toBe('https://injected.example.com/files/photo.jpg');
  });

  it('clearing the injected base (undefined) falls back to configureAssetServerUrl', () => {
    configureAssetServerUrl('https://global.example.com');
    configureAssetPrefix('/files/');
    setAssetServerBase('https://injected.example.com');
    setAssetServerBase(undefined);
    expect(getAccessableAssetUrl('photo.jpg')).toBe('https://global.example.com/files/photo.jpg');
  });

  it('strips trailing slashes from an injected base (matches configureAssetServerUrl behavior)', () => {
    configureAssetPrefix('/files/');
    setAssetServerBase('https://injected.example.com///');
    expect(getAccessableAssetUrl('photo.jpg')).toBe('https://injected.example.com/files/photo.jpg');
  });
});

/**
 * P0-9 regression tests for ASSET_SERVER_URL fallback behavior (ported from
 * src/listgrid/misc/asset-server-url.p0.test.ts). Tests that when nothing is
 * configured, it resolves to empty string and emits a one-time console.warn.
 * `_warnedNoAssetServerUrl` is a module-scope one-shot latch, so each test
 * resets the module registry and re-imports it fresh — otherwise the
 * warn-once latch tripped by an earlier test would leak into later ones.
 */
describe('ASSET_SERVER_URL fallback behavior (P0-9 parity)', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  async function freshModule() {
    return import('../asset-url');
  }

  it('resolves to empty string when nothing is configured', async () => {
    const { getAccessableAssetUrl, configureAssetServerUrl, configureAssetPrefix } =
      await freshModule();
    configureAssetServerUrl('');
    configureAssetPrefix('/static-resource/');

    const result = getAccessableAssetUrl('photo.jpg');
    expect(result).toBe('/static-resource/photo.jpg');
  });

  it('emits one-time console.warn when asset server URL is unset', async () => {
    const { getAccessableAssetUrl, configureAssetServerUrl, configureAssetPrefix } =
      await freshModule();
    configureAssetServerUrl('');
    configureAssetPrefix('/static-resource/');

    getAccessableAssetUrl('test.jpg');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('[listgrid] ASSET_SERVER_URL is not configured');

    warnSpy.mockClear();
    getAccessableAssetUrl('another.jpg');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn when the global override is configured', async () => {
    const { getAccessableAssetUrl, configureAssetServerUrl, configureAssetPrefix } =
      await freshModule();
    configureAssetServerUrl('');
    configureAssetPrefix('/static-resource/');

    configureAssetServerUrl('https://assets.example.com');
    getAccessableAssetUrl('photo.jpg');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn when only the injected base is configured', async () => {
    const { getAccessableAssetUrl, setAssetServerBase, configureAssetPrefix } =
      await freshModule();
    configureAssetPrefix('/static-resource/');

    setAssetServerBase('https://injected.example.com');
    getAccessableAssetUrl('photo.jpg');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
