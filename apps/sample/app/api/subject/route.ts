// POST /api/subject (create) + DELETE /api/subject (bulk) — RCM 0.1.0.
import { subjectStore } from '../../../lib/mock-backend/academic';
import { makeCollectionHandlers } from '../../../lib/mock-backend/crud-routes';

export const { POST, DELETE } = makeCollectionHandlers(subjectStore);
