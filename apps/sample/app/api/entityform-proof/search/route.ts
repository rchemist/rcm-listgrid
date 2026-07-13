import { entityFormProofStore } from '../../../../lib/mock-backend/entityform-proof';
import { makeSearchHandler } from '../../../../lib/mock-backend/crud-routes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = makeSearchHandler(entityFormProofStore);
