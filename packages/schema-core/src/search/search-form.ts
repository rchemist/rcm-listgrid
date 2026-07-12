// SearchForm — the list query model (charter C9). React-free. The 0.3.x engine
// (src/listgrid/form/SearchForm.ts) kept sorts/filters as Maps with a toJSON()
// bridge; the new engine keeps them as PLAIN serializable state (decision: the
// store does immutable updates, and plain state IS the wire body — no Map↔JSON
// bridge). toJSON() produces the exact POST /{url}/search body (decision D2).
//
// GX-1 (2026-07-12) — wire body realigned to rcm-backend-framework 0.1.0
// `SearchRequest`/`FilterItem` (documents/analysis/2026-07-12/
// w7-post-seal-gap-analysis.md §GX-1):
//  - `filters`/`FilterItem.subFilters` are operator-keyed maps `{AND?,OR?,NOT?}`
//    (nested groups now expressible — framework `LinkedHashMap<LogicalOperator,
//    List<FilterItem>>`, `FilterItem.java:52`).
//  - `cacheKey` no longer appears on the wire — it was never a `SearchRequest`
//    field (client-only convenience the 0.3.x engine also leaked; a strict
//    Jackson backend can reject unknown properties).
//  - `QueryConditionType` expands 12→24 — the framework's full enum
//    (`QueryConditionType.java:38-81`).
//  - The 0.3.x `withFilter`/`withFilterIgnoreDuplicate` builders are restored
//    (GJCU ~72 call sites, including OR) — ported from
//    src/listgrid/form/SearchForm.ts:420-462 onto the 0.4 immutable-clone
//    style (each `with*` returns a NEW SearchForm; `addAndFilter` keeps its
//    existing dumb-append semantics, W5-3/ViewListGrid.tsx:254-272 relies on
//    it NOT de-duping by name).

export type Direction = 'ASC' | 'DESC';

export interface SortSpec {
  field: string;
  direction: Direction;
}

/**
 * Filter-tree logical operator — the wire key of `filters`/`FilterItem.subFilters`
 * (rcm-backend-framework `LogicalOperator`: AND | OR | NOT).
 */
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

// rcm-backend-framework 0.1.0 QueryConditionType — 24 values, copied verbatim
// from core/rcm-core-search/src/main/java/io/rchemist/core/search/
// QueryConditionType.java:38-81 (grouping/comments mirror the Java source).
export type QueryConditionType =
  // Equality 2
  | 'EQUAL'
  | 'NOT_EQUAL'
  // Collection 2
  | 'IN'
  | 'NOT_IN'
  // Pattern 2
  | 'LIKE'
  | 'NOT_LIKE'
  // Comparison 4
  | 'GREATER_THAN'
  | 'GREATER_THAN_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_EQUAL'
  // Range 1
  | 'BETWEEN'
  // Null/Blank 4
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'IS_BLANK'
  | 'IS_NOT_BLANK'
  // Null-or 2
  | 'NULL_OR_EQUAL'
  | 'NULL_OR_BLANK'
  // InRange 2
  | 'IN_RANGE'
  | 'NOT_IN_RANGE'
  // Date 3
  | 'DATE_BEFORE'
  | 'DATE_AFTER'
  | 'DATE_BETWEEN'
  // Special 2
  | 'JSON_CONTAINS'
  | 'EXISTS';

/**
 * Operator-keyed filter-tree map — the wire shape of `filters` and
 * `FilterItem.subFilters` (framework `LinkedHashMap<LogicalOperator,
 * List<FilterItem>>`). Sparse: a nested group only carries the keys it uses
 * (e.g. `{ OR: [...] }` for a quickSearch-style OR group).
 */
export type FilterGroups = {
  AND?: FilterItem[];
  OR?: FilterItem[];
  NOT?: FilterItem[];
};

export interface FilterItem {
  name: string;
  value?: unknown;
  values?: unknown[];
  queryConditionType?: QueryConditionType;
  not?: boolean;
  /** Nested AND/OR/NOT group — e.g. `(a LIKE x OR b LIKE x) AND c = y`. */
  subFilters?: FilterGroups;
  /** ManyToOne/OneToMany JOIN kind (server default: INNER). */
  joinType?: 'INNER' | 'LEFT' | 'RIGHT';
}

export interface SearchFormJSON {
  page: number;
  pageSize: number;
  sorts: SortSpec[];
  filters: FilterGroups;
  quickSearchFields: string[];
}

function isBlankName(name: string | undefined | null): boolean {
  return name === undefined || name === null || name.trim().length === 0;
}

export class SearchForm {
  page = 0;
  pageSize = 20;
  sorts: SortSpec[] = [];
  // Internal engine state (NOT the wire shape) — AND/OR/NOT buckets always
  // present as arrays so `this.filters[condition]` never needs an
  // undefined-check; toJSON() decides what actually reaches the wire.
  filters: { AND: FilterItem[]; OR: FilterItem[]; NOT: FilterItem[] } = {
    AND: [],
    OR: [],
    NOT: [],
  };
  quickSearchFields: string[] = [];

  static create(props?: { page?: number; pageSize?: number }): SearchForm {
    const form = new SearchForm();
    if (props?.page !== undefined) form.page = props.page;
    if (props?.pageSize !== undefined) form.pageSize = props.pageSize;
    return form;
  }

  clone(): SearchForm {
    const c = new SearchForm();
    c.page = this.page;
    c.pageSize = this.pageSize;
    c.sorts = this.sorts.map((s) => ({ ...s }));
    c.filters = {
      AND: this.filters.AND.map((f) => ({ ...f })),
      OR: this.filters.OR.map((f) => ({ ...f })),
      NOT: this.filters.NOT.map((f) => ({ ...f })),
    };
    c.quickSearchFields = [...this.quickSearchFields];
    return c;
  }

