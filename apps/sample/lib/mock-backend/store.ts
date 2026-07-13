// Generic in-memory fixture store for the mock rcm backend (apps/sample P1
// scaffold — documents/prd/sample-site-spec.md).
//
// Resets on every process restart (`npm run dev -w apps/sample` again) —
// persistence across restarts is explicitly out of scope for P1. Within a
// running dev server, CRUD must round-trip: a create/update/delete has to
// be visible to a subsequent search.
//
// The store is cached on `globalThis` (not just a module-level variable)
// because Next.js dev-mode Fast Refresh can re-evaluate route modules; a
// plain module-level singleton would silently reset fixture state on every
// edit-triggered recompile. This is the same pattern used for dev-mode
// Prisma-client singletons.

import type { FilterGroups, FilterItem } from '@listgrid/schema-core';

export type WithId = { id: string; [key: string]: unknown };

/**
 * The exact `filters` shape SearchForm.toJSON() puts on the wire — alias for
 * schema-core's `FilterGroups` (sparse operator-keyed map `{AND?,OR?,NOT?}`,
 * search-form.ts:83-87 / framework `LinkedHashMap<LogicalOperator,
 * List<FilterItem>>`, FilterItem.java:52). Kept as a store.ts-local name
 * since crud-routes.ts / major/search/route.ts already import `SearchFilters`.
 */
export type SearchFilters = FilterGroups;

// TB-1 (documents/analysis/2026-07-13/tb-matching-semantics.md — the
// row-matching contract this module reproduces, extracted from
// rcm-backend-framework 0.1.0 FilterDispatcher.java/SearchRequestPlanner.java
// with file:line citations). Supersedes the GX-2/EC3 5-of-24 partial
// implementation (previously: EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE only, the
// remaining 19 types a `default: true` no-op, NOT-group + subFilters
// accepted on the wire but never evaluated).
//
// Value-comparison helpers (§2 "값 비교 규칙"): the framework re-types wire
// strings via `ValueCoercer.coerce(value, fieldType)` before comparing; this
// mock has no field-type metadata, so it inspects the actual JS value on the
// row + filter and picks numeric / chronological / lexical ordering
// (compareOrdered below). Non-comparable pairs return `undefined`, which
// every ordering case treats as FALSE — mirroring FilterDispatcher.compare/
// betweenPredicate's `instanceof Comparable` guard (`cb.disjunction()` on
// failure, FilterDispatcher.java:196-198,206-209).

/** true when `v` is a number, or a non-blank string that parses to a finite number. */
function isNumericValue(v: unknown): boolean {
  if (typeof v === 'number') return Number.isFinite(v);
  if (typeof v === 'string' && v.trim() !== '') return Number.isFinite(Number(v));
  return false;
}

/** Epoch ms for a Date instance or a Date.parse-able string; undefined otherwise. */
function toEpoch(v: unknown): number | undefined {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'string' && v.trim() !== '') {
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : undefined;
  }
  return undefined;
}

/**
 * Type-aware ordering comparator (tb-matching-semantics.md §2 값 비교 규칙):
 * numeric when both sides are numeric/numeric-coercible, chronological when
 * both are Date/ISO-date-like strings, lexical when both are plain strings.
 * Returns `undefined` ("not comparable") for null/undefined operands or
 * mismatched shapes.
 */
