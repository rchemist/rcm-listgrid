// bulk-delete.test.ts — TB-4 proof: bulk DELETE is now uniform across every
// mock-backend collection route. Before this task, `employee`, `collabo`,
// `org`, `staff`, `major` each had a hand-written POST-only collection
// route.ts with NO `DELETE` export at all — the real defect (adapter.ts
// remove() sends bulk `DELETE {url}` unconditionally, so deleting any row
// of those five entities failed outright). This suite drives the REAL
// route.ts exports (not just makeCollectionHandlers in isolation) for the
// five previously-defective entities plus `college` (already-uniform,
// regression check), proving:
//   1. multi-row bulk delete now works for every previously-defective entity
//   2. `revisionEntityName` passes through (echoed in the response when
//      sent, absent when omitted — a conditional field, not required)
//   3. no optimistic-locking/stale-revision semantics were invented: a
//      second delete of an already-gone id is a quiet no-op, never a
//      409/error (recon §6.2 — revisionEntityName is passthrough-only)
//   4. an already-bulk entity (college) still deletes correctly under the
//      new response shape (`{removed, revisionEntityName?}` instead of a
//      bare array — crud-routes.ts DELETE handler)
//
// Rows are created through each route's own POST handler (never seeded ids
// touched directly), so every test is independent of whatever earlier
// tests in this file already did to the module-singleton, globalThis-cached
// stores (store.ts header) — each POST mints a fresh id via `nextId`.

import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE as employeeDelete, POST as employeePost } from '../../app/api/employee/route';
import { DELETE as collaboDelete, POST as collaboPost } from '../../app/api/collabo/route';
import { DELETE as orgDelete, POST as orgPost } from '../../app/api/org/route';
import { DELETE as staffDelete, POST as staffPost } from '../../app/api/staff/route';
import { DELETE as majorDelete, POST as majorPost } from '../../app/api/major/route';
import { DELETE as collegeDelete, POST as collegePost } from '../../app/api/college/route';

type Handler = (request: NextRequest) => Promise<Response>;

function postRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, { method: 'POST', body: JSON.stringify(body) });
}

function deleteRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, { method: 'DELETE', body: JSON.stringify(body) });
}

/** Creates two fresh rows via the entity's real POST handler and returns their minted ids. */
async function createTwo(
  post: Handler,
  url: string,
  rowBody: Record<string, unknown>,
): Promise<[string, string]> {
  const row1 = await (await post(postRequest(url, rowBody))).json();
  const row2 = await (await post(postRequest(url, rowBody))).json();
  return [String(row1.id), String(row2.id)];
}

