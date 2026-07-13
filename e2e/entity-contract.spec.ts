import { expect, test } from '@playwright/test';

// TB-7 [TB-C9] — closes the recon §4/§5 e2e gap: employee/org/staff/
// university/professor are exercised ONLY incidentally elsewhere (as
// picker/xref targets embedded in OTHER entities' forms — org inside
// staff, staff/professor inside major/collabo — or, for university, not at
// all) and never directly. Per-entity UI pages are out of scope for these
// 5 by design: employee/org/staff/university have NO standalone UI page
// (picker/xref-only, recon §4 — building one would be inventing scope);
// professor has a page but only a SubCollection e2e
// (e2e/professor.spec.ts), never its own list/CRUD. The only
// non-inventing closure is therefore a route-level contract e2e, same
// harness/style as e2e/backend-contract.spec.ts (TB-6): Playwright
// `request` (APIRequestContext) against the real running dev server,
// proving each entity's 5 HTTP methods (create/getOne/search/update/bulk
// delete) round-trip per the recon §2 wire contract — the same contract
// every other spec already exercises indirectly through the UI.
//
// Contracts cited (recon §2):
//   - 9-field SearchResponse (SearchResponse.java:50-180): {content, page,
//     pageSize, totalElements, totalPages, sorts, searchRequest,
//     attributes, errors} — NOT a Spring Data Page.
//   - ProblemDetail 404: {status:404, code:'NOT_FOUND', title:'NOT_FOUND',
//     type:'about:blank', errors:[], fieldErrors:{}}, detail = '<entity>
//     <id> not found'.
//   - create = POST {url} -> 201 bare entity; GET/PUT {url}/{id} -> bare
//     entity | 404; bulk DELETE {url} -> 204 no-body (TB-6).
//   - Generic entities (all 5 here) store the POST body VERBATIM — no
//     toWire/fromWire transform (crud-routes.ts makeCollectionHandlers),
//     unlike major's hand-written college nested-M2O transform.
//
// HARD ISOLATION — the dev server run by playwright.config.ts's webServer
// is ONE shared in-memory store across every spec file, executed serially
// (fullyParallel:false, workers:1). Every row this file touches is created
// via POST first and removed by this same file's bulk-delete test — no
// SEED row (org '1'-'3', staff '1'-'3', university '1'-'4', professor
// '1'-'8', employee '1'-'5') is ever mutated or deleted. No test asserts
// an absolute row count/totalElements value — only count-AGNOSTIC
// comparisons (membership by id, per-row shape).
const SUFFIX = `${Date.now()}`;

interface EntityConfig {
  /** URL path segment, e.g. 'employee' -> /api/employee. */
  path: string;
  /** POST create body — stored verbatim by the generic factory. */
  createBody: Record<string, unknown>;
  /** Field asserted as echoed back on create/getOne. */
  sentField: string;
  sentValue: string;
  /** PUT body for the update test. */
  editPatch: Record<string, unknown>;
  editedField: string;
  editedValue: string;
  /** A field NOT touched by editPatch that must survive the partial merge
   *  (store.ts update(): `{...existing, ...data, id}`). Omitted for
   *  single-field entities (org/university) with nothing else to check. */
  untouchedField?: string;
  untouchedValue?: unknown;
  /** Extra assertions on the GET-one body beyond id/sentField — staff's
   *  verbatim nested `organization` passthrough. */
  extraGetOneAssertions?: (body: Record<string, unknown>) => void;
}

