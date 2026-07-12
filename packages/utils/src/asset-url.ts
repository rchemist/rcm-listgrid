// Asset-server URL helpers — transplanted from src/listgrid/misc/index.ts
// (0.3.x Server.ts), redesigned per documents/plans/asset-url-resolution-design.md
// (2026-07-13, §1). React-free, zero runtime dependencies, and PURE:
// `resolveAssetUrl` takes its asset-server base as an explicit argument. There
// is NO mutable module-global request state, no `console`, and no `window`/DOM
// access here — precedence (adapter base ?? host <AssetBaseProvider> ??
// NEXT_PUBLIC_ASSET_SERVER env) is resolved by the CALLER (in @listgrid/react
// via context; in RSC/Node/batch by passing a base directly).

export const ASSET_SERVER_URL: string =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ASSET_SERVER) || '';

export const ASSET_PREFIX: string = '/static-resource/';

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

/**
 * Pure asset-URL resolver. Given a stored asset value and an explicit
 * asset-server `serverUrl` base, returns the URL to display:
 *  - absolute http(s) URL on a FOREIGN host → passthrough (byte-for-byte)
 *  - absolute http(s) URL on our own `serverUrl` → normalized (strip + rebuild)
 *  - protocol-relative `//`, `data:`, `blob:` → passthrough
 *  - relative path → `serverUrl` + `prefix` + encoded-path
 *    (empty `serverUrl` → root-relative `/static-resource/<path>`, same-origin)
 *  - null/undefined/empty → ''
 *
 * Deterministic (server === client, hydration-safe), no module globals, no
 * side effects. Trailing slashes on `serverUrl` are normalized here (the
 * single normalization point).
 */
export function resolveAssetUrl(
  url: string | null | undefined,
  serverUrl?: string,
  prefix: string = ASSET_PREFIX,
): string {
  if (!url) return '';
  const t = url.trim();
  const base = serverUrl ? serverUrl.replace(/\/+$/, '') : '';

  // Absolute http(s): own-server → normalize; foreign → passthrough. (Fixes the
  // prior bug where prefixing URL-encoded the scheme colon into `https%3A//…`.)
  if (t.startsWith('http://') || t.startsWith('https://')) {
    if (base && t.startsWith(base)) {
      let u = removeAssetServerPrefix(t, base, prefix);
      if (u.startsWith('/')) u = u.substring(1);
      return base + prefix + u;
    }
    return t;
  }

  // Other opaque/absolute schemes pass through untouched.
  if (t.startsWith('//') || t.startsWith('data:') || t.startsWith('blob:')) return t;

  // Relative path.
  let u = removeAssetServerPrefix(url, base, prefix);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) u = u.substring(1);
  return base + prefix + u;
}

/**
 * Strips an explicit `serverUrl` base and `prefix` from `url`, then
 * URL-encodes each path segment (keeps `/` separators untouched so the result
 * can be concatenated with a base). Pure — no module-global reads.
 */
export function removeAssetServerPrefix(
  url: string | null | undefined,
  serverUrl: string = '',
  prefix: string = ASSET_PREFIX,
): string {
  if (!url) return '';
  let u = url;
  const server = serverUrl ? serverUrl.replace(/\/+$/, '') : '';
  if (server && u.startsWith(server)) u = u.substring(server.length);
  if (u.startsWith(prefix)) u = u.substring(prefix.length);
  return u.split('/').map(encodeURIComponent).join('/');
}

export function validatedAssetFileName(fileName: string): string {
  fileName = fileName.replace(/ /g, '_');
  fileName = fileName.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '_');
  return fileName;
}
