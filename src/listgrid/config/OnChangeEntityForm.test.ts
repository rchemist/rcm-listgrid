import { describe, it, expect, vi } from 'vitest';
import {
  ConditionalValidation,
  ConditionalSelectOption,
  OnChangeEntityForm,
} from './OnChangeEntityForm';
import type { Validation } from '../validations/Validation';

/** A lightweight Validation stub — the class only checks `.id` for dedupe. */
function makeValidation(id: string): Validation {
  return {
    id,
    validate: async () => ({ valid: true, errors: [] }),
  } as unknown as Validation;
}

describe('ConditionalValidation', () => {
  it('constructor stores the value', () => {
    const cv = new ConditionalValidation('abc');
    expect(cv.value).toBe('abc');
    expect(cv.result).toBeInstanceOf(Map);
    expect(cv.result.size).toBe(0);
  });

  it('static create builds an instance', () => {
    const cv = ConditionalValidation.create(42);
    expect(cv.value).toBe(42);
  });

  it('addValidation registers an overwrite entry', () => {
    const cv = ConditionalValidation.create(true);
    const v = makeValidation('v1');
    cv.addValidation('field1', 'overwrite', v);
    expect(cv.result.get('field1')).toEqual({ type: 'overwrite', validations: [v] });
  });

  it('addValidation registers an append entry with multiple validations', () => {
    const cv = ConditionalValidation.create('X');
    const v1 = makeValidation('v1');
    const v2 = makeValidation('v2');
    cv.addValidation('field1', 'append', v1, v2);
    expect(cv.result.get('field1')).toEqual({
      type: 'append',
      validations: [v1, v2],
    });
  });

  it('addValidation is fluent (returns this)', () => {
    const cv = ConditionalValidation.create(true);
    expect(cv.addValidation('f', 'append')).toBe(cv);
  });

  it('supports a function matcher as value', () => {
    const matcher = (v: unknown) => v === 'yes';
    const cv = ConditionalValidation.create(matcher);
    expect(cv.value).toBe(matcher);
  });
});

describe('ConditionalSelectOption', () => {
  it('constructor stores the value, result is an empty Map', () => {
    const cs = new ConditionalSelectOption('A');
    expect(cs.value).toBe('A');
    expect(cs.result).toBeInstanceOf(Map);
    expect(cs.result.size).toBe(0);
    expect(cs.defaultValue).toBeUndefined();
  });

  it('static create builds an instance', () => {
    const cs = ConditionalSelectOption.create(true);
    expect(cs.value).toBe(true);
  });

  it('withDefaultValue sets defaultValue and is fluent', () => {
    const cs = ConditionalSelectOption.create('A').withDefaultValue('fallback');
    expect(cs.defaultValue).toBe('fallback');
  });

  it('addSelectOption stores options keyed by field name', () => {
    const cs = ConditionalSelectOption.create('A');
    const opts = [
      { value: '1', label: 'one' },
      { value: '2', label: 'two' },
    ];
    cs.addSelectOption('field1', ...opts);
    expect(cs.result.get('field1')).toEqual(opts);
  });

  it('addSelectOption is fluent', () => {
    const cs = ConditionalSelectOption.create('A');
    expect(cs.addSelectOption('f')).toBe(cs);
  });

  it('supports adding multiple field mappings', () => {
    const cs = ConditionalSelectOption.create('A');
    cs.addSelectOption('f1', { value: 'x' }).addSelectOption('f2', { value: 'y' });
    expect(cs.result.size).toBe(2);
    expect(cs.result.get('f1')).toEqual([{ value: 'x' }]);
    expect(cs.result.get('f2')).toEqual([{ value: 'y' }]);
  });
});

