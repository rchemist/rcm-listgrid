import type { StoreApi } from 'zustand/vanilla';
import type {
  BackendAdapter,
  BackendError,
  EntityForm,
  FieldMetaOverride,
  FieldValue,
  InitContext,
  RenderType,
  Session,
} from '@listgrid/schema-core';
import {
  createFormStore,
  resolveFetchedValue,
  type CreateFormStoreOptions,
  type FormStoreState,
} from './form-store';

// initializeFormStore (EF3, reordered EF7, W2-1 onInit consolidation) — the
// async pipe that reassembles the 0.3.x EntityForm.initialize() (src/listgrid/
// config/EntityForm.tsx:162-306) on top of the new engine's primitives, in
// this order:
//
//   clone -> fetch (unless initialData given) -> BIND -> onInit*
//   -> REBIND -> createFormStore (build, incl. initialMeta seed)
//
// W2-1: the former separate onFetchData (once, if data present) / onInitialize
// (always) passes are consolidated into ONE onInit pass, dispatched ALWAYS —
// a handler branches on InitContext.data's presence itself (spec §4.2)
// instead of the engine dispatching two loops. The SAME InitContext instance
// (closed over the SAME `ef`) is shared across every handler in a run —
// handlers mutate ctx.form/values/setMeta IN PLACE; there is no more
// "handler returns a replacement EntityForm" escape hatch (spec §9 migration
// table).
//
// EF7 fix (preserved by the W2-1 reorder): an earlier version of this pipe
// ran hooks -> build -> hydrate, which made hydrate() the LAST write and let
// it silently clobber any value an onFetchData/onInitialize handler had just
// set via EntityForm.setValue — backwards from 0.3.x, where setFetchedValues
// (the BIND step here) ran BEFORE onInitialize specifically so a handler's
// override could WIN (EntityForm.tsx:181,257). This version restores that:
// BIND applies the fetched record onto the EntityForm clone's fields first
// (same per-field logic createFormStore's slice-building reads verbatim —
// see seedSlice, form-store.ts), THEN onInit handlers run and may call
// ctx.values.set/ctx.values.setFetched to override what BIND just wrote,
// THEN REBIND fills in any field a hook ADDED after BIND already ran (0.3.x
// EntityForm.tsx:268-302 late-added-field parity) — without clobbering a
// hook-set current on a field BIND already touched. createFormStore is
// called LAST and reads each field's already-final value; no separate
// hydrate() call is made in this path (precedence: hook values.set > fetched
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
  /** the initialized EntityForm (post onInit) — may carry fields the
   *  declared entityForm did not have; use this, not the input entityForm, to render. */
  entityForm: EntityForm;
  /** set only on a fetch failure (0.3.x EntityForm.tsx:198-203 parity) — BIND/hooks/
   *  REBIND were all skipped, but `store` is still a valid, usable (empty/default) store. */
  error?: BackendError;
}

