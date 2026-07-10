import { describe, expect, it } from 'vitest';
import {
  CustomValidation,
  EmailValidation,
  IpAddressValidation,
  MinMaxNumberValidation,
  PasswordValidation,
  PhoneNumberValidation,
  RegexFormulaValidation,
  RegexValidation,
  StringValidation,
  TelephoneNumberValidation,
  ValidateResult,
  type FieldEvalContext,
} from '../index';

// Characterization suite for the P4 validations-catalog transplant — locks the
// exact check + default-message behavior transplanted from
// src/listgrid/validations/*.ts (0.3.x) so a drift from the original engine
// fails here. See each validation file's header comment for the two
// deliberate deviations (blank passes on MinMaxNumberValidation/
// StringValidation; RegexFormulaValidation is the one validator that still
// fails on blank).

const ctx = (renderType: FieldEvalContext['renderType'] = 'create'): FieldEvalContext => ({
  renderType,
});

describe('EmailValidation', () => {
  it('passes a well-formed email', async () => {
    const v = new EmailValidation();
    const result = await v.validate(ctx(), { current: 'a@b.com' });
    expect(result.hasError()).toBe(false);
  });

  it('fails a malformed email with the default Korean message', async () => {
    const v = new EmailValidation();
    const result = await v.validate(ctx(), { current: 'not-an-email' });
    expect(result.hasError()).toBe(true);
    expect(result.message).toBe('이메일 형식으로 입력해주세요');
  });

  it("blank passes (required-ness is the field's job)", async () => {
    const v = new EmailValidation();
    const result = await v.validate(ctx(), { current: '' });
    expect(result.hasError()).toBe(false);
    const resultUndefined = await v.validate(ctx(), undefined);
    expect(resultUndefined.hasError()).toBe(false);
  });
});

describe('MinMaxNumberValidation', () => {
  it('passes a value within [min,max]', async () => {
    const v = new MinMaxNumberValidation(undefined, { min: 1, max: 10 });
    const result = await v.validate(ctx(), { current: 5 });
    expect(result.hasError()).toBe(false);
  });

  it('fails below min and above max', async () => {
    const v = new MinMaxNumberValidation(undefined, { min: 1, max: 10 });
    expect((await v.validate(ctx(), { current: 0 })).hasError()).toBe(true);
    expect((await v.validate(ctx(), { current: 11 })).hasError()).toBe(true);
  });

  it('a min/max-violating non-blank current value is caught even when fetched/default would pass', async () => {
    const v = new MinMaxNumberValidation(undefined, { min: 1 });
    const result = await v.validate(ctx('update'), { current: 0, fetched: 5, default: 99 });
    expect(result.hasError()).toBe(true);
  });

  it('blank passes (deliberate deviation — see file header)', async () => {
    const v = new MinMaxNumberValidation(undefined, { min: 1, max: 10 });
    const result = await v.validate(ctx(), { current: undefined });
    expect(result.hasError()).toBe(false);
  });

  it('a non-numeric non-blank value fails', async () => {
    const v = new MinMaxNumberValidation(undefined, { min: 1, max: 10 });
    const result = await v.validate(ctx(), { current: 'abc' as unknown as number });
    expect(result.hasError()).toBe(true);
  });
});

describe('RegexValidation', () => {
  it('passes a matching value and fails a non-matching one', async () => {
    const v = new RegexValidation('digits', /^[0-9]+$/, 'digits only');
    expect((await v.validate(ctx(), { current: '12345' })).hasError()).toBe(false);
    const failResult = await v.validate(ctx(), { current: 'abc' });
    expect(failResult.hasError()).toBe(true);
    expect(failResult.message).toBe('digits only');
  });

  it('blank passes', async () => {
    const v = new RegexValidation('digits', /^[0-9]+$/);
    expect((await v.validate(ctx(), { current: '' })).hasError()).toBe(false);
  });
});

describe('RegexFormulaValidation (fails on blank — not "blank passes")', () => {
  it('passes a syntactically valid regex-literal string', async () => {
    const v = new RegexFormulaValidation('formula');
    const result = await v.validate(ctx(), { current: '^[a-z]+$' });
    expect(result.hasError()).toBe(false);
  });

  it('fails a blank value with the default message', async () => {
    const v = new RegexFormulaValidation('formula');
    const result = await v.validate(ctx(), { current: '' });
    expect(result.hasError()).toBe(true);
    expect(result.message).toBe('정규식 문자열을 입력해야 합니다.');
  });

  it('fails a plain string with no regex meta characters', async () => {
    const v = new RegexFormulaValidation('formula');
    const result = await v.validate(ctx(), { current: 'plain' });
    expect(result.hasError()).toBe(true);
  });
});

