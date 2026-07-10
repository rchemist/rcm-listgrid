// GET/PUT/DELETE /api/staff/{id} — rcm-backend-framework 0.1.0 single-entity
// endpoints. Fetch and update return the bare entity object (no envelope
// wrapper). Clone of employee/[id]/route.ts (EC2 plan §6).
import { NextRequest, NextResponse } from 'next/server';
import { staffStore } from '../../../../lib/mock-backend/collabo';
import { notFound } from '../../../../lib/mock-backend/envelope';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const row = staffStore().findById(id);
  if (!row) return notFound(`staff ${id} not found`);
  return NextResponse.json(row);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const updated = staffStore().update(id, body);
  if (!updated) return notFound(`staff ${id} not found`);
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const removed = staffStore().remove(id);
  if (!removed) return notFound(`staff ${id} not found`);
  return NextResponse.json(removed);
}
