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
//      => { ok: false }, silent (no adapter call, no message)
//   2. validateAll() (unless opts.skipValidation) — fail => { ok: false }
//      (W4-3 Needs-Review: validateAll runs the SYNC ValidationItem channel
//      only — an AsyncValidation-carrying field's asyncState ('unchecked'/
//      'checking'/'invalid') is NEVER consulted here. Save does NOT block on
//      an unconfirmed/failed 중복확인. Spec §5.3/§6.2 are silent on whether
//      async-gating save is intended — deliberately NOT wired per that
//      task's SCOPE note; a spec decision is needed before this changes.)
//   3. toSaveData()
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
//      NAME) / an unmatched key onto a banner message; error.message is
//      suppressed when fieldErrors is present (suppress-generic); otherwise
//      addMessage({key:'save-error', ...}) — return { ok: false, error }
//   8. success => clearMessages() (clear-on-success) -> onAfterSave handlers,
//      sequential, same per-handler try/catch -> { ok: true, result }
//
// Delete flow order (spec §6.2):
//   1. capability delete gate (spec §3.4/§6.2, CAP-06; W3-2) — denied
//      => { ok: false }, silent (no adapter call, no message)
//   2. ids = opts.ids ?? [entityForm.getId()]
//   3. onBeforeDelete handlers, sequential; same cancel/throw contract
//   4. adapter.remove(url, ids, revision?) — revision = entityForm.
//      getRevisionEntityName() (spec §3.1/§6.2, CAP-07; W4-4), passed
//      through as-is (undefined when withRevision was never declared — the
//      adapter's own optional 3rd param handles the "not set" case, no
//      conditional call-site branching needed). failure =>
//      addMessage({key:'delete-error', ...}), return { ok: false, error }
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

  // spec §6.2 step 7 — field-name-keyed error mapping + suppress-generic.
  function applySaveError(error: BackendError): void {
    const fieldErrors = error.fieldErrors;
    if (fieldErrors !== undefined && Object.keys(fieldErrors).length > 0) {
      const fieldDefs = store.getState().fieldDefs;
      for (const [name, messages] of Object.entries(fieldErrors)) {
        if (name in fieldDefs) {
          store.getState().setFieldErrors(name, messages);
        } else {
          store.getState().addMessage({ key: name, severity: 'error', text: messages.join(', ') });
        }
      }
      // suppress-generic (spec §6.2): error.message is NOT also banner-ed
      // when fieldErrors is present.
    } else {
      store.getState().addMessage({ key: 'save-error', severity: 'error', text: error.message });
    }
  }

  // delete has no per-field error channel (bulk ids, not fields) — spec §6.2
  // delete step 4 is the plain banner-message form only, no fieldErrors
  // mapping/suppress-generic (that machinery is save-specific, step 7).
  function applyDeleteError(error: BackendError): void {
    store.getState().addMessage({ key: 'delete-error', severity: 'error', text: error.message });
  }

  async function save(saveOpts?: { skipValidation?: boolean }): Promise<SaveOutcome> {
    const renderType = entityForm.getRenderType();

    // spec §6.2 step 1 (CAP-06; W3-2) — capability-denied is a SILENT block:
    // no adapter call, no message (the view already hides the affordance;
    // a headless caller just receives { ok: false }). Indistinguishable from
    // a validation failure by SHAPE alone (SaveOutcome has no reason field
    // for the non-error/non-cancel case) — deliberate, see this task's
    // deviations note.
    const caps = entityForm.getCapabilities();
    const relevantCap = renderType === 'update' ? caps.update : caps.create;
    if (!(await capAllowed(relevantCap, capCtx(renderType)))) return { ok: false };

    if (!saveOpts?.skipValidation) {
      const valid = await store.getState().validateAll();
      if (!valid) return { ok: false };
    }

    let data = store.getState().toSaveData();

    for (const handler of entityForm.getBeforeSaveHandlers()) {
      let cancelled: string | undefined;
      let didCancel = false;
      const ctx: BeforeSaveContext = {
        data,
        setData(next) {
          data = next;
        },
        values: snapshotValues(),
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
          return { ok: false, cancelled };
        }
        return { ok: false };
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
      return { ok: false, error };
    }

    store.getState().clearMessages();
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

  async function del(deleteOpts?: { ids?: string[] }): Promise<DeleteOutcome> {
    // spec §6.2 step 1 (CAP-06; W3-2) — same silent-block contract as save's
    // capability gate. delete is always evaluated in 'update' mode (an
    // existing record is being removed — there is no create-mode delete).
    const caps = entityForm.getCapabilities();
    if (!(await capAllowed(caps.delete, capCtx('update')))) return { ok: false };

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
          return { ok: false, cancelled };
        }
        return { ok: false };
      }
    }

    try {
      // spec §6.2 step 4 (CAP-07; W4-4) — revision passthrough (undefined
      // when withRevision was never declared).
      await adapter.remove(entityForm.url, ids, entityForm.getRevisionEntityName());
    } catch (e) {
      const error = toBackendError(e);
      applyDeleteError(error);
      return { ok: false, error };
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
    const initOpts: InitializeFormStoreOptions = { entityForm, id, adapter };
    if (session !== undefined) initOpts.session = session;
    const fresh = await initializeFormStore(initOpts);
    // reflect the freshly-built store (fetch -> BIND -> onInit -> build) into
    // the SAME store instance the caller's subscribers already hold (zustand
    // `replace: true` — spec §6.2 suggested implementation).
    store.setState(fresh.store.getState(), true);
  }

  async function validate(): Promise<boolean> {
    return store.getState().validateAll();
  }

  return { save, delete: del, reload, validate };
}
