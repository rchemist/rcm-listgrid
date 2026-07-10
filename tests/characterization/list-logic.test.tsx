// Characterization test — P2-4: list logic (SearchForm serialization, pagination,
// multi-sort, row-select + bulk delete wire format). Pins the CURRENT behavior of
// the engine so a later re-foundation transplant (P4/P5) can be proven
// behavior-identical. Every import comes from the harness indirection (./harness,
// ./fixtures) — never from '../../src/...' directly.
//
// NOTE on scope — ViewListGrid itself is NOT rendered here: ViewListGridProps
// requires a `ListGrid` config instance (see
// src/listgrid/components/list/types/ViewListGrid.types.ts), and `ListGrid` is
// not part of the harness's re-exported surface (only EntityForm/SearchForm/
// PageResult/ViewListGrid are). Driving the full component would require a
// deep import of `ListGrid` from '../../src', which the hard rules forbid.
// Instead, this file characterizes the same wire-format contracts at the
// layer the harness DOES expose: `SearchForm`/`PageResult.fetchListData` (the
// engine methods `useListGridLogic`/`ViewListGrid` call for search+pagination)
// and `EntityForm.deleteAll` (the engine method `useListGridLogic.deleteItems`
// calls for bulk delete once `checkedItems` — the row-selection state — is
// resolved to an id list). See `deviations` in the task's structured output.

import { afterEach, describe, expect, it } from 'vitest';
import {
  SearchForm,
  PageResult,
  mockRcmFetch,
  searchPageEnvelope,
  type RecordedRequest,
} from './harness';
import { createEmployeeForm } from './fixtures';

// Snapshot-safe wire-format extraction: options.formData is handed to the mock
// ApiClient as the *live* SearchForm instance (see harness.ts mockRcmFetch —
// it records `options.formData` verbatim, unserialized). The real backend only
// ever sees the result of `JSON.stringify(searchForm)`, which invokes
// `SearchForm.prototype.toJSON()` (see src/listgrid/form/SearchForm.ts). Route
// every wire-format assertion through this helper so we characterize what
// actually crosses the wire, not the live mutable instance.
function wireBody(body: unknown): unknown {
  return JSON.parse(JSON.stringify(body));
}

describe('P2-4 — SearchForm wire-format serialization (PageResult.fetchListData)', () => {
  let mock: ReturnType<typeof mockRcmFetch> | undefined;

  afterEach(() => {
    mock?.restore();
    mock = undefined;
  });

  it('POSTs to `${url}/search` and serializes filters/sort/page/pageSize into the SearchRequest wire shape', async () => {
    mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/employee/search',
        handler: () => searchPageEnvelope([{ id: 1, name: '김도윤' }]),
      },
    ]);

    const searchForm = SearchForm.create({ page: 2, pageSize: 15 })
      .withSort('name', 'ASC')
      .handleAndFilter('status', 'ACTIVE', 'EQUAL');

    await PageResult.fetchListData('/api/employee', searchForm);

    expect(mock.requests).toHaveLength(1);
    const request = mock.requests[0] as RecordedRequest;

    // Surprise-worthy fact #1: the endpoint is POST {url}/search, not GET
    // {url}?query=... — search is always a POST body, never query params.
    expect(request.method).toBe('POST');
    expect(request.url).toBe('/api/employee/search');

    const wire = wireBody(request.body) as Record<string, unknown>;

    // Surprise-worthy fact #2: the wire body is NOT `{ filters, sorts }` bare —
    // it's the FULL SearchForm.toJSON() shape, including cacheKey (a per-instance
    // v1 UUID minted at SearchForm.create()) and several client-only bookkeeping
    // fields (ignoreCache/viewDetail/shouldReturnEmpty/preservedFilters/
    // quickSearchFields) that have no bearing on this test's filter/sort/page
    // assertions but ARE sent to the backend on every search request.
    expect(typeof wire.cacheKey).toBe('string');
    expect((wire.cacheKey as string).length).toBeGreaterThan(0);

    expect(wire.page).toBe(2);
    expect(wire.pageSize).toBe(15);

    // sorts: Map<field, direction> -> [{ field, direction }] object array (NOT
    // a [field, direction] tuple, and NOT a `{ field: direction }` plain object).
    expect(wire.sorts).toEqual([{ field: 'name', direction: 'ASC' }]);

    // filters: Map<'AND'|'OR', FilterItem[]> -> { AND: [...] } — note there is
    // NO `OR` key at all when no OR filters were ever added (not even `OR: []`).
    expect(wire.filters).toEqual({
      AND: [
        {
          name: 'status',
          value: 'ACTIVE',
          values: undefined,
          queryConditionType: 'EQUAL',
          not: undefined,
        },
      ],
    });
    expect(Object.prototype.hasOwnProperty.call(wire.filters as object, 'OR')).toBe(false);

    expect(wire.ignoreCache).toBe(false);
    expect(wire.viewDetail).toBe(false);
    expect(wire.shouldReturnEmpty).toBe(false);
    expect(wire.preservedFilters).toEqual([]);
    expect(wire.quickSearchFields).toEqual([]);
  });

  it('handleAndFilter with an array value serializes to `values` (not `value`) with `value` explicitly undefined', async () => {
    mock = mockRcmFetch([
      { method: 'POST', url: '/api/employee/search', handler: () => searchPageEnvelope([]) },
    ]);

    const searchForm = SearchForm.create().handleAndFilter('status', ['ACTIVE', 'ON_LEAVE'], 'IN');

    await PageResult.fetchListData('/api/employee', searchForm);

    const wire = wireBody(mock.requests[0]!.body) as Record<string, unknown>;
    const filters = wire.filters as { AND: Record<string, unknown>[] };
    expect(filters.AND).toEqual([
      {
        name: 'status',
        value: undefined,
        values: ['ACTIVE', 'ON_LEAVE'],
        queryConditionType: 'IN',
        not: undefined,
      },
    ]);
  });
});

