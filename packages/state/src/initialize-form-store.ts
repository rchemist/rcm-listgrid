import type { StoreApi } from 'zustand/vanilla';
import type { BackendAdapter, BackendError, EntityForm, Session } from '@listgrid/schema-core';
import {
  createFormStore,
  resolveFetchedValue,
  type CreateFormStoreOptions,
  type FormStoreState,
} from './form-store';

// initializeFormStore (EF3, reordered EF7) — the async pipe that reassembles
// the 0.3.x EntityForm.initialize() (src/listgrid/config/EntityForm.tsx:
// 162-306) on top of the new engine's primitives, in this order:
//
//   clone -> fetch (unless initialData given) -> BIND -> onFetchData*
//   -> onInitialize* -> REBIND -> createFormStore (build)
//
// EF7 fix: an earlier version of this pipe ran hooks -> build -> hydrate,
// which made hydrate() the LAST write and let it silently clobber any value
// an onFetchData/onInitialize handler had just set via EntityForm.setValue —
// backwards from 0.3.x, where setFetchedValues (the BIND step here) ran
// BEFORE onInitialize specifically so a handler's override could WIN
// (EntityForm.tsx:181,257). This version restores that: BIND applies the
// fetched record onto the EntityForm clone's fields first (same per-field
// logic createFormStore's slice-building reads verbatim — see seedSlice,
// form-store.ts), THEN onFetchData/onInitialize run and may call
// ef.setValue/ef.setFetchedValue to override what BIND just wrote, THEN
// REBIND fills in any field a hook ADDED after BIND already ran (0.3.x
// EntityForm.tsx:268-302 late-added-field parity) — without clobbering a
// hook-set current on a field BIND already touched. createFormStore is
// called LAST and reads each field's already-final value; no separate
// hydrate() call is made in this path (precedence: hook setValue > fetched
// record > declared default).

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
  /** set only on a fetch failure (0.3.x EntityForm.tsx:198-203 parity) — BIND/hooks/
   *  REBIND were all skipped, but `store` is still a valid, usable (empty/default) store. */
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

// BIND — apply `data` onto every field of `ef` BEFORE any hook runs (0.3.x
// EntityForm.tsx:181 setFetchedValues parity). UNCONDITIONALLY overwrites
// each field's current+fetched with the record's value for its name
// (undefined where the record lacks it — this is deliberate: it is what
// makes the update-mode contract "a declared default does not apply to a
// field absent from the record" hold, same as form-store.ts hydrate(),
// whose per-field logic this mirrors exactly). Mutates `ef`'s field
// instances in place (safe — `ef` is always the pipe's clone(true), never
// the caller's declared form).
function bindFetchedData(ef: EntityForm, data: Record<string, unknown>): void {
  for (const field of ef.getFields()) {
    const value = resolveFetchedValue(data, field.getName());
    field.value = { ...field.value, fetched: value, current: value };
  }
}

// REBIND — fill in a field a hook (onFetchData/onInitialize) ADDED after
// BIND already ran; BIND never saw it, so its `fetched` is still absent
// (0.3.x EntityForm.tsx:268-302 late-added-field parity — the exact same
// `field.value?.fetched !== undefined` skip-guard). Only fields BIND missed
// are touched: any field BIND already bound has `fetched` set (even to
// `undefined`, for a record-absent field — an own key, still reads as
// `undefined` here, and the second condition below then finds nothing to
// rebind for it either, so it is never re-touched), so a hook's setValue on
// a pre-existing field is never clobbered by this step.
function rebindLateAddedFields(ef: EntityForm, data: Record<string, unknown>): void {
  for (const field of ef.getFields()) {
    if (field.value?.fetched !== undefined) continue;
    const value = resolveFetchedValue(data, field.getName());
    if (value === undefined) continue;
    field.value = { ...field.value, fetched: value, current: value };
  }
}

export async function initializeFormStore(
  options: InitializeFormStoreOptions,
): Promise<InitializeFormStoreResult> {
  const { adapter, id, session, initialData, validateOnChange } = options;

  // a. never mutate the declared form. clone(true) carries declared
  // default/current values into the pipe (0.3.x parity — the old
  // initialize() did `this.clone(true)`, src/listgrid/config/EntityForm.tsx:163);
  // clone()'s default includeValue=false would drop withDefaultValue/withValue
  // before createFormStore ever seeds a slice from them.
  let ef = options.entityForm.clone(true);
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
      // c. fetch error: skip bind/hooks entirely, return a usable-but-empty store.
      return { store: createFormStore(ef, storeOpts), entityForm: ef, error: toBackendError(e) };
    }
  }

  // d. BIND — see bindFetchedData doc above. Runs BEFORE onFetchData/
  // onInitialize so a handler's ef.setValue/ef.setFetchedValue can override
  // what BIND just wrote (the EF7 fix — 0.3.x ran onInitialize AFTER
  // setFetchedValues for exactly this reason).
  if (data) {
    bindFetchedData(ef, data);
  }

  // e. onFetchData — sequential, only when there is fetched/provided data. a
  // throwing handler is logged and skipped, remaining handlers still run
  // (0.3.x per-handler isolation parity — EntityForm.tsx:591-600), same as
  // the onInitialize loop below.
  if (data) {
    for (const handler of ef.getOnFetchData()) {
      try {
        ef = await handler(ef, data);
      } catch (e) {
        console.error('[@listgrid/state] onFetchData handler threw — skipping it', e);
      }
    }
  }

  // f. onInitialize — sequential, always (create mode too); a throwing handler
  // is logged and skipped, remaining handlers still run (0.3.x EntityForm.tsx:259-264).
  for (const handler of ef.getOnInitialize()) {
    try {
      ef = await handler(ef, session);
    } catch (e) {
      console.error('[@listgrid/state] onInitialize handler threw — skipping it', e);
    }
  }

  // g. REBIND — see rebindLateAddedFields doc above. Runs AFTER both hook
  // passes so it only ever fills a gap a hook's addFields left, never a
  // value a hook explicitly set.
  if (data) {
    rebindLateAddedFields(ef, data);
  }

  // h. build LAST — every field's value.current is already final (hook
  // override > fetched record > declared default); seedSlice
  // (form-store.ts) reads it as-is, no separate hydrate() call needed here.
  // Retain `data` on the store (EF4) so a field registered at RUNTIME (e.g.
  // from an onChanges handler, after this pipe returns) can still rebind
  // from the same record.
  if (data !== undefined) storeOpts.fetchedData = data;
  const store = createFormStore(ef, storeOpts);

  return { store, entityForm: ef };
}
