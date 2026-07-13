// POST /api/major (create) + DELETE /api/major (bulk delete, body
// {ids, revisionEntityName?}) — rcm-backend-framework 0.1.0 collection
// endpoints (Decision #31 / D2: create = POST {url}; delete = DELETE {url}
// bulk, no per-row DELETE). EC3 — Major's wire shape differs from its
// storage shape (major.ts toWire/fromWire doc), so POST hand-writes the
// create instead of delegating to makeCollectionHandlers (which would
// store/echo the raw create body verbatim, losing the
// collegeId/parentMajorId -> nested college/parentMajor resolution and the
// professors/staffs {mapped,deleted} -> id-array merge). TB-4 — DELETE has
// no such wire-shape transform to make (a removed row isn't echoed back
// through toWire, so there's nothing MajorRow-specific to bridge), so it
// reuses the generic bulk handler verbatim instead of hand-writing a
// duplicate — major previously had NO collection DELETE at all, the exact
// defect this task fixes. (The Major entity's UI capability config still
// has `.withCapabilities({ delete: false })` — lib/entities/major.ts:156,
// GJCU parity — so this route wiring is backend-uniformity only; it
// doesn't itself expose a delete affordance in the UI, and changing that
// capability is out of this task's scope.)
import { NextRequest, NextResponse } from 'next/server';
import { fromWire, majorStore, toWire } from '../../../lib/mock-backend/major';
import { makeCollectionHandlers } from '../../../lib/mock-backend/crud-routes';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const created = majorStore().create(fromWire(body));
  return NextResponse.json(toWire(created), { status: 201 });
}

export const { DELETE } = makeCollectionHandlers(majorStore);
