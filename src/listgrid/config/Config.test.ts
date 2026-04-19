import { describe, it, expect } from 'vitest';
import {
  AssetConfig,
  ALWAYS,
  ADD_ONLY,
  MODIFY_ONLY,
  HIDDEN,
  VIEW_ONLY,
  VIEW_HIDDEN,
  LIST_ONLY,
  HAS_VALUE_READONLY,
  HAS_VALUE_HIDDEN,
  MANAGE_ENTITY_ALL,
  MANAGE_ENTITY_CREATE,
  MANAGE_ENTITY_UPDATE,
  MANAGE_ENTITY_NOT_DELETE,
  DEFAULT_TAB_INFO,
  DEFAULT_FIELD_GROUP_INFO,
  STATUS_TAB_INFO,
  NO_FILTER_SORT_ON_LIST,
  ModifiableTypes,
  ViewPresetTypes,
  getViewPreset,
  getModifiableType,
  getConditionalBoolean,
  getConditionalString,
  getConditionalReactNode,
  excludeIdListOnManyToOneLookUp,
  excludeSelfOnManyToOneLookup,
  type ConditionalValue,
} from './Config';

/** A tiny stub that fulfills just the `getRenderType()` contract used by
 *  getConditional* helpers. Cast to `any` to avoid pulling EntityForm's full
 *  type into the test. */
function stubEntityForm(renderType?: 'create' | 'update'): any {
  return { getRenderType: () => renderType };
}

describe('Config constants', () => {
  it('ALWAYS marks both create and update visible', () => {
    expect((ALWAYS.hidden as any).onCreate).toBe(false);
    expect((ALWAYS.hidden as any).onUpdate).toBe(false);
  });

  it('HIDDEN marks both create and update hidden', () => {
    expect((HIDDEN.hidden as any).onCreate).toBe(true);
    expect((HIDDEN.hidden as any).onUpdate).toBe(true);
  });

  it('ADD_ONLY is editable on create, readonly on update', () => {
    expect((ADD_ONLY.readonly as any).onCreate).toBe(false);
    expect((ADD_ONLY.readonly as any).onUpdate).toBe(true);
  });

  it('MODIFY_ONLY hides/locks create, opens update', () => {
    expect((MODIFY_ONLY.readonly as any).onCreate).toBe(true);
    expect((MODIFY_ONLY.readonly as any).onUpdate).toBe(false);
    expect((MODIFY_ONLY.hidden as any).onCreate).toBe(true);
    expect((MODIFY_ONLY.hidden as any).onUpdate).toBe(false);
  });

  it('VIEW_ONLY is readonly on both, hidden on create', () => {
    expect((VIEW_ONLY.readonly as any).onCreate).toBe(true);
    expect((VIEW_ONLY.readonly as any).onUpdate).toBe(true);
    expect((VIEW_ONLY.hidden as any).onCreate).toBe(true);
    expect((VIEW_ONLY.hidden as any).onUpdate).toBe(false);
  });

  it('VIEW_HIDDEN readonly only on update, hidden only on update', () => {
    expect((VIEW_HIDDEN.readonly as any).onUpdate).toBe(true);
    expect((VIEW_HIDDEN.hidden as any).onUpdate).toBe(true);
  });

  it('LIST_ONLY is readonly & hidden in both contexts', () => {
    expect((LIST_ONLY.readonly as any).onCreate).toBe(true);
    expect((LIST_ONLY.hidden as any).onCreate).toBe(true);
  });

  it('NO_FILTER_SORT_ON_LIST supports list but disables sort+filter', () => {
    expect(NO_FILTER_SORT_ON_LIST.support).toBe(true);
    expect(NO_FILTER_SORT_ON_LIST.sortable).toBe(false);
    expect(NO_FILTER_SORT_ON_LIST.filterable).toBe(false);
  });

  it('MANAGE_ENTITY_ALL enables CRUD flags', () => {
    expect(MANAGE_ENTITY_ALL.create).toBe(true);
    expect(MANAGE_ENTITY_ALL.update).toBe(true);
    expect(MANAGE_ENTITY_ALL.delete).toBe(true);
  });

  it('MANAGE_ENTITY_CREATE only allows create', () => {
    expect(MANAGE_ENTITY_CREATE).toEqual({ create: true, update: false, delete: false });
  });

  it('MANAGE_ENTITY_UPDATE only allows update', () => {
    expect(MANAGE_ENTITY_UPDATE).toEqual({ create: false, update: true, delete: false });
  });

  it('MANAGE_ENTITY_NOT_DELETE allows create+update', () => {
    expect(MANAGE_ENTITY_NOT_DELETE).toEqual({ create: true, update: true, delete: false });
  });

  it('DEFAULT_TAB_INFO / DEFAULT_FIELD_GROUP_INFO expose id/label/order', () => {
    expect(DEFAULT_TAB_INFO.id).toBe('default');
    expect(DEFAULT_TAB_INFO.order).toBe(1);
    expect(DEFAULT_FIELD_GROUP_INFO.id).toBe('default');
  });

  it('STATUS_TAB_INFO is high-order and not hidden', () => {
    expect(STATUS_TAB_INFO.id).toBe('status');
    expect(STATUS_TAB_INFO.order).toBeGreaterThan(1000);
    expect(STATUS_TAB_INFO.hidden).toBe(false);
  });

  it('ModifiableTypes lists all modifiable variants', () => {
    expect(ModifiableTypes.map((o) => o.value)).toEqual([
      'ALWAYS',
      'ADD_ONLY',
      'MODIFY_ONLY',
      'VIEW_ONLY',
      'VIEW_HIDDEN',
      'HIDDEN',
    ]);
  });

  it('ViewPresetTypes has three presets', () => {
    expect(ViewPresetTypes.length).toBe(3);
  });
});