describe('mock-backend bulk DELETE uniformity (TB-4)', () => {
  const defectiveEntities: Array<{
    name: string;
    url: string;
    post: Handler;
    del: Handler;
    body: Record<string, unknown>;
  }> = [
    {
      name: 'employee',
      url: 'http://localhost/api/employee',
      post: employeePost,
      del: employeeDelete,
      body: {
        name: 'TB-4 임시직원',
        email: 'tb4@example.com',
        department: 'QA',
        status: 'ACTIVE',
        hireDate: '2026-01-01',
      },
    },
    {
      name: 'collabo',
      url: 'http://localhost/api/collabo',
      post: collaboPost,
      del: collaboDelete,
      body: {
        name: 'TB-4 협력사',
        representative: '홍길동',
        officer: '김담당',
        socialEnterprise: false,
        showOnApply: true,
        collaborated: false,
        contracted: 'NONE',
        type: 'CORP',
      },
    },
    {
      name: 'org',
      url: 'http://localhost/api/org',
      post: orgPost,
      del: orgDelete,
      body: { name: 'TB-4 조직' },
    },
    {
      name: 'staff',
      url: 'http://localhost/api/staff',
      post: staffPost,
      del: staffDelete,
      body: {
        name: 'TB-4 직원',
        email: 'tb4-staff@example.com',
        organization: { id: '1', name: '산학협력단' },
      },
    },
    {
      name: 'major',
      url: 'http://localhost/api/major',
      post: majorPost,
      del: majorDelete,
      body: { name: 'TB-4 전공', type: 'MAJOR' },
    },
  ];

  for (const { name, url, post, del, body } of defectiveEntities) {
    it(`${name}: multi-row bulk delete removes both seeded rows (previously had no collection DELETE)`, async () => {
      const [id1, id2] = await createTwo(post, url, body);

      const response = await del(deleteRequest(url, { ids: [id1, id2] }));
      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload.removed).toHaveLength(2);
      expect((payload.removed as Array<{ id: string }>).map((row) => row.id).sort()).toEqual(
        [id1, id2].sort(),
      );
    });
  }

  it('revisionEntityName passthrough: echoed when sent, absent when omitted, delete succeeds either way', async () => {
    const [id1, id2] = await createTwo(employeePost, 'http://localhost/api/employee', {
      name: 'TB-4 리비전직원',
      email: 'tb4-rev@example.com',
      department: 'QA',
      status: 'ACTIVE',
      hireDate: '2026-01-01',
    });

    const withRevision = await employeeDelete(
      deleteRequest('http://localhost/api/employee', {
        ids: [id1],
        revisionEntityName: 'SomeAudit',
      }),
    );
    expect(withRevision.status).toBe(200);
    const withRevisionBody = await withRevision.json();
    expect(withRevisionBody.removed).toHaveLength(1);
    expect(withRevisionBody.removed[0].id).toBe(id1);
    expect(withRevisionBody.revisionEntityName).toBe('SomeAudit');

    // conditional field — a delete WITHOUT it still works, and the response
    // carries no revisionEntityName key at all.
    const withoutRevision = await employeeDelete(
      deleteRequest('http://localhost/api/employee', { ids: [id2] }),
    );
    expect(withoutRevision.status).toBe(200);
    const withoutRevisionBody = await withoutRevision.json();
    expect(withoutRevisionBody.removed).toHaveLength(1);
    expect(withoutRevisionBody.removed[0].id).toBe(id2);
    expect(withoutRevisionBody).not.toHaveProperty('revisionEntityName');
  });

  it('no optimistic-lock behavior: deleting an already-deleted id is a quiet no-op, never 409/error', async () => {
    const [id1] = await createTwo(employeePost, 'http://localhost/api/employee', {
      name: 'TB-4 재삭제직원',
      email: 'tb4-redelete@example.com',
      department: 'QA',
      status: 'ACTIVE',
      hireDate: '2026-01-01',
    });

    const first = await employeeDelete(
      deleteRequest('http://localhost/api/employee', { ids: [id1] }),
    );
    expect(first.status).toBe(200);

    // Second delete of the same (now-gone) id: proves the mock invents no
    // concurrency/stale-revision semantics — just removes nothing, no
    // 409/error of any kind (brief DO-NOT: no optimistic-locking).
    const again = await employeeDelete(
      deleteRequest('http://localhost/api/employee', {
        ids: [id1],
        revisionEntityName: 'SomeAudit',
      }),
    );
    expect(again.status).toBe(200);
    const againBody = await again.json();
    expect(againBody.removed).toHaveLength(0);
    expect(againBody.revisionEntityName).toBe('SomeAudit');
  });

  it('regression: an already-bulk entity (college) still deletes correctly under the new response shape', async () => {
    const [id1, id2] = await createTwo(collegePost, 'http://localhost/api/college', {
      name: 'TB-4 임시대학',
      englishName: 'TB-4 Temp College',
      description: 'bulk-delete regression fixture',
      active: true,
    });

    const response = await collegeDelete(
      deleteRequest('http://localhost/api/college', { ids: [id1, id2] }),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.removed).toHaveLength(2);
    expect((payload.removed as Array<{ id: string }>).map((row) => row.id).sort()).toEqual(
      [id1, id2].sort(),
    );
  });
});
