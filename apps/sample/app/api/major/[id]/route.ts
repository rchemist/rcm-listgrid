// GET/PUT /api/major/{id} — rcm-backend-framework 0.1.0 single-entity
// endpoints (bare entity, no envelope). No DELETE — Major is
// `.withCapabilities({ delete: false })` (briefing §6 / GJCU parity), same as
// Collabo/College never wiring one up.
// Hand-written (not makeItemHandlers) for the same toWire/fromWire reason as
// major/route.ts POST.
import { NextRequest, NextResponse } from 'next/server';
import { fromWire, majorStore, toWire } from '../../../../lib/mock-backend/major';
import { notFound } from '../../../../lib/mock-backend/envelope';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const row = majorStore().findById(id);
  if (!row) return notFound(`major ${id} not found`);
  return NextResponse.json(toWire(row));
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const existing = majorStore().findById(id);
  if (!existing) return notFound(`major ${id} not found`);
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const updated = majorStore().update(id, fromWire(body, existing));
  if (!updated) return notFound(`major ${id} not found`);
  return NextResponse.json(toWire(updated));
}
