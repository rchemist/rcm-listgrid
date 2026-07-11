// POST /api/staff/search — rcm-backend-framework 0.1.0 search endpoint
// (Decision #31: POST {url}/search, RequestBody = SearchRequest/SearchForm).
// EC3 — switched from the hand-rolled filter-ignoring handler (EC2 vintage)
// to the shared makeSearchHandler: Major's `staffs` XrefMappingField needs
// its async `filters: () => [{name:'assistant', ...}]` domain filter AND the
// renderer's IN/NOT_IN(mapped ids) queries to actually narrow rows (see
// mock-backend/store.ts matchesFilterGroup doc — Collabo's own staff M2O
// picker carries no filter, so this is behavior-additive for it, not a
// change).
import { staffStore } from '../../../../lib/mock-backend/collabo';
import { makeSearchHandler } from '../../../../lib/mock-backend/crud-routes';

export const POST = makeSearchHandler(staffStore);
