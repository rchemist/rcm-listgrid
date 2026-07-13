// sort-engine.test.ts — TB-2 proof: EntityStore.search() actually SORTS the
// filtered rows before pagination (tb-matching-semantics.md §5, SortBuilder
// — list-order multi-key, NORMAL/PRIORITY, default NULLS LAST regardless of
// direction), plus verification (not new implementation — see §4) that
// quickSearch's OR-group+LIKE narrowing still flows through TB-1's matcher,
// and that 0-base pagination slicing/totals are correct.

import { describe, expect, it } from 'vitest';
import type { SortSpec } from '@listgrid/schema-core';
import { EntityStore, type SearchFilters, type WithId } from './store';

interface Row extends WithId {
  name?: string;
  score?: number | null;
  joinedAt?: string | null;
  team?: string;
}

function makeStore(rows: Row[]): EntityStore<Row> {
  return new EntityStore<Row>(rows);
}

describe('EntityStore.search — sort (tb-matching-semantics.md §5)', () => {
  it('single-key ASC — numeric field sorted numerically, not lexically', () => {
    // Lexical "10" < "2" would be wrong; numeric 2 < 10 is correct — the
    // sort-side sibling of filter-engine.test.ts's numeric-comparison
    // regression test.
    const store = makeStore([
      { id: 'a', score: 10 },
      { id: 'b', score: 2 },
      { id: 'c', score: 1 },
    ]);
    const sorts: SortSpec[] = [{ field: 'score', direction: 'ASC' }];
    const { content } = store.search(0, 100, undefined, sorts);
    expect(content.map((r) => r.score)).toEqual([1, 2, 10]);
  });

  it('single-key DESC — reverses the ASC order', () => {
    const store = makeStore([
      { id: 'a', score: 10 },
      { id: 'b', score: 2 },
      { id: 'c', score: 1 },
    ]);
    const sorts: SortSpec[] = [{ field: 'score', direction: 'DESC' }];
    const { content } = store.search(0, 100, undefined, sorts);
    expect(content.map((r) => r.score)).toEqual([10, 2, 1]);
  });

  it('date/ISO-string field sorted chronologically, not lexically', () => {
    const store = makeStore([
      { id: 'a', joinedAt: '2024-12-01' },
      { id: 'b', joinedAt: '2023-01-15' },
      { id: 'c', joinedAt: '2024-01-01' },
    ]);
    const sorts: SortSpec[] = [{ field: 'joinedAt', direction: 'ASC' }];
    const { content } = store.search(0, 100, undefined, sorts);
    expect(content.map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  it('multi-key — primary sort with secondary tie-break, declaration order = priority', () => {
    const store = makeStore([
      { id: 'a', team: 'red', score: 50 },
      { id: 'b', team: 'blue', score: 90 },
      { id: 'c', team: 'red', score: 10 },
      { id: 'd', team: 'blue', score: 20 },
    ]);
    const sorts: SortSpec[] = [
      { field: 'team', direction: 'ASC' },
      { field: 'score', direction: 'DESC' },
    ];
    const { content } = store.search(0, 100, undefined, sorts);
    // team ASC groups blue before red; within each team, score DESC.
    expect(content.map((r) => r.id)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('nulls last — ASC', () => {
    const store = makeStore([
      { id: 'a', score: 5 },
      { id: 'b', score: null },
      { id: 'c', score: 1 },
      { id: 'd', score: undefined },
    ]);
    const sorts: SortSpec[] = [{ field: 'score', direction: 'ASC' }];
    const { content } = store.search(0, 100, undefined, sorts);
    // non-null ascending first (c=1, a=5), nulls/undefined trail — order
    // among the null-ish rows is whatever the stable sort preserved (b
    // before d, their original relative order).
    expect(content.map((r) => r.id)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('nulls last — DESC too (framework default is direction-independent)', () => {
    const store = makeStore([
      { id: 'a', score: 5 },
      { id: 'b', score: null },
      { id: 'c', score: 1 },
    ]);
    const sorts: SortSpec[] = [{ field: 'score', direction: 'DESC' }];
    const { content } = store.search(0, 100, undefined, sorts);
    // DESC among non-null (a=5, c=1) but null still LAST, not first.
    expect(content.map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });

  it('stable for fully-equal sort keys — original relative order preserved', () => {
    const store = makeStore([
      { id: 'a', team: 'red' },
      { id: 'b', team: 'red' },
      { id: 'c', team: 'red' },
    ]);
    const sorts: SortSpec[] = [{ field: 'team', direction: 'ASC' }];
    const { content } = store.search(0, 100, undefined, sorts);
    expect(content.map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });

  it('empty/absent sorts — filtered order unchanged (no reordering)', () => {
    const rows: Row[] = [
      { id: 'a', score: 10 },
      { id: 'b', score: 2 },
      { id: 'c', score: 1 },
    ];
    const store = makeStore(rows);
    const { content: withUndefined } = store.search(0, 100, undefined, undefined);
    expect(withUndefined.map((r) => r.id)).toEqual(['a', 'b', 'c']);
    const { content: withEmpty } = store.search(0, 100, undefined, []);
    expect(withEmpty.map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });

  it('sort is applied to FILTERED rows before pagination', () => {
    const store = makeStore([
      { id: 'a', team: 'red', score: 30 },
      { id: 'b', team: 'blue', score: 90 },
      { id: 'c', team: 'red', score: 10 },
      { id: 'd', team: 'red', score: 50 },
    ]);
    const filters: SearchFilters = {
      AND: [{ name: 'team', queryConditionType: 'EQUAL', value: 'red' }],
    };
    const sorts: SortSpec[] = [{ field: 'score', direction: 'ASC' }];
    const { content, totalElements } = store.search(0, 100, filters, sorts);
    expect(totalElements).toBe(3);
    expect(content.map((r) => r.id)).toEqual(['c', 'a', 'd']);
  });
});

describe('EntityStore.search — quickSearch verification (tb-matching-semantics.md §4)', () => {
  // listgrid does NOT emit a framework-style `searchTerm` — SearchForm.
  // quickSearch(fields, value) pre-expands into `filters.OR` LIKE items
  // (search-form.ts:178-199). This is a regression/verification test that
  // the existing OR-group+LIKE matcher (TB-1) correctly narrows rows when
  // fed exactly that shape — NO new quickSearch code path exists or is
  // added here.
  interface PersonRow extends WithId {
    firstName?: string;
    lastName?: string;
  }

  it('OR-group of LIKE items narrows rows — case-insensitive substring across fields', () => {
    const store = new EntityStore<PersonRow>([
      { id: '1', firstName: 'Alice', lastName: 'Kim' },
      { id: '2', firstName: 'Bob', lastName: 'Alison' },
      { id: '3', firstName: 'Carol', lastName: 'Lee' },
    ]);
    // quickSearch(['firstName', 'lastName'], 'ali') pre-expands to this
    // exact filters.OR shape.
    const filters: SearchFilters = {
      OR: [
        { name: 'firstName', queryConditionType: 'LIKE', value: 'ALI' },
        { name: 'lastName', queryConditionType: 'LIKE', value: 'ALI' },
      ],
    };
    const { content, totalElements } = store.search(0, 100, filters);
    expect(totalElements).toBe(2);
    expect(content.map((r) => r.id).sort()).toEqual(['1', '2']);
  });

  it('quickSearch OR-group composes with sort', () => {
    const store = new EntityStore<PersonRow & { score?: number }>([
      { id: '1', firstName: 'Alice', lastName: 'Kim', score: 30 },
      { id: '2', firstName: 'Bob', lastName: 'Alison', score: 90 },
      { id: '3', firstName: 'Carol', lastName: 'Lee', score: 10 },
    ]);
    const filters: SearchFilters = {
      OR: [
        { name: 'firstName', queryConditionType: 'LIKE', value: 'ali' },
        { name: 'lastName', queryConditionType: 'LIKE', value: 'ali' },
      ],
    };
    const sorts: SortSpec[] = [{ field: 'score', direction: 'ASC' }];
    const { content } = store.search(0, 100, filters, sorts);
    expect(content.map((r) => r.id)).toEqual(['1', '2']);
  });
});

describe('EntityStore.search — pagination (0-base)', () => {
  const rows: Row[] = Array.from({ length: 7 }, (_, i) => ({ id: String(i + 1), score: i + 1 }));

  it('page 0 vs page 1 with a known pageSize — 0-base start offset', () => {
    const store = makeStore(rows);
    const pageSize = 3;
    const page0 = store.search(0, pageSize);
    const page1 = store.search(1, pageSize);
    expect(page0.content.map((r) => r.id)).toEqual(['1', '2', '3']);
    expect(page1.content.map((r) => r.id)).toEqual(['4', '5', '6']);
  });

  it('totalElements/totalPages correctness', () => {
    const store = makeStore(rows);
    const { totalElements, totalPages } = store.search(0, 3);
    expect(totalElements).toBe(7);
    expect(totalPages).toBe(3); // ceil(7/3)
  });

  it('last page is a short slice (page*pageSize start offset holds)', () => {
    const store = makeStore(rows);
    const page2 = store.search(2, 3);
    expect(page2.content.map((r) => r.id)).toEqual(['7']);
  });

  it('pagination applies AFTER sorting', () => {
    const store = makeStore(rows);
    const sorts: SortSpec[] = [{ field: 'score', direction: 'DESC' }];
    const page0 = store.search(0, 3, undefined, sorts);
    expect(page0.content.map((r) => r.id)).toEqual(['7', '6', '5']);
  });
});
