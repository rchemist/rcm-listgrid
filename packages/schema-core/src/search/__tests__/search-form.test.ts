import { describe, expect, it } from 'vitest';
import { SearchForm } from '../search-form';
import type { FilterItem, QueryConditionType } from '../search-form';

// GX-1 (documents/analysis/2026-07-12/w7-post-seal-gap-analysis.md) — wire
// JSON parity with rcm-backend-framework 0.1.0 `SearchRequest`/`FilterItem`
// (mirrors core/rcm-core-search/src/test/java/io/rchemist/core/search/
// SearchRequestJacksonTest.java's wire examples) + the restored 0.3.x
// `withFilter`/`withFilterIgnoreDuplicate` builders GJCU's ~72 call sites
// need, + the quickSearch accumulation-bug fix.

/** Round-trip through JSON exactly like `JSON.stringify(searchForm)` would on the wire. */
function wire(sf: SearchForm): unknown {
  return JSON.parse(JSON.stringify(sf.toJSON()));
}

describe('SearchForm.toJSON() — rcm-backend-framework 0.1.0 SearchRequest wire parity', () => {
  it('AND tree + LIKE / IN — mirrors SearchRequestJacksonTest.andFilterTreeDeserialize', () => {
    const sf = SearchForm.create({ page: 0, pageSize: 20 }).withFilter(
      'AND',
      { name: 'title', value: 'spring', queryConditionType: 'LIKE' },
      { name: 'status', values: ['PUBLISHED', 'REVIEW'], queryConditionType: 'IN' },
    );

    expect(wire(sf)).toEqual({
      page: 0,
      pageSize: 20,
      sorts: [],
      filters: {
        AND: [
          { name: 'title', value: 'spring', queryConditionType: 'LIKE' },
          { name: 'status', values: ['PUBLISHED', 'REVIEW'], queryConditionType: 'IN' },
        ],
        OR: [],
      },
      quickSearchFields: [],
    });
  });

  it('nested subFilters group (OR) + a top-level NOT group — operator-keyed map, not a flat array', () => {
    const sf = SearchForm.create()
      .withFilter(
        'AND',
        {
          name: '__group',
          queryConditionType: 'EQUAL',
          subFilters: {
            OR: [
              { name: 'published', value: 'false', queryConditionType: 'EQUAL' },
              { name: 'viewCount', value: '0', queryConditionType: 'EQUAL' },
            ],
          },
        },
        { name: 'title', value: 'math', queryConditionType: 'NOT_LIKE' },
      )
      .withFilter('NOT', { name: 'archived', value: 'true', queryConditionType: 'EQUAL' });

    expect(wire(sf)).toEqual({
      page: 0,
      pageSize: 20,
      sorts: [],
      filters: {
        AND: [
          {
            name: '__group',
            queryConditionType: 'EQUAL',
            subFilters: {
              OR: [
                { name: 'published', value: 'false', queryConditionType: 'EQUAL' },
                { name: 'viewCount', value: '0', queryConditionType: 'EQUAL' },
              ],
            },
          },
          { name: 'title', value: 'math', queryConditionType: 'NOT_LIKE' },
        ],
        OR: [],
        NOT: [{ name: 'archived', value: 'true', queryConditionType: 'EQUAL' }],
      },
      quickSearchFields: [],
    });
  });

  it('variadic OR filter (GJCU OR call sites)', () => {
    const sf = SearchForm.create().withFilter(
      'OR',
      { name: 'a', value: '1' },
      { name: 'b', value: '2' },
      { name: 'c', value: '3' },
    );

    expect(wire(sf)).toMatchObject({
      filters: {
        AND: [],
        OR: [
          { name: 'a', value: '1' },
          { name: 'b', value: '2' },
          { name: 'c', value: '3' },
        ],
      },
    });
  });

  it('cacheKey is ABSENT from the wire (never a SearchRequest field)', () => {
    const sf = SearchForm.create().withFilter('AND', { name: 'x', value: 'y' });
    const json = wire(sf) as Record<string, unknown>;

    expect('cacheKey' in json).toBe(false);
    // exact top-level field audit — only SearchRequest-declared fields ride the wire
    expect(Object.keys(json).sort()).toEqual([
      'filters',
      'page',
      'pageSize',
      'quickSearchFields',
      'sorts',
    ]);
  });

  it('the 24-value QueryConditionType union accepts the full framework enum', () => {
    // Copied verbatim from core/rcm-core-search/.../QueryConditionType.java:38-81
    const ALL: QueryConditionType[] = [
      'EQUAL',
      'NOT_EQUAL',
      'IN',
      'NOT_IN',
      'LIKE',
      'NOT_LIKE',
      'GREATER_THAN',
      'GREATER_THAN_EQUAL',
      'LESS_THAN',
      'LESS_THAN_EQUAL',
      'BETWEEN',
      'IS_NULL',
      'IS_NOT_NULL',
      'IS_BLANK',
      'IS_NOT_BLANK',
      'NULL_OR_EQUAL',
      'NULL_OR_BLANK',
      'IN_RANGE',
      'NOT_IN_RANGE',
      'DATE_BEFORE',
      'DATE_AFTER',
      'DATE_BETWEEN',
      'JSON_CONTAINS',
      'EXISTS',
    ];
    expect(ALL).toHaveLength(24);
    expect(new Set(ALL).size).toBe(24);

    const items: FilterItem[] = ALL.map((queryConditionType, i) => ({
      name: `f${i}`,
      value: 'v',
      queryConditionType,
    }));
    const sf = SearchForm.create().withFilter('AND', ...items);
    expect(sf.toJSON().filters.AND).toEqual(items);
  });
});

