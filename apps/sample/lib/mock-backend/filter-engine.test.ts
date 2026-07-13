// filter-engine.test.ts — TB-1 proof: the mock matcher engine
// (matchesFilter/matchesFilterGroup, store.ts) reproduces
// rcm-backend-framework 0.1.0's row-matching contract as extracted in
// documents/analysis/2026-07-13/tb-matching-semantics.md. Every case below
// traces to that doc's §2 (24-type table + empty-value edges), §1 (group
// semantics + nested subFilters), or §3 (JSON_CONTAINS/EXISTS no-op) — no
// invented behavior (recon §6.8 Do-NOT gate).

import { describe, expect, it } from 'vitest';
import type { FilterItem } from '@listgrid/schema-core';
import {
  EntityStore,
  matchesFilter,
  matchesFilterGroup,
  type SearchFilters,
  type WithId,
} from './store';

interface Row extends WithId {
  name?: string;
  score?: number;
  nickname?: string | null;
  bio?: string;
  tag?: string;
  joinedAt?: string;
  active?: boolean;
}

function row(overrides: Partial<Row> = {}): Row {
  return { id: '1', ...overrides };
}

describe('matchesFilter — 24 QueryConditionType semantics (tb-matching-semantics.md §2)', () => {
  it('EQUAL', () => {
    const f: FilterItem = { name: 'name', queryConditionType: 'EQUAL', value: 'Alice' };
    expect(matchesFilter(row({ name: 'Alice' }), f)).toBe(true);
    expect(matchesFilter(row({ name: 'Bob' }), f)).toBe(false);
  });

  it('NOT_EQUAL', () => {
    const f: FilterItem = { name: 'name', queryConditionType: 'NOT_EQUAL', value: 'Alice' };
    expect(matchesFilter(row({ name: 'Bob' }), f)).toBe(true);
    expect(matchesFilter(row({ name: 'Alice' }), f)).toBe(false);
  });

  it('IN — matches when value is a member; empty values -> FALSE', () => {
    const f: FilterItem = { name: 'tag', queryConditionType: 'IN', values: ['a', 'b'] };
    expect(matchesFilter(row({ tag: 'a' }), f)).toBe(true);
    expect(matchesFilter(row({ tag: 'z' }), f)).toBe(false);
    const empty: FilterItem = { name: 'tag', queryConditionType: 'IN', values: [] };
    expect(matchesFilter(row({ tag: 'a' }), empty)).toBe(false);
  });

  it('NOT_IN — matches when value is NOT a member; empty values -> TRUE', () => {
    const f: FilterItem = { name: 'tag', queryConditionType: 'NOT_IN', values: ['a', 'b'] };
    expect(matchesFilter(row({ tag: 'z' }), f)).toBe(true);
    expect(matchesFilter(row({ tag: 'a' }), f)).toBe(false);
    const empty: FilterItem = { name: 'tag', queryConditionType: 'NOT_IN', values: [] };
    expect(matchesFilter(row({ tag: 'a' }), empty)).toBe(true);
  });

  it('LIKE — case-insensitive substring; value null -> matches all', () => {
    const f: FilterItem = { name: 'name', queryConditionType: 'LIKE', value: 'ali' };
    expect(matchesFilter(row({ name: 'Alice Kim' }), f)).toBe(true);
    expect(matchesFilter(row({ name: 'Bob' }), f)).toBe(false);
    const nullValue: FilterItem = { name: 'name', queryConditionType: 'LIKE', value: undefined };
    expect(matchesFilter(row({ name: 'Bob' }), nullValue)).toBe(true);
  });

  it('NOT_LIKE', () => {
    const f: FilterItem = { name: 'name', queryConditionType: 'NOT_LIKE', value: 'ali' };
    expect(matchesFilter(row({ name: 'Bob' }), f)).toBe(true);
    expect(matchesFilter(row({ name: 'Alice Kim' }), f)).toBe(false);
  });

  it('GREATER_THAN / GREATER_THAN_EQUAL / LESS_THAN / LESS_THAN_EQUAL — numeric', () => {
    expect(
      matchesFilter(row({ score: 75 }), {
        name: 'score',
        queryConditionType: 'GREATER_THAN',
        value: '50',
      }),
    ).toBe(true);
    expect(
      matchesFilter(row({ score: 30 }), {
        name: 'score',
        queryConditionType: 'GREATER_THAN',
        value: '50',
      }),
    ).toBe(false);
    expect(
      matchesFilter(row({ score: 50 }), {
        name: 'score',
        queryConditionType: 'GREATER_THAN_EQUAL',
        value: '50',
      }),
    ).toBe(true);
    expect(
      matchesFilter(row({ score: 49 }), {
        name: 'score',
        queryConditionType: 'GREATER_THAN_EQUAL',
        value: '50',
      }),
    ).toBe(false);
    expect(
      matchesFilter(row({ score: 30 }), {
        name: 'score',
        queryConditionType: 'LESS_THAN',
        value: '50',
      }),
    ).toBe(true);
    expect(
      matchesFilter(row({ score: 75 }), {
        name: 'score',
        queryConditionType: 'LESS_THAN',
        value: '50',
      }),
    ).toBe(false);
    expect(
      matchesFilter(row({ score: 50 }), {
        name: 'score',
        queryConditionType: 'LESS_THAN_EQUAL',
        value: '50',
      }),
    ).toBe(true);
    expect(
      matchesFilter(row({ score: 51 }), {
        name: 'score',
        queryConditionType: 'LESS_THAN_EQUAL',
        value: '50',
      }),
    ).toBe(false);
  });

  it('BETWEEN / IN_RANGE — from<=expr<=to; values.length<2 -> FALSE', () => {
    const between: FilterItem = {
      name: 'score',
      queryConditionType: 'BETWEEN',
      values: ['50', '100'],
    };
    expect(matchesFilter(row({ score: 75 }), between)).toBe(true);
    expect(matchesFilter(row({ score: 10 }), between)).toBe(false);
    const short: FilterItem = { name: 'score', queryConditionType: 'BETWEEN', values: ['50'] };
    expect(matchesFilter(row({ score: 75 }), short)).toBe(false);

    const inRange: FilterItem = {
      name: 'score',
      queryConditionType: 'IN_RANGE',
      values: ['50', '100'],
    };
    expect(matchesFilter(row({ score: 75 }), inRange)).toBe(true);
    expect(matchesFilter(row({ score: 10 }), inRange)).toBe(false);
    const shortRange: FilterItem = {
      name: 'score',
      queryConditionType: 'IN_RANGE',
      values: ['50'],
    };
    expect(matchesFilter(row({ score: 75 }), shortRange)).toBe(false);
  });

  it('NOT_IN_RANGE — !(from<=expr<=to); values.length<2 -> TRUE', () => {
    const f: FilterItem = {
      name: 'score',
      queryConditionType: 'NOT_IN_RANGE',
      values: ['50', '100'],
    };
    expect(matchesFilter(row({ score: 10 }), f)).toBe(true);
    expect(matchesFilter(row({ score: 75 }), f)).toBe(false);
    const short: FilterItem = { name: 'score', queryConditionType: 'NOT_IN_RANGE', values: ['50'] };
    expect(matchesFilter(row({ score: 75 }), short)).toBe(true);
  });

  it('IS_NULL / IS_NOT_NULL', () => {
    expect(matchesFilter(row({}), { name: 'nickname', queryConditionType: 'IS_NULL' })).toBe(true);
    expect(
      matchesFilter(row({ nickname: 'Al' }), { name: 'nickname', queryConditionType: 'IS_NULL' }),
    ).toBe(false);
    expect(
      matchesFilter(row({ nickname: 'Al' }), {
        name: 'nickname',
        queryConditionType: 'IS_NOT_NULL',
      }),
    ).toBe(true);
    expect(matchesFilter(row({}), { name: 'nickname', queryConditionType: 'IS_NOT_NULL' })).toBe(
      false,
    );
  });

  it('IS_BLANK / NULL_OR_BLANK — null/undefined/"" ; IS_NOT_BLANK — inverse', () => {
    for (const type of ['IS_BLANK', 'NULL_OR_BLANK'] as const) {
      expect(matchesFilter(row({ bio: '' }), { name: 'bio', queryConditionType: type })).toBe(true);
      expect(matchesFilter(row({}), { name: 'bio', queryConditionType: type })).toBe(true);
      expect(matchesFilter(row({ bio: 'hello' }), { name: 'bio', queryConditionType: type })).toBe(
        false,
      );
    }
    expect(
      matchesFilter(row({ bio: 'hello' }), { name: 'bio', queryConditionType: 'IS_NOT_BLANK' }),
    ).toBe(true);
    expect(
      matchesFilter(row({ bio: '' }), { name: 'bio', queryConditionType: 'IS_NOT_BLANK' }),
    ).toBe(false);
  });

  it('NULL_OR_EQUAL — null OR equal', () => {
    const f: FilterItem = { name: 'nickname', queryConditionType: 'NULL_OR_EQUAL', value: 'Al' };
    expect(matchesFilter(row({}), f)).toBe(true);
    expect(matchesFilter(row({ nickname: 'Al' }), f)).toBe(true);
    expect(matchesFilter(row({ nickname: 'Bob' }), f)).toBe(false);
  });

  it('DATE_BEFORE / DATE_AFTER — ISO-string chronological', () => {
    const before: FilterItem = {
      name: 'joinedAt',
      queryConditionType: 'DATE_BEFORE',
      value: '2024-06-01',
    };
    expect(matchesFilter(row({ joinedAt: '2024-01-01' }), before)).toBe(true);
    expect(matchesFilter(row({ joinedAt: '2024-12-01' }), before)).toBe(false);
    const after: FilterItem = {
      name: 'joinedAt',
      queryConditionType: 'DATE_AFTER',
      value: '2024-06-01',
    };
    expect(matchesFilter(row({ joinedAt: '2024-12-01' }), after)).toBe(true);
    expect(matchesFilter(row({ joinedAt: '2024-01-01' }), after)).toBe(false);
  });

  it('DATE_BETWEEN — values.length<2 -> FALSE', () => {
    const f: FilterItem = {
      name: 'joinedAt',
      queryConditionType: 'DATE_BETWEEN',
      values: ['2024-01-01', '2024-12-31'],
    };
    expect(matchesFilter(row({ joinedAt: '2024-06-15' }), f)).toBe(true);
    expect(matchesFilter(row({ joinedAt: '2025-01-01' }), f)).toBe(false);
    const short: FilterItem = {
      name: 'joinedAt',
      queryConditionType: 'DATE_BETWEEN',
      values: ['2024-01-01'],
    };
    expect(matchesFilter(row({ joinedAt: '2024-06-15' }), short)).toBe(false);
  });

  it('JSON_CONTAINS / EXISTS — documented no-op, always TRUE (tb-matching-semantics.md §3)', () => {
    expect(
      matchesFilter(row({}), {
        name: 'attributes',
        queryConditionType: 'JSON_CONTAINS',
        value: 'anything',
      }),
    ).toBe(true);
    expect(
      matchesFilter(row({ score: 999 }), {
        name: 'attributes',
        queryConditionType: 'JSON_CONTAINS',
        value: 'x',
      }),
    ).toBe(true);
    expect(matchesFilter(row({}), { name: 'relatedEntity', queryConditionType: 'EXISTS' })).toBe(
      true,
    );
  });
});

