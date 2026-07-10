// Response envelope helpers for the mock rcm backend route handlers.
//
// Shape matches rcm-backend-framework 0.1.0 (Decision #31, see
// src/listgrid/form/Type.ts PageResult.fetchListData): search responses are
// Spring-Data-Page-shaped (`content` / `totalElements` / `totalPages`) with
// a `searchRequest` echo; single-entity responses (fetch/create/update/
// delete) are the bare entity object with no wrapper — the host adapter's
// ApiClient is responsible for wrapping the HTTP body into `ResponseData`,
// not this mock backend.

import { NextResponse } from 'next/server';

export function searchEnvelope<T>(
  result: { content: T[]; totalElements: number; totalPages: number },
  searchRequest: unknown,
) {
  return NextResponse.json({
    content: result.content,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    // v0.1.0 line echoes the request back as `searchRequest` (PageResult
    // falls back to the client's own searchForm when absent).
    searchRequest: searchRequest ?? {},
  });
}

export function notFound(message: string) {
  return NextResponse.json({ error: { message } }, { status: 404 });
}
