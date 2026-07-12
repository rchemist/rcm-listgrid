import { expect, test } from '@playwright/test';

// GX-2 — apps/sample's mock rcm backend must be faithful to the
// rcm-backend-framework 0.1.0 wire contract (documents/analysis/2026-07-12/
// w7-post-seal-gap-analysis.md §5), since it's what every other E2E spec
// (college.spec.ts etc.) already exercises through the UI. These two tests
// hit the real running Next.js routes directly (no UI) to pin the wire
// shape itself — the assumptions packages/backend-rcm/src/__tests__/
// adapter.test.ts makes about a ProblemDetail's `detail`/`title` fields are
// backed by this mock's ACTUAL response body, not just a hand-rolled stub.

test('GET /api/college/{id} 404s with an RFC 7807 ProblemDetail body, not the old {error:{message}} nesting (§5 f)', async ({
  request,
}) => {
  const res = await request.get('/api/college/999999');
  expect(res.status()).toBe(404);

  const body = await res.json();
  // top-level ProblemDetail fields (ProblemDetailAdviceTest.java:78-95) —
  // `title` mirrors `code` per ProblemDetailAdvice.java:112.
  expect(body).toMatchObject({
    status: 404,
    title: 'NOT_FOUND',
    code: 'NOT_FOUND',
    type: 'about:blank',
    errors: [],
    fieldErrors: {},
  });
  expect(body.detail).toBe('college 999999 not found');
  // no legacy `{error:{message}}` nesting — the message is a root field.
  expect(body.error).toBeUndefined();
});

test('POST /api/college/search returns the full 9-field SearchResponse shape, not Spring Data Page (§5 a)', async ({
  request,
}) => {
  const res = await request.post('/api/college/search', {
    data: {
      page: 0,
      pageSize: 5,
      sorts: [],
      filters: { AND: [], OR: [] },
      quickSearchFields: [],
    },
  });
  expect(res.ok()).toBe(true);

  const body = await res.json();
  // SearchResponse.java:51-61 — content/page/pageSize/totalElements/
  // totalPages/sorts/searchRequest/attributes/errors. NOT Spring Data Page
  // (no pageable/number/numberOfElements/first/last/empty).
  expect(body).toMatchObject({
    page: 0,
    pageSize: 5,
    sorts: [],
    attributes: {},
    errors: [],
  });
  expect(Array.isArray(body.content)).toBe(true);
  expect(typeof body.totalElements).toBe('number');
  expect(typeof body.totalPages).toBe('number');
  expect(body.searchRequest).toMatchObject({ page: 0, pageSize: 5 });
  expect(body.pageable).toBeUndefined();
  expect(body.numberOfElements).toBeUndefined();
});
