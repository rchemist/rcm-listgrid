import { describe, expect, it } from 'vitest';
import type { FieldEvalContext, FieldValueSlice } from '../index';
import { DatetimeField } from '../field/datetime-field';

// EA-B fan-out — DatetimeField (PART C §Datetime). Transplant oracle for
// `DatetimeField.tsx:22-131` + inlined `AbstractDateField.tsx:13-83`
// builders (Time precedent: single consumer, no shared base).
// The old instance `getCurrentValue()` 'today'-sentinel override is
// deliberately NOT covered here — per Conductor decision ⑦ it moved to the
// react renderer layer (schema-core has no instance value hook, ADR-0002);
// see `packages/react/src/__tests__/datetime-field.test.tsx` for that
// behavior.

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('DatetimeField construction', () => {
  it('constructor sets type + optional limit/range', () => {
    const f = new DatetimeField(
      'startAt',
      1,
      { min: '2026-01-01T00:00', max: '2026-12-31T23:59' },
      true,
    );
    expect(f.type).toBe('datetime');
    expect(f.getName()).toBe('startAt');
    expect(f.getOrder()).toBe(1);
    expect(f.limit).toEqual({ min: '2026-01-01T00:00', max: '2026-12-31T23:59' });
    expect(f.range).toBe(true);
  });

  it('constructor omits limit/range when not passed', () => {
    const f = new DatetimeField('startAt', 1);
    expect(f.limit).toBeUndefined();
    expect(f.range).toBeUndefined();
  });
});

describe('DatetimeField builders (transplant of AbstractDateField.tsx:37-75)', () => {
  it('withRange sets/clears the range flag', () => {
    const f = new DatetimeField('t', 1).withRange(true);
    expect(f.range).toBe(true);
    f.withRange(undefined);
    expect(f.range).toBeUndefined();
  });

  it('withLimit sets both bounds at once, or clears with undefined', () => {
    const f = new DatetimeField('t', 1).withLimit({
      min: '2026-01-01T00:00',
      max: '2026-12-31T23:59',
    });
    expect(f.limit).toEqual({ min: '2026-01-01T00:00', max: '2026-12-31T23:59' });
    f.withLimit(undefined);
    expect(f.limit).toBeUndefined();
  });

  it('withMin preserves an existing max; withMax preserves an existing min', () => {
    const f = new DatetimeField('t', 1).withLimit({
      min: '2026-01-01T00:00',
      max: '2026-12-31T23:59',
    });
    f.withMin('2026-02-01T00:00');
    expect(f.limit).toEqual({ min: '2026-02-01T00:00', max: '2026-12-31T23:59' });
    f.withMax('2026-11-30T23:59');
    expect(f.limit).toEqual({ min: '2026-02-01T00:00', max: '2026-11-30T23:59' });
  });

  it('withMin with no prior limit sets only min', () => {
    const f = new DatetimeField('t', 1).withMin('2026-01-01T00:00');
    expect(f.limit).toEqual({ min: '2026-01-01T00:00' });
  });

  it('builders are chainable and mutate+return this', () => {
    const f = new DatetimeField('t', 1);
    const chained = f.withRange(true).withLimit({ min: '2026-01-01T00:00' }).withLabel('시작 일시');
    expect(chained).toBe(f);
  });
});

describe('DatetimeField.validate (inherited FormField base — required-blank only, no limit check)', () => {
  it('required + blank fails with the Korean required message', async () => {
    const f = new DatetimeField('t', 1).withRequired(true).withLabel('일시');
    const res = await f.validate(ctx({}));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('required + present passes (limit is meta-only, not a validate() rule for Datetime)', async () => {
    const f = new DatetimeField('t', 1)
      .withRequired(true)
      .withLabel('일시')
      .withLimit({ min: '2026-01-01T00:00', max: '2026-12-31T23:59' });
    // deliberately OUTSIDE [min,max] — old DatetimeField/AbstractDateField never
    // enforced limit at validate() time (only MonthField does); faithful
    // transplant means no new lexicographic check is invented here.
    expect(await f.validate(ctx({ current: '2027-01-01T00:00' }))).toEqual([]);
  });

  it('the literal sentinel string "today" is a valid present value (sentinel resolution is renderer-side)', async () => {
    const f = new DatetimeField('t', 1).withRequired(true).withLabel('일시');
    expect(await f.validate(ctx({ current: 'today' }))).toEqual([]);
  });
});

describe('DatetimeField.clone (FormField shallow structural copy)', () => {
  it('preserves limit + range on the clone', () => {
    const f = new DatetimeField(
      't',
      1,
      { min: '2026-01-01T00:00', max: '2026-12-31T23:59' },
      true,
    ).withLabel('일시');
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone.limit).toEqual({ min: '2026-01-01T00:00', max: '2026-12-31T23:59' });
    expect(clone.range).toBe(true);
    expect(clone.type).toBe('datetime');
  });

  it('clone(true) preserves the declared value (including the "today" sentinel)', () => {
    const f = new DatetimeField('t', 1).withDefaultValue('today');
    const clone = f.clone(true);
    expect(clone.value).toEqual({ default: 'today', current: 'today' });
  });
});