describe('type-aware ordering comparison (§2 값 비교 규칙)', () => {
  it('numeric fields compare numerically, not lexically', () => {
    // Lexical "9" > "10" (string compare) would be wrong; numeric 9 < 10 is correct —
    // this is the regression test for the pre-TB-1 String(a)===String(b) bug.
    expect(
      matchesFilter(row({ score: 9 }), {
        name: 'score',
        queryConditionType: 'LESS_THAN',
        value: '10',
      }),
    ).toBe(true);
    expect(
      matchesFilter(row({ score: 90 }), {
        name: 'score',
        queryConditionType: 'LESS_THAN',
        value: '10',
      }),
    ).toBe(false);
  });

  it('ISO date-string fields compare chronologically', () => {
    expect(
      matchesFilter(row({ joinedAt: '2024-02-01' }), {
        name: 'joinedAt',
        queryConditionType: 'GREATER_THAN',
        value: '2024-01-31',
      }),
    ).toBe(true);
    expect(
      matchesFilter(row({ joinedAt: '2023-12-31' }), {
        name: 'joinedAt',
        queryConditionType: 'GREATER_THAN',
        value: '2024-01-31',
      }),
    ).toBe(false);
  });

  it('non-comparable operands -> FALSE (framework disjunction() fallback)', () => {
    // numeric field vs a non-numeric, non-date filter value
    expect(
      matchesFilter(row({ score: 75 }), {
        name: 'score',
        queryConditionType: 'GREATER_THAN',
        value: 'abc',
      }),
    ).toBe(false);
    // boolean field vs an ordering filter
    expect(
      matchesFilter(row({ active: true }), {
        name: 'active',
        queryConditionType: 'GREATER_THAN',
        value: '50',
      }),
    ).toBe(false);
    // missing/null row value
    expect(
      matchesFilter(row({}), { name: 'nickname', queryConditionType: 'GREATER_THAN', value: '50' }),
    ).toBe(false);
  });
});

