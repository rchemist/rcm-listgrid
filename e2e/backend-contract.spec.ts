import { expect, test } from '@playwright/test';

// GX-2 — apps/sample's mock rcm backend must be faithful to the
// rcm-backend-framework 0.1.0 wire contract (documents/analysis/2026-07-12/
// w7-post-seal-gap-analysis.md §5), since it's what every other E2E spec
// (college.spec.ts etc.) already exercises through the UI. These two tests
// hit the real running Next.js routes directly (no UI) to pin the wire
// shape itself — the assumptions packages/backend-rcm/src/__tests__/
// adapter.test.ts makes about a ProblemDetail's `detail`/`title` fields are
// backed by this mock's ACTUAL response body, not just a hand-rolled stub.
//
// TB-6 [TB-C8/C10] — expands this into the full-set route-contract suite
// (recon §2, the same recon doc's §2 backs every contract cited below):
// the 5 methods listgrid uses over HTTP (POST /search, GET /{id}, POST /
// create, PUT /{id}, DELETE / bulk) across representative entities
// (college — hand-written toWire/fromWire-free passthrough; major — the
// hand-written toWire/fromWire nested-M2O transform, TB-5's round-trip tied
// to real HTTP) + filter/sort/GX-1 semantics + error injection, all over
// the real running dev server (not the in-process NextRequest driving that
// bulk-delete.test.ts/error-routes.test.ts use). The central new lock: bulk
// DELETE is 204 no-body (crud-routes.ts DELETE handler, TB-6) — the
// client adapter's remove() never parses the response body, so a 204
// no-body is fully client-compatible; this suite proves it over real HTTP,
// not just the in-process NextRequest driving that already covers.
//
// HARD ISOLATION — the dev server run by playwright.config.ts's webServer
// is ONE shared in-memory store across every spec file, executed serially
// (fullyParallel:false, workers:1). Every row this file touches is created
// via POST first and deleted (or left orphaned only if delete-tested) by
// this same file — SEED rows (college '1'-'6', major '1'/'2') are never
// mutated or deleted. No test asserts an absolute row count/totalElements
// value — only count-AGNOSTIC comparisons (equality between two searches,
// membership, per-row predicates).

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

// A per-run suffix keeps every throwaway row's name collision-free across
// repeated runs against a reused dev server (playwright.config.ts
// reuseExistingServer) without touching/asserting anything about other
// specs' rows.
const SUFFIX = `${Date.now()}`;

