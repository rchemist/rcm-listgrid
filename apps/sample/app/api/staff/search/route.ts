// POST /api/staff/search — rcm-backend-framework 0.1.0 search endpoint
// (Decision #31: POST {url}/search, RequestBody = SearchRequest/SearchForm).
// Clone of employee/search/route.ts (EC2 plan §6).
import { NextRequest } from 'next/server';
import { staffStore } from '../../../../lib/mock-backend/collabo';
import { searchEnvelope } from '../../../../lib/mock-backend/envelope';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const page = typeof body.page === 'number' ? body.page : 0;
  const pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;

  const result = staffStore().search(page, pageSize);
  return searchEnvelope(result, body);
}
