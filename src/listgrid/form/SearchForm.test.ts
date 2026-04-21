import { describe, it, expect } from 'vitest';
import {
  SearchForm,
  getQueryConditionValueType,
  getQueryConditionTypes,
  getQueryConditionHelpText,
  type FilterItem,
  type QueryConditionType,
} from './SearchForm';

/**
 * Tests are written against the public export surface:
 *   - Top-level helpers: getQueryConditionValueType / getQueryConditionTypes /
 *     getQueryConditionHelpText.
 *   - SearchForm class: focus on the builder methods and serialization
 *     contract, not internal field layouts.
 */

describe('getQueryConditionValueType', () => {
  it('returns MULTIPLE for IN / NOT_IN', () => {
    expect(getQueryConditionValueType('IN')).toBe('MULTIPLE');
    expect(getQueryConditionValueType('NOT_IN')).toBe('MULTIPLE');
  });

  it('returns RANGE for BETWEEN / NOT_BETWEEN', () => {
    expect(getQueryConditionValueType('BETWEEN')).toBe('RANGE');
    expect(getQueryConditionValueType('NOT_BETWEEN')).toBe('RANGE');
  });

  it('returns NONE for NULL / NOT_NULL', () => {
    expect(getQueryConditionValueType('NULL')).toBe('NONE');
    expect(getQueryConditionValueType('NOT_NULL')).toBe('NONE');
  });

  it('returns SINGLE for every other operator', () => {
    expect(getQueryConditionValueType('EQUAL')).toBe('SINGLE');
    expect(getQueryConditionValueType('GREATER')).toBe('SINGLE');
    expect(getQueryConditionValueType('LIKE')).toBe('SINGLE');
    expect(getQueryConditionValueType('ID_EQUAL')).toBe('SINGLE');
  });
});

describe('getQueryConditionTypes', () => {
  // The implementation only reads field.type; we pass a minimal shim that
  // satisfies the FormField<any> argument without instantiating the abstract
  // class. Cast is the least-invasive way to test a pure dispatch function.
  const field = (type: string) =>
    ({ type }) as unknown as Parameters<typeof getQueryConditionTypes>[0];

  it('returns text-oriented operators for text fields', () => {
    const values = getQueryConditionTypes(field('text')).map((o) => o.value);
    expect(values).toContain('LIKE');
    expect(values).toContain('START_WITH');
    expect(values).toContain('END_WITH');
    expect(values).not.toContain('BETWEEN');
  });

  it('returns only equality operators for boolean fields', () => {
    const values = getQueryConditionTypes(field('boolean')).map((o) => o.value);
    expect(values).toEqual(['EQUAL', 'NOT_EQUAL', 'NULL', 'NOT_NULL']);
  });

  it('returns only equality operators for manyToOne fields', () => {
    const values = getQueryConditionTypes(field('manyToOne')).map((o) => o.value);
    expect(values).toEqual(['EQUAL', 'NOT_EQUAL', 'NULL', 'NOT_NULL']);
  });

  it('returns numeric-oriented operators for number/date fields (fallthrough)', () => {
    const values = getQueryConditionTypes(field('number')).map((o) => o.value);
    expect(values).toContain('BETWEEN');
    expect(values).toContain('GREATER');
    expect(values).toContain('LESS_THAN_EQUAL');
    expect(values).not.toContain('LIKE');
  });
});

describe('getQueryConditionHelpText', () => {
  it('interpolates the field name into the help string', () => {
    expect(getQueryConditionHelpText('이름', 'EQUAL')).toContain("'이름'");
    expect(getQueryConditionHelpText('age', 'BETWEEN')).toContain("'age'");
  });

  it('returns "Unknown" for unknown operators', () => {
    expect(getQueryConditionHelpText('x', 'BOGUS' as QueryConditionType)).toBe('Unknown');
  });

  it('covers all standard operators (no Unknown leakage)', () => {
    const ops: QueryConditionType[] = [
      'EQUAL',
      'NOT_EQUAL',
      'EQUAL_IGNORECASE',
      'IN',
      'NOT_IN',
      'NULL',
      'NOT_NULL',
      'LIKE',
      'NOT_LIKE',
      'START_WITH',
      'NOT_START_WITH',
      'END_WITH',
      'NOT_END_WITH',
      'LESS_THAN',
      'LESS_THAN_EQUAL',
      'GREATER',
      'GREATER_THAN_EQUAL',
      'NOT_LESS_THAN',
      'NOT_LESS_THAN_EQUAL',
      'NOT_GREATER',
      'NOT_GREATER_THAN_EQUAL',
      'BETWEEN',
      'NOT_BETWEEN',
      'ID_EQUAL',
    ];
    ops.forEach((op) => {
      expect(getQueryConditionHelpText('x', op)).not.toBe('Unknown');
    });
  });
});