const ENTITIES: EntityConfig[] = [
  {
    path: 'employee',
    createBody: {
      name: `TB-7 직원${SUFFIX}`,
      email: 'tb7-emp@example.com',
      department: 'QA',
      status: 'ACTIVE',
      hireDate: '2026-01-01',
    },
    sentField: 'name',
    sentValue: `TB-7 직원${SUFFIX}`,
    editPatch: { name: `TB-7 직원${SUFFIX} 수정` },
    editedField: 'name',
    editedValue: `TB-7 직원${SUFFIX} 수정`,
    untouchedField: 'email',
    untouchedValue: 'tb7-emp@example.com',
  },
  {
    path: 'org',
    createBody: { name: `TB-7 조직${SUFFIX}` },
    sentField: 'name',
    sentValue: `TB-7 조직${SUFFIX}`,
    editPatch: { name: `TB-7 조직${SUFFIX} 수정` },
    editedField: 'name',
    editedValue: `TB-7 조직${SUFFIX} 수정`,
  },
  {
    path: 'staff',
    createBody: {
      name: `TB-7 조교${SUFFIX}`,
      email: 'tb7-staff@example.com',
      organization: { id: '1', name: '산학협력단' },
    },
    sentField: 'name',
    sentValue: `TB-7 조교${SUFFIX}`,
    editPatch: { name: `TB-7 조교${SUFFIX} 수정` },
    editedField: 'name',
    editedValue: `TB-7 조교${SUFFIX} 수정`,
    untouchedField: 'email',
    untouchedValue: 'tb7-staff@example.com',
    extraGetOneAssertions: (body) => {
      // staff.organization is a nested M2O picker in the FORM, but the
      // staff route is generic (verbatim store, no toWire/fromWire
      // transform like major's college) — GET must echo the exact same
      // nested {id,name}, not a flattened/resolved shape. Documented as a
      // fidelity gap vs major in this file's header + TB-7's deviations,
      // NOT patched here (out of scope — no invented transform).
      expect(body.organization).toEqual({ id: '1', name: '산학협력단' });
    },
  },
  {
    path: 'university',
    createBody: { name: `TB-7 대학교${SUFFIX}` },
    sentField: 'name',
    sentValue: `TB-7 대학교${SUFFIX}`,
    editPatch: { name: `TB-7 대학교${SUFFIX} 수정` },
    editedField: 'name',
    editedValue: `TB-7 대학교${SUFFIX} 수정`,
  },
  {
    path: 'professor',
    createBody: { name: `TB-7 교수${SUFFIX}`, email: 'tb7-prof@example.com' },
    sentField: 'name',
    sentValue: `TB-7 교수${SUFFIX}`,
    editPatch: { name: `TB-7 교수${SUFFIX} 수정` },
    editedField: 'name',
    editedValue: `TB-7 교수${SUFFIX} 수정`,
    untouchedField: 'email',
    untouchedValue: 'tb7-prof@example.com',
  },
];

for (const entity of ENTITIES) {
  test.describe(`${entity.path} — 5-method route contract (recon §2/§4, TB-7)`, () => {
    let createdId: string;

    test(`POST /api/${entity.path} creates a bare entity with a minted id, 201`, async ({
      request,
    }) => {
      const res = await request.post(`/api/${entity.path}`, { data: entity.createBody });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(typeof body.id).toBe('string');
      expect(body.id.length).toBeGreaterThan(0);
      expect(body[entity.sentField]).toBe(entity.sentValue);
      createdId = body.id;
    });

    test(`GET /api/${entity.path}/{id} returns the bare entity, no envelope`, async ({
      request,
    }) => {
      const res = await request.get(`/api/${entity.path}/${createdId}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(createdId);
      expect(body[entity.sentField]).toBe(entity.sentValue);
      // bare entity — no search-response wrapping, no ProblemDetail fields.
      expect(body.content).toBeUndefined();
      expect(body.error).toBeUndefined();
      entity.extraGetOneAssertions?.(body);
    });

    test(`POST /api/${entity.path}/search returns the 9-field SearchResponse, created row is a member`, async ({
      request,
    }) => {
      const res = await request.post(`/api/${entity.path}/search`, {
        data: { page: 0, pageSize: 50, filters: { AND: [], OR: [] }, sorts: [] },
      });
      expect(res.ok()).toBe(true);
      const body = await res.json();
      // SearchResponse.java:51-61 — content/page/pageSize/totalElements/
      // totalPages/sorts/searchRequest/attributes/errors. NOT Spring Data
      // Page (no pageable/number/numberOfElements/first/last/empty).
      expect(Array.isArray(body.content)).toBe(true);
      expect(typeof body.totalElements).toBe('number');
      expect(typeof body.totalPages).toBe('number');
      expect(body.attributes).toEqual({});
      expect(body.errors).toEqual([]);
      expect(body.searchRequest).toMatchObject({ page: 0, pageSize: 50 });
      expect(body.pageable).toBeUndefined();
      expect(body.numberOfElements).toBeUndefined();

      // count-agnostic — membership by id, not an absolute total.
      const content = body.content as Array<Record<string, unknown>>;
      const created = content.find((row) => row.id === createdId);
      expect(created).toBeDefined();
    });

    test(`PUT /api/${entity.path}/{id} returns the bare updated entity, 200`, async ({
      request,
    }) => {
      const res = await request.put(`/api/${entity.path}/${createdId}`, {
        data: entity.editPatch,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(createdId);
      expect(body[entity.editedField]).toBe(entity.editedValue);
      // untouched fields survive the partial merge (store.ts update()).
      if (entity.untouchedField) {
        expect(body[entity.untouchedField]).toBe(entity.untouchedValue);
      }
    });

    test(`DELETE /api/${entity.path} bulk-removes the row with 204 no-body, then GET 404s`, async ({
      request,
    }) => {
      const res = await request.delete(`/api/${entity.path}`, { data: { ids: [createdId] } });
      expect(res.status()).toBe(204);
      expect(await res.text()).toBe('');

      const after = await request.get(`/api/${entity.path}/${createdId}`);
      expect(after.status()).toBe(404);
      const problem = await after.json();
      expect(problem.code).toBe('NOT_FOUND');
    });
  });
}
