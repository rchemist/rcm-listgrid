// POST /api/collabo — rcm-backend-framework 0.1.0 create endpoint (Decision
// #31: create = POST {url}, bare-entity response body). Clone of
// employee/route.ts (EC2 plan §6 — employee 4-file pattern).
import { NextRequest, NextResponse } from 'next/server';
import { collaboStore } from '../../../lib/mock-backend/collabo';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const created = collaboStore().create(body);
  return NextResponse.json(created, { status: 201 });
}
