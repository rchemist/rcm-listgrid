import type { BackendError } from './backend/adapter';

// FormRuntime (spec §6.2; W2-5) — the STRUCTURAL save/delete/reload/validate
// contract a form screen drives. Declared here (schema-core), NOT
// @listgrid/state, for the same dependency-inversion reason FormMutator is
// (field/form-mutator.ts): the concrete implementation needs the form store
// (zustand) + a BackendAdapter, both @listgrid/state concerns, so putting the
// interface in schema-core lets a consumer (eventually @listgrid/react's
// ViewEntityForm, W3/W7) depend on the shape without schema-core ever
// importing @listgrid/state (ADR-0003 purity — the layer rule this file must
// not violate). `createFormController` (@listgrid/state/form-controller.ts)
// is the sole implementation; it imports this TYPE only (structural
// conformance — the same pattern FormMutator/createFormStore's mutator
// already uses).
//
// This file is a PURE TYPE/INTERFACE MODULE — no runtime logic lives here.
// The save/delete ORDER (validate -> toSaveData -> onBeforeSave -> adapter ->
// error-mapping/success -> onAfterSave, spec §6.2) is the implementation's
// concern (form-controller.ts); this module only fixes the shape every
// implementation (and every consumer) programs against.

export interface FormRuntime {
  /**
   * Runs the canonical save flow (spec §6.2): validate (unless
   * `opts.skipValidation`) -> `toSaveData()` -> onBeforeSave handlers
   * (sequential; a handler may transform the payload via `ctx.setData` or
   * stop the flow via `ctx.cancel`) -> the adapter's create/update call
   * (branching on `entityForm.getRenderType()`) -> on failure, map the
   * `BackendError` onto field-slice errors (keyed by field NAME) / the
   * banner channel; on success, clear non-persistent messages and run
   * onAfterSave handlers. See `SaveOutcome` for the 3 ways this resolves.
   */
  save(opts?: { skipValidation?: boolean }): Promise<SaveOutcome>;
  /**
   * Runs the canonical delete flow (spec §6.2): `opts.ids` (default: the
   * current record's id, `[entityForm.getId()]`) -> onBeforeDelete handlers
   * (same cancel/throw contract as onBeforeSave) -> `adapter.remove` -> on
   * failure, a banner message + `{ ok: false, error }`; on success,
   * onAfterDelete handlers -> `{ ok: true, result: undefined }`.
   */
  delete(opts?: { ids?: string[] }): Promise<DeleteOutcome>;
  /**
   * Re-fetches the current record, re-runs BIND -> onInit, and reflects the
   * result into the SAME store instance the caller already holds (subscribers
   * are not torn down/remounted). A no-op in create mode (`entityForm.
   * getId()` undefined — nothing to re-fetch).
   */
  reload(): Promise<void>;
  /** Runs full-form validation; equivalent to `store.getState().validateAll()`. */
  validate(): Promise<boolean>;
}

/**
 * The result of {@link FormRuntime.save} (spec §6.2). Exactly one of three
 * shapes:
 *   - `{ ok: true, result }` — the adapter's create/update call succeeded;
 *     `result` is the entity it returned.
 *   - `{ ok: false }` — validation failed (field-slice errors are already
 *     populated by `validateAll()`; there is nothing else to inspect here).
 *   - `{ ok: false, cancelled }` — an onBeforeSave handler called
 *     `ctx.cancel(reason?)`; `cancelled` carries that reason, if given.
 *   - `{ ok: false, error }` — the adapter call threw; `error` is the mapped
 *     `BackendError` (also already applied to field-slice errors / the
 *     banner channel by the time this resolves).
 */
export type SaveOutcome =
  | { ok: true; result: unknown }
  | { ok: false; cancelled?: string; error?: BackendError };

/** Same shape as {@link SaveOutcome} (spec §6.2) — delete has no success payload, so `result` is `undefined` on `ok: true`. */
export type DeleteOutcome = SaveOutcome;
