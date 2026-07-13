import { type EntityFormProofRow } from '../entities/entityform-proof';
import { getOrCreateStore } from './store';

export const entityFormProofSeed: EntityFormProofRow[] = [
  { id: '1', name: 'Proof One', status: 'ACTIVE', category: 'A', note: 'seed' },
];

export function entityFormProofStore() {
  return getOrCreateStore<EntityFormProofRow>('entityform-proof', entityFormProofSeed);
}
