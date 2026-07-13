import { entityFormProofStore } from '../../../../lib/mock-backend/entityform-proof';
import { makeItemHandlers } from '../../../../lib/mock-backend/crud-routes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, PUT } = makeItemHandlers(entityFormProofStore, 'entityform-proof');
