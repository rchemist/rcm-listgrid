// URL helpers — transplanted verbatim from src/listgrid/misc/index.ts (0.3.x
// RequestUtil.normalizeUrl / StringUtil.removeTrailingSeparator). GX-3.
// React-free, zero runtime dependencies.

import { isBlank } from './internal';

// From RequestUtil.normalizeUrl — prefixes '/' for relative paths, preserves
// absolute http(s) URLs.
export function normalizeUrl(url: string): string {
  if (isBlank(url)) return url;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (!trimmed.startsWith('/')) return `/${trimmed}`;
  return trimmed;
}

// From StringUtil.removeTrailingSeparator — separator is REQUIRED and the
// logic strips the trailing segment up to (and including) the last separator.
export function removeTrailingSeparator(input: string, separator: string): string {
  const parts = input.split(separator);
  const lastPart = parts[parts.length - 1]!;
  if (lastPart.trim() !== '') {
    return input.slice(0, input.lastIndexOf(separator));
  }
  return input;
}

// `isExternalUrl` is ALSO public at `@listgrid/schema-core`'s `util/url.ts`
// (used there by File/Image field external-URL bypass). This package stays
// zero-runtime-dependency (no `@listgrid/schema-core` import — see package
// doc), so this is a deliberately byte-identical re-implementation, not a
// diverging copy. Do NOT change one without the other.
/**
 * Checks whether `url` is an external absolute URL (`http://`/`https://`
 * prefix, after trimming).
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}
