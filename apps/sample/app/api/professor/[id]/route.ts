// GET/PUT /api/professor/{id} — rcm-backend-framework 0.1.0 single-entity
// endpoints. Bulk DELETE lives on the collection route (../route.ts) per
// the D2 wire contract — there is no per-row DELETE.
import { professorStore } from '../../../../lib/mock-backend/academic';
import { makeItemHandlers } from '../../../../lib/mock-backend/crud-routes';

export const { GET, PUT } = makeItemHandlers(professorStore, 'professor');
