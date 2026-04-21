import { describe, it, expect } from 'vitest';
import { FormField } from '../FormField';
import { FieldType } from '../../../../config/Config';

// 테스트용 구체 구현 - UI 렌더링은 전혀 하지 않는다.
class TestFormField extends FormField<TestFormField> {
  constructor(name: string, order: number, type: FieldType = 'text') {
    super(name, order, type);
  }

  protected createInstance(name: string, order: number): TestFormField {
    return new TestFormField(name, order, this.type);
  }

  protected async renderInstance(): Promise<null> {
    return null;
  }
}

const make = (name = 'f', order = 1, type: FieldType = 'text') =>
  new TestFormField(name, order, type);

describe('FormField - basic accessors', () => {
  it('getName / getOrder return constructor values', () => {
    const f = make('alpha', 7);
    expect(f.getName()).toBe('alpha');
    expect(f.getOrder()).toBe(7);
  });

  it('getLabel falls back to name when label is unset', () => {
    const f = make('alpha');
    expect(f.getLabel()).toBe('alpha');
  });

  it('getLabel returns explicitly set label', () => {
    const f = make('alpha').withLabel('Alpha Label');
    expect(f.getLabel()).toBe('Alpha Label');
  });

  it('type is stored from constructor', () => {
    const f = make('alpha', 1, 'number');
    expect(f.type).toBe('number');
  });
});

describe('FormField - withXxx builder methods', () => {
  it('withOrder updates order and returns this', () => {
    const f = make('f', 1);
    const returned = f.withOrder(42);
    expect(returned).toBe(f);
    expect(f.getOrder()).toBe(42);
  });

  it('withLabel / withTooltip / withHelpText / withPlaceHolder set the raw fields', () => {
    const f = make().withLabel('L').withTooltip('tip').withHelpText('help').withPlaceHolder('ph');
    expect(f.label).toBe('L');
    expect(f.tooltip).toBe('tip');
    expect(f.helpText).toBe('help');
    expect(f.placeHolder).toBe('ph');
  });

  it('withReadOnly defaults to true when called without argument', () => {
    const f = make().withReadOnly();
    expect(f.readonly).toBe(true);
  });

  it('withReadOnly accepts explicit false', () => {
    const f = make().withReadOnly(false);
    expect(f.readonly).toBe(false);
  });

  it('withRequired defaults to true when called without argument', () => {
    const f = make().withRequired();
    expect(f.required).toBe(true);
  });

  it('withRequired accepts explicit boolean', () => {
    const f = make().withRequired(false);
    expect(f.required).toBe(false);
  });

  it('withHidden stores the hidden descriptor', () => {
    const f = make().withHidden(true);
    expect(f.hidden).toBe(true);
  });

  it('withHideLabel stores normalized boolean', () => {
    expect(make().withHideLabel(true).hideLabel).toBe(true);
    expect(make().withHideLabel(false).hideLabel).toBe(false);
    // undefined → false (isTrue 규칙)
    expect(make().withHideLabel().hideLabel).toBe(false);
  });

  it('withLayout / withLineBreak', () => {
    const f = make().withLayout('full').withLineBreak(true);
    expect(f.layout).toBe('full');
    expect(f.lineBreak).toBe(true);
  });

  it('withLineBreak defaults to true when undefined', () => {
    const f = make().withLineBreak();
    expect(f.lineBreak).toBe(true);
  });
});

describe('FormField - tab / field group', () => {
  it('getTabId / getFieldGroupId return defaults when form is unset', () => {
    const f = make();
    expect(f.getTabId()).toBe('default');
    expect(f.getFieldGroupId()).toBe('default');
  });

  it('withTabId creates form if absent, keeping default fieldGroupId', () => {
    const f = make().withTabId('tabA');
    expect(f.getTabId()).toBe('tabA');
    expect(f.getFieldGroupId()).toBe('default');
  });

  it('withFieldGroupId creates form if absent, keeping default tabId', () => {
    const f = make().withFieldGroupId('groupA');
    expect(f.getTabId()).toBe('default');
    expect(f.getFieldGroupId()).toBe('groupA');
  });

  it('withTabId then withFieldGroupId updates both', () => {
    const f = make().withTabId('tabA').withFieldGroupId('groupA');
    expect(f.getTabId()).toBe('tabA');
    expect(f.getFieldGroupId()).toBe('groupA');
  });

  it('withForm sets both at once', () => {
    const f = make().withForm({ tabId: 't1', fieldGroupId: 'g1' });
    expect(f.getTabId()).toBe('t1');
    expect(f.getFieldGroupId()).toBe('g1');
  });
});

