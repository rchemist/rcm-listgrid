// POST /api/employee (create) + DELETE /api/employee (bulk delete, body
// {ids, revisionEntityName?}) — rcm-backend-framework 0.1.0 collection
// endpoints (Decision #31 / D2: create = POST {url}; delete = DELETE {url}
// bulk, no per-row DELETE). TB-4 — consolidated from a hand-written
// POST-only route onto the generic factory (the hand-written POST was a
// plain `store.create(body)` passthrough, identical to
// makeCollectionHandlers' POST): employee previously had NO collection
// DELETE at all, the exact defect this task fixes. Same pattern as
// college/route.ts.
import { employeeStore } from '../../../lib/mock-backend/employee';
import { makeCollectionHandlers } from '../../../lib/mock-backend/crud-routes';

export const { POST, DELETE } = makeCollectionHandlers(employeeStore);
