import { createStore, type StoreApi } from 'zustand/vanilla';
import { SearchForm, type BackendAdapter, type Direction } from '@listgrid/schema-core';

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
}

export interface CreateListStoreOptions {
  url: string;
  adapter: BackendAdapter;
  initialSearch?: SearchForm;
  /**
   * EA-D2-0 (decision ①, §3): applied to `page.content` right before `set()`
   * — on EVERY `fetch()` call, including pagination/sort/quick-search
   * refetches, not just the initial load (the briefing's Priority-view
   * reordering needs the store's `rows` itself to stay consistent across
   * pages). Must be pure — receives/returns a rows array, does not touch
   * `searchForm`. A throwing `postFetch` propagates out of `fetch()`
   * uncaught by this try/catch (by design — it runs after the adapter call
   * succeeds, so a bug here should surface, not be swallowed as a fetch
   * error).
   */
  postFetch?: (rows: Record<string, unknown>[]) => Record<string, unknown>[];
}

export function createListStore<T = Record<string, unknown>>(
  opts: CreateListStoreOptions,
): StoreApi<ListStoreState<T>> {
  return createStore<ListStoreState<T>>((set, get) => ({
    rows: [],
    totalElements: 0,
    totalPages: 0,
    loading: false,
    error: undefined,
    searchForm: opts.initialSearch ?? SearchForm.create(),

    async fetch() {
      set({ loading: true, error: undefined });
      let page;
      try {
        page = await opts.adapter.list<T>(opts.url, get().searchForm);
      } catch (e) {
        set({ loading: false, error: e instanceof Error ? e.message : String(e) });
        return;
      }
      // EA-D2-0 postFetch: applied on EVERY fetch (initial + pagination/sort/
      // quick-search), right before set(). Deliberately OUTSIDE the
      // adapter's try/catch above — a throwing postFetch must propagate out
      // of fetch() (a bug in caller-supplied logic), not be swallowed into
      // the store's `error` state like an adapter failure.
      const rows = opts.postFetch
        ? (opts.postFetch(page.content as unknown as Record<string, unknown>[]) as unknown as T[])
        : page.content;
      set({
        rows,
        totalElements: page.totalElements,
        totalPages: page.totalPages,
        loading: false,
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
  }));
}
