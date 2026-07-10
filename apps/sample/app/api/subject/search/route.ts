// POST /api/subject/search — RCM 0.1.0 search endpoint.
import { subjectStore } from '../../../../lib/mock-backend/academic';
import { makeSearchHandler } from '../../../../lib/mock-backend/crud-routes';

export const POST = makeSearchHandler(subjectStore);
