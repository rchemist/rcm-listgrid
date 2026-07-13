// POST /api/org (create) + DELETE /api/org (bulk delete, body
// {ids, revisionEntityName?}) — rcm-backend-framework 0.1.0 collection
// endpoints (Decision #31 / D2: create = POST {url}; delete = DELETE {url}
// bulk, no per-row DELETE). TB-4 — consolidated from a hand-written
// POST-only route onto the generic factory (the hand-written POST was a
// plain `store.create(body)` passthrough, identical to
// makeCollectionHandlers' POST): org previously had NO collection DELETE at
// all, the exact defect this task fixes.
import { orgStore } from '../../../lib/mock-backend/collabo';
import { makeCollectionHandlers } from '../../../lib/mock-backend/crud-routes';

export const { POST, DELETE } = makeCollectionHandlers(orgStore);
