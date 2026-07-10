// GET/PUT/DELETE /api/employee/{id} — rcm-backend-framework 0.1.0 single-
// entity endpoints. Fetch and update return the bare entity object (no
// envelope wrapper — EntityForm.fetchData / internalSave dereference
// `response.data` directly as the entity, per src/listgrid/config/EntityForm.tsx).
import { NextRequest, NextResponse } from 'next/server';
import { employeeStore } from '../../../../lib/mock-backend/employee';
import { notFound } from '../../../../lib/mock-backend/envelope';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const row = employeeStore().findById(id);
  if (!row) return notFound(`employee ${id} not found`);
  return NextResponse.json(row);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const updated = employeeStore().update(id, body);
  if (!updated) return notFound(`employee ${id} not found`);
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const removed = employeeStore().remove(id);
  if (!removed) return notFound(`employee ${id} not found`);
  return NextResponse.json(removed);
}