describe('item-level not — negates the whole leaf predicate', () => {
  it('flips a matching leaf to non-matching and vice versa', () => {
    const f: FilterItem = { name: 'name', queryConditionType: 'EQUAL', value: 'Alice', not: true };
    expect(matchesFilter(row({ name: 'Alice' }), f)).toBe(false);
    expect(matchesFilter(row({ name: 'Bob' }), f)).toBe(true);
  });
});

describe('matchesFilterGroup — group semantics (tb-matching-semantics.md §1)', () => {
  it('AND — every item must match', () => {
    const filters: SearchFilters = {
      AND: [
        { name: 'active', queryConditionType: 'EQUAL', value: 'true' },
        { name: 'score', queryConditionType: 'GREATER_THAN', value: '50' },
      ],
    };
    expect(matchesFilterGroup(row({ active: true, score: 75 }), filters)).toBe(true);
    expect(matchesFilterGroup(row({ active: true, score: 10 }), filters)).toBe(false);
  });

  it('OR — some item must match; empty OR is vacuously TRUE', () => {
    const filters: SearchFilters = {
      OR: [
        { name: 'name', queryConditionType: 'EQUAL', value: 'Alice' },
        { name: 'name', queryConditionType: 'EQUAL', value: 'Bob' },
      ],
    };
    expect(matchesFilterGroup(row({ name: 'Bob' }), filters)).toBe(true);
    expect(matchesFilterGroup(row({ name: 'Carol' }), filters)).toBe(false);

    expect(matchesFilterGroup(row({ name: 'Carol' }), { OR: [] })).toBe(true);
  });

  it('NOT group — !(every NOT item matches); empty NOT is vacuously TRUE', () => {
    const filters: SearchFilters = {
      NOT: [
        { name: 'active', queryConditionType: 'EQUAL', value: 'true' },
        { name: 'score', queryConditionType: 'GREATER_THAN', value: '50' },
      ],
    };
    // both NOT-items match -> every()=true -> group = !true = false (row excluded)
    expect(matchesFilterGroup(row({ active: true, score: 75 }), filters)).toBe(false);
    // only one NOT-item matches -> every()=false -> group = !false = true (row included)
    expect(matchesFilterGroup(row({ active: true, score: 10 }), filters)).toBe(true);

    expect(matchesFilterGroup(row({}), { NOT: [] })).toBe(true);
  });

  it('missing group key does not constrain', () => {
    expect(matchesFilterGroup(row({}), {})).toBe(true);
    expect(matchesFilterGroup(row({}), undefined)).toBe(true);
    expect(matchesFilterGroup(row({}), { AND: [] })).toBe(true);
  });

  it('multiple present groups AND together', () => {
    const filters: SearchFilters = {
      AND: [{ name: 'active', queryConditionType: 'EQUAL', value: 'true' }],
      OR: [
        { name: 'name', queryConditionType: 'EQUAL', value: 'Alice' },
        { name: 'name', queryConditionType: 'EQUAL', value: 'Bob' },
      ],
      NOT: [{ name: 'score', queryConditionType: 'GREATER_THAN', value: '90' }],
    };
    // AND ok (active), OR ok (name=Alice), NOT ok (score=75 doesn't exceed 90 -> every()=false -> !false=true)
    expect(matchesFilterGroup(row({ active: true, name: 'Alice', score: 75 }), filters)).toBe(true);
    // OR fails (name=Carol matches neither Alice nor Bob) -> overall false
    expect(matchesFilterGroup(row({ active: true, name: 'Carol', score: 75 }), filters)).toBe(
      false,
    );
    // NOT fails (score=95 > 90 -> every()=true -> !true=false) -> overall false
    expect(matchesFilterGroup(row({ active: true, name: 'Alice', score: 95 }), filters)).toBe(
      false,
    );
  });
});

