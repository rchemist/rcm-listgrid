// POST /api/student (create) + DELETE /api/student (bulk delete, body
// {ids}) — rcm-backend-framework 0.1.0 collection endpoints (Decision #31 /
// D2: create = POST {url}; delete = DELETE {url} bulk, no per-row DELETE).
import { studentStore } from '../../../lib/mock-backend/academic';
import { makeCollectionHandlers } from '../../../lib/mock-backend/crud-routes';

export const { POST, DELETE } = makeCollectionHandlers(studentStore);