describe('SearchForm factory', () => {
  it('create() uses default page=0 and pageSize=20', () => {
    const form = SearchForm.create();
    expect(form.getPage()).toBe(0);
    expect(form.getPageSize()).toBe(20);
  });

  it('create() accepts overrides', () => {
    const form = SearchForm.create({ page: 3, pageSize: 50 });
    expect(form.getPage()).toBe(3);
    expect(form.getPageSize()).toBe(50);
  });

  it('create() assigns a unique cache key per instance', () => {
    const a = SearchForm.create();
    const b = SearchForm.create();
    expect(a.getCacheKey()).toBeTruthy();
    expect(a.getCacheKey()).not.toBe(b.getCacheKey());
  });
});

describe('SearchForm pagination', () => {
  it('withPage mutates and returns this for chaining', () => {
    const form = SearchForm.create();
    const result = form.withPage(7);
    expect(result).toBe(form);
    expect(form.getPage()).toBe(7);
  });

  it('withPageSize mutates and returns this', () => {
    const form = SearchForm.create();
    form.withPageSize(100);
    expect(form.getPageSize()).toBe(100);
  });
});

describe('SearchForm sorts', () => {
  it('withSort adds a sort entry', () => {
    const form = SearchForm.create().withSort('name', 'ASC');
    expect(form.getSorts().get('name')).toBe('ASC');
    expect(form.getSortDirection('name')).toBe('ASC');
  });

  it('withSort(field, undefined) removes the entry', () => {
    const form = SearchForm.create().withSort('name', 'ASC').withSort('name', undefined);
    expect(form.getSorts().has('name')).toBe(false);
    expect(form.getSortDirection('name')).toBeNull();
  });

  it('re-adding an existing sort moves it to the front', () => {
    const form = SearchForm.create()
      .withSort('a', 'ASC')
      .withSort('b', 'DESC')
      .withSort('a', 'DESC');
    const keys = Array.from(form.getSorts().keys());
    expect(keys[0]).toBe('a');
    expect(form.getSortDirection('a')).toBe('DESC');
  });

  it('clearSorts empties the sorts map', () => {
    const form = SearchForm.create().withSort('name', 'ASC');
    form.clearSorts();
    expect(form.getSorts().size).toBe(0);
  });
});

