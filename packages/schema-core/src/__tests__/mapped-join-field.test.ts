import { describe, expect, it } from 'vitest';
import { MappedJoinField } from '../field/mapped-join-field';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValueSlice } from '../field/types';

// MappedJoin (0.3.x MappedJoinField.tsx:7-41) — a join-key carrier with no
// builders of its own. The one field-specific behavior worth locking is the
// unconditional isHidden() override (conductor decision ⑥) and its knock-on
// effect on validate() (FormField.validate short-circuits hidden fields —
// form-field.ts:110-112) — a MappedJoin field can never fail validation no
// matter what `withRequired`/value state is declared on it.

const ctx = (
  value?: FieldValueSlice,
  renderType: 'create' | 'update' = 'create',
): FieldEvalContext => ({
  renderType,
  ...(value !== undefined ? { value } : {}),
});

describe('MappedJoinField construction', () => {
  it('takes (name, order), type is mappedJoin', () => {
    const f = new MappedJoinField('collegeId', 10);
    expect(f.getName()).toBe('collegeId');
    expect(f.getOrder()).toBe(10);
    expect(f.type).toBe('mappedJoin');
  });

  it('has no declared label by default (falls back to name, like any FormField)', () => {
    const f = new MappedJoinField('collegeId', 10);
    expect(f.getLabel()).toBe('collegeId');
  });
});

describe('MappedJoinField.isHidden — unconditional override (transplant of :38-40)', () => {
  it('is always hidden, independent of any withHidden(...) declaration', async () => {
    const f = new MappedJoinField('collegeId', 10);
    expect(await f.isHidden(ctx())).toBe(true);
  });

  it('stays hidden even when withHidden(false) is explicitly declared', async () => {
    const f = new MappedJoinField('collegeId', 10).withHidden(false);
    expect(await f.isHidden(ctx())).toBe(true);
  });

  it('stays hidden across create and update render types', async () => {
    const f = new MappedJoinField('collegeId', 10);
    expect(await f.isHidden(ctx(undefined, 'create'))).toBe(true);
    expect(await f.isHidden(ctx(undefined, 'update'))).toBe(true);
  });
});

describe('MappedJoinField.validate — hidden short-circuit (form-field.ts:110-112)', () => {
  it('never fails required-blank validation, even when required + blank', async () => {
    const f = new MappedJoinField('collegeId', 10).withRequired(true);
    const result = await f.validate(ctx({ current: '' }));
    expect(result).toEqual([]);
  });

  it('never fails required-blank validation, even when value is undefined', async () => {
    const f = new MappedJoinField('collegeId', 10).withRequired(true);
    const result = await f.validate(ctx());
    expect(result).toEqual([]);
  });
});

describe('MappedJoinField.clone', () => {
  it('produces an independent copy preserving name/order/type', () => {
    const original = new MappedJoinField('collegeId', 10).withLabel('College').withRequired(true);
    const copy = original.clone();

    expect(copy).not.toBe(original);
    expect(copy.getName()).toBe('collegeId');
    expect(copy.getOrder()).toBe(10);
    expect(copy.type).toBe('mappedJoin');
    expect(copy.getLabel()).toBe('College');
    expect(copy.required).toBe(true);
  });

  it('the clone is still unconditionally hidden (override survives Object.create-based clone)', async () => {
    const copy = new MappedJoinField('collegeId', 10).clone();
    expect(await copy.isHidden(ctx())).toBe(true);
  });

  it('drops the value unless includeValue is passed (FormField.clone contract)', () => {
    const original = new MappedJoinField('collegeId', 10).withDefaultValue('c-100');
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value).toEqual({ default: 'c-100', current: 'c-100' });
  });
});