describe('FormField - withValue / getCurrentValue / getFetchedValue / resetValue', () => {
  it('withValue stores scalar as current', async () => {
    const f = make().withValue('hello');
    expect(await f.getCurrentValue()).toBe('hello');
  });

  it('withValue stores FieldValue-shaped object by merging', async () => {
    const f = make().withValue({ default: 'd', fetched: 'fe' });
    expect(await f.getCurrentValue('create')).toBe('d');
    expect(await f.getCurrentValue('update')).toBe('fe');
    expect(await f.getFetchedValue()).toBe('fe');
  });

  it('withValue stores non-FieldValue object as current', async () => {
    const obj = { id: 1, name: 'x' };
    const f = make().withValue(obj);
    expect(await f.getCurrentValue()).toEqual(obj);
  });

  it('withValue(undefined) keeps prior fields and sets current = undefined', async () => {
    const f = make().withValue({ default: 'd' }).withValue(undefined);
    // current is explicitly undefined
    expect(await f.getCurrentValue('create')).toBeUndefined();
  });

  it('withDefaultValue sets default and populates current when current is empty', async () => {
    const f = make().withDefaultValue('d');
    expect(await f.getCurrentValue('create')).toBe('d');
    expect(f.value?.default).toBe('d');
  });

  it('withDefaultValue keeps current if already set', async () => {
    const f = make().withValue('c').withDefaultValue('d');
    expect(await f.getCurrentValue('create')).toBe('c');
    expect(f.value?.default).toBe('d');
  });

  it('resetValue in create mode resets current to default', async () => {
    const f = make().withValue({ current: 'x', default: 'd' });
    f.resetValue('create');
    expect(await f.getCurrentValue('create')).toBe('d');
  });

  it('resetValue in update mode resets current to fetched', async () => {
    const f = make().withValue({ current: 'x', fetched: 'fe', default: 'd' });
    f.resetValue('update');
    expect(await f.getCurrentValue('update')).toBe('fe');
  });

  it('getCurrentValue returns undefined when value is not set', async () => {
    const f = make();
    expect(await f.getCurrentValue()).toBeUndefined();
  });

  it('getFetchedValue returns undefined when value is not set', async () => {
    const f = make();
    expect(await f.getFetchedValue()).toBeUndefined();
  });
});

describe('FormField - isBlank', () => {
  it('returns true when current is undefined', async () => {
    expect(await make().isBlank()).toBe(true);
  });

  it('returns true for empty string', async () => {
    const f = make().withValue('');
    expect(await f.isBlank()).toBe(true);
  });

  it('returns true for null', async () => {
    const f = make().withValue(null);
    expect(await f.isBlank()).toBe(true);
  });

  it('returns true for empty array', async () => {
    const f = make().withValue([]);
    expect(await f.isBlank()).toBe(true);
  });

  it('returns false for non-empty string', async () => {
    const f = make().withValue('x');
    expect(await f.isBlank()).toBe(false);
  });

  it('returns false for non-empty array', async () => {
    const f = make().withValue([1]);
    expect(await f.isBlank()).toBe(false);
  });
});

describe('FormField - isDirty', () => {
  it('returns false when value is undefined', () => {
    expect(make().isDirty()).toBe(false);
  });

  it('returns false when both fetched and current are undefined', () => {
    const f = make().withValue({ default: 'd' });
    expect(f.isDirty()).toBe(false);
  });

  it('returns false in create mode when current equals default', () => {
    const f = make().withValue({ current: 'd', default: 'd' });
    expect(f.isDirty()).toBe(false);
  });

  it('returns true in create mode when current differs from default', () => {
    const f = make().withValue({ current: 'x', default: 'd' });
    expect(f.isDirty()).toBe(true);
  });

  it('returns false in update mode when current equals fetched', () => {
    const f = make().withValue({ current: 'fe', fetched: 'fe' });
    expect(f.isDirty()).toBe(false);
  });

  it('returns true in update mode when current differs from fetched', () => {
    const f = make().withValue({ current: 'x', fetched: 'fe' });
    expect(f.isDirty()).toBe(true);
  });

  it('array comparison uses collection equality (order independent)', () => {
    // isEqualCollection with true should ignore order
    const f = make().withValue({ current: [2, 1], fetched: [1, 2] });
    expect(f.isDirty()).toBe(false);
  });
});

describe('FormField - isPermitted', () => {
  it('returns true when no requiredPermissions are set', () => {
    expect(make().isPermitted([])).toBe(true);
    expect(make().isPermitted(['ROLE_X'])).toBe(true);
    expect(make().isPermitted(undefined)).toBe(true);
  });

  it('returns false when requiredPermissions set but user has none', () => {
    const f = make().withRequiredPermissions('ROLE_A');
    expect(f.isPermitted([])).toBe(false);
    expect(f.isPermitted(undefined)).toBe(false);
  });

  it('returns true when user has at least one required permission', () => {
    const f = make().withRequiredPermissions('ROLE_A', 'ROLE_B');
    expect(f.isPermitted(['ROLE_B'])).toBe(true);
  });

  it('returns false when user has none of the required permissions', () => {
    const f = make().withRequiredPermissions('ROLE_A');
    expect(f.isPermitted(['ROLE_Z'])).toBe(false);
  });

  it('withRequiredPermissions deduplicates permissions across calls', () => {
    const f = make().withRequiredPermissions('A', 'B').withRequiredPermissions('B', 'C');
    expect(f.requiredPermissions?.sort()).toEqual(['A', 'B', 'C']);
  });
});