describe('SearchForm filters', () => {
  it('handleAndFilter adds a new AND filter', () => {
    const form = SearchForm.create().handleAndFilter('name', 'Alice');
    const and = form.getFiltersByCondition('AND');
    expect(and).toHaveLength(1);
    expect(and[0]!.name).toBe('name');
    expect(and[0]!.value).toBe('Alice');
  });

  it('handleAndFilter ignores null/undefined values unless op=NULL', () => {
    const form = SearchForm.create().handleAndFilter('a', null).handleAndFilter('b', undefined);
    expect(form.hasFilters()).toBe(false);
  });

  it('handleAndFilter allows op=NULL without a value', () => {
    const form = SearchForm.create().handleAndFilter('a', null, 'NULL');
    const items = form.getFiltersByCondition('AND');
    expect(items[0]!.queryConditionType).toBe('NULL');
  });

  it('handleAndFilter converts array values into values[]', () => {
    const form = SearchForm.create().handleAndFilter('tags', ['x', 'y'], 'IN');
    const items = form.getFiltersByCondition('AND');
    expect(items[0]!.values).toEqual(['x', 'y']);
    expect(items[0]!.value).toBeUndefined();
  });

  it('handleAndFilter dedupes by field name', () => {
    const form = SearchForm.create()
      .handleAndFilter('name', 'Alice')
      .handleAndFilter('name', 'Bob');
    const items = form.getFiltersByCondition('AND');
    expect(items).toHaveLength(1);
    expect(items[0]!.value).toBe('Bob');
  });

  it('withFilter appends items and dedupes by name on re-add', () => {
    const form = SearchForm.create()
      .withFilter('AND', { name: 'status', value: 'active' })
      .withFilter('AND', { name: 'status', value: 'archived' });
    const items = form.getFiltersByCondition('AND');
    expect(items).toHaveLength(1);
    expect(items[0]!.value).toBe('archived');
  });

  it('withFilter ignores filter items with blank name', () => {
    const form = SearchForm.create().withFilter('AND', { name: '', value: 'x' });
    expect(form.hasFilters()).toBe(false);
  });

  it('withFilterIgnoreDuplicate allows duplicate names', () => {
    const form = SearchForm.create().withFilterIgnoreDuplicate(
      'AND',
      { name: 'x', value: '1' },
      { name: 'x', value: '2' },
    );
    expect(form.getFiltersByCondition('AND')).toHaveLength(2);
  });

  it('removeFilter strips matching entries from all conditions', () => {
    const form = SearchForm.create()
      .handleAndFilter('a', '1')
      .handleAndFilter('b', '2')
      .removeFilter('a');
    const names = form.getFiltersByCondition('AND').map((f) => f.name);
    expect(names).toEqual(['b']);
  });

  it('clearFilters empties all filters', () => {
    const form = SearchForm.create().handleAndFilter('a', '1');
    form.clearFilters();
    expect(form.hasFilters()).toBe(false);
  });

  it('hasFilters is false for a fresh form', () => {
    expect(SearchForm.create().hasFilters()).toBe(false);
  });
});

describe('SearchForm getters', () => {
  it('getSearchValue returns the value for a filtered name, else null', () => {
    const form = SearchForm.create().handleAndFilter('name', 'Alice');
    expect(form.getSearchValue('name')).toBe('Alice');
    expect(form.getSearchValue('missing')).toBeNull();
  });

  it('getSearchValue returns the values array when present', () => {
    const form = SearchForm.create().handleAndFilter('tags', ['x', 'y'], 'IN');
    expect(form.getSearchValue('tags')).toEqual(['x', 'y']);
  });

  it('getSearchValueFromAnyCondition falls back to OR condition', () => {
    const form = SearchForm.create().withFilter('OR', { name: 'kind', value: 'A' });
    expect(form.getSearchValueFromAnyCondition('kind')).toBe('A');
  });

  it('getSearchValueFromAnyCondition prefers AND over OR', () => {
    const form = SearchForm.create()
      .handleAndFilter('kind', 'AND_VAL')
      .withFilter('OR', { name: 'kind', value: 'OR_VAL' });
    expect(form.getSearchValueFromAnyCondition('kind')).toBe('AND_VAL');
  });

  it('getFilterOperator returns the operator set via handleAndFilter', () => {
    const form = SearchForm.create().handleAndFilter('x', '1', 'LIKE');
    expect(form.getFilterOperator('x')).toBe('LIKE');
    expect(form.getFilterOperator('missing')).toBeUndefined();
  });

  it('filterValues returns a map of name -> value-or-values', () => {
    const form = SearchForm.create()
      .handleAndFilter('x', '1')
      .handleAndFilter('tags', ['a', 'b'], 'IN');
    const m = form.filterValues();
    expect(m.get('x')).toBe('1');
    expect(m.get('tags')).toEqual(['a', 'b']);
  });

  it('filterItems includes operator alongside value', () => {
    const form = SearchForm.create().handleAndFilter('x', '1', 'LIKE');
    const items = form.filterItems();
    expect(items.get('x')).toEqual({ value: '1', operator: 'LIKE' });
  });

  it('getFilter returns an array of per-condition matches', () => {
    const form = SearchForm.create().handleAndFilter('name', 'Alice');
    const result = form.getFilter('name');
    expect(result).toHaveLength(1);
    expect(result[0]!.condition).toBe('AND');
    expect(result[0]!.filters[0]!.name).toBe('name');
  });

  it('getFilter returns [] for unmatched names', () => {
    expect(SearchForm.create().getFilter('nope')).toEqual([]);
  });
});

