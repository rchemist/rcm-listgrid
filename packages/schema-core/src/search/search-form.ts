// SearchForm — the list query model (charter C9). React-free. The 0.3.x engine
// (src/listgrid/form/SearchForm.ts) kept sorts/filters as Maps with a toJSON()
// bridge; the new engine keeps them as PLAIN serializable state (decision: the
// store does immutable updates, and plain state IS the wire body — no Map↔JSON
// bridge). toJSON() produces the exact POST /{url}/search body (decision D2).

export type Direction = 'ASC' | 'DESC';

export interface SortSpec {
  field: string;
  direction: Direction;
}

export type QueryConditionType =
  | 'EQUAL'
  | 'NOT_EQUAL'
  | 'LIKE'
  | 'NOT_LIKE'
  | 'IN'
  | 'NOT_IN'
  | 'GREATER_THAN'
  | 'GREATER_THAN_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_EQUAL'
  | 'IS_NULL'
  | 'IS_NOT_NULL';

export interface FilterItem {
  name: string;
  value?: unknown;
  values?: unknown[];
  queryConditionType?: QueryConditionType;
  not?: boolean;
  subFilters?: FilterItem[];
}

export interface SearchFormJSON {
  cacheKey: string;
  page: number;
  pageSize: number;
  sorts: SortSpec[];
  filters: { AND: FilterItem[]; OR: FilterItem[] };
  quickSearchFields: string[];
}

export class SearchForm {
  cacheKey = '';
  page = 0;
  pageSize = 20;
  sorts: SortSpec[] = [];
  filters: { AND: FilterItem[]; OR: FilterItem[] } = { AND: [], OR: [] };
  quickSearchFields: string[] = [];

  static create(props?: { page?: number; pageSize?: number }): SearchForm {
    const form = new SearchForm();
    if (props?.page !== undefined) form.page = props.page;
    if (props?.pageSize !== undefined) form.pageSize = props.pageSize;
    return form;
  }

  clone(): SearchForm {
    const c = new SearchForm();
    c.cacheKey = this.cacheKey;
    c.page = this.page;
    c.pageSize = this.pageSize;
    c.sorts = this.sorts.map((s) => ({ ...s }));
    c.filters = {
      AND: this.filters.AND.map((f) => ({ ...f })),
      OR: this.filters.OR.map((f) => ({ ...f })),
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
    c.quickSearchFields = [...fields];
    // remove any prior quick-search filters, then add one OR group of LIKEs
    c.filters.OR = c.filters.OR.filter((f) => !f.name.startsWith('__quick__'));
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

  addAndFilter(item: FilterItem): SearchForm {
    const c = this.clone();
    c.filters.AND.push(item);
    return c;
  }

  /** The exact POST /{url}/search request body (decision D2). */
  toJSON(): SearchFormJSON {
    return {
      cacheKey: this.cacheKey,
      page: this.page,
      pageSize: this.pageSize,
      sorts: this.sorts.map((s) => ({ ...s })),
      filters: {
        AND: this.filters.AND.map((f) => ({ ...f })),
        OR: this.filters.OR.map((f) => ({ ...f })),
      },
      quickSearchFields: [...this.quickSearchFields],
    };
  }
}
