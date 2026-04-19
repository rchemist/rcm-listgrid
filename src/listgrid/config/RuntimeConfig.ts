// Stage 8 — runtime configuration.
//
// Replaces hard-coded `process.env.NEXT_PUBLIC_*` access with a
// framework-agnostic registry. Host apps call `configureRuntime({...})`
// at bootstrap with their platform-specific values (from Next env vars,
// Vite import.meta.env, custom config, etc.).

export interface RuntimeConfig {
  /** Enables server-side-rendered list caching hints. */
  cacheControl?: boolean;
  /** Enables an alternate listgrid data pipeline (server-side cache). */
  useServerSideCache?: boolean;
  /** sessionStorage key prefix for SearchForm persistence. */
  searchFormHashKey?: string;
  /** Performance logging toggle for the listgrid engine. */
  debugListGridPerformance?: boolean;
  /** True when NODE_ENV === 'development' (used by perf logger). */
  isDevelopment?: boolean;
  /** Kakao Maps JS SDK app key. */
  kakaoMapAppKey?: string;
  /** simpleCrypt passphrase / secret (replaces NEXT_PUBLIC_CRYPT_KEY). */
  cryptKey?: string;
}

const DEFAULT: Required<RuntimeConfig> = {
  cacheControl: false,
  useServerSideCache: false,
  searchFormHashKey: 'rcm-searchform',
  debugListGridPerformance: false,
  isDevelopment: false,
  kakaoMapAppKey: '',
  cryptKey: '',
};

let _config: Required<RuntimeConfig> = { ...DEFAULT };

export function configureRuntime(config: RuntimeConfig): void {
  _config = { ...DEFAULT, ..._config, ...config };
}

export function getRuntimeConfig(): Required<RuntimeConfig> {
  return _config;
}
