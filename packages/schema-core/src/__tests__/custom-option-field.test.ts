import { describe, expect, it } from 'vitest';
import { CustomOptionField } from '../field/custom-option-field';
import { isDirty } from '../field/value';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValueSlice, SelectOption } from '../index';

// EA-B fan-out — CustomOptionField (0.3.x
// `src/listgrid/components/fields/CustomOptionField.tsx:34-210`,
// re-verified against source 2026-07-11). base: OptionsField (NOT
// MultiOptionsField — 0.3.x CustomOptionField has no min/max-selected-count
// validate override), so these tests exercise construction/builders/clone +
// the alias-fetch-free base validate(), plus the EA-B1 array-dirty
// regression this field also benefits from (briefing PART B closing note).

const options: SelectOption[] = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('CustomOptionField construction', () => {
  it('sets type "customOption"', () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR');
    expect(f.type).toBe('customOption');
  });

  it('carries the alias from the constructor', () => {
    const f = new CustomOptionField('favoriteColor', 1, ' FAVORITE_COLOR ');
    expect(f.alias).toBe(' FAVORITE_COLOR ');
  });

  it('defaults multiple to false when omitted (transplant of CustomOptionField.tsx:43)', () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR');
    expect(f.multiple).toBe(false);
  });

  it('honors an explicit multiple=true', () => {
    const f = new CustomOptionField('favoriteColors', 1, 'FAVORITE_COLOR', true);
    expect(f.multiple).toBe(true);
  });

  it('defaults layout to "half" (transplant of CustomOptionField.tsx:44)', () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR');
    expect(f.layout).toBe('half');
  });

  it('starts with no declared options (fetch happens renderer-side, not here)', () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR');
    expect(f.options).toBeUndefined();
  });
});

describe('CustomOptionField builders', () => {
  it('withOptions (inherited from OptionsField) defensive-copies and clears on undefined', () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR').withOptions(options);
    expect(f.options).toEqual(options);
    expect(f.options).not.toBe(options);
    f.withOptions(undefined);
    expect(f.options).toBeUndefined();
  });

  it('withMultiple sets multiple; called with no argument sets it to undefined (0.3.x parity, CustomOptionField.tsx:176-179)', () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR').withMultiple(true);
    expect(f.multiple).toBe(true);
    f.withMultiple();
    expect(f.multiple).toBeUndefined();
  });

  it('withComboType sets/clears combo (carried but renderer-unread, 2-branch descope)', () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR').withComboType({
      direction: 'row',
    });
    expect(f.combo).toEqual({ direction: 'row' });
    f.withComboType(undefined);
    expect(f.combo).toBeUndefined();
  });

  it('withLayout overrides the ctor default', () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR').withLayout('full');
    expect(f.layout).toBe('full');
  });
});

describe('CustomOptionField.validate (base FormField.validate — no min/max-count override, unlike MultiOptionsField consumers)', () => {
  it('required + blank fails with the Korean required message', async () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR')
      .withRequired(true)
      .withLabel('선호색');
    const res = await f.validate(ctx({ current: undefined }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('required + a selected value passes', async () => {
    const f = new CustomOptionField('favoriteColor', 1, 'FAVORITE_COLOR').withRequired(true);
    expect(await f.validate(ctx({ current: 'a' }))).toEqual([]);
  });

  it('multiple=true + required + empty array fails required-blank (isBlank treats [] as blank)', async () => {
    const f = new CustomOptionField('favoriteColors', 1, 'FAVORITE_COLOR', true)
      .withRequired(true)
      .withLabel('선호색');
    const res = await f.validate(ctx({ current: [] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('not required + no value passes (no min/max-count machinery to fail it, unlike Checkbox/MultiSelect)', async () => {
    const f = new CustomOptionField('favoriteColors', 1, 'FAVORITE_COLOR', true);
    expect(await f.validate(ctx({ current: [] }))).toEqual([]);
  });
});

describe('CustomOptionField.clone (FormField.clone shallow structural copy)', () => {
  it('preserves alias/multiple/combo/layout on the clone', () => {
    const f = new CustomOptionField('favoriteColors', 1, 'FAVORITE_COLOR', true)
      .withOptions(options)
      .withComboType({ direction: 'row' })
      .withLayout('full');
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone).toBeInstanceOf(CustomOptionField);
    expect(clone.alias).toBe('FAVORITE_COLOR');
    expect(clone.multiple).toBe(true);
    expect(clone.options).toEqual(options);
    expect(clone.combo).toEqual({ direction: 'row' });
    expect(clone.layout).toBe('full');
  });
});

describe('CustomOptionField-multiple isDirty (EA-B1 regression — value.ts normalizeEmptyValue, briefing PART B closing note)', () => {
  it('current=[] with no declared default is NOT dirty (empty array normalizes to "empty", matching 0.3.x isDirty:189-199)', () => {
    const slice: FieldValueSlice = { current: [] };
    expect(isDirty(slice)).toBe(false);
  });

  it('a non-empty current array with no fetched/default IS dirty', () => {
    const slice: FieldValueSlice = { current: ['a'] };
    expect(isDirty(slice)).toBe(true);
  });

  it('update mode: current=[] equal to fetched=[] is NOT dirty', () => {
    const slice: FieldValueSlice = { fetched: [], current: [] };
    expect(isDirty(slice)).toBe(false);
  });

  it('update mode: current diverges from a non-empty fetched IS dirty', () => {
    const slice: FieldValueSlice = { fetched: ['a'], current: ['a', 'b'] };
    expect(isDirty(slice)).toBe(true);
  });
});