describe('SearchForm preserved filters', () => {
  it('starts empty and reports hasPreservedFilters=false', () => {
    const form = SearchForm.create();
    expect(form.hasPreservedFilters()).toBe(false);
    expect(form.getPreservedFilters()).toEqual([]);
  });

  it('withPreservedFilters stores entries', () => {
    const form = SearchForm.create().withPreservedFilters({ name: 'x', value: '1' });
    expect(form.hasPreservedFilters()).toBe(true);
    expect(form.getPreservedFilters()).toHaveLength(1);
  });
});

describe('SearchForm shouldReturnEmpty / viewDetail / ignoreCache', () => {
  it('isShouldReturnEmpty defaults to false', () => {
    expect(SearchForm.create().isShouldReturnEmpty()).toBe(false);
  });

  it('withShouldReturnEmpty toggles the flag', () => {
    const form = SearchForm.create().withShouldReturnEmpty(true);
    expect(form.isShouldReturnEmpty()).toBe(true);
  });

  it('withViewDetail and withIgnoreCache return this for chaining', () => {
    const form = SearchForm.create();
    expect(form.withViewDetail(true)).toBe(form);
    expect(form.withIgnoreCache()).toBe(form);
    expect(form.withIgnoreCache(false)).toBe(form);
  });
});

describe('SearchForm isFilteredOrSorted', () => {
  it('returns false when no field names are given', () => {
    const form = SearchForm.create().handleAndFilter('name', 'x');
    expect(form.isFilteredOrSorted()).toBe(false);
  });

  it('returns false when there are no filters/sorts at all', () => {
    expect(SearchForm.create().isFilteredOrSorted('name')).toBe(false);
  });

  it('returns true when a matching filter is present', () => {
    const form = SearchForm.create().handleAndFilter('name', 'Alice');
    expect(form.isFilteredOrSorted('name')).toBe(true);
  });

  it('ignores the tenantAlias=defaultTenant special case', () => {
    const form = SearchForm.create().handleAndFilter('tenantAlias', 'defaultTenant');
    expect(form.isFilteredOrSorted('tenantAlias')).toBe(false);
  });

  it('ignores the createdAt-only sort case', () => {
    const form = SearchForm.create().withSort('createdAt', 'DESC');
    expect(form.isFilteredOrSorted('createdAt')).toBe(false);
  });

  it('returns true for any non-createdAt sort', () => {
    const form = SearchForm.create().withSort('name', 'ASC');
    expect(form.isFilteredOrSorted('name')).toBe(true);
  });
});

describe('SearchForm clearFilterAndSort', () => {
  it('clears both filters and sorts', () => {
    const form = SearchForm.create()
      .handleAndFilter('name', 'x')
      .withSort('name', 'ASC')
      .clearFilterAndSort();
    expect(form.hasFilters()).toBe(false);
    expect(form.getSorts().size).toBe(0);
  });
});

describe('SearchForm.deserialize', () => {
  it('returns a fresh instance for undefined/null/empty data', () => {
    const fromUndefined = SearchForm.deserialize(undefined);
    const fromNull = SearchForm.deserialize(null);
    expect(fromUndefined.hasFilters()).toBe(false);
    expect(fromNull.hasFilters()).toBe(false);
    expect(fromUndefined).toBeInstanceOf(SearchForm);
  });

  it('parses JSON strings', () => {
    const json = JSON.stringify({ page: 2, pageSize: 30 });
    const form = SearchForm.deserialize(json);
    expect(form.getPage()).toBe(2);
    expect(form.getPageSize()).toBe(30);
  });

  it('restores sorts from object format', () => {
    const form = SearchForm.deserialize({ sorts: { name: 'DESC' } });
    expect(form.getSortDirection('name')).toBe('DESC');
  });

  it('restores sorts from array tuple format (Java Map serialization)', () => {
    const form = SearchForm.deserialize({ sorts: [['age', 'ASC']] });
    expect(form.getSortDirection('age')).toBe('ASC');
  });

  it('ignores invalid sort directions', () => {
    const form = SearchForm.deserialize({ sorts: { name: 'BOGUS' } });
    expect(form.getSortDirection('name')).toBeNull();
  });

  it('restores filters from object format', () => {
    const form = SearchForm.deserialize({
      filters: { AND: [{ name: 'x', value: '1', queryConditionType: 'EQUAL' }] },
    });
    expect(form.getSearchValue('x')).toBe('1');
  });

  it('rebuilds subFilters into a Map', () => {
    const form = SearchForm.deserialize({
      filters: {
        AND: [
          {
            name: 'q',
            subFilters: { OR: [{ name: 'name', value: 'x', queryConditionType: 'LIKE' }] },
          },
        ],
      },
    });
    const items = form.getFiltersByCondition('AND');
    expect(items[0]!.subFilters).toBeInstanceOf(Map);
    expect(items[0]!.subFilters!.get('OR')).toHaveLength(1);
  });

  it('falls back to an empty form when JSON parsing fails', () => {
    const form = SearchForm.deserialize('{not json}');
    expect(form).toBeInstanceOf(SearchForm);
    expect(form.hasFilters()).toBe(false);
  });
});

