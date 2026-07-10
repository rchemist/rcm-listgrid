// POST /api/employee — rcm-backend-framework 0.1.0 create endpoint
// (Decision #31: create = POST {url}, bare-entity response body).
import { NextRequest, NextResponse } from 'next/server';
import { employeeStore } from '../../../lib/mock-backend/employee';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const created = employeeStore().create(body);
  return NextResponse.json(created, { status: 201 });
}
