import type { AssetConfig } from './asset-config';
import { buildAssetConfig } from './asset-config';
import { FormField } from './form-field';

// FileField (EA-C fan-out — File). Transplant of 0.3.x
// `src/listgrid/components/fields/FileField.tsx:41-281` (re-verified against
// source 2026-07-11: constructor `super(name, order, 'file')` :45; builders
// `withConfig/withMaxSize/withMaxCount/withExtensions/withFileTypes` :49-92,
// each rebuilding the whole `IAssetConfig` literal from the current config +
// the one changed member). The 0.3.x original set every member explicitly
// (including `undefined` ones) on the rebuilt literal; the shared
// `buildAssetConfig` helper (imported below) achieves the SAME observable
// config each call produces
// (a member is present only when it has a value) while satisfying this
// repo's `exactOptionalPropertyTypes: true` (assigning an explicit
// `undefined` into `AssetConfig`'s non-`|undefined` optional members is a
// type error under that flag — omitting the key is the compliant
// equivalent, and behaviorally indistinguishable for every reader of
// `field.config` in this codebase, which only ever does `config?.maxSize`
// style reads, never `'maxSize' in config`).
//
// Value shape (conductor decision ①, ea-c-scout-briefing.md banner + PART C):
// plain `string` (single URL) when `config.maxCount` is absent or `1`; plain
// `string[]` (multiple URLs) when `config.maxCount > 1`. The 0.3.x
// `FileFieldValue` envelope (`{existFiles,newFiles,deleteFiles}`,
// `ui/UIProvider.tsx:227-388`) is deliberately NOT transplanted — with plain
// values the new engine's type-agnostic generic `isBlank`/`isDirty`
// (`./value.ts`) are already correct (an envelope object would read as
// non-blank even when every URL inside it is empty, silently breaking
// `withRequired` — PART C). That is also why this class carries no
// `isBlank`/`isDirty` override, unlike the 0.3.x original (:216-280): the
// generic logic is the correct behavior now, not a gap to fill.
//
// EA-R1 #5: the withX builders below rebuild the whole `AssetConfig` literal
// from four possibly-unset members via the shared `buildAssetConfig`
// (`./asset-config.ts`) — identical semantics to a private `buildConfig`
// this file used to duplicate locally; ImageField (`image-field.ts`) already
// used the shared helper, so this closes the last duplicate.

export class FileField extends FormField<string | string[]> {
  config?: AssetConfig | undefined;

  constructor(name: string, order: number, config?: AssetConfig) {
    super(name, order, 'file');
    this.config = config;
  }

  /** Replace the whole upload constraint config in one call. */
  withConfig(config?: AssetConfig): this {
    this.config = config;
    return this;
  }

  /** Transplant of `FileField.withMaxSize:54-62`. */
  withMaxSize(maxSize?: number): this {
    this.config = buildAssetConfig(
      maxSize,
      this.config?.maxCount,
      this.config?.extensions,
      this.config?.fileTypes,
    );
    return this;
  }

  /** Transplant of `FileField.withMaxCount:64-72` — the single/multi value-shape switch (decision ①). */
  withMaxCount(maxCount?: number): this {
    this.config = buildAssetConfig(
      this.config?.maxSize,
      maxCount,
      this.config?.extensions,
      this.config?.fileTypes,
    );
    return this;
  }

  /** Transplant of `FileField.withExtensions:74-82`. */
  withExtensions(...extension: string[]): this {
    this.config = buildAssetConfig(
      this.config?.maxSize,
      this.config?.maxCount,
      extension,
      this.config?.fileTypes,
    );
    return this;
  }

  /** Transplant of `FileField.withFileTypes:84-92`. */
  withFileTypes(...fileTypes: string[]): this {
    this.config = buildAssetConfig(
      this.config?.maxSize,
      this.config?.maxCount,
      this.config?.extensions,
      fileTypes,
    );
    return this;
  }

  /**
   * The effective max upload count (0.3.x host defaulted an unset
   * `maxCount` to 1 — `IAssetConfig` doc comment, `Config.ts:406-411`).
   * Renderer-consumed switch: `> 1` means the field's value is `string[]`,
   * otherwise it is a plain `string` (decision ①).
   */
  getMaxCount(): number {
    return this.config?.maxCount ?? 1;
  }

  /** `true` when this field holds multiple URLs (`string[]`) rather than one (`string`). */
  isMultiple(): boolean {
    return this.getMaxCount() > 1;
  }
}