test.describe('college — 5-method contract (§2: create=POST {url}, GET/PUT {url}/{id}, bulk DELETE {url})', () => {
  let createdId: string;

  test('POST /api/college creates a bare entity with a minted id, 201 (§2)', async ({
    request,
  }) => {
    const res = await request.post('/api/college', {
      data: {
        name: `TB-6 계약임시대학${SUFFIX}`,
        englishName: 'TB-6 Temp',
        description: 'contract fixture',
        active: true,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThan(0);
    expect(body.name).toBe(`TB-6 계약임시대학${SUFFIX}`);
    createdId = body.id;
  });

  test('GET /api/college/{id} returns the bare entity, no envelope (§2)', async ({ request }) => {
    const res = await request.get(`/api/college/${createdId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(createdId);
    expect(body.name).toBe(`TB-6 계약임시대학${SUFFIX}`);
    // bare entity — no search-response wrapping, no ProblemDetail fields.
    expect(body.content).toBeUndefined();
    expect(body.error).toBeUndefined();
  });

  test('PUT /api/college/{id} returns the bare updated entity reflecting the change, 200 (§2)', async ({
    request,
  }) => {
    const res = await request.put(`/api/college/${createdId}`, {
      data: { description: 'contract fixture — updated' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(createdId);
    expect(body.description).toBe('contract fixture — updated');
    // untouched fields survive the partial merge (store.ts update()).
    expect(body.name).toBe(`TB-6 계약임시대학${SUFFIX}`);
  });

  test('DELETE /api/college bulk-removes the row with 204 no-body, then GET 404s (§2 — the 204 fidelity lock, TB-6)', async ({
    request,
  }) => {
    const res = await request.delete('/api/college', { data: { ids: [createdId] } });
    expect(res.status()).toBe(204);
    expect(await res.text()).toBe('');

    const after = await request.get(`/api/college/${createdId}`);
    expect(after.status()).toBe(404);
    const problem = await after.json();
    expect(problem.code).toBe('NOT_FOUND');
  });
});

test.describe('major — hand-written toWire/fromWire nested M2O wire transform (major.ts:135-151, TB-5 round-trip over real HTTP)', () => {
  let majorId: string;

  test('POST /api/major returns nested college/professors/staffs, no flat collegeId, 201 (§2)', async ({
    request,
  }) => {
    const res = await request.post('/api/major', {
      data: { name: `TB-6 계약전공${SUFFIX}`, type: 'MAJOR', collegeId: '1' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(typeof body.id).toBe('string');
    // toWire() resolves flat collegeId -> nested {id,name} — seed college
    // '1' is '공과대학' (academic.ts).
    expect(body.college).toEqual({ id: '1', name: '공과대학' });
    expect(body.collegeId).toBeUndefined();
    expect(Array.isArray(body.professors?.mapped)).toBe(true);
    expect(Array.isArray(body.staffs?.mapped)).toBe(true);
    majorId = body.id;
  });

  test('GET /api/major/{id} carries the same nested college shape, no flat collegeId (§2, TB-5)', async ({
    request,
  }) => {
    const res = await request.get(`/api/major/${majorId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.college).toEqual({ id: '1', name: '공과대학' });
    expect(body.collegeId).toBeUndefined();
  });

  test('POST /api/major/search returns the 9-field SearchResponse with nested M2O content rows (§2, TB-5)', async ({
    request,
  }) => {
    const res = await request.post('/api/major/search', {
      data: { page: 0, pageSize: 20, filters: { AND: [], OR: [] }, sorts: [] },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.content)).toBe(true);
    expect(typeof body.totalElements).toBe('number');
    const created = (body.content as Array<{ id: string; college?: unknown }>).find(
      (row) => row.id === majorId,
    );
    expect(created).toBeDefined();
    // nested object, not a flat id — the same toWire() transform as GET/POST.
    expect(created?.college).toEqual({ id: '1', name: '공과대학' });
  });

  test('DELETE /api/major bulk-removes the row with 204 (generic handler, inherited via makeCollectionHandlers), then GET 404s (§2, TB-6)', async ({
    request,
  }) => {
    const res = await request.delete('/api/major', { data: { ids: [majorId] } });
    expect(res.status()).toBe(204);
    expect(await res.text()).toBe('');

    const after = await request.get(`/api/major/${majorId}`);
    expect(after.status()).toBe(404);
  });
});

test.describe('filter/sort/GX-1 over the wire (count-agnostic — GA-L2 contribution)', () => {
  test('GX-1: empty AND/OR filters is vacuous-TRUE, same totalElements as no filters key at all (§2)', async ({
    request,
  }) => {
    const withEmptyGroups = await request.post('/api/college/search', {
      data: { page: 0, pageSize: 1, filters: { AND: [], OR: [] }, sorts: [] },
    });
    const withNoFiltersKey = await request.post('/api/college/search', {
      data: { page: 0, pageSize: 1, sorts: [] },
    });
    expect(withEmptyGroups.ok()).toBe(true);
    expect(withNoFiltersKey.ok()).toBe(true);
    const a = await withEmptyGroups.json();
    const b = await withNoFiltersKey.json();
    // count-agnostic: the two totals must be EQUAL to each other (empty
    // AND/OR is vacuous-TRUE / unconstrained, not zero results) — never a
    // hard-coded number, since other specs mutate the same store.
    expect(a.totalElements).toBe(b.totalElements);
  });

  test('LIKE filter narrows content to matching rows only (store.ts matchesFilter LIKE, §2)', async ({
    request,
  }) => {
    const created = await request.post('/api/college', {
      data: {
        name: `TB-6 유니크필터대학${SUFFIX}`,
        englishName: 'TB-6 Filter Unique',
        description: 'filter fixture',
        active: true,
      },
    });
    const { id } = await created.json();

    try {
      const res = await request.post('/api/college/search', {
        data: {
          page: 0,
          pageSize: 50,
          filters: { AND: [{ name: 'name', queryConditionType: 'LIKE', value: '유니크필터' }] },
          sorts: [],
        },
      });
      expect(res.ok()).toBe(true);
      const body = await res.json();
      const content = body.content as Array<{ id: string; name: string }>;
      expect(content.some((row) => row.id === id)).toBe(true);
      for (const row of content) {
        expect(row.name).toContain('유니크필터');
      }
    } finally {
      await request.delete('/api/college', { data: { ids: [id] } });
    }
  });

  test('sorts applied in list order — DESC on a shared-prefix pair returns Z-before-A (SortBuilder-equivalent, §5)', async ({
    request,
  }) => {
    const prefix = `TB-6 정렬유니크${SUFFIX}`;
    const low = await request.post('/api/college', {
      data: {
        name: `${prefix}-AAA`,
        englishName: 'sort fixture low',
        description: 'sort fixture',
        active: true,
      },
    });
    const high = await request.post('/api/college', {
      data: {
        name: `${prefix}-ZZZ`,
        englishName: 'sort fixture high',
        description: 'sort fixture',
        active: true,
      },
    });
    const { id: lowId } = await low.json();
    const { id: highId } = await high.json();

    try {
      const res = await request.post('/api/college/search', {
        data: {
          page: 0,
          pageSize: 50,
          filters: { AND: [{ name: 'name', queryConditionType: 'LIKE', value: prefix }] },
          sorts: [{ field: 'name', direction: 'DESC' }],
        },
      });
      expect(res.ok()).toBe(true);
      const body = await res.json();
      const content = body.content as Array<{ id: string; name: string }>;
      expect(content.map((row) => row.id)).toEqual([highId, lowId]);
    } finally {
      await request.delete('/api/college', { data: { ids: [lowId, highId] } });
    }
  });
});

test.describe('error injection over HTTP (route-level spot-check — TB-3 covers route/adapter at unit level)', () => {
  test('x-mock-error: VALIDATION -> 400 ProblemDetail with populated fieldErrors (crud-routes.ts mockErrorResponse)', async ({
    request,
  }) => {
    const res = await request.post('/api/college/search', {
      headers: { 'x-mock-error': 'VALIDATION' },
      data: { page: 0, pageSize: 5 },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.status).toBe(400);
    expect(body.code).toContain('VALIDATION');
    expect(body.title).toContain('VALIDATION');
    expect(Object.keys(body.fieldErrors).length).toBeGreaterThan(0);
  });

  test('x-mock-error: SYSTEM -> 500 ProblemDetail (crud-routes.ts mockErrorResponse)', async ({
    request,
  }) => {
    const res = await request.post('/api/college/search', {
      headers: { 'x-mock-error': 'SYSTEM' },
      data: { page: 0, pageSize: 5 },
    });
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.status).toBe(500);
    expect(body.code).toContain('SYSTEM');
  });
});
