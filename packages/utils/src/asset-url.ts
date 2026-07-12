// Asset-server URL helpers — transplanted from src/listgrid/misc/index.ts
// (0.3.x Server.ts). GX-3. React-free, zero runtime dependencies. May use
// browser globals (`window`) indirectly via `process.env` (Next.js
// build-time substitution) — no direct DOM access here.
//
// GX-3 decision (2026-07-12, w7-post-seal-gap-analysis.md §GX-3 OQ②):
// BackendAdapter-injected base takes precedence over the pre-existing global
// `ASSET_SERVER_URL`/`configureAssetServerUrl` fallback. This module MUST
// NOT import `@listgrid/schema-core` or any adapter type (stays low-level) —
// the injection is a plain setter (`setAssetServerBase`) that a HIGHER layer
// (e.g. `@listgrid/react`'s `AdapterProvider`) calls with the adapter's base,
// if/when one is unambiguously wired (see that package's own wiring — or the
// GX-3 task's `deviations[]` note if it wasn't, because no current
// BackendAdapter exposes an asset-base concept distinct from its API
// `baseUrl`).
//
// Resolution order (highest → lowest precedence):
//   1. `setAssetServerBase(base)` — adapter-injected (this task's new seam).
//   2. `configureAssetServerUrl(url)` — pre-existing global override (0.3.x).
//   3. `ASSET_SERVER_URL` — `NEXT_PUBLIC_ASSET_SERVER` env constant (0.3.x).

let _warnedNoAssetServerUrl = false;

export const ASSET_SERVER_URL: string =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ASSET_SERVER) || '';

export const ASSET_PREFIX: string = '/static-resource/';

// Tier 1 — adapter-injected base (new, GX-3).
let _injectedAssetServerBase: string | undefined;

// Tier 2 — host-configuration override (0.3.x Server.ts semantics).
let _assetServerUrlOverride: string | undefined;
let _assetPrefixOverride: string | undefined;

/**
 * Injection seam for a BackendAdapter-provided asset-server base (GX-3,
 * higher precedence than `configureAssetServerUrl`). Not part of the 0.3.x
 * oracle surface. Pass `undefined` to clear the injection and fall back to
 * the next tier (`configureAssetServerUrl`/`ASSET_SERVER_URL`).
 */
export function setAssetServerBase(base: string | undefined): void {
  _injectedAssetServerBase = base ? base.replace(/\/+$/, '') : base;
}

// Host-configuration override — hosts that set the env var don't need this;
// hosts that bootstrap at runtime (non-Next environments) can override here.
export function configureAssetServerUrl(url: string): void {
  _assetServerUrlOverride = url.replace(/\/+$/, '');
}

export function configureAssetPrefix(prefix: string): void {
  _assetPrefixOverride = prefix;
}

function effectiveAssetServerUrl(): string {
  const result = _injectedAssetServerBase ?? _assetServerUrlOverride ?? ASSET_SERVER_URL;
  if (!result && !_warnedNoAssetServerUrl) {
    _warnedNoAssetServerUrl = true;
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '[listgrid] ASSET_SERVER_URL is not configured. Host must configure it via ' +
          'environment variable NEXT_PUBLIC_ASSET_SERVER, configureAssetServerUrl(), or ' +
          'an injected BackendAdapter asset base (setAssetServerBase()).',
      );
    }
  }
  return result;
}

function effectiveAssetPrefix(): string {
  return _assetPrefixOverride ?? ASSET_PREFIX;
}

/**
 * Checks whether `url` is an external absolute URL (`http://`/`https://`
 * prefix, after trimming). Deliberately byte-identical to (not imported
 * from) `@listgrid/schema-core`'s public `isExternalUrl` and this package's
 * own `./url.ts` copy — see that file's doc for why this package doesn't
 * import schema-core. Do NOT change one without the other two.
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

export function getAccessableAssetUrl(imgUrl: string | null | undefined): string {
  if (!imgUrl) return '';
  // 외부 절대 URL(`http(s)://`) 이고 자체 asset 서버 host 가 아니라면 그대로 통과.
  // `removeAssetServerPrefix` 가 절대 URL 의 스킴 콜론을 URL-encode 해버려
  // `https%3A//...` 와 같이 망가뜨리던 이전 동작을 바로잡는다.
  if (isExternalUrl(imgUrl)) {
    const trimmed = imgUrl.trim();
    const server = effectiveAssetServerUrl();
    if (server && trimmed.startsWith(server)) {
      // 우리 asset 서버 host 라면 prefix 를 제거한 뒤 표준 경로 처리로 폴백한다.
      let u = removeAssetServerPrefix(trimmed);
      if (u.startsWith('/')) u = u.substring(1);
      return effectiveAssetServerUrl() + effectiveAssetPrefix() + u;
    }
    return trimmed;
  }
  let u = removeAssetServerPrefix(imgUrl);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) u = u.substring(1);
  return effectiveAssetServerUrl() + effectiveAssetPrefix() + u;
}

export function removeAssetServerPrefix(url: string | null | undefined): string {
  if (!url) return '';
  let u = url;
  const server = effectiveAssetServerUrl();
  const prefix = effectiveAssetPrefix();
  if (u.startsWith(server)) u = u.substring(server.length);
  if (u.startsWith(prefix)) u = u.substring(prefix.length);
  // URL-encode each path segment; keeps '/' untouched so callers can
  // concatenate the result with a base URL as before.
  return u.split('/').map(encodeURIComponent).join('/');
}

export function validatedAssetFileName(fileName: string): string {
  fileName = fileName.replace(/ /g, '_');
  fileName = fileName.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '_');
  return fileName;
}