describe('OnChangeEntityForm static builders', () => {
  it('changeHidden returns a function', () => {
    const fn = OnChangeEntityForm.changeHidden('name', { value: 'a', result: new Map() });
    expect(typeof fn).toBe('function');
  });

  it('changeRequired returns a function', () => {
    const fn = OnChangeEntityForm.changeRequired('name', { value: 'a', result: new Map() });
    expect(typeof fn).toBe('function');
  });

  it('changeSelectOptions returns a function', () => {
    const fn = OnChangeEntityForm.changeSelectOptions('name', {
      value: 'a',
      result: new Map(),
    });
    expect(typeof fn).toBe('function');
  });

  it('derivedValidations returns a function', () => {
    const fn = OnChangeEntityForm.derivedValidations('name', {
      value: 'x',
      result: new Map(),
    });
    expect(typeof fn).toBe('function');
  });

  it('changeHidden no-ops when entityForm.getField returns undefined', async () => {
    const fn = OnChangeEntityForm.changeHidden('missing', {
      value: 'yes',
      result: new Map([['other', true]]),
    });
    const entityForm = {
      getField: vi.fn().mockReturnValue(undefined),
      getRenderType: () => 'create',
    } as any;
    const result = await fn(entityForm);
    expect(result).toBe(entityForm);
    expect(entityForm.getField).toHaveBeenCalledWith('missing');
  });

  it('changeRequired no-ops when entityForm.getField returns undefined', async () => {
    const fn = OnChangeEntityForm.changeRequired('missing', {
      value: 'yes',
      result: new Map([['other', true]]),
    });
    const entityForm = {
      getField: vi.fn().mockReturnValue(undefined),
      getRenderType: () => 'create',
    } as any;
    const result = await fn(entityForm);
    expect(result).toBe(entityForm);
  });

  it('changeHidden sets hidden=true on listed fields when value matches', async () => {
    const targetField = { withHidden: vi.fn() };
    const triggerField = {
      getName: () => 'trigger',
      getCurrentValue: () => 'yes',
    };
    const entityForm = {
      getField: vi.fn((name: string) => {
        if (name === 'trigger') return triggerField;
        if (name === 'target') return targetField;
        return undefined;
      }),
      getRenderType: () => 'create',
    } as any;
    const fn = OnChangeEntityForm.changeHidden('trigger', {
      value: 'yes',
      result: new Map([['target', true]]),
    });
    await fn(entityForm);
    // hidden === true → value matches → pass `v` through → withHidden(true)
    expect(targetField.withHidden).toHaveBeenCalledWith(true);
  });

  it('changeHidden negates when value does not match (single options)', async () => {
    const targetField = { withHidden: vi.fn() };
    const triggerField = {
      getName: () => 'trigger',
      getCurrentValue: () => 'no',
    };
    const entityForm = {
      getField: vi.fn((name: string) => {
        if (name === 'trigger') return triggerField;
        if (name === 'target') return targetField;
        return undefined;
      }),
      getRenderType: () => 'create',
    } as any;
    const fn = OnChangeEntityForm.changeHidden('trigger', {
      value: 'yes',
      result: new Map([['target', true]]),
    });
    await fn(entityForm);
    // hidden === false → !v inverts original true to false
    expect(targetField.withHidden).toHaveBeenCalledWith(false);
  });

  it('changeRequired single option inverts when value does not match', async () => {
    const targetField = { withRequired: vi.fn() };
    const triggerField = {
      getName: () => 'trigger',
      getCurrentValue: () => 'B',
    };
    const entityForm = {
      getField: vi.fn((name: string) => {
        if (name === 'trigger') return triggerField;
        if (name === 'target') return targetField;
        return undefined;
      }),
      getRenderType: () => 'create',
    } as any;
    const fn = OnChangeEntityForm.changeRequired('trigger', {
      value: 'A',
      result: new Map([['target', true]]),
    });
    await fn(entityForm);
    expect(targetField.withRequired).toHaveBeenCalledWith(false);
  });

  it('changeRequired array options only applies matching entries', async () => {
    const targetField = { withRequired: vi.fn() };
    const triggerField = {
      getName: () => 'trigger',
      getCurrentValue: () => 'A',
    };
    const entityForm = {
      getField: vi.fn((name: string) => {
        if (name === 'trigger') return triggerField;
        if (name === 'target') return targetField;
        return undefined;
      }),
      getRenderType: () => 'create',
    } as any;
    const fn = OnChangeEntityForm.changeRequired('trigger', [
      { value: 'A', result: new Map([['target', true]]) },
      { value: 'B', result: new Map([['target', false]]) },
    ]);
    await fn(entityForm);
    // Only the 'A' entry matched, so withRequired is called exactly once with true
    expect(targetField.withRequired).toHaveBeenCalledTimes(1);
    expect(targetField.withRequired).toHaveBeenCalledWith(true);
  });
});
