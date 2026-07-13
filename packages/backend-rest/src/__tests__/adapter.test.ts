import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchForm } from '@listgrid/schema-core';
import { createRestAdapter } from '../index';

// Minimal Response-like stub — the adapter only touches .ok/.status/.json()
// and, for `list`, .headers.get('totalCount') (ADR-0005 §5 — total count
// travels in a response header, not the JSON array body).
function mockResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: {
      get: (name: string) => headers[name] ?? null,
    },
  } as unknown as Response;
}

describe('createRestAdapter (ADR-0005 §5 generic REST reference adapter)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  describe('list', () => {
    it('GETs {url}?page=&size= built from SearchForm, parses the array body + totalCount header', async () => {
      const search = SearchForm.create({ page: 1, pageSize: 10 });
      fetchMock.mockResolvedValue(
        mockResponse(200, [{ id: 1, name: 'Engineering' }], { totalCount: '42' }),
      );
      const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

      const result = await adapter.list('/college', search);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('/college?page=1&size=10');
      expect(init.method).toBe('GET');
      expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');

      expect(result).toEqual({
        content: [{ id: '1', name: 'Engineering' }],
        totalElements: 42,
        totalPages: 5,
      });
    });

    it('defaults page/pageSize from SearchForm.create() (page=0, pageSize=20) and computes totalPages via Math.ceil', async () => {
      const search = SearchForm.create();
      fetchMock.mockResolvedValue(mockResponse(200, [], { totalCount: '1' }));
      const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

      const result = await adapter.list('/college', search);

      const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('/college?page=0&size=20');
      expect(result).toEqual({ content: [], totalElements: 1, totalPages: 1 });
    });

    it('defaults totalElements to 0 when the totalCount header is absent', async () => {
      const search = SearchForm.create();
      fetchMock.mockResolvedValue(mockResponse(200, []));
      const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

      const result = await adapter.list('/college', search);

      expect(result).toEqual({ content: [], totalElements: 0, totalPages: 0 });
    });
  });

  it('getOne GETs {url}/{id} and returns the entity with id coerced to String', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: 3, name: 'College 3' }));
    const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

    const entity = await adapter.getOne('/college', '3');

    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('/college/3');
    expect(init.method).toBe('GET');
    expect(entity).toEqual({ id: '3', name: 'College 3' });
  });

  it('create POSTs {url} with the data body and returns the created entity', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '9', name: 'New College' }));
    const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

    const data = { name: 'New College' };
    const entity = await adapter.create('/college', data);

    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('/college');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify(data));
    expect(entity).toEqual({ id: '9', name: 'New College' });
  });

  it('update PUTs {url}/{id} with the data body and returns the updated entity', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '9', name: 'Renamed' }));
    const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

    const data = { name: 'Renamed' };
    const entity = await adapter.update('/college', '9', data);

    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('/college/9');
    expect(init.method).toBe('PUT');
    expect(init.body).toBe(JSON.stringify(data));
    expect(entity).toEqual({ id: '9', name: 'Renamed' });
  });

  it('remove fires one DELETE {url}/{id} per id (REST has per-row delete, no bulk endpoint)', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, {}));
    const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

    await adapter.remove('/college', ['1', '2']);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const calls = fetchMock.mock.calls as [string, RequestInit][];
    const urls = calls.map(([url]) => url).sort();
    expect(urls).toEqual(['/college/1', '/college/2']);
    for (const [, init] of calls) {
      expect(init.method).toBe('DELETE');
    }
  });

  it('remove ignores a passed `revision` (no REST bulk-delete-body equivalent — minimal reference has no optimistic-lock semantics)', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, {}));
    const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

    await adapter.remove('/college', ['1'], 'college-revision');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('/college/1');
    expect(init.body).toBeUndefined();
  });

  it('prefixes every request with baseUrl when provided', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '1' }));
    const adapter = createRestAdapter({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await adapter.getOne('/college', '1');

    const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://api.example.com/college/1');
  });

  it('merges custom headers (e.g. Authorization) into every request', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '1' }));
    const adapter = createRestAdapter({
      headers: { Authorization: 'Bearer token123' },
      fetch: fetchMock as unknown as typeof fetch,
    });

    await adapter.getOne('/college', '1');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token123');
  });

  it('forwards assetBaseUrl verbatim onto the returned adapter when provided', () => {
    const adapter = createRestAdapter({ assetBaseUrl: 'https://assets.example.com' });
    expect(adapter.assetBaseUrl).toBe('https://assets.example.com');
  });

  it('omits assetBaseUrl entirely (not set to undefined) when not provided', () => {
    const adapter = createRestAdapter();
    expect('assetBaseUrl' in adapter).toBe(false);
  });

  describe('error mapping', () => {
    it('a 401 response throws a BackendError with code TOKEN_EXPIRED', async () => {
      fetchMock.mockResolvedValue(mockResponse(401, {}));
      const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.getOne('/college', '1')).rejects.toMatchObject({
        code: 'TOKEN_EXPIRED',
        message: 'Request failed with status 401',
      });
    });

    it('a 403 response throws a BackendError with code FORBIDDEN', async () => {
      fetchMock.mockResolvedValue(mockResponse(403, {}));
      const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.getOne('/college', '1')).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('a 400 response throws a BackendError with code VALIDATION', async () => {
      fetchMock.mockResolvedValue(mockResponse(400, {}));
      const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.create('/college', {})).rejects.toMatchObject({
        code: 'VALIDATION',
      });
    });

    it('a 422 response throws a BackendError with code VALIDATION', async () => {
      fetchMock.mockResolvedValue(mockResponse(422, {}));
      const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.update('/college', '1', {})).rejects.toMatchObject({
        code: 'VALIDATION',
      });
    });

    it('a 500 response throws a BackendError with code UNKNOWN', async () => {
      fetchMock.mockResolvedValue(mockResponse(500, {}));
      const adapter = createRestAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.remove('/college', ['1'])).rejects.toMatchObject({
        code: 'UNKNOWN',
      });
    });
  });
});
