import { describe, it, expect } from 'vitest';
import { OptionalField, MultipleOptionalField } from '../OptionalField';
import { FieldType } from '../../../../config/Config';

class TestOptionalField extends OptionalField<TestOptionalField> {
  constructor(name: string, order: number, type: FieldType = 'select') {
    super(name, order, type);
  }
  protected createInstance(name: string, order: number): TestOptionalField {
    return new TestOptionalField(name, order, this.type);
  }
  protected async renderInstance(): Promise<null> {
    return null;
  }
}

class TestMultipleOptionalField extends MultipleOptionalField<TestMultipleOptionalField> {
  constructor(name: string, order: number) {
    super(name, order, 'multiselect');
  }
  protected createInstance(name: string, order: number): TestMultipleOptionalField {
    return new TestMultipleOptionalField(name, order);
  }
  protected async renderInstance(): Promise<null> {
    return null;
  }
}

const make = (name = 'f', order = 1, type: FieldType = 'select') =>
  new TestOptionalField(name, order, type);

describe('OptionalField - builder methods', () => {
  it('withOptions stores a defensive copy', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    const f = make().withOptions(options);
    expect(f.options).toEqual(options);
    expect(f.options).not.toBe(options);
  });

  it('withOptions(undefined) clears options', () => {
    const f = make()
      .withOptions([{ value: 'a', label: 'A' }])
      .withOptions(undefined);
    expect(f.options).toBeUndefined();
  });

  it('withPreservedOptions stores a copy', () => {
    const options = [{ value: 'a', label: 'A' }];
    const f = make().withPreservedOptions(options);
    expect(f.preservedOptions).toEqual(options);
    expect(f.preservedOptions).not.toBe(options);
  });

  it('withSingleFilter defaults to true when called without args', () => {
    const f = make().withSingleFilter();
    expect(f.singleFilter).toBe(true);
  });

  it('withSingleFilter(false) sets false', () => {
    const f = make().withSingleFilter(false);
    expect(f.singleFilter).toBe(false);
  });

  it('withComboType stores combo props', () => {
    const f = make().withComboType({ direction: 'horizontal' } as any);
    expect(f.combo).toEqual({ direction: 'horizontal' });
  });

  it('withComboType(undefined) clears combo', () => {
    const f = make()
      .withComboType({ direction: 'horizontal' } as any)
      .withComboType(undefined);
    expect(f.combo).toBeUndefined();
  });
});

describe('OptionalField - useChip', () => {
  it('useChip defaults enabled=true with default maxOptions/maxLabelLength', () => {
    const f = make().useChip();
    expect(f.chipConfig?.enabled).toBe(true);
    expect(f.chipConfig?.maxOptions).toBe(10);
    expect(f.chipConfig?.maxLabelLength).toBe(8);
  });

  it('useChip respects custom config', () => {
    const f = make().useChip(true, { maxOptions: 3, maxLabelLength: 4 });
    expect(f.chipConfig?.maxOptions).toBe(3);
    expect(f.chipConfig?.maxLabelLength).toBe(4);
  });

  it('useChip(false) disables chip', () => {
    const f = make().useChip(false);
    expect(f.chipConfig?.enabled).toBe(false);
  });
});

