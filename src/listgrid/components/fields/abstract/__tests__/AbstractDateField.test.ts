import { describe, it, expect } from 'vitest';
import { AbstractDateField } from '../AbstractDateField';
import { FieldType } from '../../../../config/Config';

class TestDateField extends AbstractDateField<TestDateField> {
  constructor(name: string, order: number, type: FieldType = 'date', limit?: any, range?: boolean) {
    super(name, order, type, limit, range);
  }
  protected createInstance(name: string, order: number): TestDateField {
    return new TestDateField(name, order, this.type);
  }
  protected async renderInstance(): Promise<null> {
    return null;
  }
}

const make = (name = 'd', order = 1) => new TestDateField(name, order);

describe('AbstractDateField - constructor', () => {
  it('stores limit / range via constructor', () => {
    const f = new TestDateField('d', 1, 'date', { min: '2020-01-01', max: '2024-12-31' }, true);
    expect(f.limit).toEqual({ min: '2020-01-01', max: '2024-12-31' });
    expect(f.range).toBe(true);
  });

  it('defaults limit and range to undefined when omitted', () => {
    const f = make();
    expect(f.limit).toBeUndefined();
    expect(f.range).toBeUndefined();
  });
});

describe('AbstractDateField - withRange / withLimit', () => {
  it('withRange sets range flag', () => {
    expect(make().withRange(true).range).toBe(true);
    expect(make().withRange(false).range).toBe(false);
  });

  it('withRange(undefined) clears range', () => {
    expect(make().withRange(true).withRange(undefined).range).toBeUndefined();
  });

  it('withLimit replaces entire limit object', () => {
    const f = make().withLimit({ min: '2020-01-01', max: '2021-01-01' });
    expect(f.limit).toEqual({ min: '2020-01-01', max: '2021-01-01' });
  });

  it('withLimit(undefined) clears limit', () => {
    const f = make().withLimit({ min: '2020-01-01' }).withLimit(undefined);
    expect(f.limit).toBeUndefined();
  });
});

describe('AbstractDateField - withMin / withMax', () => {
  it('withMin preserves existing max', () => {
    const f = make().withLimit({ min: '2020-01-01', max: '2024-12-31' }).withMin('2021-01-01');
    expect(f.limit).toEqual({ min: '2021-01-01', max: '2024-12-31' });
  });

  it('withMax preserves existing min', () => {
    const f = make().withLimit({ min: '2020-01-01', max: '2024-12-31' }).withMax('2025-12-31');
    expect(f.limit).toEqual({ min: '2020-01-01', max: '2025-12-31' });
  });

  it('withMin when no prior limit creates a new object', () => {
    const f = make().withMin('2020-01-01');
    expect(f.limit).toEqual({ min: '2020-01-01', max: undefined });
  });

  it('withMax when no prior limit creates a new object', () => {
    const f = make().withMax('2020-12-31');
    expect(f.limit).toEqual({ min: undefined, max: '2020-12-31' });
  });

  it('builders return this for chaining', () => {
    const f = make();
    expect(f.withRange(true)).toBe(f);
    expect(f.withLimit({ min: '2020-01-01' })).toBe(f);
    expect(f.withMin('2021-01-01')).toBe(f);
    expect(f.withMax('2022-01-01')).toBe(f);
  });
});

describe('AbstractDateField - clone', () => {
  // TODO: AbstractDateField#copyFields references `this.limit` / `this.range`
  //       on the freshly created target rather than `origin.limit` / `origin.range`.
  //       Because `createInstance` builds the new field without limit/range,
  //       clone() does NOT preserve these values. Confirming current behaviour
  //       rather than the intuitive expectation.
  it('clone currently does NOT preserve limit / range (see TODO)', () => {
    const f = make().withRange(true).withLimit({ min: '2020-01-01', max: '2024-12-31' });
    const cloned = f.clone();
    expect(cloned.range).toBeUndefined();
    expect(cloned.limit).toBeUndefined();
  });

  it.todo('clone should preserve limit and range (behavioural fix pending)');
});
