import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  SearchForm,
  type BackendAdapter,
  type BeforeListFetchContext,
  type AfterListFetchContext,
  type Direction,
  type EntityForm,
  type Session,
} from '@listgrid/schema-core';

// createListStore — the list-grid store (charter C9). Holds the SearchForm +
// page results; every interaction (page/sort/quick-search) produces a new
// immutable SearchForm and refetches through the injected BackendAdapter
// (dependency inversion — @listgrid/state never imports a transport).

export interface ListStoreState<T = Record<string, unknown>> {
  rows: T[];
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | undefined;
  searchForm: SearchForm;

  fetch(): Promise<void>;
  setPage(page: number): Promise<void>;
  setPageSize(pageSize: number): Promise<void>;
  setSort(field: string, direction: Direction): Promise<void>;
  quickSearch(fields: string[], value: string): Promise<void>;
  /** Dismiss the last list-fetch failure without changing rows/search state. */
  clearError(): void;
  /**
   * Replace the store's `searchForm` wholesale (spec §7 CAP-20; W5-3) — the
   * advanced-search panel's apply action hands the fully composed AND/OR
   * `SearchForm` here. Resets to page 0 (same page-reset precedent
   * as `quickSearch`/`withPageSize` — a changed filter set invalidates
   * whatever page the user was on) then refetches through the same pipe.
   */
  setSearchForm(next: SearchForm): Promise<void>;
}

export interface CreateListStoreOptions {
  url: string;
  adapter: BackendAdapter;
  initialSearch?: SearchForm;
  /**
   * The hook source (spec §4.1; W2-6) — when given, `fetch()` dispatches its
   * `onBeforeListFetch`/`onAfterListFetch` handlers (see {@link EntityForm.
   * getBeforeListFetchHandlers}/`getAfterListFetchHandlers`). Absent or
   * handler-less is a no-op fetch pipe (unchanged pre-W2-6 behavior).
   */
  entityForm?: EntityForm;
  /** Passed through as `session` on every list-fetch hook context (spec §4.1). */
  session?: Session;
  /**
   * EA-D2-0 (decision ①, §3): applied to `page.content` right before `set()`
   * — on EVERY `fetch()` call, including pagination/sort/quick-search
   * refetches, not just the initial load (the briefing's Priority-view
   * reordering needs the store's `rows` itself to stay consistent across
   * pages). Must be pure — receives/returns a rows array, does not touch
   * `searchForm`. A throwing `postFetch` is recorded in the store's error
   * state and always clears loading, just like an adapter failure. Runs AFTER
   * the onAfterListFetch hooks (spec §4.2) — it is a store-level final pass
   * over whatever the hooks produced.
   */
  postFetch?: (rows: Record<string, unknown>[]) => Record<string, unknown>[];
}

export function createListStore<T = Record<string, unknown>>(
  opts: CreateListStoreOptions,
): StoreApi<ListStoreState<T>> {
  // Latest fetch wins: awaited work from superseded calls is discarded and
  // never writes stale results or errors into this store instance.
  let fetchSeq = 0;

  return createStore<ListStoreState<T>>((set, get) => ({
    rows: [],
    totalElements: 0,
    totalPages: 0,
    loading: false,
    error: undefined,
    searchForm: opts.initialSearch ?? SearchForm.create(),

    async fetch() {
      const seq = ++fetchSeq;
      set({ loading: true, error: undefined });
      const session = opts.session;

      // onBeforeListFetch (spec §4.1/§4.2; W2-6): sequential, registration
      // order, BEFORE adapter.list. setSearchForm is the REAL injection path
      // — the LAST set instance wins and is what the adapter sees. Scoped to
      // THIS fetch only: effectiveSearch is a local, never written back onto
      // the store's own `searchForm` (an injected filter must not become
      // sticky across a later pagination/sort/quick-search refetch).
      let effectiveSearch = get().searchForm;
      for (const handler of opts.entityForm?.getBeforeListFetchHandlers() ?? []) {
        const ctx: BeforeListFetchContext = {
          searchForm: effectiveSearch,
          setSearchForm(next) {
            effectiveSearch = next;
          },
          session,
        };
        try {
          await handler(ctx);
        } catch (e) {
          // spec §4.2 — a throwing list-fetch handler is logged + SKIPPED;
          // the rest still run, fetch still completes.
          console.error('[@listgrid/state] onBeforeListFetch handler threw — skipping it', e);
        }
      }

      let page;
      try {
        page = await opts.adapter.list<T>(opts.url, effectiveSearch);
      } catch (e) {
        if (seq !== fetchSeq) return;
        set({ loading: false, error: e instanceof Error ? e.message : String(e) });
        return;
      }

      // onAfterListFetch (spec §4.1/§4.2; W2-6): sequential, registration
      // order, AFTER a successful adapter.list, BEFORE postFetch. setRows is
      // the injection path — the LAST set instance wins.
      let effectiveRows = page.content as unknown as Record<string, unknown>[];
      for (const handler of opts.entityForm?.getAfterListFetchHandlers() ?? []) {
        const ctx: AfterListFetchContext = {
          rows: effectiveRows,
          totalElements: page.totalElements,
          setRows(rows) {
            effectiveRows = rows as Record<string, unknown>[];
          },
          session,
        };
        try {
          await handler(ctx);
        } catch (e) {
          console.error('[@listgrid/state] onAfterListFetch handler threw — skipping it', e);
        }
      }

      // EA-D2-0 postFetch: applied on EVERY fetch (initial + pagination/sort/
      // quick-search), right before set(), AFTER the onAfterListFetch hooks
      // (a store-level final pass over whatever the hooks produced).
      let rows: T[];
      try {
        rows = opts.postFetch
          ? (opts.postFetch(effectiveRows) as unknown as T[])
          : (effectiveRows as unknown as T[]);
      } catch (e) {
        if (seq !== fetchSeq) return;
        set({ loading: false, error: e instanceof Error ? e.message : String(e) });
        return;
      }
      if (seq !== fetchSeq) return;
      set({
        rows,
        totalElements: page.totalElements,
        totalPages: page.totalPages,
        loading: false,
        error: undefined,
      });
    },

    async setPage(page) {
      set({ searchForm: get().searchForm.withPage(page) });
      await get().fetch();
    },
    async setPageSize(pageSize) {
      set({ searchForm: get().searchForm.withPageSize(pageSize) });
      await get().fetch();
    },
    async setSort(field, direction) {
      set({ searchForm: get().searchForm.withSort(field, direction) });
      await get().fetch();
    },
    async quickSearch(fields, value) {
      set({ searchForm: get().searchForm.quickSearch(fields, value) });
      await get().fetch();
    },
    clearError() {
      set({ error: undefined });
    },
    async setSearchForm(next) {
      set({ searchForm: next.withPage(0) });
      await get().fetch();
    },
  }));
}