  withPage(page: number): SearchForm {
    const c = this.clone();
    c.page = page;
    return c;
  }

  withPageSize(pageSize: number): SearchForm {
    const c = this.clone();
    c.pageSize = pageSize;
    // page-size change resets to first page (0.3.x list behavior)
    c.page = 0;
    return c;
  }

  /** Set (single) sort on a field — multi-sort appends; same field toggles/replaces. */
  withSort(field: string, direction: Direction): SearchForm {
    const c = this.clone();
    const existing = c.sorts.findIndex((s) => s.field === field);
    if (existing >= 0) c.sorts[existing] = { field, direction };
    else c.sorts.push({ field, direction });
    return c;
  }

  clearSort(field: string): SearchForm {
    const c = this.clone();
    c.sorts = c.sorts.filter((s) => s.field !== field);
    return c;
  }

  /** LIKE quick-search across the given fields (charter C9). */
  quickSearch(fields: string[], value: string): SearchForm {
    const c = this.clone();
    // Replace (never accumulate) prior quick-search filters. Pushed items use
    // bare `name: field` (no distinguishing tag), so a prefix-match guard on
    // `name` can never fire — GX-1 fix (w7-post-seal-gap-analysis.md §4
    // bullet 6). Identify "prior quick filters" via the PRIOR
    // quickSearchFields snapshot instead (clear-first strategy).
    const priorQuickFields = new Set(this.quickSearchFields);
    c.filters.OR = c.filters.OR.filter((f) => !priorQuickFields.has(f.name));
    c.quickSearchFields = [...fields];
    if (value) {
      for (const field of fields) {
        c.filters.OR.push({
          name: field,
          value,
          queryConditionType: 'LIKE',
        });
      }
    }
    c.page = 0;
    return c;
  }

  /**
   * AND-filter sugar — plain append, no de-dup by name. Kept as its own
   * (simpler) primitive: ViewListGrid's advanced-search panel deliberately
   * relies on repeated `addAndFilter` calls STACKING same-named clauses
   * rather than replacing them (see ViewListGrid.tsx:254-272's documented
   * W5-3 decision) — do not reroute this through `withFilter`'s replace-by-
   * name semantics without re-checking that call site.
   */
  addAndFilter(item: FilterItem): SearchForm {
    const c = this.clone();
    c.filters.AND.push(item);
    return c;
  }

  /**
   * Restore 0.3.x `withFilter` (src/listgrid/form/SearchForm.ts:420-448) —
   * GJCU ~72 call sites (AND 65 + OR 7, variadic). Widened to accept `'NOT'`
   * too (framework LogicalOperator has 3 members, spec §GX-1 req #3) — a
   * backward-compatible superset of the original `'AND'|'OR'` signature.
   *
   * Semantics (exact 0.3.x port): within the given `condition` bucket only,
   * blank-name entries are dropped and a new item REPLACES an existing item
   * with the same `name` (keeping the new item's position). De-dup is
   * checked against the bucket's PRE-CALL contents only — same-name items
   * within the same variadic call are not deduped against each other (0.3.x
   * parity quirk: `existingNames` is a snapshot taken once, not updated
   * per-iteration).
   */
  withFilter(condition: LogicalOperator, ...items: FilterItem[]): SearchForm {
    const c = this.clone();
    if (items.length === 0) return c;

    const values = c.filters[condition].filter((f) => !isBlankName(f.name));
    const existingNames = new Set(values.map((f) => f.name));
    for (const item of items) {
      if (isBlankName(item.name)) continue;
      if (existingNames.has(item.name)) {
        const idx = values.findIndex((v) => v.name === item.name);
        if (idx >= 0) values.splice(idx, 1);
      }
      values.push(item);
    }
    c.filters[condition] = values;
    return c;
  }

  /**
   * Restore 0.3.x `withFilterIgnoreDuplicate`
   * (src/listgrid/form/SearchForm.ts:450-462) — plain append, no blank-name
   * filtering and no de-dup (distinct from `withFilter`).
   */
  withFilterIgnoreDuplicate(condition: LogicalOperator, ...items: FilterItem[]): SearchForm {
    const c = this.clone();
    if (items.length === 0) return c;
    c.filters[condition] = [...c.filters[condition], ...items];
    return c;
  }

  /**
   * The exact POST /{url}/search request body (decision D2; GX-1 realigns it
   * to rcm-backend-framework 0.1.0 `SearchRequest`). Only
   * `page/pageSize/sorts/filters/quickSearchFields` are emitted — no
   * `cacheKey` (never a SearchRequest field) or other non-contract field.
   *
   * `filters.AND`/`filters.OR` are always emitted (even `[]`) — deliberate
   * back-compat with the existing test suite's `toJSON().filters.AND`
   * assertions (state/list-store, ViewListGrid, ManyToOne picker tests all
   * assert presence, e.g. `toHaveLength(0)` / `toEqual([])`, which would
   * throw on `undefined`). `filters.NOT` is the one truly-optional key (no
   * prior callers), omitted unless populated — matching the framework's
   * sparse-map convention (SearchRequestJacksonTest.java's wire examples
   * never carry an empty group).
   */
  toJSON(): SearchFormJSON {
    const filters: FilterGroups = {
      AND: this.filters.AND.map((f) => ({ ...f })),
      OR: this.filters.OR.map((f) => ({ ...f })),
    };
    if (this.filters.NOT.length > 0) {
      filters.NOT = this.filters.NOT.map((f) => ({ ...f }));
    }

    return {
      page: this.page,
      pageSize: this.pageSize,
      sorts: this.sorts.map((s) => ({ ...s })),
      filters,
      quickSearchFields: [...this.quickSearchFields],
    };
  }
}