describe('P2-4 — pagination (page/pageSize request + PageResult absorption)', () => {
  let mock: ReturnType<typeof mockRcmFetch> | undefined;

  afterEach(() => {
    mock?.restore();
    mock = undefined;
  });

  it('sends the requested page/pageSize and absorbs content/totalElements/totalPages into PageResult', async () => {
    const backendEmployees = [
      { id: 101, name: '박서준' },
      { id: 102, name: '이지은' },
    ];

    mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/employee/search',
        handler: () => searchPageEnvelope(backendEmployees, { totalElements: 47, totalPages: 5 }),
      },
    ]);

    const searchForm = SearchForm.create({ page: 3, pageSize: 10 });
    const result = await PageResult.fetchListData('/api/employee', searchForm);

    const wire = wireBody(mock.requests[0]!.body) as Record<string, unknown>;
    expect(wire.page).toBe(3);
    expect(wire.pageSize).toBe(10);

    // PageResult absorbs Spring-Data-Page-shaped totalElements/totalPages into
    // its own totalCount/totalPage field names (0.1.0 line — see
    // src/listgrid/form/Type.ts PageResult.fetchListData).
    expect(result.totalCount).toBe(47);
    expect(result.totalPage).toBe(5);
    expect(result.errors).toBeUndefined();

    // Surprise: every entity id is coerced to a string, even when the backend
    // sends a bare number (`id: String(item.id)` — see PageResult.fetchListData).
    expect(result.list).toEqual([
      { id: '101', name: '박서준' },
      { id: '102', name: '이지은' },
    ]);
    expect(typeof result.list[0]!.id).toBe('string');
  });

  it('falls back to totalCount/totalPage=0 when the backend envelope omits every pagination field', async () => {
    mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/employee/search',
        // Raw payload with none of totalCount/totalPage/totalElements/totalPages
        // and no `list`/`content` key either — the emptiest legal response shape.
        handler: () => ({}),
      },
    ]);

    const result = await PageResult.fetchListData('/api/employee', SearchForm.create());

    expect(result.list).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.totalPage).toBe(0);
    expect(result.errors).toBeUndefined();
  });

  it('surprise: PageResult.searchForm resets to a FRESH SearchForm when the backend echoes an empty searchRequest', async () => {
    // searchPageEnvelope()'s default `searchRequest: {}` is a *truthy* object —
    // fetchListData's echo logic is `payload.searchForm ?? payload.searchRequest`,
    // then `echoForm ? SearchForm.deserialize(echoForm) : searchForm`. An empty
    // object is truthy, so the client's original page/pageSize/sorts/filters are
    // silently DISCARDED and replaced with SearchForm.deserialize({}) defaults
    // (page 0, pageSize 20, no sorts/filters) — UNLESS the caller (e.g.
    // useListGridLogic, not exported by this harness) manually re-applies sorts
    // after the fact. This is a real, currently-relied-upon quirk of the
    // envelope contract: a backend/mock that doesn't echo `searchRequest`
    // resets pagination/sort state on the returned PageResult.
    mock = mockRcmFetch([
      { method: 'POST', url: '/api/employee/search', handler: () => searchPageEnvelope([]) },
    ]);

    const requestForm = SearchForm.create({ page: 4, pageSize: 25 }).withSort('name', 'DESC');
    const result = await PageResult.fetchListData('/api/employee', requestForm);

    expect(result.searchForm.getPage()).toBe(0);
    expect(result.searchForm.getPageSize()).toBe(20);
    expect(result.searchForm.getSorts().size).toBe(0);
  });

  it('PageResult.searchForm preserves page/pageSize/sorts when the backend echoes the real searchRequest', async () => {
    const requestForm = SearchForm.create({ page: 4, pageSize: 25 }).withSort('name', 'DESC');

    mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/employee/search',
        // Echo the client's own SearchRequest back, as a real rcm-framework
        // 0.1.0 SearchResponse does (Decision #31).
        handler: () => searchPageEnvelope([], { searchRequest: wireBody(requestForm) }),
      },
    ]);

    const result = await PageResult.fetchListData('/api/employee', requestForm);

    expect(result.searchForm.getPage()).toBe(4);
    expect(result.searchForm.getPageSize()).toBe(25);
    expect(result.searchForm.getSortDirection('name')).toBe('DESC');
  });
});

