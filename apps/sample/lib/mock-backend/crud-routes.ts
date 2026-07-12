// Generic route-handler factory for rcm-backend-framework 0.1.0 CRUD
// entities (Decision #31 / D2 wire contract — see employee/route.ts,
// employee/search/route.ts, employee/[id]/route.ts for the hand-written
// original this generalizes). Each entity's route files stay thin:
// they just bind an EntityStore accessor and delegate here, instead of
// re-implementing the same envelope/notFound plumbing per entity.
//
// Wire contract recap (RCM 0.1.0):
//   POST   {url}/search  -> searchEnvelope(...) — full 9-field SearchResponse
//                           (content/page/pageSize/totalElements/totalPages/
//                           sorts/searchRequest/attributes/errors), see
//                           envelope.ts.
//   POST   {url}         -> bare created entity (201)
//   GET    {url}/{id}    -> bare entity | 404 ProblemDetail
//   PUT    {url}/{id}    -> bare updated entity | 404 ProblemDetail
//   DELETE {url}         -> bulk delete, body {ids:string[]} (no per-row DELETE)

import { NextRequest, NextResponse } from 'next/server';
import type { EntityStore, SearchFilters, WithId } from './store';
import { notFound, searchEnvelope } from './envelope';

// Exported (not just used internally by makeSearchHandler) — major/search/
// route.ts (EC3) needs the same wire `filters` extraction for its own
// hand-written handler (its response body needs a toWire() transform
// makeSearchHandler can't express generically).
//
// GX-2 (§5 item 4) — `body.filters` is the GX-1 FilterGroups shape, an
// operator-keyed map `{AND?, OR?, NOT?}` (SearchForm.toJSON() always emits
// `AND`/`OR` as arrays, `[]` at minimum; `NOT` only when populated —
// search-form.ts:264-281). Only `AND`/`OR` are read and applied
// (matchesFilterGroup, store.ts) — `NOT` is accepted on the wire (present
// here as a passthrough property on `raw`) but NOT matched against rows: no
// current caller in this app populates it (grep across apps/sample +
// packages/react registries turns up only `addAndFilter`), and the
// framework doesn't document NOT-group row-matching semantics anywhere this
// mock can cite, so implementing it would be inventing behavior. Empty
// `AND: []` / `OR: []` are handled gracefully as a no-op (vacuous
// `Array.every`/`length === 0` in matchesFilterGroup) — not an error.
export function readFilters(body: Record<string, unknown>): SearchFilters | undefined {
  const raw = body.filters as { AND?: unknown; OR?: unknown; NOT?: unknown } | undefined;
  if (!raw || !Array.isArray(raw.AND) || !Array.isArray(raw.OR)) return undefined;
  return raw as SearchFilters;
}

export function makeSearchHandler<T extends WithId>(getStore: () => EntityStore<T>) {
  return async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    const page = typeof body.page === 'number' ? body.page : 0;
    const pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;

    // EC3 — apply the wire `filters` (see store.ts matchesFilterGroup doc).
    const result = getStore().search(page, pageSize, readFilters(body));
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
