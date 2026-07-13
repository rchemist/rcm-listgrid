// POST /api/org/search — rcm-backend-framework 0.1.0 search endpoint
// (Decision #31: POST {url}/search, RequestBody = SearchRequest/SearchForm).
// Clone of employee/search/route.ts (EC2 plan §6).
import { NextRequest } from 'next/server';
import { orgStore } from '../../../../lib/mock-backend/collabo';
import { readSorts } from '../../../../lib/mock-backend/crud-routes';
import { searchEnvelope } from '../../../../lib/mock-backend/envelope';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const page = typeof body.page === 'number' ? body.page : 0;
  const pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;

  // TB-2 — pass through wire `sorts` (uniformity with makeSearchHandler /
  // major/search). Filters intentionally left unpassed here, same as
  // before this change — org/search never read `body.filters` and this
  // task's scope is sorts-only for this route (tb-2 brief §EXACT CHANGES 3).
  const result = orgStore().search(page, pageSize, undefined, readSorts(body));
  return searchEnvelope(result, body);
}
