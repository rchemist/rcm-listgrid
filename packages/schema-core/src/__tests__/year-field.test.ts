import { describe, expect, it } from 'vitest';
import { YearField } from '../field/year-field';
import type { FieldEvalContext } from '../field/eval-context';

// Transplant oracle for YearField (EA-A, PART 2 §Year). Locks the eager
// min/max default-computation quirk (constructor + withLimit BOTH recompute
// eagerly against `new Date().getFullYear()`, not lazily) — the briefing's
// named pitfall: "그대로 이식, lazy로 고치지 말 것".

const currentYear = new Date().getFullYear();

const ctx = (value: FieldEvalContext['value'], renderType: 'create' | 'update' = 'create') => ({
  renderType,
  value,
});

describe('YearField construction (0.3.x YearField.tsx:14-26)', () => {
  it('type discriminant is "year"', () => {
    const f = new YearField('graduationYear', 1);
    expect(f.type).toBe('year');
  });

  it('defaults limit to min=1900, max=current year when no limit passed', () => {
    const f = new YearField('graduationYear', 1);
    expect(f.limit).toEqual({ min: 1900, max: currentYear });
  });

  it('a partial limit fills only the missing side with the default', () => {
    const f = new YearField('graduationYear', 1, { min: 2000 });
    expect(f.limit).toEqual({ min: 2000, max: currentYear });

    const g = new YearField('graduationYear', 1, { max: 2020 });
    expect(g.limit).toEqual({ min: 1900, max: 2020 });
  });

  it('a fully-specified limit is respected verbatim', () => {
    const f = new YearField('graduationYear', 1, { min: 1950, max: 2010 });
    expect(f.limit).toEqual({ min: 1950, max: 2010 });
  });
});

describe('YearField.withLimit (0.3.x YearField.tsx:121-129 — eager recompute)', () => {
  it('sets a fully-specified limit', () => {
    const f = new YearField('y', 1).withLimit({ min: 1990, max: 2005 });
    expect(f.limit).toEqual({ min: 1990, max: 2005 });
  });

  it('PITFALL: calling withLimit() with no args RESETS to the eager default, discarding a prior custom limit (not a no-op merge)', () => {
    const f = new YearField('y', 1).withLimit({ min: 1950, max: 1960 });
    expect(f.limit).toEqual({ min: 1950, max: 1960 });
    f.withLimit();
    expect(f.limit).toEqual({ min: 1900, max: currentYear });
  });

  it('is chainable and returns `this`', () => {
    const f = new YearField('y', 1);
    expect(f.withLimit({ min: 2000 })).toBe(f);
  });
});

describe('YearField.validate (base FormField.validate — no field-specific override)', () => {
  it('required + blank -> one failure', async () => {
    const f = new YearField('graduationYear', 1).withRequired(true).withLabel('졸업년도');
    const res = await f.validate(ctx({ current: '' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('required + filled -> valid', async () => {
    const f = new YearField('graduationYear', 1).withRequired(true);
    expect(await f.validate(ctx({ current: '2020' }))).toEqual([]);
  });

  it('limit does not itself constrain validate() — it is option-generation-only meta (briefing: "validate: base만")', async () => {
    const f = new YearField('graduationYear', 1, { min: 2000, max: 2010 });
    // a value outside [min,max] still passes base validate; limit only shapes
    // the renderer's SelectBox option range, not a validation rule.
    expect(await f.validate(ctx({ current: '1500' }))).toEqual([]);
  });
});

describe('YearField.clone (FormField.clone structural copy)', () => {
  it('preserves type + limit on a declaration-only clone', () => {
    const f = new YearField('graduationYear', 1, { min: 1950, max: 2010 }).withLabel('졸업년도');
    const c = f.clone();
    expect(c).not.toBe(f);
    expect(c.type).toBe('year');
    expect(c.limit).toEqual({ min: 1950, max: 2010 });
    expect(c.label).toBe('졸업년도');
    expect(c.value).toBeUndefined();
  });

  it('clone(true) preserves the current value', () => {
    const f = new YearField('graduationYear', 1).withValue('1999');
    const c = f.clone(true);
    expect(c.value?.current).toBe('1999');
  });
});
