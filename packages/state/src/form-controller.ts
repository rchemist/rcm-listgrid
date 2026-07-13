import type { StoreApi } from 'zustand/vanilla';
import {
  getConditionalBoolean,
  getCurrentValue,
  type AfterDeleteContext,
  type AfterSaveContext,
  type BackendAdapter,
  type BackendError,
  type BeforeDeleteContext,
  type BeforeSaveContext,
  type ConditionalBooleanValue,
  type DeleteOutcome,
  type EntityForm,
  type FieldEvalContext,
  type FormMutator,
  type FormRuntime,
  type RenderType,
  type SaveOutcome,
  type Session,
} from '@listgrid/schema-core';
import {
  initializeFormStore,
  toBackendError,
  type InitializeFormStoreOptions,
} from './initialize-form-store';
import type { FormStoreState } from './form-store';

// createFormController (spec §6.2; W2-5) — the sole IMPLEMENTATION of
// FormRuntime (@listgrid/schema-core/form-runtime.ts). Lives in @listgrid/
// state (not schema-core) because the save/delete flow needs the form store
// (validateAll/toSaveData/messages/field-slice errors) + a BackendAdapter,
// both state-layer concerns — schema-core stays a pure declaration
// (ADR-0003), importing FormRuntime as a TYPE only, never this module.
//
// Save flow order (spec §6.2 EXACTLY, revision step now wired — W4-4):
//   1. capability create|update gate (spec §3.4/§6.2, CAP-06; W3-2) — denied
//      => { ok: false, reason: 'capability' }, silent (no adapter call/message)
//   2. set saving=true, capture an immutable value/payload snapshot, then
//      validateAll() (unless opts.skipValidation) — fail =>
//      { ok: false, reason: 'validation' }.
//      Runs the SYNC ValidationItem channel AND the W4-3a async save-gate
//      (spec §5.3/§6.2): a field declaring an AsyncValidation whose value is
//      DIRTY but whose asyncState !== 'valid' ('unchecked'/'checking'/
//      'invalid') is invalid, so an unconfirmed/failed 중복확인 blocks save.
//      No network here — validateAll reads the stored tri-state (the check
//      runs only via store.runAsyncValidation). An untouched update-form
//      field (not dirty) is exempt — its persisted value is already confirmed.
//      A headless write that changes the snapshot during validation is also
//      rejected instead of sending unvalidated data.
//   3. use the captured toSaveData() payload
//   4. onBeforeSave handlers, sequential; setData threads the payload;
//      cancel() stops the flow; a THROWING handler is logged + SKIPPED
//      (spec §4.2 — does not propagate, does not cancel)
//   5. revision inject (spec §3.1/§6.2, CAP-07; W4-4) — ONLY when
//      entityForm.getRevisionEntityName() is not undefined (i.e.
//      withRevision was declared); writes data['revisionEntityName'] (0.3.x
//      key/value port, EntityForm.tsx:468-470/879) — no always-truthy
//      fallback (schema-core's getRevisionEntityName() already reports
//      honest undefined, entity-form.ts).
//   6. adapter.update (renderType 'update') | adapter.create (else)
//   7. failure => map BackendError.fieldErrors onto field slices (keyed by
//      NAME), and BackendError.globalErrors plus unmatched field keys onto
//      the plural form-wide validation channel. Specific errors suppress the
//      generic error.message; non-validation failures use messages — return
//      { ok: false, reason: 'error', error }. (onBeforeSave cancel =>
//      { ok: false, reason: 'cancelled', cancelled? } — step 4.)
//   8. success => clearMessages()/clearGlobalErrors() -> onAfterSave handlers,
//      sequential, same per-handler try/catch -> { ok: true, result }.
//      Every exit path settles through finally and restores saving=false;
//      overlapping save() calls share the same in-flight promise.
//
// Delete flow order (spec §6.2):
//   1. capability delete gate (spec §3.4/§6.2, CAP-06; W3-2) — denied
//      => { ok: false, reason: 'capability' }, silent (no adapter call/message)
//   2. ids = opts.ids ?? [entityForm.getId()]
//   3. onBeforeDelete handlers, sequential; same cancel/throw contract
//   4. adapter.remove(url, ids, revision?) — revision = entityForm.
//      getRevisionEntityName() (spec §3.1/§6.2, CAP-07; W4-4), passed
//      through as-is (undefined when withRevision was never declared — the
//      adapter's own optional 3rd param handles the "not set" case, no
//      conditional call-site branching needed). failure =>
//      addMessage({key:'delete-error', ...}), return
//      { ok: false, reason: 'error', error }
//   5. success => onAfterDelete handlers, sequential -> { ok: true, result: undefined }

