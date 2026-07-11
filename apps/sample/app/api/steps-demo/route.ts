// POST /api/steps-demo (create) — rcm-backend-framework 0.1.0 collection
// endpoint (Decision #31 / D2: create = POST {url}). W4-2 E2E-only fixture
// (lib/entities/steps-demo.ts header) — no search/[id] routes: the E2E only
// ever creates via the wizard and never lists/fetches back.
import { stepsDemoStore } from '../../../lib/mock-backend/steps-demo';
import { makeCollectionHandlers } from '../../../lib/mock-backend/crud-routes';

export const { POST, DELETE } = makeCollectionHandlers(stepsDemoStore);
