import type { StoreApi } from 'zustand/vanilla';
import type { BackendAdapter, BackendError, EntityForm, Session } from '@listgrid/schema-core';
import { createFormStore, type CreateFormStoreOptions, type FormStoreState } from './form-store';

// initializeFormStore (EF3) — the async pipe that reassembles the 0.3.x
// EntityForm.initialize() (src/listgrid/config/EntityForm.tsx:162-306) on top
// of the new engine's primitives. Does NOT re-implement createFormStore or
// hydrate — it calls them, in this order:
//
//   clone -> fetch (unless initialData given) -> onFetchData* -> onInitialize*
//   -> createFormStore (build) -> hydrate
//
// Building the store AFTER the hooks run (unlike 0.3.x, which bound fetched
// values to fields BEFORE onInitialize and needed a second late-added-field
// rebinding pass at EntityForm.tsx:268-302) makes any field an onInitialize
// handler adds first-class from the start: createFormStore seeds a slice for
// it, and the subsequent hydrate() call fills its fetched value like any
// other field — the old rebinding pass falls out structurally.

export interface InitializeFormStoreOptions {
  /** the declared form; never mutated — a clone is initialized (see EntityForm.clone). */
  entityForm: EntityForm;
  /** required to fetch by id; omit for a create-mode form or when initialData is supplied. */
  adapter?: BackendAdapter;
  /** existing-record id — triggers a fetch (via adapter) unless initialData is given. */
  id?: string;
  session?: Session;
  /** bypasses the adapter fetch — e.g. data already loaded by the host (0.3.x dataPreloaded). */
  initialData?: Record<string, unknown>;
  /** EF5 — passthrough to createFormStore's opt-in validate-on-change (default OFF). */
  validateOnChange?: CreateFormStoreOptions['validateOnChange'];
}

export interface InitializeFormStoreResult {
  store: StoreApi<FormStoreState>;
  /** the initialized EntityForm (post onFetchData/onInitialize) — may carry fields the
   *  declared entityForm did not have; use this, not the input entityForm, to render. */
  entityForm: EntityForm;
  /** set only on a fetch failure (0.3.x EntityForm.tsx:198-203 parity) — hooks/hydrate
   *  were skipped, but `store` is still a valid, usable (empty/default) store. */
  error?: BackendError;
}

function toBackendError(e: unknown): BackendError {
  if (
    e !== null &&
    typeof e === 'object' &&
    'code' in e &&
    'message' in e &&
    typeof (e as { message: unknown }).message === 'string'
  ) {
    return e as BackendError;
  }
  return { code: 'UNKNOWN', message: e instanceof Error ? e.message : String(e) };
}

export async function initializeFormStore(
  options: InitializeFormStoreOptions,
): Promise<InitializeFormStoreResult> {
  const { adapter, id, session, initialData, validateOnChange } = options;

  // a. never mutate the declared form.
  let ef = options.entityForm.clone();
  if (id != null) ef = ef.withId(id);

  const storeOpts: CreateFormStoreOptions = {};
  if (session !== undefined) storeOpts.session = session;
  if (validateOnChange !== undefined) storeOpts.validateOnChange = validateOnChange;

  // b. resolve the fetched data (initialData bypasses the adapter entirely).
  let data: Record<string, unknown> | undefined = initialData;
  if (data === undefined && id != null && adapter) {
    try {
      data = (await adapter.getOne(ef.getUrl(), id)) as Record<string, unknown>;
    } catch (e) {
      // c. fetch error: skip hooks and hydrate, return a usable-but-empty store.
      return { store: createFormStore(ef, storeOpts), entityForm: ef, error: toBackendError(e) };
    }
  }

  // d. onFetchData — sequential, only when there is fetched/provided data.
  if (data) {
    for (const handler of ef.getOnFetchData()) {
      ef = await handler(ef, data);
    }
  }

  // e. onInitialize — sequential, always (create mode too); a throwing handler
  // is logged and skipped, remaining handlers still run (0.3.x EntityForm.tsx:259-264).
  for (const handler of ef.getOnInitialize()) {
    try {
      ef = await handler(ef, session);
    } catch (e) {
      console.error('[@listgrid/state] onInitialize handler threw — skipping it', e);
    }
  }

  // f. build AFTER hooks, so fields onInitialize added are first-class slices.
  const store = createFormStore(ef, storeOpts);

  // g. seed fetched values (flat + dotted names — see form-store.ts hydrate).
  if (data) {
    store.getState().hydrate(data);
  }

  return { store, entityForm: ef };
}