describe('P2-4 — multi-sort serialization', () => {
  let mock: ReturnType<typeof mockRcmFetch> | undefined;

  afterEach(() => {
    mock?.restore();
    mock = undefined;
  });

  it('serializes 2+ sort columns as an ordered [{field,direction}] array, newest-applied sort FIRST', async () => {
    mock = mockRcmFetch([
      { method: 'POST', url: '/api/employee/search', handler: () => searchPageEnvelope([]) },
    ]);

    // Surprise: SearchForm.withSort() PREPENDS — the last .withSort() call ends
    // up FIRST in the serialized array, not last (see SearchForm.withSort:
    // "나중에 들어온 정렬 값이 맨 앞으로 가야 하므로"). Applying name then email then
    // hireDate yields hireDate, email, name (reverse of call order).
    const searchForm = SearchForm.create()
      .withSort('name', 'ASC')
      .withSort('email', 'DESC')
      .withSort('hireDate', 'ASC');

    await PageResult.fetchListData('/api/employee', searchForm);

    const wire = wireBody(mock.requests[0]!.body) as Record<string, unknown>;
    expect(wire.sorts).toEqual([
      { field: 'hireDate', direction: 'ASC' },
      { field: 'email', direction: 'DESC' },
      { field: 'name', direction: 'ASC' },
    ]);
  });

  it('re-applying withSort() on an already-sorted field moves it to the front instead of duplicating it', async () => {
    mock = mockRcmFetch([
      { method: 'POST', url: '/api/employee/search', handler: () => searchPageEnvelope([]) },
    ]);

    const searchForm = SearchForm.create()
      .withSort('name', 'ASC')
      .withSort('email', 'DESC')
      .withSort('name', 'DESC'); // re-sort by `name`, now DESC

    await PageResult.fetchListData('/api/employee', searchForm);

    const wire = wireBody(mock.requests[0]!.body) as Record<string, unknown>;
    expect(wire.sorts).toEqual([
      { field: 'name', direction: 'DESC' },
      { field: 'email', direction: 'DESC' },
    ]);
  });

  it('withSort(field, undefined) removes that field from the sort set entirely', async () => {
    mock = mockRcmFetch([
      { method: 'POST', url: '/api/employee/search', handler: () => searchPageEnvelope([]) },
    ]);

    const searchForm = SearchForm.create()
      .withSort('name', 'ASC')
      .withSort('email', 'DESC')
      .withSort('name', undefined);

    await PageResult.fetchListData('/api/employee', searchForm);

    const wire = wireBody(mock.requests[0]!.body) as Record<string, unknown>;
    expect(wire.sorts).toEqual([{ field: 'email', direction: 'DESC' }]);
  });
});

