// POST /api/major — rcm-backend-framework 0.1.0 create endpoint (Decision
// #31: create = POST {url}, bare-entity response body). EC3 — Major's wire
// shape differs from its storage shape (major.ts toWire/fromWire doc), so
// this hand-writes the create instead of delegating to
// makeCollectionHandlers (which would store/echo the raw create body
// verbatim, losing the collegeId/parentMajorId -> nested college/parentMajor
// resolution and the professors/staffs {mapped,deleted} -> id-array merge).
import { NextRequest, NextResponse } from 'next/server';
import { fromWire, majorStore, toWire } from '../../../lib/mock-backend/major';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const created = majorStore().create(fromWire(body));
  return NextResponse.json(toWire(created), { status: 201 });
}
