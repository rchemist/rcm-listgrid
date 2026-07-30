import { describe, expect, it } from 'vitest';
import { NumberField, TextareaField } from '../index';

describe('NumberField 0.3 builder compatibility', () => {
  it('composes min/max without dropping the opposite bound', () => {
    const field = new NumberField('count', 1)
      .withLimit({ min: 1, max: 10 })
      .withMin(2)
      .withMax(9);

    expect(field.limit).toEqual({ min: 2, max: 9 });
  });

  it('clears individual bounds and preserves chainability', () => {
    const field = new NumberField('count', 1).withLimit({ min: 1, max: 10 });
    expect(field.withMin(undefined)).toBe(field);
    expect(field.limit).toEqual({ max: 10 });
    expect(field.withMax(undefined)).toBe(field);
    expect(field.limit).toEqual({});
  });

  it('retains currency/double/limit builders promised as unchanged', () => {
    const field = new NumberField('amount', 1)
      .withCurrency('KRW')
      .withDouble(true)
      .withLimit({ min: 0 });

    expect(field.currency).toBe('KRW');
    expect(field.double).toBe(true);
    expect(field.limit).toEqual({ min: 0 });
  });
});

describe('TextareaField 0.3 builder compatibility', () => {
  it('retains withLimit and clones the supplied declaration', () => {
    const limit = { min: 1, max: 500 };
    const field = new TextareaField('description', 1).withLimit(limit);
    expect(field.limit).toEqual(limit);
    expect(field.limit).not.toBe(limit);
  });
});
