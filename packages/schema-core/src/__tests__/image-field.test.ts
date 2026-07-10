import { describe, expect, it } from 'vitest';
import type { FieldEvalContext, FieldValueSlice } from '../index';
// ImageField itself is imported directly from its declaring module rather
// than the package barrel: index.ts export wiring for this task's field is
// the orchestrator's job (manifest-driven), not this agent's — see task hard
// rules ("Do NOT edit ... index.ts").
import { ImageField } from '../field/image-field';

// EA-C fan-out (Image) — transplant of 0.3.x
// `src/listgrid/components/fields/ImageField.tsx:69-309` as pure meta
// (charter C4). Value is a plain `string` (single) / `string[]` (multi) —
// conductor decision ① (ea-c-scout-briefing.md banner), NOT the 0.3.x
// `FileFieldValue` envelope. Type is the pre-existing dedicated `'image'`
// discriminant, not the 0.3.x `'file'` reuse (decision ⑤).

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('ImageField construction (transplant of ImageField.tsx:73-80)', () => {
  it('carries the dedicated image type (not the 0.3.x-reused "file")', () => {
    const f = new ImageField('avatar', 10);
    expect(f.type).toBe('image');
    expect(f.getName()).toBe('avatar');
    expect(f.getOrder()).toBe(10);
    expect(f.config).toBeUndefined();
    expect(f.previewSize).toBeUndefined();
  });

  it('accepts a config via the constructor', () => {
    const f = new ImageField('avatar', 10, { maxSize: 5, extensions: ['png'] });
    expect(f.config).toEqual({ maxSize: 5, extensions: ['png'] });
  });
});

describe('ImageField builders (transplant of ImageField.tsx:82-136)', () => {
  it('withConfig sets/clears the whole config object', () => {
    const f = new ImageField('avatar', 10).withConfig({ maxCount: 3 });
    expect(f.config).toEqual({ maxCount: 3 });
    f.withConfig(undefined);
    expect(f.config).toBeUndefined();
  });

  it('withMaxSize/withMaxCount/withExtensions/withFileTypes each reconstruct config, preserving the other members regardless of call order', () => {
    const f = new ImageField('avatar', 10)
      .withMaxSize(5)
      .withMaxCount(2)
      .withExtensions('png', 'jpg')
      .withFileTypes('image/png', 'image/jpeg');
    expect(f.config).toEqual({
      maxSize: 5,
      maxCount: 2,
      extensions: ['png', 'jpg'],
      fileTypes: ['image/png', 'image/jpeg'],
    });

    // re-setting one member does not clobber the others
    const g = new ImageField('avatar', 10).withMaxCount(2).withExtensions('png').withMaxSize(10);
    expect(g.config).toEqual({
      maxSize: 10,
      maxCount: 2,
      extensions: ['png'],
      fileTypes: undefined,
    });
  });

  it('withPreviewSize sets previewSize (number or CSS-length string)', () => {
    const f = new ImageField('avatar', 10).withPreviewSize(120);
    expect(f.previewSize).toBe(120);
    f.withPreviewSize('8rem');
    expect(f.previewSize).toBe('8rem');
  });

  it('returns `this` (chainable)', () => {
    const f = new ImageField('avatar', 10);
    expect(f.withConfig({ maxCount: 1 })).toBe(f);
    expect(f.withMaxSize(1)).toBe(f);
    expect(f.withMaxCount(1)).toBe(f);
    expect(f.withExtensions('png')).toBe(f);
    expect(f.withFileTypes('image/png')).toBe(f);
    expect(f.withPreviewSize(1)).toBe(f);
  });
});

