// Response envelope helpers for the mock rcm backend route handlers.
//
// Shape matches rcm-backend-framework 0.1.0 (Decision #31, see
// src/listgrid/form/Type.ts PageResult.fetchListData): search responses are
// the framework's own custom `SearchResponse<T>` record — NOT a Spring Data
// Page (no `pageable`/`number`/`numberOfElements`/`first`/`last`/`empty`).
// See SearchResponse.java:51-61 (`content, page, pageSize, totalElements,
// totalPages, sorts, searchRequest, attributes, errors`, @JsonInclude
// NON_NULL). Single-entity responses (fetch/create/update/delete) are the
// bare entity object with no wrapper — the host adapter's ApiClient is
// responsible for wrapping the HTTP body into `ResponseData`, not this mock
// backend. Errors are RFC 7807 ProblemDetail (top-level, no `{error:{...}}`
// nesting) — see notFound() below and ProblemDetailAdviceTest.java:78-95.

import { NextResponse } from 'next/server';

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

export function searchEnvelope<T>(
  result: { content: T[]; totalElements: number; totalPages: number },
  searchRequest: Record<string, unknown> | undefined,
) {
  return NextResponse.json({
    content: result.content,
    // SearchResponse.java:53-54 — page/pageSize are echoed from the request
    // (same defaults makeSearchHandler/hand-written routes apply when
    // calling store.search()).
    page: numberOr(searchRequest?.page, 0),
    pageSize: numberOr(searchRequest?.pageSize, 20),
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    // SearchResponse.sorts is NEVER null (SearchResponse.java:57,77 —
    // `sorts = sorts == null ? List.of() : ...`); echo the request's sorts,
    // `[]` at minimum.
    sorts: Array.isArray(searchRequest?.sorts) ? searchRequest.sorts : [],
    // v0.1.0 line echoes the request back as `searchRequest` (PageResult
    // falls back to the client's own searchForm when absent).
    searchRequest: searchRequest ?? {},
    // attributes/errors are likewise never-null on the wire
    // (SearchResponse.java:59-60,78-79) — this mock never populates either
    // (no facet/aggregation data, no list-level partial errors).
    attributes: {},
    errors: [],
  });
}

/**
 * RFC 7807 ProblemDetail — top-level fields, no `{error:{...}}` nesting
 * (ProblemDetailAdviceTest.java:78-95, ProblemDetailAdvice.java:106-122).
 * `title` mirrors `code` (`pd.setTitle(primary.code())`,
 * ProblemDetailAdvice.java:112) — both default to `NOT_FOUND` here since
 * this mock has no per-domain ErrorType registry. `type` defaults to
 * `about:blank` (Spring `ProblemDetail`'s RFC 7807 default). `field` /
 * `traceId` / `tenantId` are OMITTED (not emitted as explicit `null`) when
 * unset — matching the framework's conditional `pd.setProperty(...)` calls
 * (`applyContextProperties`, ProblemDetailAdvice.java:415-424; `ex.field()
 * != null` guard, ProblemDetailAdvice.java:114-116): this mock has no
 * request/tenant context to echo, same as a real backend call with neither
 * bound.
 */
export function notFound(message: string, code = 'NOT_FOUND') {
  return NextResponse.json(
    {
      status: 404,
      title: code,
      detail: message,
      type: 'about:blank',
      code,
      // errors/fieldErrors are unconditionally set by the framework's
      // ServiceException handler (applyServiceErrors, ProblemDetailAdvice
      // .java:288-302) — empty here since this generic not-found has no
      // per-field breakdown.
      errors: [],
      fieldErrors: {},
    },
    { status: 404 },
  );
}