function compareOrdered(a: unknown, b: unknown): number | undefined {
  if (a === null || a === undefined || b === null || b === undefined) return undefined;
  if (isNumericValue(a) && isNumericValue(b)) {
    const na = Number(a);
    const nb = Number(b);
    return na < nb ? -1 : na > nb ? 1 : 0;
  }
  if (typeof a !== 'number' && typeof b !== 'number') {
    const da = toEpoch(a);
    const db = toEpoch(b);
    if (da !== undefined && db !== undefined) {
      return da < db ? -1 : da > db ? 1 : 0;
    }
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  return undefined;
}

/**
 * BETWEEN/IN_RANGE/DATE_BETWEEN shared range test — `from <= expr <= to`
 * (FilterDispatcher.betweenPredicate:200-210). Non-comparable operands (on
 * either bound) → false, same `cb.disjunction()` fallback as the two-arg
 * ordering ops; NOT_IN_RANGE negates this result (FilterDispatcher.java:
 * 147-151 `cb.not(betweenPredicate(...))`), so a non-comparable NOT_IN_RANGE
 * comes out TRUE — that falls out naturally from `!isBetween(...)` below.
 */
function isBetween(rowValue: unknown, low: unknown, high: unknown): boolean {
  const cmpLow = compareOrdered(rowValue, low);
  const cmpHigh = compareOrdered(rowValue, high);
  return cmpLow !== undefined && cmpHigh !== undefined && cmpLow >= 0 && cmpHigh <= 0;
}

/** null/undefined/'' — the framework's shared IS_BLANK/NULL_OR_BLANK predicate. */
function isBlank(v: unknown): boolean {
  return v === null || v === undefined || v === '';
}

/**
 * `FilterItem.subFilters` present with >=1 operator key (Java
 * `hasSubFilters()` = `subFilters != null && !subFilters.isEmpty()` — map
 * key count, NOT array length; `{AND:[]}` still counts and degenerates to
 * vacuous TRUE via combineGroup, FilterItem.java:97-99).
 */
function hasNestedGroup(group: FilterGroups | undefined): group is FilterGroups {
  return !!group && Object.keys(group).length > 0;
}

/**
 * `SearchRequestPlanner.combineGroup(op, inner)` (:176-186) — one
 * LogicalOperator bucket's members combined: an empty bucket is vacuously
 * TRUE (`cb.conjunction()`, :177-179) *before* the operator switch, so this
 * applies identically to empty AND/OR/**NOT**. Otherwise AND=every item
 * matches, OR=some item matches, NOT=`!every` (negation of the member
 * conjunction — NOT per-item negation, that's the separate `item.not`).
 */
function combineGroup(row: WithId, op: 'AND' | 'OR' | 'NOT', items: FilterItem[]): boolean {
  if (items.length === 0) return true;
  if (op === 'AND') return items.every((item) => matchesFilter(row, item));
  if (op === 'OR') return items.some((item) => matchesFilter(row, item));
  return !items.every((item) => matchesFilter(row, item));
}

/**
 * FilterItem → row predicate. All 24 `QueryConditionType`s
 * (tb-matching-semantics.md §2, FilterDispatcher.buildBase:99-179).
 */
export function matchesFilter(row: WithId, item: FilterItem): boolean {
  // subFilters ⇒ recurse as a nested group, ignoring this item's own
  // name/value/queryConditionType entirely (SearchRequestPlanner.
  // buildFilters:146 `hasSubFilters() ? buildSubFilter(...) :
  // FilterDispatcher.build(...)` — either/or). item.not still negates the
  // recursive result (FilterDispatcher.build:70 wraps whichever base
  // predicate was built, sub-tree or leaf).
  if (hasNestedGroup(item.subFilters)) {
    const nested = matchesFilterGroup(row, item.subFilters);
    return item.not ? !nested : nested;
  }

  const rowValue = row[item.name];
  const type = item.queryConditionType ?? 'EQUAL';
  let result: boolean;

  switch (type) {
    case 'EQUAL':
      result = String(rowValue) === String(item.value);
      break;
    case 'NOT_EQUAL':
      result = String(rowValue) !== String(item.value);
      break;
    case 'IN':
      // values empty -> FALSE (FilterDispatcher.java:107-109 cb.disjunction()).
      result =
        Array.isArray(item.values) &&
        item.values.length > 0 &&
        item.values.some((v) => String(v) === String(rowValue));
      break;
    case 'NOT_IN':
      // values empty -> TRUE (FilterDispatcher.java:117-120 cb.conjunction()).
      result =
        !Array.isArray(item.values) ||
        item.values.length === 0 ||
        !item.values.some((v) => String(v) === String(rowValue));
      break;
    case 'LIKE':
      // value == null -> matches all (framework likePattern:226-229 "%").
      result =
        item.value == null
          ? true
          : typeof rowValue === 'string' &&
            rowValue.toLowerCase().includes(String(item.value).toLowerCase());
      break;
    case 'NOT_LIKE': {
      const likeMatches =
        item.value == null
          ? true
          : typeof rowValue === 'string' &&
            rowValue.toLowerCase().includes(String(item.value).toLowerCase());
      result = !likeMatches;
      break;
    }
    case 'GREATER_THAN': {
      const cmp = compareOrdered(rowValue, item.value);
      result = cmp !== undefined && cmp > 0;
      break;
    }
    case 'GREATER_THAN_EQUAL': {
      const cmp = compareOrdered(rowValue, item.value);
      result = cmp !== undefined && cmp >= 0;
      break;
    }
    case 'LESS_THAN': {
      const cmp = compareOrdered(rowValue, item.value);
      result = cmp !== undefined && cmp < 0;
      break;
    }
    case 'LESS_THAN_EQUAL': {
      const cmp = compareOrdered(rowValue, item.value);
      result = cmp !== undefined && cmp <= 0;
      break;
    }
    case 'BETWEEN':
    case 'IN_RANGE':
      // values.length<2 -> FALSE (FilterDispatcher.java:141-144 cb.disjunction()).
      result =
        Array.isArray(item.values) &&
        item.values.length >= 2 &&
        isBetween(rowValue, item.values[0], item.values[1]);
      break;
    case 'NOT_IN_RANGE':
      // values.length<2 -> TRUE (FilterDispatcher.java:147-150 cb.conjunction()).
      result =
        !Array.isArray(item.values) ||
        item.values.length < 2 ||
        !isBetween(rowValue, item.values[0], item.values[1]);
      break;
    case 'IS_NULL':
      result = rowValue === null || rowValue === undefined;
      break;
    case 'IS_NOT_NULL':
      result = rowValue !== null && rowValue !== undefined;
      break;
    case 'IS_BLANK':
    case 'NULL_OR_BLANK': // = IS_BLANK (FilterDispatcher.java:163-166).
      result = isBlank(rowValue);
      break;
    case 'IS_NOT_BLANK':
      result = !isBlank(rowValue);
      break;
    case 'NULL_OR_EQUAL':
      result =
        rowValue === null || rowValue === undefined || String(rowValue) === String(item.value);
      break;
    case 'DATE_BEFORE': {
      const cmp = compareOrdered(rowValue, item.value);
      result = cmp !== undefined && cmp < 0;
      break;
    }
    case 'DATE_AFTER': {
      const cmp = compareOrdered(rowValue, item.value);
      result = cmp !== undefined && cmp > 0;
      break;
    }
    case 'DATE_BETWEEN':
      // values.length<2 -> FALSE (FilterDispatcher.java:171-174 cb.disjunction()).
      result =
        Array.isArray(item.values) &&
        item.values.length >= 2 &&
        isBetween(rowValue, item.values[0], item.values[1]);
      break;
    case 'JSON_CONTAINS':
    case 'EXISTS':
      // Documented no-op (tb-matching-semantics.md §3): the framework
      // resolves these against a JSON column / relational subquery
      // (FilterDispatcher.jsonContains:256-266, existsSubQuery:272-283) —
      // this store's rows are flat in-memory objects with no JSON path and
      // no relation to subquery against, so no faithful predicate is
      // possible. Explicit always-TRUE, locked by filter-engine.test.ts —
      // NOT an invented semantic, a cited data-model limitation.
      result = true;
      break;
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`unreachable queryConditionType: ${String(exhaustiveCheck)}`);
    }
  }

  return item.not ? !result : result;
}

