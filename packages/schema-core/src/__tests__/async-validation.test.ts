import { describe, expect, it, vi } from 'vitest';
import {
  AsyncValidation,
  StringField,
  ValidateResult,
  ValidationItem,
  type FieldEvalContext,
} from '../index';

// W4-3 (spec §5.3, CAP-05) — AsyncValidation's schema-core contract: a
// ValidationItem subclass (C5 single channel — no dedicated field class),
// neutral in the SYNC validate()/validateAll() flow (real determination is
// the store's job, @listgrid/state), option defaults, and withValidations()
// carrying it exactly like every other concrete Validation.

const ctx = (renderType: FieldEvalContext['renderType'] = 'create'): FieldEvalContext => ({
  renderType,
});

describe('AsyncValidation', () => {
  it('is a ValidationItem subclass', () => {
    const v = new AsyncValidation(async () => ValidateResult.success());
    expect(v).toBeInstanceOf(ValidationItem);
  });

  it('defaults: trigger "change", buttonLabel "확인", debounceMs 300', () => {
    const v = new AsyncValidation(async () => ValidateResult.success());
    expect(v.trigger).toBe('change');
    expect(v.buttonLabel).toBe('확인');
    expect(v.debounceMs).toBe(300);
  });

  it('opts override every default', () => {
    const v = new AsyncValidation(async () => ValidateResult.success(), {
      trigger: 'button',
      buttonLabel: '중복확인',
      debounceMs: 500,
    });
    expect(v.trigger).toBe('button');
    expect(v.buttonLabel).toBe('중복확인');
    expect(v.debounceMs).toBe(500);
  });

  it('exposes the wrapped check function unchanged (identity), for the store to invoke directly', () => {
    const check = vi.fn(async () => ValidateResult.success());
    const v = new AsyncValidation(check);
    expect(v.check).toBe(check);
  });

  it('validate() (the sync ValidationItem channel) is ALWAYS neutral — never invokes `check`, even when `check` would fail', async () => {
    const check = vi.fn(async () => ValidateResult.fail('중복된 값입니다'));
    const v = new AsyncValidation(check);

    const result = await v.validate(ctx(), { current: 'anything' });

    expect(result.hasError()).toBe(false);
    expect(check).not.toHaveBeenCalled();
  });

  it('validate() stays neutral regardless of the value/message args passed', async () => {
    const v = new AsyncValidation(async () => ValidateResult.fail('x'));
    expect((await v.validate(ctx(), undefined)).hasError()).toBe(false);
    expect((await v.validate(ctx(), { current: '' }, 'custom message')).hasError()).toBe(false);
  });

  it('rides withValidations() like any other Validation — no dedicated field class needed (C5)', () => {
    const v = new AsyncValidation(async () => ValidateResult.success());
    const field = new StringField('alias', 1).withValidations(v);
    expect(field.validations).toEqual([v]);
  });

  it('does not weaken the existing sync validateAll flow — a required+blank field still fails on required-blank, an AsyncValidation attached alongside contributes nothing (neutral)', async () => {
    const v = new AsyncValidation(async () => ValidateResult.fail('taken'));
    const field = new StringField('alias', 1).withRequired(true).withValidations(v);

    const results = await field.validate({ renderType: 'create' });

    expect(results).toHaveLength(1);
    expect(results[0]?.message).toMatch(/필수/);
  });

  it('a non-blank, non-required field with only an AsyncValidation passes the sync flow (neutral contributes zero failing results, even though `check` would fail this value)', async () => {
    const v = new AsyncValidation(async () => ValidateResult.fail('taken'));
    const field = new StringField('alias', 1).withValidations(v);

    const results = await field.validate({
      renderType: 'create',
      value: { current: 'anything' },
    });

    expect(results).toHaveLength(0);
  });
});
