// POST /api/collabo (create) + DELETE /api/collabo (bulk delete, body
// {ids, revisionEntityName?}) — rcm-backend-framework 0.1.0 collection
// endpoints (Decision #31 / D2: create = POST {url}; delete = DELETE {url}
// bulk, no per-row DELETE). TB-4 — consolidated from a hand-written
// POST-only route onto the generic factory (the hand-written POST was a
// plain `store.create(body)` passthrough, identical to
// makeCollectionHandlers' POST): collabo previously had NO collection
// DELETE at all, the exact defect this task fixes. (The Collabo entity's UI
// capability config still has `.withCapabilities({ delete: false })` —
// lib/entities/collabo.ts:197, GJCU parity — so this route wiring is
// backend-uniformity only; it doesn't itself expose a delete affordance in
// the UI, and changing that capability is out of this task's scope.)
import { collaboStore } from '../../../lib/mock-backend/collabo';
import { makeCollectionHandlers } from '../../../lib/mock-backend/crud-routes';

export const { POST, DELETE } = makeCollectionHandlers(collaboStore);
