import { describe, expect, it } from 'vitest';
import type { FieldEvalContext, FieldValueSlice } from '../index';
import { TelephoneNumberValidation } from '../index';
import { TelephoneNumberField } from '../field/telephone-number-field';

// EA-B fan-out — TelephoneNumberField (ea-b-scout-briefing.md PART C
// §TelephoneNumber). Transplant oracle for
// `TelephoneNumberField.tsx:107-115`'s ctor semantics. The rendering/
// formatting instance methods (renderInstance, getDisplayValue,
// getSaveValue, renderListItemInstance) are NOT covered here — they moved
// to the react renderer layer (schema-core has no instance value hook,
// ADR-0002); see `packages/react/src/__tests__/telephone-number-field.test.tsx`.

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('TelephoneNumberField construction', () => {
  it('constructor sets type, name, order', () => {
    const f = new TelephoneNumberField('phone', 1);
    expect(f.type).toBe('telephoneNumber');
    expect(f.getName()).toBe('phone');
    expect(f.getOrder()).toBe(1);
  });

  it('constructor leaves validations undefined when not passed (faithful transplant of the old ctor — no auto-attach, unlike EmailField/PhoneNumberField)', () => {
    const f = new TelephoneNumberField('phone', 1);
    expect(f.validations).toBeUndefined();
  });

  it('constructor assigns validations when explicitly passed', () => {
    const validation = new TelephoneNumberValidation();
    const f = new TelephoneNumberField('phone', 1, [validation]);
    expect(f.validations).toEqual([validation]);
  });
});

describe('TelephoneNumberField builders (inherited FormField)', () => {
  it('withValidations overrides the ctor-time validations array', () => {
    const f = new TelephoneNumberField('phone', 1, [new TelephoneNumberValidation()]);
    const replacement = new TelephoneNumberValidation('custom', undefined, 'custom message');
    f.withValidations(replacement);
    expect(f.validations).toEqual([replacement]);
  });

  it('builders are chainable and mutate+return this', () => {
    const f = new TelephoneNumberField('phone', 1);
    const chained = f.withLabel('전화번호').withRequired(true);
    expect(chained).toBe(f);
  });
});

describe('TelephoneNumberField.validate (inherited FormField base + TelephoneNumberValidation when attached)', () => {
  it('required + blank fails with the Korean required message', async () => {
    const f = new TelephoneNumberField('phone', 1).withRequired(true).withLabel('전화번호');
    const res = await f.validate(ctx({}));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('required + present passes when no format validation is attached', async () => {
    const f = new TelephoneNumberField('phone', 1).withRequired(true).withLabel('전화번호');
    expect(await f.validate(ctx({ current: '01012345678' }))).toEqual([]);
  });

  it('with TelephoneNumberValidation attached, an invalid digits-only value fails format validation', async () => {
    const f = new TelephoneNumberField('phone', 1, [new TelephoneNumberValidation()]);
    const res = await f.validate(ctx({ current: '123' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('전화번호 형식이 올바르지 않습니다');
  });

  it('with TelephoneNumberValidation attached, a valid digits-only value passes', async () => {
    const f = new TelephoneNumberField('phone', 1, [new TelephoneNumberValidation()]);
    expect(await f.validate(ctx({ current: '01012345678' }))).toEqual([]);
  });

  it('with TelephoneNumberValidation attached, an empty value passes (required handled separately)', async () => {
    const f = new TelephoneNumberField('phone', 1, [new TelephoneNumberValidation()]);
    expect(await f.validate(ctx({ current: '' }))).toEqual([]);
  });
});

describe('TelephoneNumberField.clone (FormField shallow structural copy)', () => {
  it('preserves type + validations on the clone', () => {
    const validation = new TelephoneNumberValidation();
    const f = new TelephoneNumberField('phone', 1, [validation]).withLabel('전화번호');
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone.type).toBe('telephoneNumber');
    expect(clone.validations).toEqual([validation]);
    // validations array itself is a fresh copy (FormField.clone:219)
    expect(clone.validations).not.toBe(f.validations);
  });

  it('clone(true) preserves the declared digits-only value', () => {
    const f = new TelephoneNumberField('phone', 1).withDefaultValue('01012345678');
    const clone = f.clone(true);
    expect(clone.value).toEqual({ default: '01012345678', current: '01012345678' });
  });

  it('clone() without includeValue drops the value', () => {
    const f = new TelephoneNumberField('phone', 1).withDefaultValue('01012345678');
    const clone = f.clone();
    expect(clone.value).toBeUndefined();
  });
});
