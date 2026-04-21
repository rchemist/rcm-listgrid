import { describe, it, expect } from 'vitest';
import { CheckButtonValidationField } from '../CheckButtonValidationField';
import { ValidateResult } from '../../../../validations/Validation';

class TestCheckButtonField extends CheckButtonValidationField<TestCheckButtonField> {
  constructor(name: string, order: number) {
    super(name, order, 'text');
  }
  protected createInstance(name: string, order: number): TestCheckButtonField {
    return new TestCheckButtonField(name, order);
  }
  protected async renderInstance(): Promise<null> {
    return null;
  }
}

const make = (name = 'f', order = 1) => new TestCheckButtonField(name, order);

describe('CheckButtonValidationField - builders', () => {
  it('withCheckButtonValidation stores the function', () => {
    const fn = async () => ValidateResult.success();
    const f = make().withCheckButtonValidation(fn);
    expect(f.checkButtonValidation).toBe(fn);
  });

  it('withCheckButtonValidation(undefined) clears the function', () => {
    const fn = async () => ValidateResult.success();
    const f = make().withCheckButtonValidation(fn).withCheckButtonValidation(undefined);
    expect(f.checkButtonValidation).toBeUndefined();
  });

  it('withCheckButtonLabel stores label', () => {
    const f = make().withCheckButtonLabel('Check');
    expect(f.checkButtonLabel).toBe('Check');
  });

  it('withCheckButtonLabel(undefined) clears label', () => {
    const f = make().withCheckButtonLabel('x').withCheckButtonLabel(undefined);
    expect(f.checkButtonLabel).toBeUndefined();
  });

  it('builders return this for chaining', () => {
    const f = make();
    const fn = async () => ValidateResult.success();
    expect(f.withCheckButtonValidation(fn)).toBe(f);
    expect(f.withCheckButtonLabel('x')).toBe(f);
  });
});

describe('CheckButtonValidationField - isRequired', () => {
  it('returns false when required is unset', async () => {
    const f = make();
    expect(await f.isRequired({})).toBe(false);
  });

  it('returns true when withRequired(true)', async () => {
    const f = make().withRequired(true);
    expect(await f.isRequired({})).toBe(true);
  });
});

describe('CheckButtonValidationField - inherits FormField behaviour', () => {
  it('getName returns constructor value', () => {
    expect(make('myField', 2).getName()).toBe('myField');
  });

  it('getLabel falls back to name', () => {
    expect(make('x').getLabel()).toBe('x');
  });

  it('clone preserves checkButtonLabel', () => {
    const f = make().withCheckButtonLabel('Click');
    const cloned = f.clone();
    expect(cloned.checkButtonLabel).toBe('Click');
  });

  it('clone preserves checkButtonValidation function reference', () => {
    const fn = async () => ValidateResult.success();
    const f = make().withCheckButtonValidation(fn);
    const cloned = f.clone();
    expect(cloned.checkButtonValidation).toBe(fn);
  });
});
