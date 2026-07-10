// Shared File/Image upload constraint config — transplanted verbatim (member
// shape) from src/listgrid/config/Config.ts:406-411 (0.3.x `IAssetConfig`).
// Lives here rather than inside a specific field file because File/Image
// (EA-C fan-out) share the identical shape (ea-c-scout-briefing.md PART D).

/**
 * Upload constraints for a File/Image field (0.3.x `IAssetConfig`,
 * `Config.ts:406-411` — member names/optionality unchanged).
 */
export interface AssetConfig {
  /** Per-file size limit in MB. Unset = host default (10MB in 0.3.x). */
  maxSize?: number;
  /** Max number of files for the field. Unset = host default (1 in 0.3.x). */
  maxCount?: number;
  /** Allowed file extensions. Unset = all extensions allowed. */
  extensions?: string[];
  /** Allowed MIME types, e.g. `['image/*']`. */
  fileTypes?: string[];
}