/**
 * `filters` (top-level) or `FilterItem.subFilters` (nested) → row predicate.
 * `andOk ∧ orOk ∧ notOk`; each group evaluated only if its key is present —
 * a missing key doesn't constrain (mirrors buildFilters/buildSubFilter only
 * folding present LogicalOperator map entries into the group `cb.and`,
 * SearchRequestPlanner.java:143-154/161-173).
 */
export function matchesFilterGroup(row: WithId, filters?: SearchFilters): boolean {
  if (!filters) return true;
  const andOk = filters.AND ? combineGroup(row, 'AND', filters.AND) : true;
  const orOk = filters.OR ? combineGroup(row, 'OR', filters.OR) : true;
  const notOk = filters.NOT ? combineGroup(row, 'NOT', filters.NOT) : true;
  return andOk && orOk && notOk;
}

function nextId(rows: WithId[]): string {
  const max = rows.reduce((acc, row) => {
    const n = Number(row.id);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return String(max + 1);
}

export class EntityStore<T extends WithId> {
  private rows: T[];

  constructor(seed: T[]) {
    this.rows = [...seed];
  }

  search(
    page = 0,
    pageSize = 20,
    filters?: SearchFilters,
  ): { content: T[]; totalElements: number; totalPages: number } {
    const filtered = filters
      ? this.rows.filter((row) => matchesFilterGroup(row, filters))
      : this.rows;
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / Math.max(pageSize, 1)));
    const start = page * pageSize;
    const content = filtered.slice(start, start + pageSize);
    return { content, totalElements, totalPages };
  }

  findById(id: string): T | undefined {
    return this.rows.find((row) => row.id === id);
  }

  create(data: Partial<T>): T {
    const id = nextId(this.rows);
    const row = { ...data, id } as T;
    this.rows.push(row);
    return row;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const idx = this.rows.findIndex((row) => row.id === id);
    if (idx === -1) return undefined;
    const existing = this.rows[idx] as T;
    const updated = { ...existing, ...data, id } as T;
    this.rows[idx] = updated;
    return updated;
  }

  remove(id: string): T | undefined {
    const idx = this.rows.findIndex((row) => row.id === id);
    if (idx === -1) return undefined;
    const [removed] = this.rows.splice(idx, 1);
    return removed;
  }
}

type StoreRegistry = Map<string, EntityStore<WithId>>;

const globalForStores = globalThis as unknown as { __listgridMockStores?: StoreRegistry };

function registry(): StoreRegistry {
  if (!globalForStores.__listgridMockStores) {
    globalForStores.__listgridMockStores = new Map();
  }
  return globalForStores.__listgridMockStores;
}

/**
 * Get (or lazily create) the singleton in-memory store for `entityName`.
 * More entities can be wired up later by calling this with a different name
 * and seed — P1 only needs `employee`.
 */
export function getOrCreateStore<T extends WithId>(entityName: string, seed: T[]): EntityStore<T> {
  const reg = registry();
  if (!reg.has(entityName)) {
    reg.set(entityName, new EntityStore<WithId>(seed));
  }
  return reg.get(entityName) as unknown as EntityStore<T>;
}
