import { describe, expect, it } from 'vitest';
import type { AssetItem } from '../field/multiple-asset-field';
import { MultipleAssetField } from '../field/multiple-asset-field';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValueSlice } from '../field/types';

// MultipleAssetField (EA-C fan-out) — transplant of 0.3.x
// `src/listgrid/components/fields/MultipleAssetField.tsx:27-67`. Old class
// had no chainable builders and no validate()/isBlank()/isDirty() overrides
// (:216-242/:244-280 belong to FileField, not this one) — the value shape
// change (conductor decision ④, `MultipleAssetForm{assets,preferred}` ->
// bare `AssetItem[]`) means the generic `FormField.validate` + the free
// `isBlank`/`isDirty` functions in `../field/value` (empty-array-is-blank,
// EA-B1) now apply directly with zero per-field override, which this suite
// locks down.

const ctx = (
  value?: FieldValueSlice<AssetItem[]>,
  renderType: 'create' | 'update' = 'create',
): FieldEvalContext => ({
  renderType,
  ...(value !== undefined ? { value } : {}),
});

describe('MultipleAssetField construction', () => {
  it('takes (name, order, tags?, fileTypes?), type is multipleAsset', () => {
    const f = new MultipleAssetField('gallery', 5, ['Primary', 'thumbnail'], ['image/*']);
    expect(f.getName()).toBe('gallery');
    expect(f.getOrder()).toBe(5);
    expect(f.type).toBe('multipleAsset');
    expect(f.tags).toEqual(['Primary', 'thumbnail']);
    expect(f.fileTypes).toEqual(['image/*']);
  });

  it('tags/fileTypes are optional (0.3.x ctor parity)', () => {
    const f = new MultipleAssetField('gallery', 5);
    expect(f.tags).toBeUndefined();
    expect(f.fileTypes).toBeUndefined();
  });

  it('has no declared label by default (falls back to name, like any FormField)', () => {
    const f = new MultipleAssetField('gallery', 5);
    expect(f.getLabel()).toBe('gallery');
  });

  it('has no chaining builders of its own (0.3.x parity — old class had none)', () => {
    const f = new MultipleAssetField('gallery', 5);
    // withLabel/withRequired etc. are the only chainable API, inherited from
    // FormField; MultipleAssetField itself adds no withXxx methods.
    expect((f as unknown as Record<string, unknown>).withTags).toBeUndefined();
    expect((f as unknown as Record<string, unknown>).withFileTypes).toBeUndefined();
  });
});

describe('MultipleAssetField.clone — preserves tags/fileTypes', () => {
  it('the clone carries over tags and fileTypes', () => {
    const original = new MultipleAssetField('gallery', 5, ['Primary', 'thumbnail'], ['image/*']);
    const copy = original.clone();

    expect(copy).not.toBe(original);
    expect(copy).toBeInstanceOf(MultipleAssetField);
    expect(copy.getName()).toBe('gallery');
    expect(copy.type).toBe('multipleAsset');
    expect(copy.tags).toEqual(['Primary', 'thumbnail']);
    expect(copy.fileTypes).toEqual(['image/*']);
  });

  it('preserves declared meta (label/required) alongside field-specific members', () => {
    const original = new MultipleAssetField('gallery', 5, ['Primary'])
      .withLabel('Gallery')
      .withRequired(true);
    const copy = original.clone();

    expect(copy.getLabel()).toBe('Gallery');
    expect(copy.required).toBe(true);
    expect(copy.tags).toEqual(['Primary']);
  });

  it('drops the value unless includeValue is passed (FormField.clone contract)', () => {
    const assets: AssetItem[] = [{ name: 'Primary', url: '/a.png', primary: true }];
    const original = new MultipleAssetField('gallery', 5).withDefaultValue(assets);
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value).toEqual({ default: assets, current: assets });
  });
});

describe('MultipleAssetField blank/required behavior with plain AssetItem[] values (conductor decision ④)', () => {
  it('an empty array is blank — required + [] fails validation', async () => {
    const f = new MultipleAssetField('gallery', 5).withRequired(true).withLabel('Gallery');
    const result = await f.validate(ctx({ current: [] }));
    expect(result).toHaveLength(1);
    expect(result[0].message).toContain('필수 값입니다');
  });

  it('an undefined value is blank — required + undefined fails validation', async () => {
    const f = new MultipleAssetField('gallery', 5).withRequired(true).withLabel('Gallery');
    const result = await f.validate(ctx());
    expect(result).toHaveLength(1);
  });

  it('a non-empty array is NOT blank — required + populated array passes', async () => {
    const f = new MultipleAssetField('gallery', 5).withRequired(true);
    const assets: AssetItem[] = [{ name: 'Primary', url: '/a.png', primary: true }];
    const result = await f.validate(ctx({ current: assets }));
    expect(result).toEqual([]);
  });

  it('not required + blank passes validation', async () => {
    const f = new MultipleAssetField('gallery', 5);
    const result = await f.validate(ctx({ current: [] }));
    expect(result).toEqual([]);
  });

  it('AssetItem shape allows name/description/url/primary, only url mandatory at the type level', () => {
    const minimal: AssetItem = { url: '/a.png' };
    const full: AssetItem = {
      name: 'Primary',
      description: 'alt text',
      url: '/a.png',
      primary: true,
    };
    expect(minimal.url).toBe('/a.png');
    expect(full.primary).toBe(true);
  });
});