describe('ImageField.resolveConfig — image-whitelist default fill (transplant of ImageField.tsx:142-160)', () => {
  it('no config declared -> full whitelist default (maxCount 1, image extensions, image/*)', () => {
    const f = new ImageField('avatar', 10);
    expect(f.resolveConfig()).toEqual({
      maxCount: 1,
      extensions: ['png', 'jpeg', 'jpg', 'gif', 'webp', 'svg'],
      fileTypes: ['image/*'],
    });
  });

  it('partial config -> only the UNSET members are back-filled', () => {
    const f = new ImageField('avatar', 10, { maxSize: 5, extensions: ['png'] });
    expect(f.resolveConfig()).toEqual({
      maxSize: 5,
      maxCount: 1,
      extensions: ['png'],
      fileTypes: ['image/*'],
    });
  });

  it('maxCount 0 or negative heals to 1 (0.3.x `!config.maxCount || config.maxCount < 1`)', () => {
    expect(new ImageField('avatar', 10, { maxCount: 0 }).resolveConfig().maxCount).toBe(1);
    expect(new ImageField('avatar', 10, { maxCount: -3 }).resolveConfig().maxCount).toBe(1);
  });

  it('declared maxCount >= 1 is kept as-is (multi-image field)', () => {
    expect(new ImageField('gallery', 10, { maxCount: 5 }).resolveConfig().maxCount).toBe(5);
  });

  it('does not mutate `this.config` (fresh object each call, unlike the 0.3.x aliasing side effect)', () => {
    const f = new ImageField('avatar', 10, { maxSize: 5 });
    const resolved = f.resolveConfig();
    resolved.maxCount = 999;
    expect(f.config).toEqual({ maxSize: 5 });
  });
});

describe('ImageField.validate — base FormField required-blank (no isBlank/isDirty override, decision ⑤ natural healing)', () => {
  it('required + blank string -> one failure', async () => {
    const f = new ImageField('avatar', 10).withRequired(true).withLabel('프로필 사진');
    const res = await f.validate(ctx({ current: '' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
    expect(res[0].message).toContain('프로필 사진');
  });

  it('required + undefined -> one failure', async () => {
    const f = new ImageField('avatar', 10).withRequired(true);
    const res = await f.validate(ctx({ current: undefined }));
    expect(res).toHaveLength(1);
  });

  it('required + empty array -> one failure (plain string[] blank, generic isBlank array branch)', async () => {
    const f = new ImageField('gallery', 10, { maxCount: 3 }).withRequired(true);
    const res = await f.validate(ctx({ current: [] }));
    expect(res).toHaveLength(1);
  });

  it('required + filled string -> valid', async () => {
    const f = new ImageField('avatar', 10).withRequired(true);
    expect(await f.validate(ctx({ current: 'https://cdn.example.com/a.png' }))).toEqual([]);
  });

  it('required + filled array -> valid', async () => {
    const f = new ImageField('gallery', 10, { maxCount: 3 }).withRequired(true);
    expect(await f.validate(ctx({ current: ['https://cdn.example.com/a.png'] }))).toEqual([]);
  });

  it('not required + blank -> valid (Image has no built-in format validation)', async () => {
    const f = new ImageField('avatar', 10);
    expect(await f.validate(ctx({ current: '' }))).toEqual([]);
  });

  it('hidden/readonly fields skip validation', async () => {
    const hidden = new ImageField('a', 1).withRequired(true).withHidden(true);
    expect(await hidden.validate(ctx({ current: '' }))).toEqual([]);
    const readonly = new ImageField('b', 1).withRequired(true).withReadOnly(true);
    expect(await readonly.validate(ctx({ current: '' }))).toEqual([]);
  });
});

describe('ImageField.clone', () => {
  it('preserves type/config/previewSize/label/required across a structural clone', () => {
    const original = new ImageField('avatar', 10, { maxSize: 5, extensions: ['png'] })
      .withPreviewSize('8rem')
      .withLabel('Avatar')
      .withRequired(true);
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy.type).toBe('image');
    expect(copy.config).toEqual({ maxSize: 5, extensions: ['png'] });
    expect(copy.previewSize).toBe('8rem');
    expect(copy.getLabel()).toBe('Avatar');
    expect(copy.required).toBe(true);
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new ImageField('avatar', 10).withDefaultValue('https://cdn.example.com/a.png');
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.default).toBe('https://cdn.example.com/a.png');
  });
});
