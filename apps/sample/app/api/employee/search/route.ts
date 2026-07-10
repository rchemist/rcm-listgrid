// POST /api/employee/search — rcm-backend-framework 0.1.0 search endpoint
// (Decision #31: POST {url}/search, RequestBody = SearchRequest/SearchForm).
import { NextRequest } from 'next/server';
import { employeeStore } from '../../../../lib/mock-backend/employee';
import { searchEnvelope } from '../../../../lib/mock-backend/envelope';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const page = typeof body.page === 'number' ? body.page : 0;
  const pageSize = typeof body.pageSize === 'number' ? body.pageSize : 20;

  const result = employeeStore().search(page, pageSize);
  return searchEnvelope(result, body);
}
