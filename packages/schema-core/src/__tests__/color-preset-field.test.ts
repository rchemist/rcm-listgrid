import { describe, expect, it } from 'vitest';
import { ColorPresetField } from '../field/color-preset-field';
import type { FieldEvalContext } from '../field/eval-context';

// ColorPresetField (EA-A fan-out — ColorPreset). Transplant of 0.3.x
// ColorPresetField (src/listgrid/components/fields/ColorPresetField.tsx:11-47)
// minus its render/list-render members (schema-core is render-free,
// ADR-0003) — what remains is a plain FormField<string> carrying the
// dedicated 'colorPreset' type discriminant (old reused 'text'), the
// inherited required/validations machinery, and a constructor-only optional
// `presets` narrowing array (no builder in 0.3.x, none added here).

function ctx(
  value: FieldEvalContext['value'],
  renderType: 'create' | 'update' = 'create',
): FieldEvalContext {
  return { renderType, value };
}

describe('ColorPresetField (builders)', () => {
  it('carries the dedicated colorPreset type (not the 0.3.x-reused "text")', () => {
    const f = new ColorPresetField('brandColor', 10);
    expect(f.type).toBe('colorPreset');
    expect(f.getName()).toBe('brandColor');
    expect(f.getOrder()).toBe(10);
    expect(f.presets).toBeUndefined();
  });

  it('constructor-only presets narrows the swatch palette (no withPresets builder, faithful to 0.3.x)', () => {
    const f = new ColorPresetField('brandColor', 10, ['indigo', 'red', 'teal']);
    expect(f.presets).toEqual(['indigo', 'red', 'teal']);
    expect(typeof (f as unknown as { withPresets?: unknown }).withPresets).toBe('undefined');
  });

  it('inherits base FormField builders (withLabel/withRequired/withDefaultValue chain)', () => {
    const f = new ColorPresetField('brandColor', 10)
      .withLabel('Brand Color')
      .withRequired(true)
      .withDefaultValue('indigo');
    expect(f.getLabel()).toBe('Brand Color');
    expect(f.required).toBe(true);
    expect(f.value?.default).toBe('indigo');
  });
});

describe('ColorPresetField.validate (base FormField required-blank + declared validations)', () => {
  it('required + blank → one failure', async () => {
    const f = new ColorPresetField('brandColor', 10).withRequired(true).withLabel('브랜드 색상');
    const res = await f.validate(ctx({ current: '' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
    expect(res[0].message).toContain('브랜드 색상');
  });

  it('required + filled → valid', async () => {
    const f = new ColorPresetField('brandColor', 10).withRequired(true);
    expect(await f.validate(ctx({ current: 'indigo' }))).toEqual([]);
  });

  it('not required + blank → valid (ColorPreset has no built-in swatch-membership validation)', async () => {
    const f = new ColorPresetField('brandColor', 10);
    expect(await f.validate(ctx({ current: '' }))).toEqual([]);
  });

  it('hidden/readonly fields skip validation', async () => {
    const hidden = new ColorPresetField('a', 1).withRequired(true).withHidden(true);
    expect(await hidden.validate(ctx({ current: '' }))).toEqual([]);
    const readonly = new ColorPresetField('b', 1).withRequired(true).withReadOnly(true);
    expect(await readonly.validate(ctx({ current: '' }))).toEqual([]);
  });
});

describe('ColorPresetField.clone', () => {
  it('preserves type/label/required/presets across a structural clone', () => {
    const original = new ColorPresetField('brandColor', 10, ['indigo', 'red'])
      .withLabel('Brand Color')
      .withRequired(true);
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy.type).toBe('colorPreset');
    expect(copy.getLabel()).toBe('Brand Color');
    expect(copy.required).toBe(true);
    expect(copy.presets).toEqual(['indigo', 'red']);
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new ColorPresetField('brandColor', 10).withDefaultValue('indigo');
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.default).toBe('indigo');
  });
});