describe('P2-4 — row select + bulk delete wire format (EntityForm.deleteAll)', () => {
  let mock: ReturnType<typeof mockRcmFetch> | undefined;

  afterEach(() => {
    mock?.restore();
    mock = undefined;
  });

  // Row-selection state (`checkedItems: string[]`) itself lives inside
  // `useListGridLogic` (a hook this harness does not export — see the file
  // banner). What IS exercised end-to-end through the exported engine surface
  // is the boundary useListGridLogic.deleteItems() calls across: it collects
  // checked row ids into a plain string[] and hands that array straight to
  // `EntityForm.deleteAll(checkedItems)` — so a selected-rows id list is
  // simulated locally here and threaded through the real deleteAll() call.

  it('DELETEs to the entity base URL (not `${url}/bulk` or similar) with { ids } as the body', async () => {
    mock = mockRcmFetch([
      {
        method: 'DELETE',
        url: '/api/employee',
        handler: () => ({ deleted: true }),
      },
    ]);

    const employeeForm = createEmployeeForm();
    const selectedRowIds = ['10', '11', '12']; // simulated `checkedItems` selection state

    const result = await employeeForm.deleteAll(selectedRowIds);

    expect(mock.requests).toHaveLength(1);
    const request = mock.requests[0] as RecordedRequest;
    expect(request.method).toBe('DELETE');
    expect(request.url).toBe('/api/employee');

    // Surprise: the body is the LIVE plain object the engine built (not run
    // through SearchForm.toJSON or any wire transform) — { ids, revisionEntityName }.
    // getRevisionEntityName() falls back to the EntityForm's own `name` when no
    // explicit revisionEntityName/menuUrl was set (see EntityFormBase.tsx:745
    // `this.revisionEntityName || this.menuUrl || this.name`), so EVERY bulk
    // delete on this fixture implicitly sends `revisionEntityName: 'employee'`
    // even though the fixture never calls `.withRevisionEntityName(...)`.
    expect(request.body).toEqual({
      ids: selectedRowIds,
      revisionEntityName: 'employee',
    });

    expect(result.errors).toBeUndefined();
    expect(result.refreshOrList).toBe(true);
  });

  it('refuses to call the backend at all when the selected-id list is empty', async () => {
    mock = mockRcmFetch([
      { method: 'DELETE', url: '/api/employee', handler: () => ({ deleted: true }) },
    ]);

    const employeeForm = createEmployeeForm();
    const result = await employeeForm.deleteAll([]);

    expect(mock.requests).toHaveLength(0);
    expect(result.errors).toEqual(['삭제할 대상이 없습니다.']);
  });

  it('surfaces a default Korean error message on the result when the backend returns a falsy payload', async () => {
    // deleteAll()'s success/failure branch is `if (response.data) { ... } else
    // { result.errors = [response.error ?? '데이터 삭제 중 오류가 발생했습니다.'] }`.
    // mockRcmFetch always wraps a matched route's return value at status 200
    // (see harness.ts resolve()) — there is no route-level way to produce an
    // isError()=true ResponseData, only a falsy `.data`. Characterize that path:
    // a route that resolves but returns nothing surfaces the hardcoded default
    // Korean error message, not a generic "no route" 404.
    mock = mockRcmFetch([{ method: 'DELETE', url: '/api/employee', handler: () => undefined }]);

    const employeeForm = createEmployeeForm();
    const result = await employeeForm.deleteAll(['1']);

    expect(result.errors).toEqual(['데이터 삭제 중 오류가 발생했습니다.']);
    expect(result.refreshOrList).toBeUndefined();
  });

  it('surprise: mockRcmFetch route handlers that throw propagate as an UNCAUGHT rejection through deleteAll (no try/catch in EntityForm.deleteAll)', async () => {
    // Unlike PageResult.fetchListData (which wraps its whole body in try/catch
    // and always resolves a PageResult, even on failure — see the fallback
    // tests above), EntityForm.deleteAll has no such guard around
    // getExternalApiDataWithError(). A thrown/rejected ApiClient call rejects
    // deleteAll's own returned promise instead of resolving with
    // `result.errors`. This is a real asymmetry between the two engine call
    // sites worth preserving across the transplant.
    mock = mockRcmFetch([
      {
        method: 'DELETE',
        url: '/api/employee',
        handler: () => {
          throw new Error('backend rejected the bulk delete');
        },
      },
    ]);

    const employeeForm = createEmployeeForm();
    await expect(employeeForm.deleteAll(['1'])).rejects.toThrow('backend rejected the bulk delete');
  });
});
