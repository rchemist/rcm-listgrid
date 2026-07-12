import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchForm } from '@listgrid/schema-core';
import { createRcmAdapter } from '../adapter';

// Minimal Response-like stub — the adapter only touches .ok/.status/.json().
function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('createRcmAdapter (ADR-0005 default BackendAdapter — RCM 0.1.0 wire contract)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  describe('list', () => {
    it('POSTs {url}/search with the SearchForm.toJSON() body and parses the Spring-Page envelope', async () => {
      const search = SearchForm.create({ page: 1, pageSize: 10 });
      fetchMock.mockResolvedValue(
        mockResponse(200, {
          content: [{ id: 1, name: 'Engineering' }],
          totalElements: 42,
          totalPages: 5,
        }),
      );
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      const result = await adapter.list('/college', search);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('/college/search');
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(search.toJSON()));
      expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');

      expect(result).toEqual({
        content: [{ id: '1', name: 'Engineering' }],
        totalElements: 42,
        totalPages: 5,
      });
    });

    it('parses the legacy envelope (list/totalCount/totalPage) and coerces ids to String', async () => {
      const search = SearchForm.create();
      fetchMock.mockResolvedValue(
        mockResponse(200, {
          list: [{ id: 7, name: 'Legacy' }],
          totalCount: 1,
          totalPage: 1,
        }),
      );
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      const result = await adapter.list('/college', search);

      expect(result).toEqual({
        content: [{ id: '7', name: 'Legacy' }],
        totalElements: 1,
        totalPages: 1,
      });
    });
  });

  it('getOne GETs {url}/{id} and returns the bare entity', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '3', name: 'College 3' }));
    const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

    const entity = await adapter.getOne('/college', '3');

    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('/college/3');
    expect(init.method).toBe('GET');
    expect(entity).toEqual({ id: '3', name: 'College 3' });
  });

  it('create POSTs {url} with the data body and returns the created entity', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '9', name: 'New College' }));
    const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

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
    const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

    const data = { name: 'Renamed' };
    const entity = await adapter.update('/college', '9', data);

    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('/college/9');
    expect(init.method).toBe('PUT');
    expect(init.body).toBe(JSON.stringify(data));
    expect(entity).toEqual({ id: '9', name: 'Renamed' });
  });

  it('remove DELETEs {url} (bulk, no per-row delete) with body {ids} — no revision arg (2-arg call stays valid, W4-4 optional param)', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, {}));
    const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

    await adapter.remove('/college', ['1', '2']);

    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('/college');
    expect(init.method).toBe('DELETE');
    expect(init.body).toBe(JSON.stringify({ ids: ['1', '2'] }));
  });

  it('remove DELETEs {url} with body {ids, revisionEntityName} when a revision is passed (spec §3.1/§6.2, CAP-07; W4-4 — 0.3.x wire-contract port)', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, {}));
    const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

    await adapter.remove('/college', ['1', '2'], 'college-revision');

    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('/college');
    expect(init.method).toBe('DELETE');
    expect(init.body).toBe(
      JSON.stringify({ ids: ['1', '2'], revisionEntityName: 'college-revision' }),
    );
  });

  it('prefixes every request with baseUrl when provided', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '1' }));
    const adapter = createRcmAdapter({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await adapter.getOne('/college', '1');

    const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://api.example.com/college/1');
  });

  it('merges custom headers (e.g. Authorization) into every request', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '1' }));
    const adapter = createRcmAdapter({
      headers: { Authorization: 'Bearer token123' },
      fetch: fetchMock as unknown as typeof fetch,
    });

    await adapter.getOne('/college', '1');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token123');
  });

  it('accepts a functional headers option and re-evaluates it per request (CAP-24 lazy header evaluation)', async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: '1' }));
    let currentToken = 'token-A';
    const adapter = createRcmAdapter({
      headers: () => ({ Authorization: `Bearer ${currentToken}` }),
      fetch: fetchMock as unknown as typeof fetch,
    });

    await adapter.getOne('/college', '1');
    const [, initFirst] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((initFirst.headers as Record<string, string>).Authorization).toBe('Bearer token-A');

    currentToken = 'token-B';
    await adapter.getOne('/college', '1');
    const [, initSecond] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect((initSecond.headers as Record<string, string>).Authorization).toBe('Bearer token-B');

    expect((initFirst.headers as Record<string, string>).Authorization).not.toBe(
      (initSecond.headers as Record<string, string>).Authorization,
    );
  });

  describe('error mapping', () => {
    it('a 403 response throws a BackendError with code FORBIDDEN', async () => {
      fetchMock.mockResolvedValue(mockResponse(403, { message: '접근 권한이 없습니다.' }));
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.getOne('/college', '1')).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: '접근 권한이 없습니다.',
      });
    });

    it('a 401 response throws a BackendError with code TOKEN_EXPIRED', async () => {
      fetchMock.mockResolvedValue(mockResponse(401, { message: '세션이 만료되었습니다.' }));
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.getOne('/college', '1')).rejects.toMatchObject({
        code: 'TOKEN_EXPIRED',
      });
    });

    it('a 400 response throws a BackendError with code VALIDATION and fieldErrors', async () => {
      fetchMock.mockResolvedValue(
        mockResponse(400, {
          message: '입력 값이 올바르지 않습니다.',
          fieldErrors: { name: ['필수 값입니다.'] },
        }),
      );
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.create('/college', {})).rejects.toMatchObject({
        code: 'VALIDATION',
        fieldErrors: { name: ['필수 값입니다.'] },
      });
    });

    it('a 500 with no recognizable body throws a BackendError with code UNKNOWN', async () => {
      fetchMock.mockResolvedValue(mockResponse(500, {}));
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.remove('/college', ['1'])).rejects.toMatchObject({
        code: 'UNKNOWN',
      });
    });

    // GX-2 (f) — rcm-backend-framework 0.1.0 errors are RFC 7807
    // ProblemDetail, top-level (no `{error:{message}}` nesting),
    // ProblemDetailAdviceTest.java:78-95. `detail` carries the
    // human-readable message; the adapter must surface it instead of
    // falling back to the generic `Request failed with status N`.
    it('a ProblemDetail 404 ({status,title,detail,...}) surfaces `detail` as the message, not the generic fallback', async () => {
      fetchMock.mockResolvedValue(
        mockResponse(404, {
          status: 404,
          title: 'NOT_FOUND',
          detail: 'college 999 not found',
          type: 'about:blank',
          code: 'NOT_FOUND',
          errors: [],
          fieldErrors: {},
        }),
      );
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.getOne('/college', '999')).rejects.toMatchObject({
        code: 'UNKNOWN',
        message: 'college 999 not found',
      });
    });

    it('a ProblemDetail with no `detail` (e.g. 500 SYSTEM.UNEXPECTED) falls back to `title`', async () => {
      fetchMock.mockResolvedValue(
        mockResponse(500, {
          status: 500,
          title: 'SYSTEM.UNEXPECTED',
          type: 'about:blank',
          code: 'SYSTEM.UNEXPECTED',
          errors: [],
          fieldErrors: {},
        }),
      );
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.getOne('/college', '1')).rejects.toMatchObject({
        code: 'UNKNOWN',
        message: 'SYSTEM.UNEXPECTED',
      });
    });

    it('a non-ProblemDetail body without `detail`/`title`/`message` falls back to the generic status message', async () => {
      fetchMock.mockResolvedValue(mockResponse(404, { foo: 'bar' }));
      const adapter = createRcmAdapter({ fetch: fetchMock as unknown as typeof fetch });

      await expect(adapter.getOne('/college', '1')).rejects.toMatchObject({
        message: 'Request failed with status 404',
      });
    });
  });
});
