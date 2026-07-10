import { describe, expect, it } from 'vitest';
import type { FieldEvalContext, FieldValueSlice } from '../index';
// ColorField itself is imported directly from its declaring module rather
// than the package barrel: index.ts export wiring is the orchestrator's job
// (manifest-driven fan-out), not this agent's — task hard rules ("Do NOT
// edit ... index.ts").
import { ColorField } from '../field/color-field';

// EA-B fan-out — transplant oracle for 0.3.x
// `src/listgrid/components/fields/ColorField.tsx:9-37` as pure meta
// (charter C4). The old class declares NO extra properties, NO withXxx
// builders, and NO validate() override (renderer-only field — hex color
// string) — so this class is FormField-direct with only the constructor
// setting type='color', and these tests cover: builder-chain compatibility
// (inherited FormField withXxx), base validate() (required-blank + declared
// validations, unchanged from FormField), and clone (no extra fields to
// preserve beyond what FormField.clone already handles).

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('ColorField construction (transplant of ColorField.tsx:9-12)', () => {
  it('sets type + name + order', () => {
    const f = new ColorField('brandColor', 3);
    expect(f.type).toBe('color');
    expect(f.getName()).toBe('brandColor');
    expect(f.getOrder()).toBe(3);
  });

  it('has no builders beyond the inherited FormField withXxx grammar (old class had none)', () => {
    const f = new ColorField('brandColor', 3);
    expect((f as unknown as Record<string, unknown>).withOptions).toBeUndefined();
    expect((f as unknown as Record<string, unknown>).withMultiple).toBeUndefined();
  });

  it('inherited withLabel/withRequired/withDefaultValue chain normally', () => {
    const f = new ColorField('brandColor', 3)
      .withLabel('Brand Color')
      .withRequired(true)
      .withDefaultValue('#ffffff');
    expect(f.getLabel()).toBe('Brand Color');
    expect(f.required).toBe(true);
    expect(f.value?.default).toBe('#ffffff');
  });
});

describe('ColorField.validate — base FormField behavior (old class has no override)', () => {
  it('required + blank fails with the required message', async () => {
    const f = new ColorField('brandColor', 3).withRequired(true).withLabel('Brand Color');
    const res = await f.validate(ctx({ current: '' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('a hex value passes with no declared validations', async () => {
    const f = new ColorField('brandColor', 3).withRequired(true);
    expect(await f.validate(ctx({ current: '#fa5252' }))).toEqual([]);
  });

  it('not required + blank passes (no implicit format check)', async () => {
    const f = new ColorField('brandColor', 3);
    expect(await f.validate(ctx({ current: undefined }))).toEqual([]);
  });
});

describe('ColorField.clone (FormField.clone shallow structural copy)', () => {
  it('preserves type + label on the clone (no extra fields to lose — old class declares none)', () => {
    const f = new ColorField('brandColor', 3).withLabel('Brand Color').withRequired(true);
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone.type).toBe('color');
    expect(clone.getLabel()).toBe('Brand Color');
    expect(clone.required).toBe(true);
  });

  it('drops the runtime value unless includeValue is passed', () => {
    const f = new ColorField('brandColor', 3).withValue('#12b886');
    expect(f.clone().value).toBeUndefined();
    expect(f.clone(true).value?.current).toBe('#12b886');
  });
});
