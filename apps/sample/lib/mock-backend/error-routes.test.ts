// error-routes.test.ts — TB-3 proof: the mock backend can reproduce the
// framework's full ProblemDetail error set (CrudErrorType.java:37-43 +
// ProblemDetailAdvice.java) via the `x-mock-error` trigger header wired
// into crud-routes.ts (see that file's header comment for why a header was
// chosen over a body-field marker), AND that @listgrid/backend-rcm's
// `createRcmAdapter` maps every one of those wire shapes to the correct
// `BackendErrorCode` (packages/backend-rcm/src/adapter.ts `parseBackendError`
// — NOT modified here, this is the round-trip verification target).
//
// Two layers per error:
//   1. route-level  — drive the generic handler through NextRequest, assert
//      response.status + parsed body.code (+ fieldErrors for 400).
//   2. adapter round-trip — feed that same Response into createRcmAdapter's
//      injectable `fetch` option (RcmAdapterOptions.fetch — the adapter's
//      own documented test seam, "Injectable fetch (tests, non-global
//      runtimes)", adapter.ts:12) and assert the thrown error's `code` +
//      `fieldErrors`. This uses the DI seam rather than monkey-patching
//      `globalThis.fetch` — same pattern as
//      packages/backend-rcm/src/__tests__/adapter.test.ts — so no
//      afterEach/finally restore of a global is needed.

import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createRcmAdapter } from '@listgrid/backend-rcm';
import type { BackendErrorCode } from '@listgrid/schema-core';
import { EntityStore, type WithId } from './store';
import { makeCollectionHandlers, makeItemHandlers, makeSearchHandler } from './crud-routes';

interface Row extends WithId {
  name?: string;
}

function makeStore(rows: Row[] = [{ id: '1', name: 'seed' }]): EntityStore<Row> {
  return new EntityStore<Row>(rows);
}

/** Builds a NextRequest, optionally carrying the `x-mock-error` trigger header. */
function makeRequest(
  url: string,
  init: { method: string; mockError?: string; body?: string },
): NextRequest {
  const headers: Record<string, string> = {};
  if (init.mockError) headers['x-mock-error'] = init.mockError;
  return new NextRequest(url, {
    method: init.method,
    headers,
    ...(init.body !== undefined ? { body: init.body } : {}),
  });
}

