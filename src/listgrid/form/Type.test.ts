import { describe, it, expect, vi, afterEach } from 'vitest';
import { PageResult } from './Type';
import { SearchForm } from './SearchForm';
import { configureApiClient } from '../api/ApiClient';

/**
 * Public surface covered:
 *   - PageResult constructor + createEmptyResult factory
 *   - withErrors chaining
 *   - fetchListData: error-path, entityError path, happy path, and recovery
 *     from thrown exceptions. The network layer is stubbed via
 *     configureApiClient so no HTTP happens.
 */

afterEach(() => {
  // Reset host-configured api client back to the default no-op (see api/ApiClient.ts).
  vi.restoreAllMocks();
});

describe('PageResult constructor', () => {
  it('stores list/totalCount/totalPage/searchForm', () => {
    const searchForm = SearchForm.create();
    const result = new PageResult({
      list: [{ id: '1' }],
      totalCount: 1,
      totalPage: 1,
      searchForm,
    });
    expect(result.list).toEqual([{ id: '1' }]);
    expect(result.totalCount).toBe(1);
    expect(result.totalPage).toBe(1);
    expect(result.searchForm).toBe(searchForm);
  });

  it('has no errors by default', () => {
    const result = new PageResult({
      list: [],
      totalCount: 0,
      totalPage: 0,
      searchForm: SearchForm.create(),
    });
    expect(result.errors).toBeUndefined();
  });
});

describe('PageResult.createEmptyResult', () => {
  it('returns an empty page result with the given search form', () => {
    const form = SearchForm.create();
    const r = PageResult.createEmptyResult(form);
    expect(r.list).toEqual([]);
    expect(r.totalCount).toBe(0);
    expect(r.totalPage).toBe(0);
    expect(r.searchForm).toBe(form);
  });

  it('falls back to a fresh SearchForm when none is supplied', () => {
    const r = PageResult.createEmptyResult();
    expect(r.searchForm).toBeInstanceOf(SearchForm);
  });
});

describe('PageResult.withErrors', () => {
  it('attaches error messages and returns this', () => {
    const r = PageResult.createEmptyResult();
    const ret = r.withErrors('boom', 'kaboom');
    expect(ret).toBe(r);
    expect(r.errors).toEqual(['boom', 'kaboom']);
  });
});

describe('PageResult.fetchListData', () => {
  // Helper: stubs the host-supplied API client with a fixed response.
  const stubApi = (callExternalHttpRequest: (..._args: unknown[]) => unknown) => {
    configureApiClient({
      callExternalHttpRequest: callExternalHttpRequest as any,
      getExternalApiData: (async () => ({})) as any,
      getExternalApiDataWithError: (async () => ({})) as any,
    });
  };

  it('returns an empty result with the error when the response isError', async () => {
    stubApi(async () => ({
      isError: () => true,
      error: 'server down',
      entityError: null,
      data: null,
      status: 500,
    }));

    const form = SearchForm.create();
    const result = await PageResult.fetchListData('/api/whatever', form);
    expect(result.list).toEqual([]);
    expect(result.errors?.[0]).toBe('server down');
    expect(result.searchForm).toBe(form);
  });

  it('bubbles up entityError.error.message when present', async () => {
    stubApi(async () => ({
      isError: () => true,
      error: null,
      entityError: { error: { message: 'validation failed' } },
      data: null,
      status: 400,
    }));

    const result = await PageResult.fetchListData('/api/x', SearchForm.create());
    expect(result.errors?.[0]).toBe('validation failed');
  });

  it('returns a PageResult with the server list on success', async () => {
    stubApi(async () => ({
      isError: () => false,
      error: null,
      entityError: null,
      status: 200,
      data: {
        list: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        totalCount: 2,
        totalPage: 1,
        searchForm: null,
      },
    }));

    const result = await PageResult.fetchListData('/api/items', SearchForm.create());
    expect(result.errors).toBeUndefined();
    expect(result.list).toHaveLength(2);
    // id coerced to string — the implementation forces String(item.id)
    expect(result.list[0]!.id).toBe('1');
    expect(result.totalCount).toBe(2);
    expect(result.totalPage).toBe(1);
  });

  it('falls back to data.content when data.list is missing', async () => {
    stubApi(async () => ({
      isError: () => false,
      error: null,
      entityError: null,
      status: 200,
      data: {
        content: [{ id: 7 }],
        totalCount: 1,
        totalPage: 1,
        searchForm: null,
      },
    }));

    const result = await PageResult.fetchListData('/api/items', SearchForm.create());
    expect(result.list).toHaveLength(1);
    expect(result.list[0]!.id).toBe('7');
  });

  it('recovers to an empty result with a generic error message on thrown errors', async () => {
    stubApi(() => {
      throw new Error('unexpected');
    });
    const result = await PageResult.fetchListData('/api/items', SearchForm.create());
    expect(result.list).toEqual([]);
    expect(result.errors?.[0]).toMatch(/데이터 로딩/);
  });
});
