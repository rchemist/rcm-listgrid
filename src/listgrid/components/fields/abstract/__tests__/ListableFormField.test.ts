import { describe, it, expect } from 'vitest';
import { ListableFormField, getNestedValue } from '../ListableFormField';
import { FieldType } from '../../../../config/Config';

class TestListableField extends ListableFormField<TestListableField> {
  constructor(name: string, order: number, type: FieldType = 'text') {
    super(name, order, type);
  }
  protected createInstance(name: string, order: number): TestListableField {
    return new TestListableField(name, order, this.type);
  }
  protected async renderInstance(): Promise<null> {
    return null;
  }
}

const make = (name = 'f', order = 1, type: FieldType = 'text') =>
  new TestListableField(name, order, type);

describe('getNestedValue', () => {
  it('returns undefined when obj is null / undefined', () => {
    expect(getNestedValue(null, 'a')).toBeUndefined();
    expect(getNestedValue(undefined, 'a')).toBeUndefined();
  });

  it('returns undefined when path is empty', () => {
    expect(getNestedValue({ a: 1 }, '')).toBeUndefined();
  });

  it('accesses shallow property without dots', () => {
    expect(getNestedValue({ a: 1 }, 'a')).toBe(1);
  });

  it('accesses nested property via dot notation', () => {
    expect(getNestedValue({ a: { b: { c: 7 } } }, 'a.b.c')).toBe(7);
  });

  it('returns undefined when any mid path node is null', () => {
    expect(getNestedValue({ a: null }, 'a.b.c')).toBeUndefined();
  });

  it('returns undefined when property missing', () => {
    expect(getNestedValue({ a: { b: 1 } }, 'a.x.y')).toBeUndefined();
  });
});

describe('ListableFormField - useListField / withListConfig / isSupportList', () => {
  it('useListField() with no props enables support', () => {
    const f = make().useListField();
    expect(f.isSupportList()).toBe(true);
    expect(f.listConfig?.support).toBe(true);
  });

  it('useListField(number) sets support and order', () => {
    const f = make().useListField(5);
    expect(f.isSupportList()).toBe(true);
    expect(f.listConfig?.order).toBe(5);
  });

  it('useListField props applies quickSearch / sortable / filterable', () => {
    const f = make().useListField({
      order: 2,
      quickSearch: true,
      sortable: false,
      filterable: false,
    });
    expect(f.listConfig?.quickSearch).toBe(true);
    expect(f.listConfig?.sortable).toBe(false);
    expect(f.listConfig?.filterable).toBe(false);
  });

  it('withListConfig(undefined) resets listConfig', () => {
    const f = make().useListField().withListConfig(undefined);
    expect(f.listConfig).toBeUndefined();
    expect(f.isSupportList()).toBe(false);
  });

  it('withListConfig defaults support to true when omitted', () => {
    const f = make('name', 1).withListConfig({});
    expect(f.listConfig?.support).toBe(true);
    expect(f.listConfig?.label).toBe('name'); // falls back to name
  });

  it('withListConfig respects explicit support=false', () => {
    const f = make().withListConfig({ support: false });
    expect(f.listConfig?.support).toBe(false);
    expect(f.isSupportList()).toBe(false);
  });
});

describe('ListableFormField - getListConfig defaults', () => {
  it('returns defaults for order / label when supported', () => {
    const f = make('fx', 9).useListField();
    const cfg = f.getListConfig();
    expect(cfg?.order).toBe(9);
    expect(cfg?.label).toBe('fx');
  });

  it('returns supplied order / label from useListField', () => {
    const f = make('fx', 9).useListField({ order: 3 }).withLabel('My Label');
    const cfg = f.getListConfig();
    expect(cfg?.order).toBe(3);
    expect(cfg?.label).toBe('My Label');
  });
});

describe('ListableFormField - filterable / sortable flags', () => {
  it('withFilterable sets filterable flag', () => {
    const f = make().useListField().withFilterable(true);
    expect(f.listConfig?.filterable).toBe(true);
  });

  it('withFilterable(false) sets false', () => {
    const f = make().useListField().withFilterable(false);
    expect(f.listConfig?.filterable).toBe(false);
  });

  it('withSortable sets sortable flag', () => {
    const f = make().useListField().withSortable(true);
    expect(f.listConfig?.sortable).toBe(true);
  });

  it('isFilterable defaults to true when list supported', () => {
    const f = make().useListField();
    expect(f.isFilterable()).toBe(true);
  });

  it('isFilterable is false when not supported and listConfig undefined', () => {
    const f = make();
    expect(f.isFilterable()).toBe(false);
  });

  it('isFilterable honours explicit false', () => {
    const f = make().useListField({ filterable: false });
    expect(f.isFilterable()).toBe(false);
  });

  it('isSortable defaults to true when list supported', () => {
    const f = make().useListField();
    expect(f.isSortable()).toBe(true);
  });

  it('isSortable false when unsupported and no config', () => {
    expect(make().isSortable()).toBe(false);
  });
});

describe('ListableFormField - withSaveValue / withOverrideRenderListItem / withOverrideRenderListFilter', () => {
  it('withSaveValue stores the function', () => {
    const fn = async () => 'x';
    const f = make().withSaveValue(fn);
    expect(f.saveValue).toBe(fn);
  });

  it('withOverrideRenderListItem stores the function', () => {
    const fn = async () => ({ result: null });
    const f = make().withOverrideRenderListItem(fn);
    expect(f.overrideRenderListItem).toBe(fn);
  });

  it('withOverrideRenderListFilter stores the function', () => {
    const fn = async () => null;
    const f = make().withOverrideRenderListFilter(fn);
    expect(f.overrideRenderListFilter).toBe(fn);
  });
});

describe('ListableFormField - getListFieldAlignType', () => {
  it('returns listConfig.align when explicitly set', () => {
    const f = make('f', 1).withListConfig({ align: 'right', support: true });
    expect(f.getListFieldAlignType()).toBe('right');
  });

  it('returns "center" for select / boolean / date / image', () => {
    for (const t of ['select', 'boolean', 'date', 'image'] as FieldType[]) {
      expect(make('f', 1, t).getListFieldAlignType()).toBe('center');
    }
  });

  it('returns "left" for text type by default', () => {
    expect(make('f', 1, 'text').getListFieldAlignType()).toBe('left');
  });
});
