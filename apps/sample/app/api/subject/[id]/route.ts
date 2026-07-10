// GET/PUT /api/subject/{id} — RCM 0.1.0 single-entity endpoints.
import { subjectStore } from '../../../../lib/mock-backend/academic';
import { makeItemHandlers } from '../../../../lib/mock-backend/crud-routes';

export const { GET, PUT } = makeItemHandlers(subjectStore, 'subject');
