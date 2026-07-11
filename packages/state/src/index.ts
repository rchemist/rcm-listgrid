// @listgrid/state — createFormStore/createListStore (zustand vanilla,
// framework-agnostic). ADR-0002 value-slice form store + charter-C9 list store.

export { createFormStore } from './form-store';
export type { FormStoreState, CreateFormStoreOptions, FormMessage } from './form-store';

export { createListStore } from './list-store';
export type { ListStoreState, CreateListStoreOptions } from './list-store';

// --- initializeFormStore pipe (EF3: fetch -> onFetchData -> onInitialize ->
// build -> hydrate) ---
export { initializeFormStore } from './initialize-form-store';
export type {
  InitializeFormStoreOptions,
  InitializeFormStoreResult,
} from './initialize-form-store';

// --- createFormController (spec §6.2; W2-5) — the FormRuntime
// (@listgrid/schema-core) implementation: canonical save/delete lifecycle
// over a form store + BackendAdapter ---
export { createFormController } from './form-controller';
export type { CreateFormControllerOptions } from './form-controller';
