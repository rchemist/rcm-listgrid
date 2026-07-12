// POST /api/collabo/search — rcm-backend-framework 0.1.0 search endpoint
// (Decision #31: POST {url}/search, RequestBody = SearchRequest/SearchForm).
// GX-2 (g) — migrated from a hand-rolled handler that ignored `filters`
// entirely to the shared makeSearchHandler (same pattern every other entity
// uses, see crud-routes.ts), so `body.filters` is actually applied.
import { collaboStore } from '../../../../lib/mock-backend/collabo';
import { makeSearchHandler } from '../../../../lib/mock-backend/crud-routes';

export const POST = makeSearchHandler(collaboStore);
