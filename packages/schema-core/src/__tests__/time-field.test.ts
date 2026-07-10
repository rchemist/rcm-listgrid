import { describe, expect, it } from 'vitest';
import type { FieldEvalContext, FieldValueSlice } from '../index';
import { TimeField } from '../field/time-field';

// EA-A fan-out — TimeField (PART 2 §Time). Transplant oracle for
// `TimeField.tsx:13-59` + inlined `AbstractDateField.tsx:13-83` builders.
// The old instance `getCurrentValue()` 'now'-sentinel override is
// deliberately NOT covered here — per Conductor decision ⑤ it moved to the
// react renderer layer (schema-core has no instance value hook, ADR-0002);
// see `packages/react/src/__tests__/time-field.test.tsx` for that behavior.

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('TimeField construction', () => {
  it('constructor sets type + optional limit/range', () => {
    const f = new TimeField('startTime', 1, { min: '09:00', max: '18:00' }, true);
    expect(f.type).toBe('time');
    expect(f.getName()).toBe('startTime');
    expect(f.getOrder()).toBe(1);
    expect(f.limit).toEqual({ min: '09:00', max: '18:00' });
    expect(f.range).toBe(true);
  });

  it('constructor omits limit/range when not passed', () => {
    const f = new TimeField('startTime', 1);
    expect(f.limit).toBeUndefined();
    expect(f.range).toBeUndefined();
  });
});

describe('TimeField builders (transplant of AbstractDateField.tsx:37-75)', () => {
  it('withRange sets/clears the range flag', () => {
    const f = new TimeField('t', 1).withRange(true);
    expect(f.range).toBe(true);
    f.withRange(undefined);
    expect(f.range).toBeUndefined();
  });

  it('withLimit sets both bounds at once, or clears with undefined', () => {
    const f = new TimeField('t', 1).withLimit({ min: '09:00', max: '18:00' });
    expect(f.limit).toEqual({ min: '09:00', max: '18:00' });
    f.withLimit(undefined);
    expect(f.limit).toBeUndefined();
  });

  it('withMin preserves an existing max; withMax preserves an existing min', () => {
    const f = new TimeField('t', 1).withLimit({ min: '09:00', max: '18:00' });
    f.withMin('10:00');
    expect(f.limit).toEqual({ min: '10:00', max: '18:00' });
    f.withMax('17:00');
    expect(f.limit).toEqual({ min: '10:00', max: '17:00' });
  });

  it('withMin with no prior limit sets only min', () => {
    const f = new TimeField('t', 1).withMin('08:00');
    expect(f.limit).toEqual({ min: '08:00' });
  });

  it('builders are chainable and mutate+return this', () => {
    const f = new TimeField('t', 1);
    const chained = f.withRange(true).withLimit({ min: '09:00' }).withLabel('시작 시각');
    expect(chained).toBe(f);
  });
});

describe('TimeField.validate (inherited FormField base — required-blank only, no limit check)', () => {
  it('required + blank fails with the Korean required message', async () => {
    const f = new TimeField('t', 1).withRequired(true).withLabel('시각');
    const res = await f.validate(ctx({}));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('required + present passes (limit is meta-only, not a validate() rule for Time)', async () => {
    const f = new TimeField('t', 1)
      .withRequired(true)
      .withLabel('시각')
      .withLimit({ min: '09:00', max: '18:00' });
    // deliberately OUTSIDE [min,max] — old TimeField/AbstractDateField never
    // enforced limit at validate() time (only MonthField does); faithful
    // transplant means no new lexicographic check is invented here.
    expect(await f.validate(ctx({ current: '20:00' }))).toEqual([]);
  });

  it('the literal sentinel string "now" is a valid present value (sentinel resolution is renderer-side)', async () => {
    const f = new TimeField('t', 1).withRequired(true).withLabel('시각');
    expect(await f.validate(ctx({ current: 'now' }))).toEqual([]);
  });
});

describe('TimeField.clone (FormField shallow structural copy)', () => {
  it('preserves limit + range on the clone', () => {
    const f = new TimeField('t', 1, { min: '09:00', max: '18:00' }, true).withLabel('시각');
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone.limit).toEqual({ min: '09:00', max: '18:00' });
    expect(clone.range).toBe(true);
    expect(clone.type).toBe('time');
  });

  it('clone(true) preserves the declared value (including the "now" sentinel)', () => {
    const f = new TimeField('t', 1).withDefaultValue('now');
    const clone = f.clone(true);
    expect(clone.value).toEqual({ default: 'now', current: 'now' });
  });
});
