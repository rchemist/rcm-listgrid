// GET/PUT/DELETE /api/org/{id} — rcm-backend-framework 0.1.0 single-entity
// endpoints. Fetch and update return the bare entity object (no envelope
// wrapper). Clone of employee/[id]/route.ts (EC2 plan §6).
import { NextRequest, NextResponse } from 'next/server';
import { orgStore } from '../../../../lib/mock-backend/collabo';
import { notFound } from '../../../../lib/mock-backend/envelope';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const row = orgStore().findById(id);
  if (!row) return notFound(`org ${id} not found`);
  return NextResponse.json(row);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const updated = orgStore().update(id, body);
  if (!updated) return notFound(`org ${id} not found`);
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const removed = orgStore().remove(id);
  if (!removed) return notFound(`org ${id} not found`);
  return NextResponse.json(removed);
}