describe('mock-backend error routes (TB-3)', () => {
  describe('route-level — x-mock-error trigger', () => {
    it('x-mock-error: VALIDATION -> 400 VALIDATION.FAILED with fieldErrors', async () => {
      const { POST } = makeCollectionHandlers(() => makeStore());
      const response = await POST(
        makeRequest('http://localhost/api/widget', {
          method: 'POST',
          mockError: 'VALIDATION',
          body: '{}',
        }),
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe('VALIDATION.FAILED');
      expect(body.title).toBe('VALIDATION.FAILED');
      expect(body.fieldErrors).toEqual({ name: ['must not be blank'] });
    });

    it('x-mock-error: DUPLICATE -> 409 CRUD.DUPLICATE', async () => {
      const POST = makeSearchHandler(() => makeStore());
      const response = await POST(
        makeRequest('http://localhost/api/widget/search', {
          method: 'POST',
          mockError: 'DUPLICATE',
          body: '{}',
        }),
      );

      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.code).toBe('CRUD.DUPLICATE');
    });

    it('x-mock-error: UNPROCESSABLE -> 422 CRUD.UNPROCESSABLE', async () => {
      const { PUT } = makeItemHandlers(() => makeStore(), 'widget');
      const response = await PUT(
        makeRequest('http://localhost/api/widget/1', {
          method: 'PUT',
          mockError: 'UNPROCESSABLE',
          body: '{}',
        }),
        { params: Promise.resolve({ id: '1' }) },
      );

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.code).toBe('CRUD.UNPROCESSABLE');
    });

    it('x-mock-error: SYSTEM -> 500 SYSTEM.UNEXPECTED with a generic detail (no internals leaked)', async () => {
      const { DELETE } = makeCollectionHandlers(() => makeStore());
      const response = await DELETE(
        makeRequest('http://localhost/api/widget', {
          method: 'DELETE',
          mockError: 'SYSTEM',
          body: JSON.stringify({ ids: [] }),
        }),
      );

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('SYSTEM.UNEXPECTED');
      // The framework hides the real exception message on this path
      // (ProblemDetailAdvice.java:242-247) — detail must be the fixed
      // generic string, never anything caller/store-specific.
      expect(body.detail).toBe('Internal server error');
    });

    it('x-mock-error: UNAUTHORIZED -> 401 bare status, body carries code TOKEN_EXPIRED', async () => {
      const POST = makeSearchHandler(() => makeStore());
      const response = await POST(
        makeRequest('http://localhost/api/widget/search', {
          method: 'POST',
          mockError: 'UNAUTHORIZED',
          body: '{}',
        }),
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.code).toBe('TOKEN_EXPIRED');
    });

    it('x-mock-error: FORBIDDEN -> 403 bare status', async () => {
      const { GET } = makeItemHandlers(() => makeStore(), 'widget');
      const response = await GET(
        makeRequest('http://localhost/api/widget/1', { method: 'GET', mockError: 'FORBIDDEN' }),
        { params: Promise.resolve({ id: '1' }) },
      );

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.code).toBe('ACCESS_DENIED');
    });

    it('no header -> the natural 404 path (missing id) is untouched', async () => {
      const { GET } = makeItemHandlers(() => makeStore([]), 'widget');
      const response = await GET(makeRequest('http://localhost/api/widget/99', { method: 'GET' }), {
        params: Promise.resolve({ id: '99' }),
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.code).toBe('NOT_FOUND');
    });

    it('an unrecognized x-mock-error value is ignored — normal traffic is unaffected', async () => {
      const { POST } = makeCollectionHandlers(() => makeStore());
      const response = await POST(
        makeRequest('http://localhost/api/widget', {
          method: 'POST',
          mockError: 'NOT_A_REAL_TRIGGER',
          body: JSON.stringify({ name: 'ok' }),
        }),
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.name).toBe('ok');
    });
  });

  describe('adapter round-trip — createRcmAdapter maps every ProblemDetail to the correct BackendErrorCode', () => {
    interface ThrownAdapterError {
      name: string;
      code: BackendErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
    }

    async function driveAdapter(response: Response): Promise<ThrownAdapterError> {
      const fetchStub = vi.fn().mockResolvedValue(response);
      const adapter = createRcmAdapter({ fetch: fetchStub as unknown as typeof fetch });
      try {
        await adapter.create('/widget', {});
        throw new Error('expected adapter.create to throw');
      } catch (err) {
        return err as ThrownAdapterError;
      }
    }

    it('400 VALIDATION.FAILED{fieldErrors} -> code VALIDATION, fieldErrors present', async () => {
      const { POST } = makeCollectionHandlers(() => makeStore());
      const response = await POST(
        makeRequest('http://localhost/api/widget', {
          method: 'POST',
          mockError: 'VALIDATION',
          body: '{}',
        }),
      );

      const error = await driveAdapter(response);
      expect(error.name).toBe('BackendAdapterError');
      expect(error.code).toBe('VALIDATION');
      expect(error.fieldErrors).toEqual({ name: ['must not be blank'] });
    });

    it('422 CRUD.UNPROCESSABLE -> code VALIDATION', async () => {
      const { PUT } = makeItemHandlers(() => makeStore(), 'widget');
      const response = await PUT(
        makeRequest('http://localhost/api/widget/1', {
          method: 'PUT',
          mockError: 'UNPROCESSABLE',
          body: '{}',
        }),
        { params: Promise.resolve({ id: '1' }) },
      );

      const error = await driveAdapter(response);
      expect(error.code).toBe('VALIDATION');
    });

    it('409 CRUD.DUPLICATE -> code UNKNOWN', async () => {
      const POST = makeSearchHandler(() => makeStore());
      const response = await POST(
        makeRequest('http://localhost/api/widget/search', {
          method: 'POST',
          mockError: 'DUPLICATE',
          body: '{}',
        }),
      );

      const error = await driveAdapter(response);
      expect(error.code).toBe('UNKNOWN');
    });

    it('500 SYSTEM.UNEXPECTED -> code UNKNOWN', async () => {
      const { DELETE } = makeCollectionHandlers(() => makeStore());
      const response = await DELETE(
        makeRequest('http://localhost/api/widget', {
          method: 'DELETE',
          mockError: 'SYSTEM',
          body: JSON.stringify({ ids: [] }),
        }),
      );

      const error = await driveAdapter(response);
      expect(error.code).toBe('UNKNOWN');
    });

    it('404 CRUD.NOT_FOUND (natural, no header) -> code UNKNOWN', async () => {
      const { GET } = makeItemHandlers(() => makeStore([]), 'widget');
      const response = await GET(makeRequest('http://localhost/api/widget/99', { method: 'GET' }), {
        params: Promise.resolve({ id: '99' }),
      });

      const error = await driveAdapter(response);
      expect(error.code).toBe('UNKNOWN');
    });

    it('401 (+ TOKEN_EXPIRED body code) -> code TOKEN_EXPIRED', async () => {
      const POST = makeSearchHandler(() => makeStore());
      const response = await POST(
        makeRequest('http://localhost/api/widget/search', {
          method: 'POST',
          mockError: 'UNAUTHORIZED',
          body: '{}',
        }),
      );

      const error = await driveAdapter(response);
      expect(error.code).toBe('TOKEN_EXPIRED');
    });

    it('403 -> code FORBIDDEN', async () => {
      const { GET } = makeItemHandlers(() => makeStore(), 'widget');
      const response = await GET(
        makeRequest('http://localhost/api/widget/1', { method: 'GET', mockError: 'FORBIDDEN' }),
        { params: Promise.resolve({ id: '1' }) },
      );

      const error = await driveAdapter(response);
      expect(error.code).toBe('FORBIDDEN');
    });
  });
});
