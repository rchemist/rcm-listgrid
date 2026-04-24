// Stage 8 — runtime configuration.
//
// Replaces hard-coded `process.env.NEXT_PUBLIC_*` access with a
// framework-agnostic registry. Host apps call `configureRuntime({...})`
// at bootstrap with their platform-specific values (from Next env vars,
// Vite import.meta.env, custom config, etc.).
//
// Stage 9 (0.3.0) — host-coupling detox.
// Two registries were added to replace hardcoded project literals:
//   - `endpoints`: named API paths used by built-in features
//   - `permissions`: predicate hooks for UI permission gates
// See docs/REFACTOR_HOST_COUPLING.md for rationale.

import type { Session } from '../auth/types';

/**
 * Named API endpoints used internally by built-in fields and features.
 * Hosts override at bootstrap via `configureRuntime({ endpoints: { ... } })`.
 * Individual fields can still override via their own chainable setters.
 */
export interface ListGridEndpoints {
  /** Excel import suffix appended to an entity's base URL. */
  excelUpload: string;
  /** Excel download history logging endpoint. */
  excelDownloadHistory: string;
  /** Custom option single-alias fetch. */
  customOptionByAlias: string;
  /** Custom option bulk-alias fetch. */
  customOptionByAliases: string;
  /** Asset upload endpoint (MultipleAssetField, etc.). */
  assetUpload: string;
  /** Static resource prefix for asset URLs. */
  staticResourcePrefix: string;
  /** SMS sender list endpoint (SMS modal). */
  smsSenderList: string;
  /** SMS send endpoint. */
  smsNotificationSend: string;
  /** Revision history endpoint. */
  revisionApi: string;
  /** Fallback image URL when an asset cannot be loaded. */
  noImageFallback: string;
}

/**
 * Permission predicate hooks. Each returns `true` when the UI affordance
 * is allowed for the given session. Library defaults are permissive
 * (`() => true`); hosts install their own role checks at bootstrap.
 */
export interface ListGridPermissions {
  /** PhoneNumberField "Send SMS" button visibility. */
  canSendSms: (session?: Session) => boolean;
  /** ListGrid "Open in new window" button visibility. */
  canOpenInNewWindow: (session?: Session) => boolean;
}

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
  /** Named API endpoints; hosts override any subset. */
  endpoints?: Partial<ListGridEndpoints>;
  /** Permission predicates; hosts override any subset. */
  permissions?: Partial<ListGridPermissions>;
}

const DEFAULT_ENDPOINTS: ListGridEndpoints = {
  excelUpload: '/excel-upload',
  excelDownloadHistory: '/excel-download-history/add',
  customOptionByAlias: '/option/by-alias',
  customOptionByAliases: '/option/by-aliases',
  assetUpload: '/asset/upload-file',
  staticResourcePrefix: '/static-resource/',
  smsSenderList: '/api/v1/sms-sender/list',
  smsNotificationSend: '/notification/send',
  revisionApi: '/revision',
  noImageFallback: '/assets/images/no-image.png',
};

const DEFAULT_PERMISSIONS: ListGridPermissions = {
  canSendSms: () => true,
  canOpenInNewWindow: () => true,
};

interface ResolvedRuntimeConfig {
  cacheControl: boolean;
  useServerSideCache: boolean;
  searchFormHashKey: string;
  debugListGridPerformance: boolean;
  isDevelopment: boolean;
  kakaoMapAppKey: string;
  cryptKey: string;
  endpoints: ListGridEndpoints;
  permissions: ListGridPermissions;
}

const DEFAULT: ResolvedRuntimeConfig = {
  cacheControl: false,
  useServerSideCache: false,
  searchFormHashKey: 'rcm-searchform',
  debugListGridPerformance: false,
  isDevelopment: false,
  kakaoMapAppKey: '',
  cryptKey: '',
  endpoints: { ...DEFAULT_ENDPOINTS },
  permissions: { ...DEFAULT_PERMISSIONS },
};

let _config: ResolvedRuntimeConfig = {
  ...DEFAULT,
  endpoints: { ...DEFAULT_ENDPOINTS },
  permissions: { ...DEFAULT_PERMISSIONS },
};

export function configureRuntime(config: RuntimeConfig): void {
  const { endpoints: epOverride, permissions: pmOverride, ...scalarOverrides } = config;
  _config = {
    ..._config,
    ...scalarOverrides,
    endpoints: { ..._config.endpoints, ...(epOverride ?? {}) },
    permissions: { ..._config.permissions, ...(pmOverride ?? {}) },
  };
}

export function getRuntimeConfig(): ResolvedRuntimeConfig {
  return _config;
}

export function getEndpoint(name: keyof ListGridEndpoints): string {
  return _config.endpoints[name];
}

export function getPermission(name: keyof ListGridPermissions): (session?: Session) => boolean {
  return _config.permissions[name];
}
