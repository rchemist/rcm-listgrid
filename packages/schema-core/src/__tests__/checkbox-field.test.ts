import { describe, expect, it } from 'vitest';
import { CheckboxField } from '../field/checkbox-field';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValueSlice } from '../field/types';

// EA-A fan-out — CheckboxField (0.3.x
// `src/listgrid/components/fields/CheckboxField.tsx:16-59`). valueShape is
// `string[]` (a checkbox GROUP, not a single boolean) — every assertion here
// exercises the field through its MultiOptionsField base (options-field.ts,
// EA-A0 pre-stage) the same way options-field.test.ts does for a generic
// consumer, plus the Checkbox-specific `combo` layout builder.

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
];

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('CheckboxField construction', () => {
  it('sets type "checkbox"', () => {
    const f = new CheckboxField('flags', 1);
    expect(f.type).toBe('checkbox');
  });

  it('constructor accepts options + limit directly (defensive-copies options)', () => {
    const f = new CheckboxField('flags', 1, options, { min: 1, max: 2 });
    expect(f.options).toEqual(options);
    expect(f.options).not.toBe(options);
    expect(f.limit).toEqual({ min: 1, max: 2 });
  });

  it('constructor with no options/limit leaves both unset', () => {
    const f = new CheckboxField('flags', 1);
    expect(f.options).toBeUndefined();
    expect(f.limit).toBeUndefined();
  });
});

describe('CheckboxField builders (inherited from OptionsField/MultiOptionsField)', () => {
  it('withOptions defensive-copies and withOptions(undefined) clears', () => {
    const f = new CheckboxField('flags', 1).withOptions(options);
    expect(f.options).toEqual(options);
    expect(f.options).not.toBe(options);
    f.withOptions(undefined);
    expect(f.options).toBeUndefined();
  });

  it('withLimit/withMin/withMax compose (transplant of MultipleOptionalField.tsx:223-251)', () => {
    const f = new CheckboxField('flags', 1).withOptions(options).withLimit({ min: 1, max: 3 });
    expect(f.limit).toEqual({ min: 1, max: 3 });
    f.withMin(2);
    expect(f.limit).toEqual({ min: 2, max: 3 });
    f.withMax(5);
    expect(f.limit).toEqual({ min: 2, max: 5 });
  });
});

describe('CheckboxField.withComboType (transplant of OptionalField.withComboType:80-84)', () => {
  it('sets the row/column layout hint', () => {
    const f = new CheckboxField('flags', 1).withComboType({ direction: 'row' });
    expect(f.combo).toEqual({ direction: 'row' });
  });

  it('withComboType(undefined) clears it', () => {
    const f = new CheckboxField('flags', 1).withComboType({ direction: 'row' });
    f.withComboType(undefined);
    expect(f.combo).toBeUndefined();
  });
});

describe('CheckboxField.validate — selected-count check over string[] (pitfall: NOT a boolean field)', () => {
  it('under min fails with the Korean min-count message', async () => {
    const f = new CheckboxField('flags', 1, options, { min: 2 });
    const res = await f.validate(ctx({ current: ['a'] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최소 2개');
  });

  it('over max fails with the Korean max-count message', async () => {
    const f = new CheckboxField('flags', 1, options, { max: 2 });
    const res = await f.validate(ctx({ current: ['a', 'b', 'c'] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최대 2개');
  });

  it('within [min,max] passes', async () => {
    const f = new CheckboxField('flags', 1, options, { min: 1, max: 3 });
    expect(await f.validate(ctx({ current: ['a', 'b'] }))).toEqual([]);
  });

  it('no limit declared → no count check even with an empty selection', async () => {
    const f = new CheckboxField('flags', 1, options);
    expect(await f.validate(ctx({ current: [] }))).toEqual([]);
  });

  it('a base validate() failure (required-blank) short-circuits the limit check', async () => {
    const f = new CheckboxField('flags', 1, options, { min: 1 })
      .withRequired(true)
      .withLabel('플래그');
    const res = await f.validate(ctx({ current: [] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });
});

describe('CheckboxField.clone (FormField.clone shallow structural copy)', () => {
  it('preserves options + limit + combo on the clone', () => {
    const f = new CheckboxField('flags', 1, options, { min: 1, max: 3 }).withComboType({
      direction: 'row',
    });
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone).toBeInstanceOf(CheckboxField);
    expect(clone.options).toEqual(options);
    expect(clone.limit).toEqual({ min: 1, max: 3 });
    expect(clone.combo).toEqual({ direction: 'row' });
  });
});
