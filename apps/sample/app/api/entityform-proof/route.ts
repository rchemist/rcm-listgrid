import { entityFormProofStore } from '../../../lib/mock-backend/entityform-proof';
import { makeCollectionHandlers } from '../../../lib/mock-backend/crud-routes';
import { validationFailed } from '../../../lib/mock-backend/envelope';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { POST, DELETE } = makeCollectionHandlers(entityFormProofStore, {
  validateCreate(body) {
    if (body.name !== 'VALIDATION_PROOF') return undefined;
    return validationFailed(
      { name: ['too short', 'reserved'] },
      'Validation proof failed',
      'VALIDATION.FAILED',
      ['date range is invalid', 'form combination is not allowed'],
    );
  },
});