export interface CreateFormControllerOptions {
  entityForm: EntityForm;
  store: StoreApi<FormStoreState>;
  adapter: BackendAdapter;
  session?: Session;
}

export function createFormController(opts: CreateFormControllerOptions): FormRuntime {
  const { entityForm, store, adapter } = opts;
  const session = opts.session;

  // Readonly<Record<string,unknown>> snapshot of every field's current
  // resolved value (spec §4.1 BeforeSaveContext.values) — built the same way
  // the store's own internal mutator.getValues() is (form-store.ts), since
  // that mutator is not itself externally reachable (W2-5 briefing deviation
  // — see this task's DEVIATIONS note).
  function snapshotValues(): Record<string, unknown> {
    const s = store.getState();
    const values: Record<string, unknown> = {};
    for (const [name, slice] of Object.entries(s.fields)) {
      values[name] = getCurrentValue(slice, s.renderType);
    }
    return values;
  }

  function sameValues(
    left: Readonly<Record<string, unknown>>,
    right: Readonly<Record<string, unknown>>,
  ): boolean {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(right, key) && Object.is(left[key], right[key]),
      )
    );
  }

  // Capability resolver (spec §3.4/§6.2, CAP-06; W3-2) — encapsulates the
  // default-true semantics: an undeclared (undefined) capability key is
  // allowed. getConditionalBoolean(undefined) itself resolves to `false`
  // (conditional.ts:58-60), so undefined MUST be special-cased here rather
  // than delegated straight through.
  async function capAllowed(
    cap: ConditionalBooleanValue | undefined,
    ctx: FieldEvalContext,
  ): Promise<boolean> {
    return cap === undefined ? true : getConditionalBoolean(ctx, cap);
  }
  function capCtx(renderType: RenderType): FieldEvalContext {
    const ctx: FieldEvalContext = { renderType, values: snapshotValues() };
    if (session !== undefined) ctx.session = session;
    return ctx;
  }

  // Store-backed FormMutator for AfterSaveContext.mutator (spec §4.1) — the
  // store's own internal mutator (form-store.ts) is a closure-private const,
  // not part of FormStoreState, so this rebuilds an equivalent adapter from
  // the store's PUBLIC actions only (no new store accessor needed).
  function buildMutator(): FormMutator {
    return {
      getValue(name) {
        return store.getState().getValue(name);
      },
      getValues() {
        return snapshotValues();
      },
      setValue(name, value) {
        store.getState().setValue(name, value);
      },
      setMeta(name, partial) {
        store.getState().setMeta(name, partial);
      },
      addField(field) {
        store.getState().addField(field);
      },
      removeField(name) {
        store.getState().removeField(name);
      },
      setTabHidden(tabId, hidden) {
        store.getState().setTabHidden(tabId, hidden);
      },
      getRenderType() {
        return entityForm.getRenderType();
      },
      getSession() {
        return session;
      },
    };
  }

  // Field and global validation errors are independent plural channels.
  // A backend may return both in the same response. The generic `message`
  // remains a fallback only, avoiding a duplicate "Validation failed"
  // banner when specific errors were supplied.
  function applySaveError(error: BackendError): void {
    const fieldErrors = error.fieldErrors;
    const globalErrors = [...(error.globalErrors ?? [])];
    let mappedFieldError = false;
    if (fieldErrors !== undefined && Object.keys(fieldErrors).length > 0) {
      const fieldDefs = store.getState().fieldDefs;
      for (const [name, messages] of Object.entries(fieldErrors)) {
        if (name in fieldDefs) {
          store.getState().setFieldErrors(name, messages);
          mappedFieldError = true;
        } else {
          globalErrors.push(...messages);
        }
      }
    }

    if (globalErrors.length > 0) {
      store.getState().setGlobalErrors(globalErrors);
    } else if (error.code === 'VALIDATION' && !mappedFieldError) {
      store.getState().setGlobalErrors([error.message]);
    } else if (!mappedFieldError) {
      store.getState().addMessage({ key: 'save-error', severity: 'error', text: error.message });
    }
  }

  // delete has no per-field error channel (bulk ids, not fields) — spec §6.2
  // delete step 4 is the plain banner-message form only, no fieldErrors
  // mapping/suppress-generic (that machinery is save-specific, step 7).
  function applyDeleteError(error: BackendError): void {
    store.getState().addMessage({ key: 'delete-error', severity: 'error', text: error.message });
  }

  let activeSave: Promise<SaveOutcome> | undefined;

  async function performSave(saveOpts?: { skipValidation?: boolean }): Promise<SaveOutcome> {
    const renderType = entityForm.getRenderType();

    // spec §6.2 step 1 (CAP-06; W3-2) — capability-denied is a SILENT block:
    // no adapter call, no message (the view already hides the affordance;
    // a headless caller receives { ok: false, reason: 'capability' }). D2
    // (#W3-2, 2026-07-12) gave SaveOutcome an explicit `reason` discriminant,
    // so this is now distinguishable from a validation failure / cancel by
    // shape (spec §6.2 SaveOutcome).
    const caps = entityForm.getCapabilities();
    const relevantCap = renderType === 'update' ? caps.update : caps.create;
    if (!(await capAllowed(relevantCap, capCtx(renderType))))
      return { ok: false, reason: 'capability' };

    store.getState().clearGlobalErrors();
    const validatedValues = snapshotValues();
    let data = store.getState().toSaveData();

    if (!saveOpts?.skipValidation) {
      const valid = await store.getState().validateAll();
      if (!valid) return { ok: false, reason: 'validation' };
      // The UI is locked while saving, but headless callers may still write
      // directly to the store. Never send a value different from the one the
      // validation run inspected.
      if (!sameValues(validatedValues, snapshotValues())) {
        store.getState().setGlobalErrors(['검증 중 입력값이 변경되었습니다. 다시 저장해 주세요.']);
        return { ok: false, reason: 'validation' };
      }
    }

    for (const handler of entityForm.getBeforeSaveHandlers()) {
      let cancelled: string | undefined;
      let didCancel = false;
      const ctx: BeforeSaveContext = {
        data,
        setData(next) {
          data = next;
        },
        values: validatedValues,
        renderType,
        session,
        cancel(reason) {
          didCancel = true;
          cancelled = reason;
        },
      };
      try {
        await handler(ctx);
      } catch (e) {
        // spec §4.2 — a throwing onBeforeSave handler is logged + SKIPPED;
        // it does NOT propagate and does NOT cancel the flow.
        console.error('[@listgrid/state] onBeforeSave handler threw — skipping it', e);
        continue;
      }
      if (didCancel) {
        if (cancelled !== undefined) {
          store.getState().addMessage({ key: 'save-cancelled', severity: 'info', text: cancelled });
          return { ok: false, reason: 'cancelled', cancelled };
        }
        return { ok: false, reason: 'cancelled' };
      }
    }

    // spec §6.2 step 5 (CAP-07; W4-4) — revision inject, ONLY when declared
    // (`withRevision`) — see this fn's header comment.
    const revisionEntityName = entityForm.getRevisionEntityName();
    if (revisionEntityName !== undefined) {
      data = { ...data, revisionEntityName };
    }

    let result: unknown;
    try {
      if (renderType === 'update') {
        result = await adapter.update(entityForm.url, entityForm.getId()!, data);
      } else {
        result = await adapter.create(entityForm.url, data);
      }
    } catch (e) {
      const error = toBackendError(e);
      applySaveError(error);
      return { ok: false, reason: 'error', error };
    }

    store.getState().clearMessages();
    store.getState().clearGlobalErrors();
    for (const handler of entityForm.getAfterSaveHandlers()) {
      const ctx: AfterSaveContext = { result, data, renderType, session, mutator: buildMutator() };
      try {
        await handler(ctx);
      } catch (e) {
        console.error('[@listgrid/state] onAfterSave handler threw — skipping it', e);
      }
    }

    return { ok: true, result };
  }

  function save(saveOpts?: { skipValidation?: boolean }): Promise<SaveOutcome> {
    if (activeSave !== undefined) return activeSave;
    store.getState().setSaving(true);
    const pending = performSave(saveOpts).finally(() => {
      activeSave = undefined;
      store.getState().setSaving(false);
    });
    activeSave = pending;
    return pending;
  }

  async function del(deleteOpts?: { ids?: string[] }): Promise<DeleteOutcome> {
    // spec §6.2 step 1 (CAP-06; W3-2) — same silent-block contract as save's
    // capability gate. delete is always evaluated in 'update' mode (an
    // existing record is being removed — there is no create-mode delete).
    const caps = entityForm.getCapabilities();
    if (!(await capAllowed(caps.delete, capCtx('update'))))
      return { ok: false, reason: 'capability' };

    if (deleteOpts?.ids === undefined && entityForm.getId() === undefined) {
      // create-mode delete with no ids and no bound id — building [undefined]
      // would call adapter.remove with a bogus id array (R12,
      // documents/analysis/2026-07-13/midpoint-code-review.md §4.4). Same
      // silent-block contract as the capability gate above: no adapter call,
      // no message.
      return { ok: false, reason: 'capability' };
    }
    const ids = deleteOpts?.ids ?? [entityForm.getId()!];

    for (const handler of entityForm.getBeforeDeleteHandlers()) {
      let cancelled: string | undefined;
      let didCancel = false;
      const ctx: BeforeDeleteContext = {
        ids,
        session,
        cancel(reason) {
          didCancel = true;
          cancelled = reason;
        },
      };
      try {
        await handler(ctx);
      } catch (e) {
        console.error('[@listgrid/state] onBeforeDelete handler threw — skipping it', e);
        continue;
      }
      if (didCancel) {
        if (cancelled !== undefined) {
          store
            .getState()
            .addMessage({ key: 'delete-cancelled', severity: 'info', text: cancelled });
          return { ok: false, reason: 'cancelled', cancelled };
        }
        return { ok: false, reason: 'cancelled' };
      }
    }

    try {
      // spec §6.2 step 4 (CAP-07; W4-4) — revision passthrough (undefined
      // when withRevision was never declared).
      await adapter.remove(entityForm.url, ids, entityForm.getRevisionEntityName());
    } catch (e) {
      const error = toBackendError(e);
      applyDeleteError(error);
      return { ok: false, reason: 'error', error };
    }

    for (const handler of entityForm.getAfterDeleteHandlers()) {
      const ctx: AfterDeleteContext = { ids, session };
      try {
        await handler(ctx);
      } catch (e) {
        console.error('[@listgrid/state] onAfterDelete handler threw — skipping it', e);
      }
    }

    return { ok: true, result: undefined };
  }

  async function reload(): Promise<void> {
    const id = entityForm.getId();
    if (id === undefined) return; // create mode: nothing to re-fetch (spec §6.2 FormRuntime.reload doc)
    // R1 (analysis §4.1): re-run the init pipe INTO the existing store (`into`)
    // so its action closures — and therefore its live subscribers (the mounted
    // field renderers) — stay authoritative. The prior
    // `store.setState(fresh.store.getState(), true)` replaced those closures
    // with a throwaway store's (which captured the throwaway's set/get),
    // orphaning EVERY write after the first reload (silent data loss).
    const initOpts: InitializeFormStoreOptions = { entityForm, id, adapter, into: store };
    if (session !== undefined) initOpts.session = session;
    await initializeFormStore(initOpts);
  }

  async function validate(): Promise<boolean> {
    return store.getState().validateAll();
  }

  return { save, delete: del, reload, validate };
}
