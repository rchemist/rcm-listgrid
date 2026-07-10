// POST /api/professor/search — rcm-backend-framework 0.1.0 search endpoint
// (Decision #31: POST {url}/search, RequestBody = SearchRequest/SearchForm).
import { professorStore } from '../../../../lib/mock-backend/academic';
import { makeSearchHandler } from '../../../../lib/mock-backend/crud-routes';

export const POST = makeSearchHandler(professorStore);