describe('getViewPreset', () => {
  it('maps ALWAYS → ALWAYS', () => {
    expect(getViewPreset('ALWAYS')).toBe(ALWAYS);
  });
  it('maps MODIFY_ONLY → MODIFY_ONLY', () => {
    expect(getViewPreset('MODIFY_ONLY')).toBe(MODIFY_ONLY);
  });
  it('maps ADD_ONLY (and unknown) → ADD_ONLY via else branch', () => {
    expect(getViewPreset('ADD_ONLY')).toBe(ADD_ONLY);
    // LIST_ONLY is declared in the ViewPresetType union but is not a known branch;
    // the else path returns ADD_ONLY.
    expect(getViewPreset('LIST_ONLY')).toBe(ADD_ONLY);
  });
});

describe('getModifiableType', () => {
  it('covers every branch', () => {
    expect(getModifiableType('ALWAYS')).toBe(ALWAYS);
    expect(getModifiableType('ADD_ONLY')).toBe(ADD_ONLY);
    expect(getModifiableType('MODIFY_ONLY')).toBe(MODIFY_ONLY);
    expect(getModifiableType('VIEW_ONLY')).toBe(VIEW_ONLY);
    expect(getModifiableType('VIEW_HIDDEN')).toBe(VIEW_HIDDEN);
    expect(getModifiableType('HIDDEN')).toBe(HIDDEN);
  });

  it('falls back to ALWAYS for unknown input', () => {
    // Cast to any so we can pass a bogus value.
    expect(getModifiableType('__unknown__' as any)).toBe(ALWAYS);
  });
});

describe('AssetConfig', () => {
  it('AssetConfig.create applies defaults (10mb, 1 count, provided extensions)', () => {
    const c = AssetConfig.create(undefined, undefined, 'png', 'jpg');
    expect(c.maxSize).toBe(10);
    expect(c.maxCount).toBe(1);
    expect(c.extensions).toEqual(['png', 'jpg']);
  });

  it('AssetConfig.create honors passed values', () => {
    const c = AssetConfig.create(50, 3, 'pdf');
    expect(c.maxSize).toBe(50);
    expect(c.maxCount).toBe(3);
    expect(c.extensions).toEqual(['pdf']);
  });

  it('withMaxSize / withMaxCount / withExtensions are fluent', () => {
    const c = new AssetConfig().withMaxSize(1).withMaxCount(2).withExtensions('a', 'b');
    expect(c.maxSize).toBe(1);
    expect(c.maxCount).toBe(2);
    expect(c.extensions).toEqual(['a', 'b']);
  });
});

describe('getConditionalBoolean', () => {
  it('returns false when condition is undefined', async () => {
    expect(await getConditionalBoolean({}, undefined)).toBe(false);
  });

  it('returns the boolean as-is', async () => {
    expect(await getConditionalBoolean({}, true)).toBe(true);
    expect(await getConditionalBoolean({}, false)).toBe(false);
  });

  it('invokes a function condition and resolves its result', async () => {
    const fn = async () => true;
    expect(await getConditionalBoolean({ renderType: 'create' }, fn)).toBe(true);
  });

  it('returns false when function resolves null', async () => {
    const fn = async () => null as unknown as boolean;
    expect(await getConditionalBoolean({}, fn)).toBe(false);
  });

  it('reads onCreate for create render type', async () => {
    const result = await getConditionalBoolean(
      { renderType: 'create' },
      { onCreate: true, onUpdate: false },
    );
    expect(result).toBe(true);
  });

  it('reads onUpdate for update render type', async () => {
    const result = await getConditionalBoolean(
      { renderType: 'update' },
      { onCreate: true, onUpdate: false },
    );
    expect(result).toBe(false);
  });

  it('falls back to entityForm.getRenderType when renderType absent', async () => {
    const props: ConditionalValue = { entityForm: stubEntityForm('update') };
    const result = await getConditionalBoolean(props, { onCreate: true, onUpdate: false });
    expect(result).toBe(false);
  });

  it('uses onCreate/onUpdate fallback when renderType is undefined entirely', async () => {
    const result = await getConditionalBoolean({}, { onCreate: true });
    expect(result).toBe(true);
    const result2 = await getConditionalBoolean({}, { onUpdate: true });
    expect(result2).toBe(true);
  });
});

