// `steps-demo` entity fixture — W4-2 E2E-only (see lib/entities/steps-demo.ts
// header). No seed rows — the E2E only ever creates one via the wizard and
// never lists/fetches it back, so an empty starting store is enough.

import { getOrCreateStore } from './store';

export interface StepsDemoRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: unknown;
}

export function stepsDemoStore() {
  return getOrCreateStore<StepsDemoRecord>('steps-demo', []);
}