describe('StringValidation', () => {
  it('passes within bounds', async () => {
    const v = new StringValidation({ length: { min: 2, max: 5 }, id: 'len' });
    expect((await v.validate(ctx(), { current: 'abc' })).hasError()).toBe(false);
  });

  it('fails below min length and above max length', async () => {
    const v = new StringValidation({ length: { min: 2, max: 5 }, id: 'len' });
    const shortResult = await v.validate(ctx(), { current: 'a' });
    expect(shortResult.hasError()).toBe(true);
    expect(shortResult.message).toBe('Minimum length is 2');

    const longResult = await v.validate(ctx(), { current: 'abcdef' });
    expect(longResult.hasError()).toBe(true);
    expect(longResult.message).toBe('Maximum length is 5');
  });

  it('blank passes (deliberate deviation — see file header)', async () => {
    const v = new StringValidation({ length: { min: 2, max: 5 }, id: 'len' });
    expect((await v.validate(ctx(), { current: '' })).hasError()).toBe(false);
    expect((await v.validate(ctx(), undefined)).hasError()).toBe(false);
  });

  it('regex bound is honored alongside length', async () => {
    const v = new StringValidation({ regex: /^[a-z]+$/, id: 'lower' });
    expect((await v.validate(ctx(), { current: 'abc' })).hasError()).toBe(false);
    expect((await v.validate(ctx(), { current: 'ABC' })).hasError()).toBe(true);
  });
});

describe('PhoneNumberValidation', () => {
  it('passes with and without hyphens', async () => {
    const v = new PhoneNumberValidation();
    expect((await v.validate(ctx(), { current: '01012345678' })).hasError()).toBe(false);
    expect((await v.validate(ctx(), { current: '010-1234-5678' })).hasError()).toBe(false);
  });

  it('fails an invalid number with the default Korean message', async () => {
    const v = new PhoneNumberValidation();
    const result = await v.validate(ctx(), { current: '123' });
    expect(result.hasError()).toBe(true);
    expect(result.message).toBe('전화번호 형식이 올바르지 않습니다.');
  });

  it('blank passes', async () => {
    const v = new PhoneNumberValidation();
    expect((await v.validate(ctx(), { current: '' })).hasError()).toBe(false);
  });
});

describe('TelephoneNumberValidation', () => {
  it('passes with and without hyphens (9-11 digits)', async () => {
    const v = new TelephoneNumberValidation();
    expect((await v.validate(ctx(), { current: '021234567' })).hasError()).toBe(false);
    expect((await v.validate(ctx(), { current: '02-1234-5678' })).hasError()).toBe(false);
  });

  it('fails an invalid number', async () => {
    const v = new TelephoneNumberValidation();
    expect((await v.validate(ctx(), { current: '123' })).hasError()).toBe(true);
  });
});

describe('PasswordValidation', () => {
  it('passes a strong password', async () => {
    const v = new PasswordValidation();
    expect((await v.validate(ctx(), { current: 'Abcdef1!' })).hasError()).toBe(false);
  });

  it('fails a password missing a special character', async () => {
    const v = new PasswordValidation();
    expect((await v.validate(ctx(), { current: 'Abcdefgh1' })).hasError()).toBe(true);
  });
});

describe('IpAddressValidation', () => {
  it('passes valid IPs including wildcard forms', async () => {
    const v = new IpAddressValidation();
    const result = await v.validate(ctx(), { current: ['192.168.1.1', '10.0.*'] as never });
    expect(result.hasError()).toBe(false);
  });

  it('fails an invalid IP with a per-value message', async () => {
    const v = new IpAddressValidation();
    const result = await v.validate(ctx(), { current: ['999.1.1.1'] as never });
    expect(result.hasError()).toBe(true);
    expect(result.message).toContain('999.1.1.1');
  });

  it('empty/undefined passes', async () => {
    const v = new IpAddressValidation();
    expect((await v.validate(ctx(), { current: [] as never })).hasError()).toBe(false);
    expect((await v.validate(ctx(), undefined)).hasError()).toBe(false);
  });
});

describe('CustomValidation', () => {
  it('delegates to the wrapped validate function', async () => {
    const v = new CustomValidation('custom', async (_c, value) =>
      value?.current === 'ok' ? ValidateResult.success() : ValidateResult.fail('bad'),
    );
    expect((await v.validate(ctx(), { current: 'ok' })).hasError()).toBe(false);
    const failResult = await v.validate(ctx(), { current: 'nope' });
    expect(failResult.hasError()).toBe(true);
    expect(failResult.message).toBe('bad');
  });
});