// exported (W2-5) — createFormController (form-controller.ts) reuses this
// exact mapping for its adapter create/update/remove try/catch (spec §6.2:
// "map to a BackendError — there is an existing toBackendError helper... reuse
// it"), keeping error normalization identical whether the fetch/save/delete
// call site is initializeFormStore's or the controller's.
export function toBackendError(e: unknown): BackendError {
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

// REBIND — fill in a field a hook (onInit) ADDED after BIND already ran;
// BIND never saw it, so its `fetched` is still absent (0.3.x
// EntityForm.tsx:268-302 late-added-field parity — the exact same
// `field.value?.fetched !== undefined` skip-guard). Only fields BIND missed
// are touched: any field BIND already bound has `fetched` set (even to
// `undefined`, for a record-absent field — an own key, still reads as
// `undefined` here, and the second condition below then finds nothing to
// rebind for it either, so it is never re-touched), so a hook's values.set
// on a pre-existing field is never clobbered by this step.
function rebindLateAddedFields(ef: EntityForm, data: Record<string, unknown>): void {
  for (const field of ef.getFields()) {
    if (field.value?.fetched !== undefined) continue;
    const value = resolveFetchedValue(data, field.getName());
    if (value === undefined) continue;
    field.value = { ...field.value, fetched: value, current: value };
  }
}

// buildInitContext — composes the InitContext (spec §4.1) shared across every
// onInit handler in a single initializeFormStore run. `values.get/set/
// setFetched` operate directly on `ef`'s field instances (same direct
// field.value manipulation BIND/REBIND above already use — no schema-core
// helper needed, keeping this pipe-internal per ADR-0003: EntityForm itself
// stays a pure declaration, the mutation-on-behalf-of-a-hook logic lives in
// the engine that dispatches the hook). `setMeta` accumulates into
// `initialMeta` (mutated in place by reference) — the caller passes that same
// object to createFormStore's new `initialMeta` option once every handler has
// run (spec §4.1: "ctx.setMeta accumulates into the store's initial meta
// seed").
function buildInitContext(
  ef: EntityForm,
  data: Record<string, unknown> | undefined,
  session: Session | undefined,
  initialMeta: Record<string, FieldMetaOverride>,
): InitContext {
  // renderType is id-based (spec §3.1 — 'update' iff id set), NOT data-based:
  // `data` may be present on a CREATE form via initialData (prefill/template),
  // and ctx.data is the independent "data provided" branch signal (spec §4.2).
  // Keeping this id-based also matches the future mutator.getRenderType() (W2-2)
  // so onInit and onChange handlers observe the same renderType.
  const renderType: RenderType = ef.getRenderType();
  const ctx: InitContext = {
    form: ef,
    values: {
      get(name) {
        return ef.getField(name)?.value?.current;
      },
      set(name, value) {
        const field = ef.getField(name);
        if (field) field.value = { ...field.value, current: value };
      },
      setFetched(name, value) {
        const field = ef.getField(name);
        if (field) {
          const next: FieldValue<unknown> = { ...field.value, fetched: value };
          if (field.value?.current === undefined) {
            next.current = value;
          }
          field.value = next;
        }
      },
    },
    setMeta(name, patch) {
      initialMeta[name] = { ...(initialMeta[name] ?? {}), ...patch };
    },
    renderType,
  };
  if (data !== undefined) ctx.data = data;
  if (session !== undefined) ctx.session = session;
  return ctx;
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
      data = (await adapter.getOne(ef.url, id)) as Record<string, unknown>;
    } catch (e) {
      // c. fetch error: skip bind/hooks entirely, return a usable-but-empty store.
      return { store: createFormStore(ef, storeOpts), entityForm: ef, error: toBackendError(e) };
    }
  }

  // d. BIND — see bindFetchedData doc above. Runs BEFORE onInit so a
  // handler's ctx.values.set/ctx.values.setFetched can override what BIND
  // just wrote (the EF7 fix — 0.3.x ran onInitialize AFTER setFetchedValues
  // for exactly this reason).
  if (data) {
    bindFetchedData(ef, data);
  }

  // e. onInit — sequential, ALWAYS (create mode too — 0.3.x onInitialize
  // parity; W2-1 consolidation of the former onFetchData-only-with-data +
  // onInitialize-always passes into one, spec §4.2). A throwing handler is
  // logged and skipped, remaining handlers still run (0.3.x EntityForm.tsx:
  // 259-264 parity). One InitContext, built once, is shared across every
  // handler — `ctx.setMeta` accumulates into `initialMeta`, which seeds the
  // store's initial meta override below (spec §4.1).
  const initialMeta: Record<string, FieldMetaOverride> = {};
  const ctx = buildInitContext(ef, data, session, initialMeta);
  for (const handler of ef.getInitHandlers()) {
    try {
      await handler(ctx);
    } catch (e) {
      console.error('[@listgrid/state] onInit handler threw — skipping it', e);
    }
  }

  // f. REBIND — see rebindLateAddedFields doc above. Runs AFTER onInit so it
  // only ever fills a gap a hook's addFields left, never a value a hook
  // explicitly set.
  if (data) {
    rebindLateAddedFields(ef, data);
  }

  // g. build LAST — every field's value.current is already final (hook
  // override > fetched record > declared default); seedSlice
  // (form-store.ts) reads it as-is, no separate hydrate() call needed here.
  // Retain `data` on the store (EF4) so a field registered at RUNTIME (e.g.
  // from an onChanges handler, after this pipe returns) can still rebind
  // from the same record. `initialMeta` seeds the store's meta slice from
  // every onInit handler's accumulated setMeta calls (spec §4.1).
  if (data !== undefined) storeOpts.fetchedData = data;
  storeOpts.initialMeta = initialMeta;
  const store = createFormStore(ef, storeOpts);

  return { store, entityForm: ef };
}
