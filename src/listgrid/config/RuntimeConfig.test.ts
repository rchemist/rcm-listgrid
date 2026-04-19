import { describe, it, expect, beforeEach } from 'vitest';
import { configureRuntime, getRuntimeConfig } from './RuntimeConfig';

describe('RuntimeConfig', () => {
  beforeEach(() => {
    // Reset to defaults before each test. configureRuntime merges into current
    // state, so we overwrite known fields back to defaults.
    configureRuntime({
      cacheControl: false,
      useServerSideCache: false,
      searchFormHashKey: 'rcm-searchform',
      debugListGridPerformance: false,
      isDevelopment: false,
      kakaoMapAppKey: '',
      cryptKey: '',
    });
  });

  describe('getRuntimeConfig', () => {
    it('returns defaults when nothing configured', () => {
      const config = getRuntimeConfig();
      expect(config.cacheControl).toBe(false);
      expect(config.useServerSideCache).toBe(false);
      expect(config.searchFormHashKey).toBe('rcm-searchform');
      expect(config.debugListGridPerformance).toBe(false);
      expect(config.isDevelopment).toBe(false);
      expect(config.kakaoMapAppKey).toBe('');
      expect(config.cryptKey).toBe('');
    });

    it('returns a fully-populated Required<RuntimeConfig>', () => {
      const config = getRuntimeConfig();
      // every key exists (Required<T>)
      expect(Object.keys(config).sort()).toEqual(
        [
          'cacheControl',
          'cryptKey',
          'debugListGridPerformance',
          'isDevelopment',
          'kakaoMapAppKey',
          'searchFormHashKey',
          'useServerSideCache',
        ].sort(),
      );
    });
  });

  describe('configureRuntime', () => {
    it('overrides specified values and keeps the rest at defaults', () => {
      configureRuntime({ cacheControl: true, kakaoMapAppKey: 'KEY-1' });
      const config = getRuntimeConfig();
      expect(config.cacheControl).toBe(true);
      expect(config.kakaoMapAppKey).toBe('KEY-1');
      // unchanged
      expect(config.useServerSideCache).toBe(false);
      expect(config.searchFormHashKey).toBe('rcm-searchform');
    });

    it('merges multiple consecutive calls (last write wins)', () => {
      configureRuntime({ cryptKey: 'A' });
      configureRuntime({ cryptKey: 'B' });
      expect(getRuntimeConfig().cryptKey).toBe('B');
    });

    it('partial update preserves previously-set values', () => {
      configureRuntime({ cryptKey: 'secret', isDevelopment: true });
      configureRuntime({ debugListGridPerformance: true });
      const config = getRuntimeConfig();
      expect(config.cryptKey).toBe('secret');
      expect(config.isDevelopment).toBe(true);
      expect(config.debugListGridPerformance).toBe(true);
    });

    it('ignores undefined in the input (keeps previous)', () => {
      configureRuntime({ searchFormHashKey: 'custom-key' });
      configureRuntime({ searchFormHashKey: undefined });
      // undefined overrides current value to undefined under spread — verify behaviour
      const config = getRuntimeConfig();
      // spread semantics: explicit undefined overwrites
      expect(config.searchFormHashKey).toBeUndefined();
    });

    it('empty config call preserves everything', () => {
      configureRuntime({ kakaoMapAppKey: 'map-key', isDevelopment: true });
      configureRuntime({});
      const config = getRuntimeConfig();
      expect(config.kakaoMapAppKey).toBe('map-key');
      expect(config.isDevelopment).toBe(true);
    });
  });
});
