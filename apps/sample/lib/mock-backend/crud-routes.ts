// Generic route-handler factory for rcm-backend-framework 0.1.0 CRUD
// entities (Decision #31 / D2 wire contract — see employee/route.ts,
// employee/search/route.ts, employee/[id]/route.ts for the hand-written
// original this generalizes). Each entity's route files stay thin:
// they just bind an EntityStore accessor and delegate here, instead of
// re-implementing the same envelope/notFound plumbing per entity.
//
// Wire contract recap (RCM 0.1.0):
//   POST   {url}/search  -> searchEnvelope({content,totalElements,totalPages})
//   POST   {url}         -> bare created entity (201)
//   GET    {url}/{id}    -> bare entity | 404
//   PUT    {url}/{id}    -> bare updated entity | 404
//   DELETE {url}         -> bulk delete, body {ids:string[]} (no per-row DELETE)

import { NextRequest, NextResponse } from 'next/server';
import type { EntityStore, WithId } from './store';
import { notFound, searchEnvelope } from './envelope';

export function makeSearchHandler<T extends WithId>(getStore: () => EntityStore<T>) {
  return async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    const page = typeof body.page === 'number' ? body.page : 0;
    const pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;

    const result = getStore().search(page, pageSize);
    return searchEnvelope(result, body);
  };
}

export function makeCollectionHandlers<T extends WithId>(getStore: () => EntityStore<T>) {
  return {
    async POST(request: NextRequest) {
      const body = await request.json().catch(() => ({}) as Record<string, unknown>);
      const created = getStore().create(body);
      return NextResponse.json(created, { status: 201 });
    },

    // Bulk delete — the wire contract has no per-row DELETE endpoint.
    async DELETE(request: NextRequest) {
      const body = await request.json().catch(() => ({}) as Record<string, unknown>);
      const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];
      const removed = ids
        .map((id: string) => getStore().remove(id))
        .filter((row): row is T => row !== undefined);
      return NextResponse.json(removed);
    },
  };
}

export function makeItemHandlers<T extends WithId>(
  getStore: () => EntityStore<T>,
  entityName: string,
) {
  type RouteContext = { params: Promise<{ id: string }> };

  return {
    async GET(_request: NextRequest, { params }: RouteContext) {
      const { id } = await params;
      const row = getStore().findById(id);
      if (!row) return notFound(`${entityName} ${id} not found`);
      return NextResponse.json(row);
    },

    async PUT(request: NextRequest, { params }: RouteContext) {
      const { id } = await params;
      const body = await request.json().catch(() => ({}) as Record<string, unknown>);
      const updated = getStore().update(id, body);
      if (!updated) return notFound(`${entityName} ${id} not found`);
      return NextResponse.json(updated);
    },
  };
}
