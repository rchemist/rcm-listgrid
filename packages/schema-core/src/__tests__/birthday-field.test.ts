import { describe, expect, it } from 'vitest';
import type { FieldEvalContext, FieldValueSlice } from '../index';
import { BirthdayField } from '../field/birthday-field';

// EA-B fan-out — BirthdayField (ea-b-scout-briefing.md PART C §Birthday).
// Transplant oracle for `BirthdayField.tsx:229-298`. The date-shape
// validation (`validateDate`) is deliberately NOT covered here — per the
// briefing there is no entityForm-level validate hook for it; that logic
// lives renderer-side (`packages/react/src/__tests__/birthday-field.test.tsx`).

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('BirthdayField construction', () => {
  it('constructor sets type + default includeHyphen=false', () => {
    const f = new BirthdayField('birthDate', 1);
    expect(f.type).toBe('birthday');
    expect(f.getName()).toBe('birthDate');
    expect(f.getOrder()).toBe(1);
    expect(f.includeHyphen).toBe(false);
  });

  it('constructor accepts includeHyphen=true', () => {
    const f = new BirthdayField('birthDate', 1, true);
    expect(f.includeHyphen).toBe(true);
  });

  it('constructor sets the transplanted default helpText, overridable via withHelpText', () => {
    const f = new BirthdayField('birthDate', 1);
    expect(f.helpText).toBe('생년월일 8자리를 입력해 주세요 (예: 19900101)');
    f.withHelpText('custom help');
    expect(f.helpText).toBe('custom help');
  });
});

describe('BirthdayField.withIncludeHyphen', () => {
  it('sets includeHyphen and returns this (chainable)', () => {
    const f = new BirthdayField('birthDate', 1);
    const chained = f.withIncludeHyphen(true);
    expect(f.includeHyphen).toBe(true);
    expect(chained).toBe(f);
  });

  it('can flip includeHyphen back to false', () => {
    const f = new BirthdayField('birthDate', 1, true).withIncludeHyphen(false);
    expect(f.includeHyphen).toBe(false);
  });
});

describe('BirthdayField.validate (inherited FormField base — required-blank only, no date-shape check)', () => {
  it('required + blank fails with the Korean required message', async () => {
    const f = new BirthdayField('birthDate', 1).withRequired(true).withLabel('생년월일');
    const res = await f.validate(ctx({}));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
  });

  it('required + present (even a malformed date string) passes — no entityForm-level date check', async () => {
    const f = new BirthdayField('birthDate', 1).withRequired(true).withLabel('생년월일');
    expect(await f.validate(ctx({ current: 'not-a-date' }))).toEqual([]);
  });

  it('not required + blank passes', async () => {
    const f = new BirthdayField('birthDate', 1);
    expect(await f.validate(ctx({}))).toEqual([]);
  });
});

describe('BirthdayField.clone (FormField shallow structural copy)', () => {
  it('preserves includeHyphen + type on the clone', () => {
    const f = new BirthdayField('birthDate', 1, true).withLabel('생년월일');
    const clone = f.clone();
    expect(clone).not.toBe(f);
    expect(clone.includeHyphen).toBe(true);
    expect(clone.type).toBe('birthday');
    expect(clone.label).toBe('생년월일');
  });

  it('clone(true) preserves the declared value', () => {
    const f = new BirthdayField('birthDate', 1).withDefaultValue('19900101');
    const clone = f.clone(true);
    expect(clone.value).toEqual({ default: '19900101', current: '19900101' });
  });

  it('clone(false) (default) drops the declared value', () => {
    const f = new BirthdayField('birthDate', 1).withDefaultValue('19900101');
    const clone = f.clone();
    expect(clone.value).toBeUndefined();
  });
});
