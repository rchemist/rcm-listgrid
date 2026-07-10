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
      try {
        const page = await opts.adapter.list<T>(opts.url, get().searchForm);
        set({
          rows: page.content,
          totalElements: page.totalElements,
          totalPages: page.totalPages,
          loading: false,
        });
      } catch (e) {
        set({ loading: false, error: e instanceof Error ? e.message : String(e) });
      }
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
