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
import type { SortSpec } from '@listgrid/schema-core';
import type { EntityStore, SearchFilters, WithId } from './store';
import { notFound, searchEnvelope } from './envelope';

// Exported (not just used internally by makeSearchHandler) — major/search/
// route.ts (EC3) needs the same wire `filters` extraction for its own
// hand-written handler (its response body needs a toWire() transform
// makeSearchHandler can't express generically).
//
// TB-1 correction (tb-matching-semantics.md — this doc's header carries the
// full correction note): the previous comment here claimed "the framework
// doesn't document NOT-group row-matching semantics anywhere this mock can
// cite, so implementing it would be inventing behavior." That was WRONG.
// `SearchRequestPlanner.combineGroup:184` defines it explicitly —
// `NOT -> cb.not(cb.and(arr))` (negation of the member AND). matchesFilterGroup
// (store.ts) now implements exactly that, plus item-level `subFilters`
// recursion. `body.filters` is the GX-1 FilterGroups shape, a sparse
// operator-keyed map `{AND?, OR?, NOT?}` (SearchForm.toJSON() always emits
// `AND`/`OR` as arrays, `[]` at minimum; `NOT` only when populated —
// search-form.ts:264-281) — any subset of the three keys may be present, and
// each, when present, applies (missing keys don't constrain; empty arrays
// are vacuously TRUE — matchesFilterGroup/combineGroup in store.ts).
export function readFilters(body: Record<string, unknown>): SearchFilters | undefined {
  const raw = body.filters as { AND?: unknown; OR?: unknown; NOT?: unknown } | undefined;
  if (!raw) return undefined;
  const hasAnd = Array.isArray(raw.AND);
  const hasOr = Array.isArray(raw.OR);
  const hasNot = Array.isArray(raw.NOT);
  if (!hasAnd && !hasOr && !hasNot) return undefined;
  return raw as SearchFilters;
}

// TB-2 (tb-matching-semantics.md §5) — `body.sorts` is `SortSpec[]`
// (`{field, direction}` only — search-form.ts:27-30, no framework
// `type`/`nullsFirst` on the wire). Exported alongside `readFilters` for the
// same reason: major/search/route.ts's hand-written handler needs the
// identical wire extraction.
export function readSorts(body: Record<string, unknown>): SortSpec[] | undefined {
  const raw = body.sorts;
  return Array.isArray(raw) && raw.length > 0 ? (raw as SortSpec[]) : undefined;
}

export function makeSearchHandler<T extends WithId>(getStore: () => EntityStore<T>) {
  return async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    const page = typeof body.page === 'number' ? body.page : 0;
    const pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;

    // EC3 — apply the wire `filters` (see store.ts matchesFilterGroup doc).
    // TB-2 — apply the wire `sorts` (see store.ts sortRows doc).
    const result = getStore().search(page, pageSize, readFilters(body), readSorts(body));
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