describe('SearchForm quick search', () => {
  it('handleQuickSearch builds an AND filter with an OR subFilter', () => {
    const form = SearchForm.create().handleQuickSearch('foo', ['name', 'email']);
    const andFilters = form.getFiltersByCondition('AND');
    expect(andFilters).toHaveLength(1);
    const top = andFilters[0]!;
    expect(top.subFilters).toBeInstanceOf(Map);
    const or = top.subFilters!.get('OR') as FilterItem[];
    expect(or).toHaveLength(2);
    expect(or.map((i) => i.name).sort()).toEqual(['email', 'name']);
    expect(or[0]!.queryConditionType).toBe('LIKE');
  });

  it('handleQuickSearch with blank value clears existing quick search filters', () => {
    const form = SearchForm.create().handleQuickSearch('foo', ['name']);
    expect(form.hasFilters()).toBe(true);
    form.handleQuickSearch('', ['name']);
    expect(form.hasFilters()).toBe(false);
  });

  it('getQuickSearchValue returns the current quick search value', () => {
    const form = SearchForm.create().handleQuickSearch('foo', ['name', 'email']);
    expect(form.getQuickSearchValue()).toBe('foo');
  });

  it('getQuickSearchValue returns null when no quick search configured', () => {
    expect(SearchForm.create().getQuickSearchValue()).toBeNull();
  });

  it('getQuickSearchFields returns a defensive copy', () => {
    const form = SearchForm.create().handleQuickSearch('foo', ['name']);
    const fields = form.getQuickSearchFields();
    expect(fields).toEqual(['name']);
    fields.push('injected');
    expect(form.getQuickSearchFields()).toEqual(['name']);
  });

  it('buildQuickSearchFilter constructs a FilterItem with subFilters map', () => {
    const form = SearchForm.create();
    const item = form.buildQuickSearchFilter('abc', ['a', 'b']);
    expect(item.name).toBe('_quickSearch');
    expect(item.subFilters).toBeInstanceOf(Map);
    expect(item.subFilters!.get('OR')).toHaveLength(2);
  });
});

describe('SearchForm.clone', () => {
  it('produces an independent copy of sorts and filters', () => {
    const original = SearchForm.create({ page: 2, pageSize: 30 })
      .withSort('name', 'ASC')
      .handleAndFilter('status', 'active');

    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy.getPage()).toBe(2);
    expect(copy.getPageSize()).toBe(30);
    expect(copy.getSortDirection('name')).toBe('ASC');
    expect(copy.getSearchValue('status')).toBe('active');

    // Mutate original; copy is unaffected.
    original.handleAndFilter('status', 'archived');
    expect(copy.getSearchValue('status')).toBe('active');
  });

  it('deep-clones subFilters maps', () => {
    const original = SearchForm.create().handleQuickSearch('foo', ['name', 'email']);
    const copy = original.clone();

    const originalTop = original.getFiltersByCondition('AND')[0]!;
    const copyTop = copy.getFiltersByCondition('AND')[0]!;
    expect(copyTop.subFilters).not.toBe(originalTop.subFilters);
    expect(copyTop.subFilters!.get('OR')).toHaveLength(2);
  });

  it('gets a new cache key so downstream caches do not collide', () => {
    const original = SearchForm.create();
    const copy = original.clone();
    expect(copy.getCacheKey()).not.toBe(original.getCacheKey());
  });
});
