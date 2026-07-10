// @listgrid/backend-rcm — BackendAdapter impl for rcm-framework 0.1.0 (first-class default)
//
// Transplants the verified wire behavior from src/listgrid/form/Type.ts +
// EntityForm.tsx (fetchData/internalSave/deleteAll) behind the schema-core
// BackendAdapter contract (ADR-0005).
export { createRcmAdapter } from './adapter';
export type { RcmAdapterOptions } from './adapter';