describe('SearchForm.withFilter — restored 0.3.x semantics (src/listgrid/form/SearchForm.ts:420-448)', () => {
  it('replaces an existing item with the same name WITHIN the condition bucket', () => {
    let sf = SearchForm.create().withFilter('AND', {
      name: 'status',
      value: 'DRAFT',
      queryConditionType: 'EQUAL',
    });
    sf = sf.withFilter('AND', { name: 'status', value: 'PUBLISHED', queryConditionType: 'EQUAL' });

    expect(sf.toJSON().filters.AND).toEqual([
      { name: 'status', value: 'PUBLISHED', queryConditionType: 'EQUAL' },
    ]);
  });

  it('drops blank-name entries (existing AND newly-passed)', () => {
    const sf = SearchForm.create().withFilter(
      'AND',
      { name: '', value: 'x' },
      { name: '   ', value: 'y' },
      { name: 'ok', value: 'z' },
    );

    expect(sf.toJSON().filters.AND).toEqual([{ name: 'ok', value: 'z' }]);
  });

  it('leaves the OTHER condition bucket untouched', () => {
    const sf = SearchForm.create()
      .withFilter('AND', { name: 'a', value: '1' })
      .withFilter('OR', { name: 'b', value: '2' });

    expect(sf.toJSON().filters.AND).toEqual([{ name: 'a', value: '1' }]);
    expect(sf.toJSON().filters.OR).toEqual([{ name: 'b', value: '2' }]);
  });

  it('is immutable — the receiver is unchanged, a NEW SearchForm is returned', () => {
    const base = SearchForm.create();
    const next = base.withFilter('AND', { name: 'x', value: '1' });

    expect(base.toJSON().filters.AND).toEqual([]);
    expect(next.toJSON().filters.AND).toEqual([{ name: 'x', value: '1' }]);
    expect(next).not.toBe(base);
  });
});

describe('SearchForm.withFilterIgnoreDuplicate — restored 0.3.x semantics (src/listgrid/form/SearchForm.ts:450-462)', () => {
  it('appends without de-dup or blank-name filtering (distinct from withFilter)', () => {
    let sf = SearchForm.create().withFilterIgnoreDuplicate('AND', { name: 'x', value: '1' });
    sf = sf.withFilterIgnoreDuplicate('AND', { name: 'x', value: '2' });

    expect(sf.toJSON().filters.AND).toEqual([
      { name: 'x', value: '1' },
      { name: 'x', value: '2' },
    ]);
  });
});

describe('SearchForm.addAndFilter — unchanged sugar (W5-3 / ViewListGrid.tsx:254-272 relies on stacking, not replace)', () => {
  it('plain append — repeated same-name calls stack rather than replace', () => {
    let sf = SearchForm.create().addAndFilter({ name: 'active', value: true });
    sf = sf.addAndFilter({ name: 'active', value: false });

    expect(sf.toJSON().filters.AND).toEqual([
      { name: 'active', value: true },
      { name: 'active', value: false },
    ]);
  });
});

describe('SearchForm.quickSearch — de-dup/accumulation bug fix (gap analysis §4 bullet 6)', () => {
  it('a repeated quickSearch() call REPLACES the prior quick-search OR filters instead of accumulating', () => {
    let sf = SearchForm.create();
    sf = sf.quickSearch(['name', 'code'], 'foo');
    expect(sf.toJSON().filters.OR).toEqual([
      { name: 'name', value: 'foo', queryConditionType: 'LIKE' },
      { name: 'code', value: 'foo', queryConditionType: 'LIKE' },
    ]);

    sf = sf.quickSearch(['name', 'code'], 'bar');
    expect(sf.toJSON().filters.OR).toEqual([
      { name: 'name', value: 'bar', queryConditionType: 'LIKE' },
      { name: 'code', value: 'bar', queryConditionType: 'LIKE' },
    ]);
  });

  it('replaces even when the field list changes across calls', () => {
    let sf = SearchForm.create().quickSearch(['name', 'code'], 'foo');
    sf = sf.quickSearch(['title'], 'baz');

    expect(sf.toJSON().filters.OR).toEqual([
      { name: 'title', value: 'baz', queryConditionType: 'LIKE' },
    ]);
  });

  it('an empty value clears the quick-search OR filters', () => {
    let sf = SearchForm.create().quickSearch(['name'], 'foo');
    sf = sf.quickSearch(['name'], '');

    expect(sf.toJSON().filters.OR).toEqual([]);
  });

  it('resets to page 0', () => {
    const sf = SearchForm.create({ page: 3 }).quickSearch(['name'], 'foo');
    expect(sf.page).toBe(0);
  });
});