describe('OptionalField - shouldRenderAsChip', () => {
  it('returns false when chip explicitly disabled', () => {
    const f = make()
      .withOptions([{ value: 'a', label: 'A' }])
      .useChip(false);
    expect(f.shouldRenderAsChip()).toBe(false);
  });

  it('returns false when options are missing / empty', () => {
    expect(make().shouldRenderAsChip()).toBe(false);
    expect(make().withOptions([]).shouldRenderAsChip()).toBe(false);
  });

  it('returns true when chip explicitly enabled (skip auto checks)', () => {
    const f = make()
      .withOptions([{ value: 'a', label: 'AAAAAAAAAAAAAAAAA' }])
      .useChip(true);
    expect(f.shouldRenderAsChip()).toBe(true);
  });

  it('auto mode: returns true when options fit thresholds', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    const f = make().withOptions(options);
    expect(f.shouldRenderAsChip()).toBe(true);
  });

  it('auto mode: returns false when option count exceeds default', () => {
    const options = Array.from({ length: 11 }, (_, i) => ({ value: `v${i}`, label: `L${i}` }));
    const f = make().withOptions(options);
    expect(f.shouldRenderAsChip()).toBe(false);
  });

  it('auto mode: returns false when a label is too long', () => {
    const options = [{ value: 'a', label: 'ThisLabelIsLong' }];
    const f = make().withOptions(options);
    expect(f.shouldRenderAsChip()).toBe(false);
  });

  it('auto mode uses option.value when label missing', () => {
    const options = [{ value: 'short' } as any];
    const f = make().withOptions(options);
    expect(f.shouldRenderAsChip()).toBe(true);
  });
});

describe('OptionalField - changeOptions', () => {
  it('changeOptions stores preserved snapshot and replaces options', () => {
    const initial = [{ value: 'a', label: 'A' }];
    const next = [{ value: 'b', label: 'B' }];
    const f = make().withOptions(initial);
    const changed = f.changeOptions(next);
    expect(changed).toBe(true);
    expect(f.options).toEqual(next);
    expect(f.preservedOptions).toEqual(initial);
  });

  it('changeOptions returns false when new options reference equals current and preserved already set', () => {
    // isEqualOptions uses isEquals which returns false for distinct arrays.
    // Only the exact same array reference produces the "no change" path.
    const options = [{ value: 'a', label: 'A' }];
    const f = make().withOptions(options);
    // preservedOptions must be set to enter the "no-op" branch
    f.preservedOptions = f.options;
    expect(f.changeOptions(f.options!)).toBe(false);
  });

  it('changeOptions applies defaultValue when provided', async () => {
    const f = make();
    f.changeOptions([{ value: 'a', label: 'A' }], 'a');
    expect(f.value?.default).toBe('a');
  });
});

describe('OptionalField - revertOptions', () => {
  it('returns false when preservedOptions is undefined', () => {
    expect(make().revertOptions()).toBe(false);
  });

  it('reverts to preserved snapshot and clears preserved', () => {
    const a = [{ value: 'a', label: 'A' }];
    const b = [{ value: 'b', label: 'B' }];
    const f = make().withOptions(a);
    f.changeOptions(b);
    expect(f.options).toEqual(b);
    const reverted = f.revertOptions();
    expect(reverted).toBe(true);
    expect(f.options).toEqual(a);
    expect(f.preservedOptions).toBeUndefined();
  });

  it('returns false when preservedOptions is the same reference as current options', () => {
    // isEqualOptions uses isEquals which treats distinct arrays as non-equal.
    // Reuse the same reference so the "already equal" branch triggers.
    const f = make();
    const a = [{ value: 'a', label: 'A' }];
    f.options = a;
    f.preservedOptions = a;
    expect(f.revertOptions()).toBe(false);
  });
});

describe('MultipleOptionalField - limits', () => {
  const makeM = (name = 'f', order = 1) => new TestMultipleOptionalField(name, order);

  it('withLimit stores the limit object', () => {
    const f = makeM().withLimit({ min: 1, max: 3 });
    expect(f.limit).toEqual({ min: 1, max: 3 });
  });

  it('withMin preserves existing max', () => {
    const f = makeM().withLimit({ min: 1, max: 3 }).withMin(2);
    expect(f.limit).toEqual({ min: 2, max: 3 });
  });

  it('withMax preserves existing min', () => {
    const f = makeM().withLimit({ min: 1, max: 3 }).withMax(5);
    expect(f.limit).toEqual({ min: 1, max: 5 });
  });

  it('withMin when no prior limit creates new object', () => {
    const f = makeM().withMin(1);
    expect(f.limit).toEqual({ min: 1, max: undefined });
  });

  it('withMax when no prior limit creates new object', () => {
    const f = makeM().withMax(3);
    expect(f.limit).toEqual({ min: undefined, max: 3 });
  });
});
