import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchForm } from '@listgrid/schema-core';
import { createRcmgoAdapter, defaultRcmgoParams } from '../adapter';

// Minimal Response-like stub — the adapter only touches .ok/.status/.json().
function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function calledQuery(fetchMock: ReturnType<typeof vi.fn>, call = 0): URLSearchParams {
  const [calledUrl] = fetchMock.mock.calls[call] as [string, RequestInit];
  return new URL(calledUrl, 'https://test.invalid').searchParams;
}

describe('createRcmgoAdapter (CB-05 BackendAdapter — Go cursor wire contract)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  function adapter(opts: Parameters<typeof createRcmgoAdapter>[0] = {}) {
    return createRcmgoAdapter({ fetch: fetchMock as unknown as typeof fetch, ...opts });
  }

  describe('list', () => {
    it('GETs the url with page_size and parses the page.next_cursor envelope', async () => {
      const search = SearchForm.create({ page: 0, pageSize: 20 });
      fetchMock.mockResolvedValue(
        mockResponse(200, {
          rules: [{ id: 'a1', name: 'one' }],
          page: { next_cursor: 'c1' },
        }),
      );

      const result = await adapter({ dataKeys: ['rules'] }).list('/rules', search);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('/rules?page_size=20');
      expect(init.method).toBe('GET');
      expect(result).toEqual({
        content: [{ id: 'a1', name: 'one' }],
        totalElements: 0,
        totalPages: 2,
        totalRelation: 'unknown',
        hasMore: true,
      });
    });

    it('parses the top-level next_cursor envelope and coerces ids to String', async () => {
      fetchMock.mockResolvedValue(mockResponse(200, { items: [{ id: 7 }], next_cursor: null }));

      const result = await adapter().list('/events', SearchForm.create());

      expect(result).toEqual({
        content: [{ id: '7' }],
        totalElements: 0,
        totalPages: 1,
        totalRelation: 'unknown',
        hasMore: false,
      });
    });

    it('replays the cached cursor on the next page and grows totalPages', async () => {
      const a = adapter();
      fetchMock
        .mockResolvedValueOnce(
          mockResponse(200, { rows: [{ id: 'r1' }], page: { next_cursor: 'c1' } }),
        )
        .mockResolvedValueOnce(
          mockResponse(200, { rows: [{ id: 'r2' }], page: { next_cursor: null } }),
        );

      const first = await a.list('/rows', SearchForm.create({ page: 0, pageSize: 1 }));
      expect(first.totalPages).toBe(2);
      const second = await a.list('/rows', SearchForm.create({ page: 1, pageSize: 1 }));

      expect(calledQuery(fetchMock, 1).get('cursor')).toBe('c1');
      expect(second.content).toEqual([{ id: 'r2' }]);
      expect(second.totalPages).toBe(2);
      expect(second.hasMore).toBe(false);
    });

    it('prefetches missing links on a forward jump', async () => {
      const a = adapter();
      fetchMock
        .mockResolvedValueOnce(
          mockResponse(200, { rows: [{ id: 'r1' }], page: { next_cursor: 'c1' } }),
        )
        .mockResolvedValueOnce(
          mockResponse(200, { rows: [{ id: 'r2' }], page: { next_cursor: 'c2' } }),
        )
        .mockResolvedValueOnce(
          mockResponse(200, { rows: [{ id: 'r3' }], page: { next_cursor: null } }),
        );

      const result = await a.list('/rows', SearchForm.create({ page: 2, pageSize: 1 }));

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(calledQuery(fetchMock, 0).get('cursor')).toBeNull();
      expect(calledQuery(fetchMock, 1).get('cursor')).toBe('c1');
      expect(calledQuery(fetchMock, 2).get('cursor')).toBe('c2');
      expect(result.content).toEqual([{ id: 'r3' }]);
    });

    it('answers past-the-end pages empty', async () => {
      const a = adapter();
      fetchMock.mockResolvedValue(mockResponse(200, { rows: [{ id: 'r1' }], page: {} }));

      await a.list('/rows', SearchForm.create({ page: 0, pageSize: 1 }));
      const result = await a.list('/rows', SearchForm.create({ page: 4, pageSize: 1 }));

      expect(result.content).toEqual([]);
      expect(result.hasMore).toBe(false);
    });

    it('starts a fresh chain when the filters change', async () => {
      const a = adapter();
      fetchMock
        .mockResolvedValueOnce(
          mockResponse(200, { rows: [{ id: 'r1' }], page: { next_cursor: 'c1' } }),
        )
        .mockResolvedValueOnce(mockResponse(200, { rows: [{ id: 'r2' }], page: {} }))
        .mockResolvedValueOnce(
          mockResponse(200, { rows: [{ id: 'r8' }], page: { next_cursor: 'c8' } }),
        )
        .mockResolvedValueOnce(mockResponse(200, { rows: [{ id: 'r9' }], page: {} }));

      await a.list('/rows', SearchForm.create({ page: 0, pageSize: 1 }));
      await a.list('/rows', SearchForm.create({ page: 1, pageSize: 1 }));
      expect(calledQuery(fetchMock, 1).get('cursor')).toBe('c1');
      // Same page number, different filters → its own chain: page 0
      // without cursor, then page 1 with the fresh cursor.
      const filtered = SearchForm.create({ page: 1, pageSize: 1 }).addAndFilter({
        name: 'site_id',
        value: 's1',
      });
      const result = await a.list('/rows', filtered);
      expect(calledQuery(fetchMock, 2).get('cursor')).toBeNull();
      expect(calledQuery(fetchMock, 2).get('site_id')).toBe('s1');
      expect(calledQuery(fetchMock, 3).get('cursor')).toBe('c8');
      expect(result.content).toEqual([{ id: 'r9' }]);
    });

    it('honors cursorParam/sizeParam/dataKeys/totalKeys overrides', async () => {
      fetchMock.mockResolvedValue(
        mockResponse(200, { data: [{ id: 'x' }], paging: { cursor: 'k' }, total: 90 }),
      );
      const a = adapter({
        cursorParam: 'after',
        sizeParam: 'limit',
        dataKeys: ['data'],
        totalKeys: ['total'],
        params: () => ({}),
      });
      // No next_cursor in this fixture: the chain ends while the total
      // stays exact through totalKeys.
      const result = await a.list('/t', SearchForm.create({ page: 0, pageSize: 30 }));

      expect(calledQuery(fetchMock).get('limit')).toBe('30');
      expect(result.totalElements).toBe(90);
      expect(result.totalPages).toBe(3);
      expect(result.totalRelation).toBe('exact');
      expect(result.hasMore).toBe(false);
    });

    it('throws a naming error when no dataKeys array is present', async () => {
      fetchMock.mockResolvedValue(mockResponse(200, { page: {} }));

      await expect(adapter().list('/t', SearchForm.create())).rejects.toThrow(
        /no row array.*dataKeys/,
      );
    });

    it('maps AND EQUAL/IN filters flat and rejects everything else', async () => {
      fetchMock.mockResolvedValue(mockResponse(200, { items: [], page: {} }));
      const search = SearchForm.create()
        .addAndFilter({ name: 'site_id', value: 's1' })
        .addAndFilter({ name: 'kind', queryConditionType: 'IN', values: ['a', 'b'] });

      await adapter().list('/t', search);

      const query = calledQuery(fetchMock);
      expect(query.get('site_id')).toBe('s1');
      expect(query.getAll('kind')).toEqual(['a', 'b']);
    });

    it('evicts the oldest chain past maxChains', async () => {
      const a = adapter({ maxChains: 1 });
      fetchMock.mockResolvedValue(mockResponse(200, { rows: [], page: { next_cursor: 'c' } }));

      await a.list('/one', SearchForm.create({ page: 0 }));
      await a.list('/two', SearchForm.create({ page: 0 }));
      // '/one' was evicted: page 1 refetches its chain from scratch.
      await a.list('/one', SearchForm.create({ page: 1 }));

      expect(fetchMock).toHaveBeenCalledTimes(4);
      expect(calledQuery(fetchMock, 2).get('cursor')).toBeNull();
      expect(calledQuery(fetchMock, 3).get('cursor')).toBe('c');
    });
  });

  describe('defaultRcmgoParams', () => {
    it('throws on sorts, OR/NOT groups, and non-EQUAL/IN operators', () => {
      expect(() => defaultRcmgoParams(SearchForm.create().withSort('name', 'ASC'))).toThrow(
        /sorts are not supported/,
      );
      expect(() =>
        defaultRcmgoParams(SearchForm.create().withFilter('OR', { name: 'q', value: 'x' })),
      ).toThrow(/OR\/NOT/);
      expect(() =>
        defaultRcmgoParams(
          SearchForm.create().addAndFilter({ name: 'n', value: 'x', queryConditionType: 'LIKE' }),
        ),
      ).toThrow(/LIKE/);
      expect(() => defaultRcmgoParams(SearchForm.create().addAndFilter({ name: '  ' }))).toThrow(
        /blank filter name/,
      );
    });
  });

  describe('errors', () => {
    it('maps the Go envelope: message passthrough, re-auth codes, field from params', async () => {
      fetchMock.mockResolvedValue(
        mockResponse(401, { error: { code: 'session_expired', message: '세션이 만료됐습니다.' } }),
      );

      const failure = await adapter()
        .list('/t', SearchForm.create())
        .then(
          () => {
            throw new Error('must reject');
          },
          (error) => error,
        );
      expect(failure.code).toBe('TOKEN_EXPIRED');
      expect(failure.message).toBe('세션이 만료됐습니다.');
    });

    it('maps login_required (403) to TOKEN_EXPIRED and plain 403 to FORBIDDEN', async () => {
      fetchMock
        .mockResolvedValueOnce(
          mockResponse(403, { error: { code: 'login_required', message: 'm' } }),
        )
        .mockResolvedValueOnce(mockResponse(403, { error: { code: 'denied_x', message: 'm' } }));
      const a = adapter();

      const login = await a.list('/t', SearchForm.create()).then(
        () => {
          throw new Error('must reject');
        },
        (error) => error,
      );
      const forbidden = await a.list('/t', SearchForm.create()).then(
        () => {
          throw new Error('must reject');
        },
        (error) => error,
      );
      expect(login.code).toBe('TOKEN_EXPIRED');
      expect(forbidden.code).toBe('FORBIDDEN');
    });

    it('maps 400 to VALIDATION with params.field as fieldErrors', async () => {
      fetchMock.mockResolvedValue(
        mockResponse(400, {
          error: { code: 'invalid_input', message: 'bad limit', params: { field: 'limit' } },
        }),
      );

      const failure = await adapter()
        .list('/t', SearchForm.create())
        .then(
          () => {
            throw new Error('must reject');
          },
          (error) => error,
        );
      expect(failure.code).toBe('VALIDATION');
      expect(failure.fieldErrors).toEqual({ limit: ['bad limit'] });
    });

    it('falls back to the status text on non-JSON bodies', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('no json');
        },
      } as unknown as Response);

      const failure = await adapter()
        .list('/t', SearchForm.create())
        .then(
          () => {
            throw new Error('must reject');
          },
          (error) => error,
        );
      expect(failure.code).toBe('UNKNOWN');
      expect(failure.message).toBe('Request failed with status 502');
    });
  });

  describe('getOne/create', () => {
    it('GETs {url}/{id} and POSTs {url} as bare JSON', async () => {
      fetchMock
        .mockResolvedValueOnce(mockResponse(200, { id: 'e1', name: 'n' }))
        .mockResolvedValueOnce(mockResponse(200, { id: 'e2' }));
      const a = adapter();

      await expect(a.getOne('/bots', 'e1')).resolves.toEqual({ id: 'e1', name: 'n' });
      await expect(a.create('/bots', { name: 'n' })).resolves.toEqual({ id: 'e2' });
      const [, postInit] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect(postInit.method).toBe('POST');
      expect(postInit.body).toBe(JSON.stringify({ name: 'n' }));
    });
  });

  describe('update/remove', () => {
    it('rejects with guidance toward the endpoint client', async () => {
      const a = adapter();

      await expect(a.update('/bots', 'e1', {})).rejects.toThrow(/per-endpoint actions/);
      await expect(a.remove('/bots', ['e1'])).rejects.toThrow(/per-endpoint actions/);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('assetBaseUrl forwarding', () => {
    it('carries assetBaseUrl onto the adapter when provided', () => {
      const a = adapter({ assetBaseUrl: 'https://cdn.example' });
      expect(a.assetBaseUrl).toBe('https://cdn.example');
    });

    it('leaves assetBaseUrl absent when not provided', () => {
      const a = adapter({});
      expect(a.assetBaseUrl).toBeUndefined();
      expect('assetBaseUrl' in a).toBe(false);
    });
  });
});
