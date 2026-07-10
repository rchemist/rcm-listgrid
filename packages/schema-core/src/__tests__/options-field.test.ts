import { describe, expect, it } from 'vitest';
import {
  MultiOptionsField,
  type FieldEvalContext,
  type FieldValueSlice,
  type SelectOption,
} from '../index';

// EA-A0 pre-stage — MINIMAL transplant of 0.3.x
// `abstract/OptionalField.tsx:55-346` (OptionalField + MultipleOptionalField)
// as OptionsField/MultiOptionsField. Concrete fan-out consumers
// (Checkbox/MultiSelect/Tag, EA-A) each declare their own public constructor;
// this test builds a minimal concrete subclass to exercise the shared base.

class TestTagsField extends MultiOptionsField<string[]> {
  constructor(name: string, order: number) {
    super(name, order, 'multiselect');
  }
}

const options: SelectOption[] = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
];

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('OptionsField.withOptions (transplant of OptionalField.tsx:86-90)', () => {
  it('defensive-copies the options array (not aliased)', () => {
    const f = new TestTagsField('tags', 1).withOptions(options);
    expect(f.options).toEqual(options);
    expect(f.options).not.toBe(options);
  });

  it('withOptions(undefined) clears', () => {
    const f = new TestTagsField('tags', 1).withOptions(options).withOptions(undefined);
    expect(f.options).toBeUndefined();
  });
});

describe('MultiOptionsField limit builders (transplant of OptionalField.tsx:223-251)', () => {
  it('withLimit sets both bounds at once', () => {
    const f = new TestTagsField('tags', 1).withLimit({ min: 1, max: 3 });
    expect(f.limit).toEqual({ min: 1, max: 3 });
  });

  it('withMin preserves an existing max; withMax preserves an existing min', () => {
    const f = new TestTagsField('tags', 1).withLimit({ min: 1, max: 3 });
    f.withMin(2);
    expect(f.limit).toEqual({ min: 2, max: 3 });
    f.withMax(5);
    expect(f.limit).toEqual({ min: 2, max: 5 });
  });
});

describe('MultiOptionsField.validate — selected-count check (transplant of OptionalField.tsx:281-345)', () => {
  it('under min fails with the Korean min-count message', async () => {
    const f = new TestTagsField('tags', 1).withOptions(options).withLimit({ min: 2 });
    const res = await f.validate(ctx({ current: ['a'] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최소 2개');
  });

  it('over max fails with the Korean max-count message', async () => {
    const f = new TestTagsField('tags', 1).withOptions(options).withLimit({ max: 2 });
    const res = await f.validate(ctx({ current: ['a', 'b', 'c'] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최대 2개');
  });

  it('within [min,max] passes', async () => {
    const f = new TestTagsField('tags', 1).withOptions(options).withLimit({ min: 1, max: 3 });
    expect(await f.validate(ctx({ current: ['a', 'b'] }))).toEqual([]);
  });

  it('no limit declared → no count check', async () => {
    const f = new TestTagsField('tags', 1).withOptions(options);
    expect(await f.validate(ctx({ current: [] }))).toEqual([]);
  });

  it('a base validate() failure (required-blank) short-circuits the limit check', async () => {
    const f = new TestTagsField('tags', 1)
      .withRequired(true)
      .withLabel('태그')
      .withLimit({ min: 1 });
    const res = await f.validate(ctx({ current: [] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });
});

describe('clone (FormField.clone shallow structural copy)', () => {
  it('preserves options + limit on the clone', () => {
    const f = new TestTagsField('tags', 1).withOptions(options).withLimit({ min: 1, max: 3 });
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone.options).toEqual(options);
    expect(clone.limit).toEqual({ min: 1, max: 3 });
  });
});
