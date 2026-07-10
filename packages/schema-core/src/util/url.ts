// URL classification — transplanted verbatim from src/listgrid/misc/index.ts
// (0.3.x isExternalUrl, misc/index.ts:486-490). React-free. Shared by
// File/Image fields (EA-C fan-out, ea-c-scout-briefing.md decision ⑥) to
// bypass the asset-server URL prefix when the field's value is already an
// absolute external URL.

/**
 * Checks whether `url` is an external absolute URL (`http://`/`https://`
 * prefix, after trimming). Used to decide when a File/Image field's stored
 * value should skip the asset-server prefix and render/link as-is.
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}
