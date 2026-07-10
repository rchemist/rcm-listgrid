import { describe, expect, it } from 'vitest';
import { MultiSelectField } from '../field/multi-select-field';
import type { FieldEvalContext } from '../field/eval-context';
import type { SelectOption } from '../field/basic-fields';

// MultiSelectField (EA-A fan-out — MultiSelect). Transplant of 0.3.x
// MultiSelectField (src/listgrid/components/fields/MultiSelectField.tsx:37-168),
// minus the status-change trio (conductor decision ④, descoped — see
// multi-select-field.ts header comment). What remains is a MultiOptionsField
// (options + selected-count limit) carrying the dedicated 'multiselect' type
// — these tests lock that shape + the inherited validate()/clone() behavior
// so a future change doesn't silently re-grow the status-change API or break
// the array-valued (never single-Boolean) value contract.

const options: SelectOption[] = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

function ctx(
  value: FieldEvalContext['value'],
  renderType: 'create' | 'update' = 'create',
): FieldEvalContext {
  return { renderType, value };
}

describe('MultiSelectField (builders + construction)', () => {
  it('carries the dedicated multiselect type + name/order', () => {
    const f = new MultiSelectField('colors', 10);
    expect(f.type).toBe('multiselect');
    expect(f.getName()).toBe('colors');
    expect(f.getOrder()).toBe(10);
  });

  it('constructor accepts options + limit positionally (faithful to 0.3.x signature)', () => {
    const f = new MultiSelectField('colors', 10, options, { min: 1, max: 2 });
    expect(f.options).toEqual(options);
    expect(f.limit).toEqual({ min: 1, max: 2 });
  });

  it('defaults to an empty options array when omitted', () => {
    const f = new MultiSelectField('colors', 10);
    expect(f.options).toEqual([]);
    expect(f.limit).toBeUndefined();
  });

  it('inherits MultiOptionsField/OptionsField builders (withOptions/withLimit/withMin/withMax)', () => {
    const f = new MultiSelectField('colors', 10).withOptions(options).withLimit({ min: 1, max: 2 });
    expect(f.options).toEqual(options);
    expect(f.limit).toEqual({ min: 1, max: 2 });

    f.withMin(2);
    expect(f.limit).toEqual({ min: 2, max: 2 });
    f.withMax(3);
    expect(f.limit).toEqual({ min: 2, max: 3 });
  });

  it('inherits base FormField builders (withLabel/withRequired/withDefaultValue chain)', () => {
    const f = new MultiSelectField('colors', 10, options)
      .withLabel('Colors')
      .withRequired(true)
      .withDefaultValue(['red']);
    expect(f.getLabel()).toBe('Colors');
    expect(f.required).toBe(true);
    expect(f.value?.default).toEqual(['red']);
  });

  it('does not carry the descoped status-change trio (conductor decision ④)', () => {
    const f = new MultiSelectField('colors', 10) as unknown as Record<string, unknown>;
    expect('enableImmediateChange' in f).toBe(false);
    expect('reason' in f).toBe(false);
    expect('validateStatusChange' in f).toBe(false);
    expect(typeof (f as { withImmediateChange?: unknown }).withImmediateChange).toBe('undefined');
    expect(typeof (f as { withReason?: unknown }).withReason).toBe('undefined');
    expect(typeof (f as { withValidateStatusChange?: unknown }).withValidateStatusChange).toBe(
      'undefined',
    );
  });
});

describe('MultiSelectField.validate — selected-count check (inherited MultiOptionsField, transplant of OptionalField.tsx:281-345)', () => {
  it('required + blank → one required-blank failure', async () => {
    const f = new MultiSelectField('colors', 10, options).withRequired(true).withLabel('색상');
    const res = await f.validate(ctx({ current: [] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('under min → Korean min-count failure', async () => {
    const f = new MultiSelectField('colors', 10, options, { min: 2 });
    const res = await f.validate(ctx({ current: ['red'] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최소 2개');
  });

  it('over max → Korean max-count failure', async () => {
    const f = new MultiSelectField('colors', 10, options, { max: 2 });
    const res = await f.validate(ctx({ current: ['red', 'green', 'blue'] }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최대 2개');
  });

  it('within [min,max] → valid', async () => {
    const f = new MultiSelectField('colors', 10, options, { min: 1, max: 3 });
    expect(await f.validate(ctx({ current: ['red', 'green'] }))).toEqual([]);
  });

  it('no limit declared → no count check beyond required-blank', async () => {
    const f = new MultiSelectField('colors', 10, options);
    expect(await f.validate(ctx({ current: [] }))).toEqual([]);
  });

  it('hidden/readonly fields skip the required-blank check (base FormField.validate short-circuit)', async () => {
    // NOTE: only the required-blank + declared-validations layer is asserted
    // here — MultiOptionsField.validate (options-field.ts) runs its
    // selected-count check unconditionally against the current value once
    // the base layer passes/short-circuits with []; it does not re-derive
    // hidden/readonly itself. That is inherited shared-base behavior (EA-A0
    // pre-stage), not something this field class overrides — so this
    // assertion deliberately uses fields with no `limit` declared, where the
    // count check is a no-op regardless.
    const hidden = new MultiSelectField('a', 1, options).withRequired(true).withHidden(true);
    expect(await hidden.validate(ctx({ current: [] }))).toEqual([]);
    const readonly = new MultiSelectField('b', 1, options).withRequired(true).withReadOnly(true);
    expect(await readonly.validate(ctx({ current: [] }))).toEqual([]);
  });
});

describe('MultiSelectField.clone', () => {
  it('preserves type/options/limit/label/required across a structural clone', () => {
    const original = new MultiSelectField('colors', 10, options, { min: 1, max: 2 })
      .withLabel('Colors')
      .withRequired(true);
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy.type).toBe('multiselect');
    expect(copy.options).toEqual(options);
    expect(copy.limit).toEqual({ min: 1, max: 2 });
    expect(copy.getLabel()).toBe('Colors');
    expect(copy.required).toBe(true);
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new MultiSelectField('colors', 10, options).withDefaultValue(['red']);
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.default).toEqual(['red']);
  });
});