describe('FormField - async conditional getters (boolean / string)', () => {
  it('isRequired returns false when required is undefined', async () => {
    expect(await make().isRequired({})).toBe(false);
  });

  it('isRequired returns true when required is boolean true', async () => {
    const f = make().withRequired(true);
    expect(await f.isRequired({})).toBe(true);
  });

  it('isHidden returns false when hidden undefined', async () => {
    expect(await make().isHidden({})).toBe(false);
  });

  it('isReadonly returns true when readonly is true', async () => {
    expect(await make().withReadOnly().isReadonly({})).toBe(true);
  });

  it('getPlaceHolder returns "" when placeHolder not set', async () => {
    expect(await make().getPlaceHolder({})).toBe('');
  });

  it('getPlaceHolder returns static string when set', async () => {
    const f = make().withPlaceHolder('enter...');
    expect(await f.getPlaceHolder({})).toBe('enter...');
  });
});

describe('FormField - view presets', () => {
  it('withViewPreset(undefined) leaves readonly/hidden unchanged', () => {
    const f = make().withViewPreset(undefined);
    expect(f.readonly).toBeUndefined();
    expect(f.hidden).toBeUndefined();
  });

  it('withAddOnly applies ADD_ONLY preset (readonly depending on renderType)', async () => {
    const f = make().withAddOnly();
    // On update, readonly should be true
    expect(await f.isReadonly({ renderType: 'update' })).toBe(true);
    // On create, readonly should be false
    expect(await f.isReadonly({ renderType: 'create' })).toBe(false);
  });

  it('withModifyOnly hides on create', async () => {
    const f = make().withModifyOnly();
    expect(await f.isHidden({ renderType: 'create' })).toBe(true);
    expect(await f.isHidden({ renderType: 'update' })).toBe(false);
  });

  it('withListOnly hides on both create and update', async () => {
    const f = make().withListOnly();
    expect(await f.isHidden({ renderType: 'create' })).toBe(true);
    expect(await f.isHidden({ renderType: 'update' })).toBe(true);
  });
});

describe('FormField - clone', () => {
  it('clone preserves name / order / value', async () => {
    const f = make('orig', 3).withLabel('L').withValue('v').withTooltip('t').withRequired(true);
    const cloned = f.clone();
    expect(cloned.getName()).toBe('orig');
    expect(cloned.getOrder()).toBe(3);
    expect(cloned.label).toBe('L');
    expect(cloned.tooltip).toBe('t');
    expect(cloned.required).toBe(true);
    expect(await cloned.getCurrentValue()).toBe('v');
  });

  it('clone(false) drops value', async () => {
    const f = make('orig', 3).withValue('v');
    const cloned = f.clone(false);
    // value object is not copied when includeValue is false,
    // so current should be undefined (value may still be undefined or partial)
    const current = await cloned.getCurrentValue();
    expect(current).toBeUndefined();
  });

  it('clone is a different instance', () => {
    const f = make();
    expect(f.clone()).not.toBe(f);
  });

  it('clone preserves requiredPermissions as a copy', () => {
    const f = make().withRequiredPermissions('A', 'B');
    const cloned = f.clone();
    expect(cloned.requiredPermissions?.sort()).toEqual(['A', 'B']);
    // independent array
    cloned.requiredPermissions!.push('C');
    expect(f.requiredPermissions).not.toContain('C');
  });
});

describe('FormField - withAttributes / withValidations / withCardIcon / withOverrideRender', () => {
  it('withAttributes stores the Map', () => {
    const attrs = new Map<string, unknown>([['k', 'v']]);
    const f = make().withAttributes(attrs);
    expect(f.attributes).toBe(attrs);
  });

  it('withValidations filters out undefined validations', () => {
    const v1 = {
      id: '1',
      validate: async () => ({ error: false, message: '' }) as any,
      getErrorMessage: () => '',
    };
    const f = make().withValidations(v1 as any, undefined, undefined);
    expect(f.validations).toHaveLength(1);
    expect(f.validations?.[0]).toBe(v1);
  });

  it('withOverrideRender stores the function', () => {
    const fn = async () => null;
    const f = make().withOverrideRender(fn);
    expect(f.overrideRender).toBe(fn);
  });

  it('withDisplayFunc / withMaskedValue store the functions', () => {
    const df = async () => 'x';
    const mf = async () => 'masked';
    const f = make().withDisplayFunc(df).withMaskedValue(mf);
    expect(f.displayFunc).toBe(df);
    expect(f.maskedValueFunc).toBe(mf);
  });
});

describe('FormField - viewLabel', () => {
  it('viewLabel returns translated label when label is string', () => {
    const t = (key: string) => `t(${key})`;
    const f = make('x').withLabel('lbl');
    expect(f.viewLabel(t)).toBe('t(lbl)');
  });

  it('viewLabel returns name when t(label) is falsy', () => {
    const t = () => '';
    const f = make('fallback').withLabel('lbl');
    expect(f.viewLabel(t)).toBe('fallback');
  });

  it('viewLabel returns name when no label is set', () => {
    const f = make('theName');
    expect(f.viewLabel(() => 'x')).toBe('theName');
  });
});
