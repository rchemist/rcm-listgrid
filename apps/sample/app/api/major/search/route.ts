// POST /api/major/search — rcm-backend-framework 0.1.0 search endpoint.
// Hand-written (not makeSearchHandler) because the response content needs
// the same toWire() transform as the item/collection routes — the list page
// AND the parentMajor self-ref M2O picker both read through this endpoint.
import { NextRequest } from 'next/server';
import { majorStore, toWire } from '../../../../lib/mock-backend/major';
import { readFilters, readSorts } from '../../../../lib/mock-backend/crud-routes';
import { searchEnvelope } from '../../../../lib/mock-backend/envelope';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const page = typeof body.page === 'number' ? body.page : 0;
  const pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;

  const result = majorStore().search(page, pageSize, readFilters(body), readSorts(body));
  return searchEnvelope({ ...result, content: result.content.map(toWire) }, body);
}
