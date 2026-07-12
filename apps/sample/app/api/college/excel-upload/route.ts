// POST /api/college/excel-upload — bulk-insert rows parsed by the
// @listgrid/excel DataImporter (W6-3; decision 6 — the host owns this
// endpoint, DataImporter never hardcodes an upload URL). Body:
// `{ rows: Record<string, unknown>[] }`, one already value-transformed row
// per parsed Excel data row (`buildImportRows`, packages/excel/src/
// import-core.ts). Each row is created through the SAME `collegeStore()`
// singleton + `EntityStore.create()` the single-row `POST /api/college`
// route uses (mirrors `crud-routes.ts` `makeCollectionHandlers`), so
// sequential `id` assignment stays consistent whether a College is created
// through the form or through an Excel upload.
import { NextRequest, NextResponse } from 'next/server';
import { collegeStore } from '../../../../lib/mock-backend/academic';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const rows = Array.isArray(body.rows) ? (body.rows as Record<string, unknown>[]) : [];
  const created = rows.map((row) => collegeStore().create(row));
  return NextResponse.json({ created }, { status: 201 });
}
