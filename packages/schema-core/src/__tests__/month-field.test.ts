import { describe, expect, it } from 'vitest';
import type { FieldEvalContext, FieldValueSlice } from '../index';
// MonthField itself is imported directly from its declaring module rather
// than the package barrel: index.ts export wiring for the 12 EA-A fan-out
// field classes is the orchestrator's job (manifest-driven), not this
// agent's — see task hard rules ("Do NOT edit ... index.ts").
import { MonthField } from '../field/month-field';

// EA-A fan-out — transplant of 0.3.x
// `src/listgrid/components/fields/MonthField.tsx:15-94` as pure meta
// (charter C4). Value is a `YYYY-MM` string; `limit` bounds are compared
// LEXICOGRAPHICALLY (fixed-width YYYY-MM ⇒ string order == chronological
// order) — faithful transplant, not "fixed" into a Date comparison.

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('MonthField construction (transplant of MonthField.tsx:19-22)', () => {
  it('sets type + name + order; no limit by default', () => {
    const f = new MonthField('graduationMonth', 10);
    expect(f.type).toBe('month');
    expect(f.getName()).toBe('graduationMonth');
    expect(f.getOrder()).toBe(10);
    expect(f.limit).toBeUndefined();
  });

  it('accepts a limit via the constructor', () => {
    const f = new MonthField('graduationMonth', 10, { min: '2020-01', max: '2020-12' });
    expect(f.limit).toEqual({ min: '2020-01', max: '2020-12' });
  });
});

describe('MonthField.withLimit (transplant of MonthField.tsx:47-50)', () => {
  it('sets the limit and returns `this` (chainable)', () => {
    const f = new MonthField('graduationMonth', 10);
    const ret = f.withLimit({ min: '2020-01', max: '2020-12' });
    expect(ret).toBe(f);
    expect(f.limit).toEqual({ min: '2020-01', max: '2020-12' });
  });

  it('withLimit(undefined) clears a previously set limit', () => {
    const f = new MonthField('graduationMonth', 10).withLimit({ min: '2020-01' });
    f.withLimit(undefined);
    expect(f.limit).toBeUndefined();
  });
});

describe('MonthField.validate — limit bound check (transplant of MonthField.tsx:52-89)', () => {
  it('below min fails with the Korean min message', async () => {
    const f = new MonthField('graduationMonth', 10, { min: '2020-06' });
    const res = await f.validate(ctx({ current: '2020-01' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최소 2020-06');
  });

  it('above max fails with the Korean max message', async () => {
    const f = new MonthField('graduationMonth', 10, { max: '2020-06' });
    const res = await f.validate(ctx({ current: '2020-12' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('최대 2020-06');
  });

  it('within [min,max] passes', async () => {
    const f = new MonthField('graduationMonth', 10, { min: '2020-01', max: '2020-12' });
    expect(await f.validate(ctx({ current: '2020-06' }))).toEqual([]);
  });

  it('value === min passes (bound is inclusive — `min > value` not `>=`)', async () => {
    const f = new MonthField('graduationMonth', 10, { min: '2020-06' });
    expect(await f.validate(ctx({ current: '2020-06' }))).toEqual([]);
  });

  it('value === max passes (bound is inclusive — `max < value` not `<=`)', async () => {
    const f = new MonthField('graduationMonth', 10, { max: '2020-06' });
    expect(await f.validate(ctx({ current: '2020-06' }))).toEqual([]);
  });

  it(
    'lexicographic comparison — "2020-09" > "2020-10" is TRUE (single-digit-vs-double-digit,' +
      ' month is not zero-padded-safe unless value shape is honored) is faithfully NOT special-cased',
    async () => {
      // "9" > "1" lexicographically even though September < October chronologically
      // ONLY IF the caller passes malformed (non-zero-padded) values — the real
      // YYYY-MM shape ('09' vs '10') keeps string order == chronological order.
      // This test locks the zero-padded (correct) shape behaves correctly.
      const f = new MonthField('graduationMonth', 10, { min: '2020-09' });
      const res = await f.validate(ctx({ current: '2020-10' }));
      expect(res).toEqual([]);
    },
  );

  it('blank value is skipped (no limit check fires)', async () => {
    const f = new MonthField('graduationMonth', 10, { min: '2020-06' });
    expect(await f.validate(ctx({ current: undefined }))).toEqual([]);
  });

  it('no limit declared → no bound check', async () => {
    const f = new MonthField('graduationMonth', 10);
    expect(await f.validate(ctx({ current: '1999-01' }))).toEqual([]);
  });

  it('a base validate() failure (required-blank) short-circuits the limit check', async () => {
    const f = new MonthField('graduationMonth', 10, { min: '2020-06' })
      .withRequired(true)
      .withLabel('졸업월');
    const res = await f.validate(ctx({ current: undefined }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });
});

describe('clone (FormField.clone shallow structural copy)', () => {
  it('preserves limit on the clone', () => {
    const f = new MonthField('graduationMonth', 10, { min: '2020-01', max: '2020-12' });
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone.limit).toEqual({ min: '2020-01', max: '2020-12' });
    expect(clone.type).toBe('month');
  });
});
