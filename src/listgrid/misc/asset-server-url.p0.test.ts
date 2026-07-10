import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * P0-9 regression tests for ASSET_SERVER_URL fallback behavior.
 * Tests that when ASSET_SERVER_URL is unset (env not configured),
 * it resolves to empty string and emits a one-time console.warn.
 *
 * `_warnedNoAssetServerUrl` is a module-scope one-shot latch (like
 * htmlSanitizer's warn-once registry), so each test resets the module
 * registry and re-imports it fresh — otherwise the warn-once latch tripped
 * by an earlier test would leak into later ones.
 */
describe('ASSET_SERVER_URL fallback behavior (P0-9)', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console.warn to verify one-time warning is emitted
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  async function freshModule() {
    return import('./index');
  }

  it('resolves to empty string when ASSET_SERVER_URL is unset and no override is configured', async () => {
    const { getAccessableAssetUrl, configureAssetServerUrl, configureAssetPrefix } =
      await freshModule();
    // Reset asset server config to empty to simulate unconfigured state
    configureAssetServerUrl('');
    configureAssetPrefix('/static-resource/');

    // When asset server is not configured, getAccessableAssetUrl should use
    // the empty fallback (not the old 127.0.0.1:8320)
    const result = getAccessableAssetUrl('photo.jpg');
    // With empty server URL, result should be /static-resource/photo.jpg (server empty + prefix + path)
    expect(result).toBe('/static-resource/photo.jpg');
  });

  it('emits one-time console.warn when asset server URL is unset', async () => {
    const { getAccessableAssetUrl, configureAssetServerUrl, configureAssetPrefix } =
      await freshModule();
    // Reset asset server config to empty to simulate unconfigured state
    configureAssetServerUrl('');
    configureAssetPrefix('/static-resource/');

    // First call should trigger the warning
    getAccessableAssetUrl('test.jpg');
    expect(warnSpy).toHaveBeenCalledWith(
      '[listgrid] ASSET_SERVER_URL is not configured. Host must configure it via environment variable NEXT_PUBLIC_ASSET_SERVER or configureAssetServerUrl().',
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Subsequent calls should not re-warn
    warnSpy.mockClear();
    getAccessableAssetUrl('another.jpg');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn when asset server URL is configured', async () => {
    const { getAccessableAssetUrl, configureAssetServerUrl, configureAssetPrefix } =
      await freshModule();
    // Reset asset server config to empty to simulate unconfigured state
    configureAssetServerUrl('');
    configureAssetPrefix('/static-resource/');

    configureAssetServerUrl('https://assets.example.com');
    getAccessableAssetUrl('photo.jpg');
    // No warning should be emitted because URL is configured
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
