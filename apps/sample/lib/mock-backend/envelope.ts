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

// TB-3 — the rest of the framework's ProblemDetail error set (CrudErrorType
// .java:37-43 + ProblemDetailAdvice.java), same field shape as notFound()
// above (title=code, type='about:blank', errors:[], fieldErrors default {}).
// 401/403 are documented exceptions: bare Spring-Security statuses, NOT
// web-advice ProblemDetail from this registry — see unauthorized()/
// forbidden() below for the distinction.

/**
 * VALIDATION.FAILED -> 400. The one ProblemDetail case that carries a
 * populated `fieldErrors` (applyServiceErrors, ProblemDetailAdvice.java:
 * 288-302) — callers pass the per-field messages to reproduce.
 */
export function validationFailed(
  fieldErrors: Record<string, string[]>,
  message = 'Validation failed',
  code = 'VALIDATION.FAILED',
  globalErrors: string[] = [],
) {
  return NextResponse.json(
    {
      status: 400,
      title: code,
      detail: message,
      type: 'about:blank',
      code,
      errors: globalErrors,
      fieldErrors,
    },
    { status: 400 },
  );
}

/** CRUD.DUPLICATE -> 409. */
export function duplicate(message = 'Duplicate entity', code = 'CRUD.DUPLICATE') {
  return NextResponse.json(
    {
      status: 409,
      title: code,
      detail: message,
      type: 'about:blank',
      code,
      errors: [],
      fieldErrors: {},
    },
    { status: 409 },
  );
}

/** CRUD.UNPROCESSABLE -> 422. */
export function unprocessable(message = 'Unprocessable entity', code = 'CRUD.UNPROCESSABLE') {
  return NextResponse.json(
    {
      status: 422,
      title: code,
      detail: message,
      type: 'about:blank',
      code,
      errors: [],
      fieldErrors: {},
    },
    { status: 422 },
  );
}

/**
 * SYSTEM.UNEXPECTED -> 500. ProblemDetailAdvice HIDES the real exception
 * message on this path (ProblemDetailAdvice.java:242-247) — `detail` is
 * therefore a fixed generic string here too, never a caller-supplied
 * message that could leak internals.
 */
export function systemError() {
  const code = 'SYSTEM.UNEXPECTED';
  return NextResponse.json(
    {
      status: 500,
      title: code,
      detail: 'Internal server error',
      type: 'about:blank',
      code,
      errors: [],
      fieldErrors: {},
    },
    { status: 500 },
  );
}

/**
 * Bare Spring-Security `HttpStatusEntryPoint(UNAUTHORIZED)` — 401. NOT a
 * web-advice ProblemDetail; the framework has no `AUTH.TOKEN` code in the
 * CrudErrorType registry. `code: 'TOKEN_EXPIRED'` is included so this body
 * exercises the adapter's `isTokenExpired()` body-shape path in addition to
 * the (already sufficient) `status === 401` path — matching what a real
 * token-expiry response commonly carries.
 */
export function unauthorized() {
  return NextResponse.json(
    {
      status: 401,
      title: 'UNAUTHORIZED',
      detail: 'Authentication required',
      type: 'about:blank',
      code: 'TOKEN_EXPIRED',
      errors: [],
      fieldErrors: {},
    },
    { status: 401 },
  );
}

/**
 * Bare Spring-Security access-denied — 403. NOT a web-advice ProblemDetail;
 * the framework has no `AUTH.FORBIDDEN` code either — the adapter keys on
 * `status === 403` alone. `code: 'ACCESS_DENIED'` is a short honest label
 * for this mock, not a claimed framework namespace.
 */
export function forbidden() {
  const code = 'ACCESS_DENIED';
  return NextResponse.json(
    {
      status: 403,
      title: code,
      detail: 'Access denied',
      type: 'about:blank',
      code,
      errors: [],
      fieldErrors: {},
    },
    { status: 403 },
  );
}