describe('nested subFilters — (a LIKE x OR b LIKE x) AND c = y', () => {
  interface PersonRow extends WithId {
    firstName?: string;
    lastName?: string;
    city?: string;
  }

  const nestedOrItem: FilterItem = {
    // Deliberately bogus own leaf — must be IGNORED because subFilters is
    // present (SearchRequestPlanner.buildFilters:146 either/or: hasSubFilters
    // ⇒ buildSubFilter recursion, the item's own name/value/conditionType
    // are never evaluated).
    name: '__ignored__',
    queryConditionType: 'EQUAL',
    value: 'this-should-never-be-evaluated',
    subFilters: {
      OR: [
        { name: 'firstName', queryConditionType: 'LIKE', value: 'ali' },
        { name: 'lastName', queryConditionType: 'LIKE', value: 'ali' },
      ],
    },
  };
  const cityItem: FilterItem = { name: 'city', queryConditionType: 'EQUAL', value: 'Seoul' };
  const filters: SearchFilters = { AND: [nestedOrItem, cityItem] };

  it('matches when either nested branch matches AND the outer condition matches', () => {
    const p1: PersonRow = { id: '1', firstName: 'Alice', lastName: 'Kim', city: 'Seoul' };
    expect(matchesFilterGroup(p1, filters)).toBe(true);

    const p2: PersonRow = { id: '2', firstName: 'Bob', lastName: 'Alison', city: 'Seoul' };
    expect(matchesFilterGroup(p2, filters)).toBe(true);
  });

  it('fails when neither nested branch matches, even if the outer condition matches', () => {
    const p3: PersonRow = { id: '3', firstName: 'Bob', lastName: 'Kim', city: 'Seoul' };
    expect(matchesFilterGroup(p3, filters)).toBe(false);
  });

  it('fails when the nested branch matches but the outer AND sibling does not', () => {
    const p4: PersonRow = { id: '4', firstName: 'Alice', lastName: 'Kim', city: 'Busan' };
    expect(matchesFilterGroup(p4, filters)).toBe(false);
  });

  it('item.not on a subFilters item negates the recursive group result', () => {
    const negated: FilterItem = { ...nestedOrItem, not: true };
    const p5: PersonRow = { id: '5', firstName: 'Alice', lastName: 'Kim', city: 'Seoul' };
    // base OR group would match (firstName LIKE ali) -> not:true flips it to false
    expect(matchesFilter(p5, negated)).toBe(false);

    const p6: PersonRow = { id: '6', firstName: 'Bob', lastName: 'Kim', city: 'Seoul' };
    // base OR group would NOT match -> not:true flips it to true
    expect(matchesFilter(p6, negated)).toBe(true);
  });
});

describe('EntityStore.search() end-to-end wiring', () => {
  interface Item extends WithId {
    name: string;
    score: number;
  }

  it('applies filters through the full search() pipeline', () => {
    const store = new EntityStore<Item>([
      { id: '1', name: 'Alice', score: 90 },
      { id: '2', name: 'Bob', score: 40 },
      { id: '3', name: 'Carol', score: 70 },
    ]);
    const filters: SearchFilters = {
      AND: [{ name: 'score', queryConditionType: 'GREATER_THAN_EQUAL', value: '70' }],
    };
    const { content, totalElements } = store.search(0, 100, filters);
    expect(totalElements).toBe(2);
    expect(content.map((r) => r.id).sort()).toEqual(['1', '3']);
  });
});