describe('getConditionalString', () => {
  it('returns empty string when condition is undefined', async () => {
    expect(await getConditionalString({}, undefined)).toBe('');
  });

  it('returns a literal string', async () => {
    expect(await getConditionalString({}, 'hello')).toBe('hello');
  });

  it('invokes function and returns its string', async () => {
    expect(await getConditionalString({}, async () => 'value')).toBe('value');
  });

  it('returns "" when function resolves null', async () => {
    const fn = async () => null as unknown as string;
    expect(await getConditionalString({}, fn)).toBe('');
  });

  it('picks onUpdate when renderType is update', async () => {
    const result = await getConditionalString(
      { renderType: 'update' },
      { onCreate: 'c', onUpdate: 'u' },
    );
    expect(result).toBe('u');
  });

  it('picks onCreate when renderType is create', async () => {
    const result = await getConditionalString(
      { renderType: 'create' },
      { onCreate: 'c', onUpdate: 'u' },
    );
    expect(result).toBe('c');
  });

  it('falls back to onCreate when renderType is unknown and onCreate set', async () => {
    const result = await getConditionalString({}, { onCreate: 'c', onUpdate: 'u' });
    expect(result).toBe('c');
  });

  it('falls back to onUpdate when onCreate missing and renderType unknown', async () => {
    const result = await getConditionalString({}, { onUpdate: 'u' });
    expect(result).toBe('u');
  });
});

describe('getConditionalReactNode', () => {
  it('returns "" when condition is undefined', async () => {
    expect(await getConditionalReactNode({}, undefined)).toBe('');
  });

  it('returns a plain string condition as-is', async () => {
    expect(await getConditionalReactNode({}, 'node')).toBe('node');
  });

  it('returns a number condition as-is', async () => {
    expect(await getConditionalReactNode({}, 42)).toBe(42);
  });

  it('calls a function condition and resolves the ReactNode', async () => {
    const node = await getConditionalReactNode({}, async () => 'hello');
    expect(node).toBe('hello');
  });

  it('coalesces a null function result to ""', async () => {
    const fn = async () => null as any;
    expect(await getConditionalReactNode({}, fn)).toBe('');
  });

  it('resolves optional onCreate/onUpdate for update renderType', async () => {
    const node = await getConditionalReactNode(
      { renderType: 'update' },
      { onCreate: 'c', onUpdate: 'u' },
    );
    expect(node).toBe('u');
  });

  it('resolves optional onCreate for create renderType', async () => {
    const node = await getConditionalReactNode(
      { renderType: 'create' },
      { onCreate: 'c', onUpdate: 'u' },
    );
    expect(node).toBe('c');
  });

  it('returns null for a non-matching, non-ReactNode object shape', async () => {
    // Pass something that is neither string/number, nor optional react node.
    const weird = { foo: 'bar' } as any;
    const node = await getConditionalReactNode({}, weird);
    expect(node).toBeNull();
  });
});

describe('HAS_VALUE_READONLY / HAS_VALUE_HIDDEN', () => {
  it('HAS_VALUE_READONLY returns true when value.current is set', async () => {
    const fn = HAS_VALUE_READONLY.readonly as (p: ConditionalValue) => Promise<boolean>;
    expect(await fn({ value: { current: 'x' } })).toBe(true);
  });

  it('HAS_VALUE_READONLY returns true when value.fetched is set', async () => {
    const fn = HAS_VALUE_READONLY.readonly as (p: ConditionalValue) => Promise<boolean>;
    expect(await fn({ value: { fetched: 'y' } })).toBe(true);
  });

  it('HAS_VALUE_READONLY returns false when both current/fetched absent', async () => {
    const fn = HAS_VALUE_READONLY.readonly as (p: ConditionalValue) => Promise<boolean>;
    expect(await fn({ value: {} })).toBe(false);
    expect(await fn({})).toBe(false);
  });

  it('HAS_VALUE_HIDDEN follows the same semantics', async () => {
    const fn = HAS_VALUE_HIDDEN.hidden as (p: ConditionalValue) => Promise<boolean>;
    expect(await fn({ value: { current: 1 } })).toBe(true);
    expect(await fn({})).toBe(false);
  });
});

describe('excludeIdListOnManyToOneLookUp', () => {
  it('returns a NULL filter when idList is empty/undefined', async () => {
    const filter = excludeIdListOnManyToOneLookUp();
    // entityForm is irrelevant for this branch
    const result = await filter({} as any);
    expect(result).toEqual([{ name: '__blank__', queryConditionType: 'NULL' }]);
  });

  it('returns NOT_IN filter with the given idList', async () => {
    const filter = excludeIdListOnManyToOneLookUp(['a', 'b']);
    const result = await filter({} as any);
    expect(result).toEqual([{ name: 'id', queryConditionType: 'NOT_IN', values: ['a', 'b'] }]);
  });
});

describe('excludeSelfOnManyToOneLookup', () => {
  it('returns a NOT_IN filter using entityForm.getId()', async () => {
    const filter = excludeSelfOnManyToOneLookup();
    const entityForm = { getId: () => 'xid' } as any;
    const result = await filter(entityForm);
    expect(result).toEqual([{ name: 'id', queryConditionType: 'NOT_IN', values: ['xid'] }]);
  });
});
