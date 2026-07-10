import type { AssetConfig } from './asset-config';
import { buildAssetConfig } from './asset-config';
import { FormField } from './form-field';

// Image (0.3.x ImageField, src/listgrid/components/fields/ImageField.tsx:69-309).
// META ONLY (charter C4): the renderer (@listgrid/react image-renderer.tsx —
// FileInput slot + bare <img> thumbnail) owns rendering; this class owns the
// declaration + upload-config resolution.
//
// Value shape (EA-C conductor decision ①, ea-c-scout-briefing.md banner):
// plain `string` (single URL, the common maxCount<=1 case) or `string[]`
// (multi-image, maxCount>1) — the 0.3.x `FileFieldValue` envelope
// (`{existFiles,newFiles,deleteFiles}`) is explicitly NOT transplanted. The
// envelope's isBlank/isDirty overrides existed only to unwrap that shape
// (ImageField.tsx itself declared NEITHER — 0.3.x's own inconsistency,
// briefing PART A "isBlank/isDirty override 없음"); with a plain value the
// new engine's generic `value.ts` isBlank/isDirty already do the right thing
// with zero overrides here, and — DEVIATION (documented, not a bug) — because
// isBlank now actually recognizes an empty value as blank, `withRequired()`
// on this field WORKS for the first time (0.3.x's own required-blank check
// operated on the envelope and silently passed through a `{existFiles:[],...}`
// shape as non-blank in some data paths — "natural healing" per briefing
// decision ⑤, not something ported deliberately).
//
// Type discriminant: dedicated `'image'` (schema-core/src/field/types.ts,
// pre-existing) — NOT the 0.3.x `'file'` reuse (ImageField.tsx:74 `super(name,
// order, 'file')`, briefing PART A "구 결함"). That 0.3.x choice collided
// FileField and ImageField onto one render dispatch key; the new
// one-type-one-renderer registry (ADR-0003) requires them distinct, and
// 'image' already existed in the flat union before this task.
//
// `AssetConfig` (`packages/schema-core/src/field/asset-config.ts`, EA-C0
// pre-stage) is the shared File/Image upload-constraint shape (0.3.x
// `IAssetConfig`, `Config.ts:406-411`) — not redeclared here.

/** 0.3.x ImageField.tsx:147,155 default extensions whitelist (image-only). */
const DEFAULT_IMAGE_EXTENSIONS = ['png', 'jpeg', 'jpg', 'gif', 'webp', 'svg'];
/** 0.3.x ImageField.tsx:148,152 default MIME whitelist. */
const DEFAULT_IMAGE_FILE_TYPES = ['image/*'];

export class ImageField extends FormField<string | string[]> {
  config?: AssetConfig;
  /**
   * Form-preview thumbnail side length (`number` = px, `string` = any CSS
   * length). Transplant of `ImageField.withPreviewSize` (ImageField.tsx:93-96)
   * — unset leaves sizing to the renderer/host CSS default.
   */
  previewSize?: number | string;

  constructor(name: string, order: number, config?: AssetConfig) {
    super(name, order, 'image');
    if (config !== undefined) this.config = config;
  }

  /** Transplant of `ImageField.withConfig` (ImageField.tsx:82-85). */
  withConfig(config?: AssetConfig): this {
    if (config !== undefined) this.config = config;
    else delete this.config;
    return this;
  }

  /**
   * Transplant of `ImageField.withMaxSize` (ImageField.tsx:98-106) — rebuilds
   * `config` as a new object each call, preserving the other three members
   * (faithful to the 0.3.x "reconstruct the whole IAssetConfig" pattern
   * shared by all four `withX` builders below, so calls compose regardless of
   * order: `.withMaxSize(5).withExtensions('png')` keeps maxSize=5).
   */
  withMaxSize(maxSize?: number): this {
    this.config = buildAssetConfig(
      maxSize,
      this.config?.maxCount,
      this.config?.extensions,
      this.config?.fileTypes,
    );
    return this;
  }

  /** Transplant of `ImageField.withMaxCount` (ImageField.tsx:108-116). */
  withMaxCount(maxCount?: number): this {
    this.config = buildAssetConfig(
      this.config?.maxSize,
      maxCount,
      this.config?.extensions,
      this.config?.fileTypes,
    );
    return this;
  }

  /** Transplant of `ImageField.withExtensions` (ImageField.tsx:118-126). */
  withExtensions(...extensions: string[]): this {
    this.config = buildAssetConfig(
      this.config?.maxSize,
      this.config?.maxCount,
      extensions,
      this.config?.fileTypes,
    );
    return this;
  }

  /** Transplant of `ImageField.withFileTypes` (ImageField.tsx:128-136). */
  withFileTypes(...fileTypes: string[]): this {
    this.config = buildAssetConfig(
      this.config?.maxSize,
      this.config?.maxCount,
      this.config?.extensions,
      fileTypes,
    );
    return this;
  }

  /** Transplant of `ImageField.withPreviewSize` (ImageField.tsx:93-96). */
  withPreviewSize(size: number | string): this {
    this.previewSize = size;
    return this;
  }

  /**
   * Resolve the effective upload config for the renderer/FileInput slot:
   * when NO config was ever declared, fill the full image whitelist
   * (`maxCount:1`, extensions, fileTypes); when a PARTIAL config was
   * declared, back-fill only the unset members — `maxCount` also heals a
   * declared `0`/negative value up to `1`. Faithful transplant of the
   * default-fill block inline in `ImageField.renderInstance`
   * (ImageField.tsx:142-160, re-verified against source), moved here as a
   * pure method since schema-core owns no rendering (ADR-0003). Unlike the
   * 0.3.x original — which mutated its local `config` binding in place, an
   * alias of `this.config` — this returns a fresh object and never mutates
   * `this.config`; nothing downstream needs the fill to stick to the field.
   */
  resolveConfig(): AssetConfig {
    const config = this.config;
    if (!config) {
      return {
        maxCount: 1,
        extensions: [...DEFAULT_IMAGE_EXTENSIONS],
        fileTypes: [...DEFAULT_IMAGE_FILE_TYPES],
      };
    }
    return buildAssetConfig(
      config.maxSize,
      !config.maxCount || config.maxCount < 1 ? 1 : config.maxCount,
      config.extensions ?? [...DEFAULT_IMAGE_EXTENSIONS],
      config.fileTypes ?? [...DEFAULT_IMAGE_FILE_TYPES],
    );
  }
}
