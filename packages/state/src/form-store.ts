import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  AsyncValidation,
  extractPermissions,
  getCurrentValue,
  getStaticConditionalBoolean,
  isDirty as computeDirty,
  resetValue,
  type EntityField,
  type EntityForm,
  type FieldEvalContext,
  type FieldMetaOverride,
  type FieldValueSlice,
  type FormMutator,
  type RenderType,
  type Session,
} from '@listgrid/schema-core';

// resolveFetchedValue — reads field `name`'s value out of a fetched/provided
// data record. A dotted name (e.g. 'user.state') addresses a nested object in
// the record (0.3.x parity — src/listgrid/config/EntityForm.tsx
// setFetchedValues:553-575 walked the same `key.split('.')` path for
// pre-existing fields). Exported (EF7) — initializeFormStore
// (@listgrid/state) reuses this exact resolution for its pre-hook BIND step
// and its post-hook REBIND-late-added-fields step, so both the store's own
// `hydrate()`/`addField()` and the init pipe read a dotted/flat name
// identically.
export function resolveFetchedValue(data: Record<string, unknown>, name: string): unknown {
  if (!name.includes('.')) return data[name];
  let cur: unknown = data;
  for (const part of name.split('.')) {
    if (cur === undefined || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

// nestDottedKeys — the write-side mirror of resolveFetchedValue's dotted-path
// read: toSaveData (W2-4, spec §5.2) merges every field's serializeValue
// contribution into one FLAT map first, then this pass nests any key
// containing '.' into the equivalent object path (`{'a.b': v}` -> `{a: {b:
// v}}`). A key with no dot is copied through unchanged, so for the current
// field set — none of whose serializeValue contributions use a dotted key —
// this is a strict no-op (existing toSaveData characterization tests are
// unaffected).
function nestDottedKeys(flat: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (!key.includes('.')) {
      out[key] = value;
      continue;
    }
    const parts = key.split('.');
    let cur = out;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i] as string;
      const existing = cur[part];
      if (typeof existing !== 'object' || existing === null) {
        cur[part] = {};
      }
      cur = cur[part] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1] as string] = value;
  }
  return out;
}

// findAsyncValidation — W4-3 (spec §5.3, CAP-05): locates the (at most one,
// by convention) AsyncValidation instance a field's `validations` array
// carries, optionally narrowed to a `trigger`. AsyncValidation rides the same
// single `withValidations()` channel every other Validation does (C5 — no
// dedicated field class), so identity here is `instanceof`, not a lookup by
// `id` (AsyncValidation's constructor takes no `id` param — see
// ../validations/async-validation.ts).
function findAsyncValidation(
  field: EntityField | undefined,
  trigger?: 'change' | 'button',
): AsyncValidation | undefined {
  if (!field) return undefined;
  return (field.validations ?? []).find(
    (v): v is AsyncValidation =>
      v instanceof AsyncValidation && (trigger === undefined || v.trigger === trigger),
  );
}

// asyncGateMessage — W4-3a (D1, spec §5.3/§6.2): the save-time gate message
// validateAll writes for a DIRTY AsyncValidation field that has not resolved to
// 'valid'. Deterministic per state — deliberately NOT the check's own message:
// the specific check message (e.g. '이미 사용 중인 별칭입니다') surfaces at
// check time via runAsyncValidation, written to the same per-field `errors`
// channel; by save time that channel may have been overwritten, so a stable
// per-state line explains the block. Kept generic (the affordance label
// defaults to '확인'); an app localizes via its own message layer if needed.
function asyncGateMessage(state: FieldValueSlice['asyncState']): string {
  switch (state) {
    case 'invalid':
      return '확인에 실패했습니다. 값을 수정한 뒤 다시 확인해 주세요.';
    case 'checking':
      return '확인이 진행 중입니다. 잠시 후 다시 시도해 주세요.';
    default: // 'unchecked' | undefined
      return '확인이 필요합니다.';
  }
}

// createFormStore — the per-instance, value-slice form store (ADR-0002). The
// store holds ONLY the value slices + form-level UI state; the field META lives
// on the EntityForm/field instances. Renderers subscribe to a single field's
// slice (`state.fields[name]`), so a keystroke re-renders one field, not the
// whole form (decision D4 — the 0.3.x clone(true) path is gone).

/**
 * W2-3 (spec §6.1) — a single entry in the form-level banner channel
 * (`FormStoreState.messages`). This is NOT a field-error store — field
 * validation errors live on their own field's slice (`state.fields[name].
 * errors`), untouched by this type. `messages` is the single form-level
 * banner channel server entity errors (EG5), the old `alertMessages` (EG17),
 * and a `cancel` reason all land on (W2-5 wires those writers; this type +
 * the store actions below are the channel they write through).
 */
export interface FormMessage {
  key: string;
  severity: 'error' | 'warning' | 'info';
  text: string;
  /** optional association to a field name. */
  field?: string | undefined;
  /** survives a clear-on-success `clearMessages()` call unless `includePersistent` is set. */
  persistent?: boolean | undefined;
}

export interface FormStoreState {
  fields: Record<string, FieldValueSlice>;
  /**
   * Per-field imperative meta overrides (EF1). When a key is set on a field's
   * entry it WINS over that field's declared/predicate-resolved meta —
   * renderers subscribe to this via useFieldMeta and validate() consults it.
   * This is the reactivity substrate the imperative lifecycle
   * (onChanges/onInitialize, EF2/EF3) mutates to reshape a live form.
   */
  meta: Record<string, FieldMetaOverride>;
  /**
   * The LIVE field registry (EF4) — seeded from entityForm.getFields() at
   * store creation, then mutated by addField/removeField. This, NOT
   * entityForm.getFields()/getField(), is the source hydrate/validateField/
   * validateAll/toSaveData read from, so a dynamically added/removed field
   * participates correctly. entityForm itself is never mutated (schema-core
   * stays untouched by EF4 — see reuse review); ViewEntityForm re-derives its
   * tabs/groups from this registry on a structureVersion bump.
   */
  fieldDefs: Record<string, EntityField>;
  /**
   * Bumped by addField/removeField only (EF4) — NEVER by a value edit.
   * ViewEntityForm subscribes to this to re-derive tabs/groups/field list
   * without a full remount (replaces the 0.3.x shouldReload full-clone/
   * cacheKey-remount path — EntityFormBase.tsx:75-76/636-638,
   * useEntityFormLogic.ts:263-273).
   */
  structureVersion: number;
  /**
   * Runtime tab-hidden override slice (EC3-0), seeded from each declared
   * TabDef.hidden at store build. A key set here WINS over the declared
   * TabDef.hidden — ViewEntityForm reads `tabHidden[tabId] ??
   * TabDef.hidden ?? false` as the effective hidden used to filter the tab
   * bar (0.3.x getViewableTabs parity). Mutated by setTabHidden (and the
   * FormMutator adapter it backs) — NEVER cascades to field-level `hidden`
   * meta (see FormMutator.setTabHidden doc, @listgrid/schema-core, for the
   * full contract/rationale).
   */
  tabHidden: Record<string, boolean>;
  renderType: RenderType;
  tabIndex: string;
  initialized: boolean;
  saving: boolean;
  /**
   * Declared-level form read-only seed (spec §3.1, CAP-27; W3-5), from
   * `entityForm.getReadOnly()` at store build. FieldRenderer ORs this into
   * every field's effective readOnly and ViewEntityForm hides the built-in
   * Save affordance when true (spec §6.1) — a display/edit-affordance
   * contract only, NOT a write hard-gate (controller.save/delete do not
   * consult it; write-blocking is `withCapabilities({ update: false })`'s
   * job). Declared seed only — no runtime setter in this slice.
   */
  formReadOnly: boolean;
  /**
   * W2-3 (spec §6.1) — the form-level banner channel. Replaces the old
   * inert `formErrors: string[]` (never written by anything — confirmed
   * dead). Field-level validation errors are NOT stored here (see
   * FormMessage doc) — this array is exclusively the banner ViewEntityForm
   * renders below the field groups.
   */
  messages: FormMessage[];

  // --- actions ---
  /**
   * Writes field `name`'s value slice, then dispatches the EntityForm's
   * registered onChanges handlers (EF2) — see createFormStore's dispatch/
   * loop-guard doc comment below for the batching contract.
   *
   * `opts.cascade === false` (EA-B0) skips ONLY the dispatchOnChanges call —
   * an independent axis from the loop-guard's isTopLevel/dispatchBatch
   * machinery (do not conflate). writeValue/dirty recompute, touched
   * marking, and validate-on-change scheduling all run exactly as they do
   * without the option (old-engine parity — FieldRenderer.tsx propagation=
   * false only ever skipped the onChanges loop, PART A). Not exposed on
   * FormMutator: handler-driven cascade writes are the loop-guard's concern,
   * not this option's.
   */
  setValue(name: string, value: unknown, opts?: { cascade?: boolean }): void;
  getValue(name: string): unknown;
  /** fill fetched values from a server entity (create → update). */
  hydrate(data: Record<string, unknown>): void;
  /**
   * Imperative reactivity entry point (EF1): shallow-merge `partial` into
   * field `name`'s meta override. Renderers subscribed via useFieldMeta
   * re-render; validateField/validateAll consult the merged override.
   */
  setMeta(name: string, partial: FieldMetaOverride): void;
  /** read field `name`'s current meta override, if any has been set. */
  getMeta(name: string): FieldMetaOverride | undefined;
  /**
   * Register a new field mid-lifecycle (EF4) — see FormMutator.addField doc
   * (@listgrid/schema-core) for the full seed/rebind/duplicate-replace/
   * version-bump contract this implements.
   */
  addField(field: EntityField): void;
  /**
   * Remove field `name`'s value/meta slices (EF4) — nonexistent name is a
   * silent no-op (no version bump). See FormMutator.removeField doc.
   */
  removeField(name: string): void;
  /** validate one field; writes errors to its slice; returns valid. */
  validateField(name: string): Promise<boolean>;
  /**
   * W2-5 (spec §6.2 save-flow error-mapping step) — writes field `name`'s
   * slice `errors` directly from a list of message strings (as opposed to
   * `validateField`, which DERIVES errors by running the field's own
   * `Validation`s). The controller's save flow uses this to map a
   * `BackendError.fieldErrors` entry onto its field's slice, keyed by field
   * NAME (not label — the old EF3.x label-key bug this deliberately avoids).
   * A no-op if `name` names no declared field (mirrors `removeField`'s
   * silent-no-op-on-unknown-name contract) — the controller is expected to
   * check `fieldDefs` itself before calling this to decide between this
   * action and a banner `addMessage` (spec §6.2), but this guard keeps the
   * action safe to call unconditionally too.
   */
  setFieldErrors(name: string, messages: string[]): void;
  /** validate every field; returns whether the whole form is valid. */
  validateAll(): Promise<boolean>;
  /**
   * W4-3 (spec §5.3, CAP-05) — run field `name`'s declared AsyncValidation
   * (the first `instanceof AsyncValidation` found in its `validations`)
   * against its CURRENT value: writes `asyncState:'checking'` synchronously,
   * then awaits `check(value, ctx)` and writes `asyncState:'valid'` |
   * `'invalid'` from the resolved `ValidateResult` — an invalid result's
   * message is written to the SAME `errors` channel `validateField`/
   * `validateAll` write (no separate message field; a later sync
   * validate*() call overwrites it wholesale, same as it already does across
   * repeated sync calls). A no-op (no state change, `check` never invoked)
   * if `name` names no declared field or the field carries no
   * AsyncValidation.
   *
   * This is the explicit entry point a `trigger:'button'` field's confirm
   * button calls directly (@listgrid/react FieldRenderer). A
   * `trigger:'change'` field never needs it called directly — `setValue`'s
   * internal debounce scheduler (see createFormStore's dispatch/loop-guard
   * doc) calls it after that AsyncValidation's own `debounceMs` elapses.
   * Cancels any pending 'change'-trigger debounce for `name` first, so an
   * explicit call always wins over a stale pending timer.
   *
   * SAVE-GATING (W4-3a, D1 — spec §5.3/§6.2, resolving the W4-3 Needs-Review):
   * `asyncState` is NOT display-only — `validateAll` (and therefore
   * `controller.save`/`controller.validate`) treats a DIRTY field whose
   * `asyncState !== 'valid'` as invalid, so an unconfirmed/failed 중복확인
   * blocks save. This action only RESOLVES the tri-state (checking→valid/
   * invalid); the gate itself lives in `validateAll`. A value change resets
   * the tri-state to 'unchecked' (writeValue), so a stale 'valid' can't
   * survive an edit past the gate.
   */
  runAsyncValidation(name: string): Promise<void>;
  /** reset every slice to its baseline (create→default, update→fetched). */
  reset(): void;
  isDirty(): boolean;
  setSaving(saving: boolean): void;
  setTabIndex(tabIndex: string): void;
  /**
   * Runtime tab-hidden override (EC3-0): writes `tabHidden[tabId]`,
   * overriding the tab's declared TabDef.hidden. See FormStoreState.tabHidden
   * doc for the effective-hidden resolution order and FormMutator.setTabHidden
   * (@listgrid/schema-core) for the non-cascading contract.
   */
  setTabHidden(tabId: string, hidden: boolean): void;
  /**
   * W2-3 (spec §6.1) — append `msg` to the form-level banner channel. A
   * `msg.key` that already matches an existing message REPLACES it (keys
   * are the dedup/removal handle `removeMessage` looks up) rather than
   * producing a duplicate entry.
   */
  addMessage(msg: FormMessage): void;
  /** remove the message with `key` from the banner channel; no-op if absent (spec §6.1). */
  removeMessage(key: string): void;
  /**
   * W2-3 (spec §6.1) — clear the banner channel. With no/empty `opts`, only
   * NON-persistent messages are cleared (the save-flow "성공: 비persistent
   * messages clear" clear-on-success step, spec §6.2 canonical save flow).
   * `{ includePersistent: true }` clears every message regardless of its
   * `persistent` flag.
   */
  clearMessages(opts?: { includePersistent?: boolean }): void;
  /** build the save payload (exceptOnSave dropped, ManyToOne flattened → `<name>Id`). */
  toSaveData(): Record<string, unknown>;
}

export interface CreateFormStoreOptions {
  session?: Session;
  renderType?: RenderType;
  /**
   * EF5 — opt-in validate-on-change. Default OFF (absent/false): zero change
   * from pre-EF5 behavior. `true` uses the default 300ms trailing debounce;
   * an object customizes `debounceMs`. Only a TOP-LEVEL (user-initiated)
   * setValue of the field just changed schedules validation of THAT field —
   * nested cascade writes from onChanges handlers never mark touched or
   * schedule (old renderer-onChange asymmetry — FieldRenderer.tsx:97-101
   * parity: cascade-driven writes never validated in the 0.3.x engine
   * either).
   */
  validateOnChange?: boolean | { debounceMs?: number };
  /**
   * EF7 — the fetched/provided record the init pipe (initializeFormStore,
   * @listgrid/state) already bound onto `entityForm`'s fields (+ let
   * onFetchData/onInitialize override) BEFORE calling createFormStore. When
   * present, createFormStore does NOT re-derive field values from it
   * (seedSlice already reads the final bound+hook-adjusted value straight
   * off each field) — it is retained ONLY for the EF4 late-added-field
   * rebind (a field registered by addField AFTER the store is built, e.g.
   * from an onChanges handler, still needs to pull its fetched value from
   * the same record — see the `fetchedData` closure var below) and to mark
   * the store's initial `renderType` 'update' (0.3.x parity: a record was
   * loaded, so this is an edit, even if the caller never set an `id`, e.g.
   * host-preloaded `initialData`).
   */
  fetchedData?: Record<string, unknown>;
  /**
   * W2-1 (spec §4.1) — the accumulated `InitContext.setMeta` calls from every
   * `onInit` handler the init pipe (initializeFormStore, @listgrid/state) ran
   * BEFORE calling createFormStore. Seeds the store's initial `meta` slice
   * (EF1) directly — same shallow-merge-per-field shape `store.setMeta`
   * itself produces, just pre-populated at build time instead of accumulated
   * via runtime calls. Absent/undefined seeds an empty `meta: {}`, identical
   * to pre-W2-1 behavior.
   */
  initialMeta?: Record<string, FieldMetaOverride>;
}

interface ValidateOnChangeConfig {
  debounceMs: number;
}

function resolveValidateOnChange(
  opt: CreateFormStoreOptions['validateOnChange'],
): ValidateOnChangeConfig | null {
  if (!opt) return null;
  const debounceMs = typeof opt === 'object' ? (opt.debounceMs ?? 300) : 300;
  return { debounceMs };
}

export function createFormStore(
  entityForm: EntityForm,
  opts: CreateFormStoreOptions = {},
): StoreApi<FormStoreState> {
  // EF7: opts.fetchedData present means a record was loaded/provided for
  // this form — that is an edit, even when the caller never called
  // entityForm.withId (e.g. host-preloaded initialData with no id yet).
  // opts.renderType, if explicitly given, still wins over both.
  const renderType =
    opts.renderType ?? (opts.fetchedData !== undefined ? 'update' : entityForm.getRenderType());
  const session = opts.session;
  const validateOnChangeConfig = resolveValidateOnChange(opts.validateOnChange);
  // EG1 — computed once; consulted by toSaveData's per-field permission gate
  // below (security: a field the session lacks permission for must never
  // reach the save payload, regardless of hidden/exceptOnSave state).
  const userPermissions = extractPermissions(session);

  // seed a slice from a field's declaration values (default / declared
  // current) — shared by the initial-fields build below AND addField (EF4),
  // which reruns the same seeding for a field registered mid-lifecycle.
  function seedSlice(field: EntityField): FieldValueSlice {
    const seed = field.value;
    const slice: FieldValueSlice = {};
    if (seed?.default !== undefined) slice.default = seed.default;
    // EF7: carry `fetched` too — the init pipe (initializeFormStore) now
    // binds the fetched record onto field.value BEFORE calling
    // createFormStore, so this is the only place that value reaches the
    // store slice. Without it, computeDirty/resetValue would see
    // fetched=undefined for every bound field and misjudge dirty/reset
    // baselines (fetched vs default confusion — see isDirty's create-mode
    // vs update-mode branch split, ../schema-core field/value.ts).
    if (seed?.fetched !== undefined) slice.fetched = seed.fetched;
    if (seed && Object.prototype.hasOwnProperty.call(seed, 'current')) {
      slice.current = seed.current;
    }
    // W4-3 (spec §5.3): seed the AsyncValidation tri-state to 'unchecked' for
    // any field that declares one — absent entirely on a field with none
    // (see FieldValueSlice.asyncState doc, @listgrid/schema-core).
    if (findAsyncValidation(field) !== undefined) {
      slice.asyncState = 'unchecked';
    }
    return slice;
  }

  const initialFieldDefs: Record<string, EntityField> = {};
  const initialFields: Record<string, FieldValueSlice> = {};
  for (const field of entityForm.getFields()) {
    initialFieldDefs[field.getName()] = field;
    initialFields[field.getName()] = seedSlice(field);
  }

  // EC3-0: seed the runtime tabHidden slice from each declared TabDef.hidden
  // — only tabs that actually declare a `hidden` value get an entry here (a
  // tab a declaration never marked hidden falls through to the `?? false`
  // default at read time, same as an entirely undeclared tab discovered via
  // a dynamically-added field).
  const initialTabHidden: Record<string, boolean> = {};
  for (const tab of entityForm.getTabs()) {
    const staticHidden = getStaticConditionalBoolean(tab.hidden, renderType);
    if (staticHidden) initialTabHidden[tab.id] = staticHidden;
  }

  function sortedFieldDefs(state: FormStoreState): EntityField[] {
    return Object.values(state.fieldDefs).sort((a, b) => a.getOrder() - b.getOrder());
  }

  function buildCtx(state: FormStoreState, name: string): FieldEvalContext {
    const values: Record<string, unknown> = {};
    for (const [n, slice] of Object.entries(state.fields)) {
      values[n] = getCurrentValue(slice, state.renderType);
    }
    const ctx: FieldEvalContext = { renderType: state.renderType, values };
    const slice = state.fields[name];
    if (slice !== undefined) ctx.value = slice;
    if (session !== undefined) ctx.session = session;
    return ctx;
  }

  return createStore<FormStoreState>((set, get) => {
    // --- EF2 onChanges cascade: dispatch + loop-guard -----------------------
    // A top-level setValue(name, value) call starts a "batch" — a Set of
    // field names already dispatched during this synchronous call stack. A
    // nested mutator.setValue (called from inside a handler) ALWAYS writes
    // the value, but only dispatches onChanges for that field if it is not
    // already in the batch set (added when dispatched). This lets a
    // legitimate cascade chain A -> B -> C run to completion while stopping
    // an A -> B -> A re-entry loop after B's dispatch (A is already
    // in-batch, so the re-entrant A write does not re-dispatch A's
    // handlers). The batch is cleared when the top-level call's dispatch
    // stack unwinds (finally), so a LATER, unrelated top-level setValue
    // starts a fresh batch.
    //
    // Scope caveat: this guard covers the SYNCHRONOUS batch only. onChanges
    // handlers are dispatched fire-and-forget (0.3.x parity —
    // EntityForm.tsx:122-127) — an async handler's mutator.setValue, made
    // after its await resolves, runs after the originating batch has
    // already cleared, so it starts a brand-new top-level batch. This
    // matches the 0.3.x fire-and-forget exposure: an async handler's writes
    // are not covered by the loop-guard that protected the synchronous
    // chain it was dispatched from.
    let dispatchBatch: Set<string> | null = null;

    // --- EF5 validate-on-change: touched gating + trailing debounce ---------
    // touchedFields marks a field on its first TOP-LEVEL setValue (see
    // performSetValue's isTopLevel check, reusing the EF2 dispatch-depth
    // mechanism above) — a nested cascade write never touches this set.
    // validationTimers holds one trailing setTimeout per field; a later
    // top-level setValue of the same field resets it (only the last edit
    // within the debounce window validates). No new public dispose API is
    // added (out of scope per EF5 briefing) — clearing on reschedule plus
    // letting the final trailing timer run is the accepted leak posture.
    const touchedFields = new Set<string>();
    const validationTimers = new Map<string, ReturnType<typeof setTimeout>>();

    function scheduleValidateOnChange(name: string): void {
      if (!validateOnChangeConfig) return;
      touchedFields.add(name);
      const existing = validationTimers.get(name);
      if (existing !== undefined) clearTimeout(existing);
      const timer = setTimeout(() => {
        validationTimers.delete(name);
        if (touchedFields.has(name)) void get().validateField(name);
      }, validateOnChangeConfig.debounceMs);
      validationTimers.set(name, timer);
    }

    // --- W4-3 AsyncValidation (spec §5.3, CAP-05): 'change'-trigger debounce
    // scheduler + the shared runner both 'change' and the button-trigger
    // public action (runAsyncValidation, below) fall through to. Independent
    // of the EF5 validateOnChangeConfig opt-in above — a field's own declared
    // AsyncValidation IS the opt-in signal here (the store option gates the
    // separate sync-validation-on-change feature, not this one). Its own
    // timer map (not validationTimers) since the two debounce windows are
    // configured independently (EF5's store-level debounceMs vs. this
    // AsyncValidation instance's own debounceMs).
    const asyncValidationTimers = new Map<string, ReturnType<typeof setTimeout>>();

    async function runAsyncValidationNow(name: string, validation: AsyncValidation): Promise<void> {
      set((s) => ({
        fields: { ...s.fields, [name]: { ...s.fields[name], asyncState: 'checking' } },
      }));
      const state = get();
      const value = getCurrentValue(state.fields[name], state.renderType);
      const ctx = buildCtx(state, name);
      const result = await validation.check(value, ctx);
      // W4-3a (D1): stale-result guard. If the field's value changed while
      // `check` was in flight (a keystroke / cascade / an explicit re-run),
      // this result belongs to a value the user has since moved past — writing
      // it would resurrect a stale 'valid'/'invalid' (e.g. re-marking an
      // already-edited duplicate as 'valid'), reopening the save-gating bypass
      // that D1 closes. Drop it: the newer write (reset-on-edit's 'unchecked'
      // in writeValue, or a newer check) owns the tri-state now.
      if (!Object.is(getCurrentValue(get().fields[name], get().renderType), value)) return;
      set((s) => ({
        fields: {
          ...s.fields,
          [name]: {
            ...s.fields[name],
            asyncState: result.hasError() ? 'invalid' : 'valid',
            errors: result.hasError() ? [{ message: result.message }] : [],
          },
        },
      }));
    }

    function scheduleAsyncValidation(name: string): void {
      const validation = findAsyncValidation(get().fieldDefs[name], 'change');
      if (!validation) return;
      const existing = asyncValidationTimers.get(name);
      if (existing !== undefined) clearTimeout(existing);
      const timer = setTimeout(() => {
        asyncValidationTimers.delete(name);
        void runAsyncValidationNow(name, validation);
      }, validation.debounceMs);
      asyncValidationTimers.set(name, timer);
    }

    // EF4 — the last hydrated/provided data payload, retained so a field
    // registered AFTER init (a post-init addField, e.g. from an onChanges
    // handler) can still rebind its fetched value (0.3.x EntityForm.tsx:
    // 268-302 late-added-field parity). Seeded from opts.fetchedData (EF7 —
    // the init pipe's already-bound record) and/or overwritten by a later
    // explicit hydrate() call; init-time additions (fields an
    // onFetchData/onInitialize handler added) never hit THIS path — the
    // init pipe's own REBIND step (initialize-form-store.ts) already bound
    // them onto the EntityForm clone before createFormStore ever ran.
    let fetchedData: Record<string, unknown> | undefined = opts.fetchedData;

    function dispatchOnChanges(changedField: string): void {
      for (const handler of entityForm.getChangeHandlers()) {
        const result = handler(mutator, changedField);
        if (result && typeof (result as Promise<void>).then === 'function') {
          // fire-and-forget (see doc comment above) — swallow rejections so
          // an async handler failure cannot surface as an unhandled
          // rejection.
          (result as Promise<void>).catch(() => {});
        }
      }
    }

    function writeValue(name: string, value: unknown): void {
      set((s) => {
        const prev = s.fields[name] ?? {};
        const next: FieldValueSlice = { ...prev, current: value };
        next.dirty = computeDirty(next);
        // W4-3a (D1, spec §5.3): a value change invalidates any prior async
        // verification — reset the tri-state to 'unchecked' so save-gating
        // (validateAll) re-requires a check. Only a field that DECLARED an
        // AsyncValidation carries asyncState (guard on `!== undefined` so this
        // never ADDS the key to a field that never had one — mirrors
        // resetValue's invariant). A 'change'-trigger field re-verifies via the
        // debounce scheduler in performSetValue right after; a 'button'-trigger
        // field stays 'unchecked' until its 확인 affordance is pressed again —
        // this is what closes the stale-'valid'-after-edit save bypass.
        if (prev.asyncState !== undefined && !Object.is(prev.current, value)) {
          next.asyncState = 'unchecked';
        }
        return { fields: { ...s.fields, [name]: next } };
      });
    }

    function performSetValue(name: string, value: unknown, opts?: { cascade?: boolean }): void {
      const isTopLevel = dispatchBatch === null;
      if (isTopLevel) dispatchBatch = new Set<string>();
      const batch = dispatchBatch as Set<string>;
      try {
        writeValue(name, value);
        // EA-B0: cascade:false is an INDEPENDENT condition from the
        // isTopLevel/batch loop-guard above — it only ever suppresses this
        // dispatchOnChanges call (old-engine propagation=false parity, PART
        // A). Everything else (writeValue/dirty just above, touched +
        // validate-on-change scheduling just below) is unconditional.
        if (opts?.cascade !== false && !batch.has(name)) {
          batch.add(name);
          dispatchOnChanges(name);
        }
        // EF5: only the top-level (user-initiated) write of a field schedules
        // its own validation — nested cascade writes (onChanges handlers
        // setting a sibling) never do (see scheduleValidateOnChange doc).
        if (isTopLevel) scheduleValidateOnChange(name);
        // W4-3: same top-level-only gating for a 'change'-trigger
        // AsyncValidation (see scheduleAsyncValidation doc) — a cascade
        // write of a sibling field never triggers ITS AsyncValidation
        // either, mirroring the EF5 precedent immediately above.
        if (isTopLevel) scheduleAsyncValidation(name);
      } finally {
        if (isTopLevel) dispatchBatch = null;
      }
    }

    // Store-backed FormMutator adapter (EF2) injected into every onChange
    // handler. Keeps schema-core's ChangeHandler state-agnostic
    // (ADR-0003) while giving handlers read/write access to this store.
    const mutator: FormMutator = {
      getValue(name) {
        return get().getValue(name);
      },
      getValues() {
        const s = get();
        const values: Record<string, unknown> = {};
        for (const [n, slice] of Object.entries(s.fields)) {
          values[n] = getCurrentValue(slice, s.renderType);
        }
        return values;
      },
      setValue(name, value) {
        performSetValue(name, value);
      },
      setMeta(name, partial) {
        get().setMeta(name, partial);
      },
      addField(field) {
        get().addField(field);
      },
      removeField(name) {
        get().removeField(name);
      },
      setTabHidden(tabId, hidden) {
        get().setTabHidden(tabId, hidden);
      },
      getRenderType() {
        return entityForm.getRenderType();
      },
      getSession() {
        return session;
      },
    };

    return {
      fields: initialFields,
      meta: opts.initialMeta ?? {},
      fieldDefs: initialFieldDefs,
      structureVersion: 0,
      tabHidden: initialTabHidden,
      renderType,
      // prefer the first non-hidden declared tab (EC3-0) — ViewEntityForm's
      // own tabs.find(...)?? tabs[0] fallback covers this regardless, but
      // seeding a visible tab here keeps store.tabIndex itself consistent
      // rather than relying solely on the render-layer fallback.
      tabIndex:
        entityForm.getTabs().find((t) => !getStaticConditionalBoolean(t.hidden, renderType))?.id ??
        entityForm.getTabs()[0]?.id ??
        'default',
      initialized: true,
      saving: false,
      formReadOnly: entityForm.getReadOnly(),
      messages: [],

      getValue(name) {
        return getCurrentValue(get().fields[name], get().renderType);
      },

      setValue(name, value, opts) {
        performSetValue(name, value, opts);
      },

      hydrate(data) {
        fetchedData = data;
        set((s) => {
          const fields = { ...s.fields };
          for (const field of sortedFieldDefs(s)) {
            const name = field.getName();
            const prev = fields[name] ?? {};
            const value = resolveFetchedValue(data, name);
            // the loaded record is the new baseline: fetched = record value, and
            // current follows it (no edits yet) so the create-time default is
            // dropped (0.3.x update-mode: defaults don't apply). dirty = false.
            const next: FieldValueSlice = {
              ...prev,
              fetched: value,
              current: value,
              dirty: false,
            };
            fields[name] = next;
          }
          return { fields, renderType: 'update' as RenderType, initialized: true };
        });
      },

      setMeta(name, partial) {
        set((s) => ({ meta: { ...s.meta, [name]: { ...(s.meta[name] ?? {}), ...partial } } }));
      },

      getMeta(name) {
        return get().meta[name];
      },

      addField(field) {
        set((s) => {
          const name = field.getName();
          // route dynamically-added fields the same way EntityForm.addFields
          // places declaration-time ones — 'default' tab/group unless the
          // caller already set one via withForm().
          if (!field.form) field.form = { tabId: 'default', fieldGroupId: 'default' };

          let slice = seedSlice(field);
          if (fetchedData !== undefined) {
            const value = resolveFetchedValue(fetchedData, name);
            // late-added-field rebind (0.3.x EntityForm.tsx:268-302 parity) —
            // only when the hydrated record actually has a value for this name.
            if (value !== undefined) {
              slice = { ...slice, fetched: value, current: value, dirty: false };
            }
          }

          // duplicate name: replace the field definition AND reset its
          // value/meta slices from the new definition wholesale (0.3.x
          // `fields.set` parity — the field instance IS the value's home).
          const meta = { ...s.meta };
          delete meta[name];

          // duplicate-name replace (EF-R2): the new field instance starts
          // untouched with no pending validation — drop any stale touched
          // mark / debounce timer left over from the replaced field so a
          // later-firing timer can't validate the wrong (new) field.
          const existingTimer = validationTimers.get(name);
          if (existingTimer !== undefined) clearTimeout(existingTimer);
          validationTimers.delete(name);
          touchedFields.delete(name);

          // W4-3 (EF-R2 parity): same stale-timer hazard for a 'change'-
          // trigger AsyncValidation — a pending debounce for the REPLACED
          // field must not fire against the new field instance.
          const existingAsyncTimer = asyncValidationTimers.get(name);
          if (existingAsyncTimer !== undefined) clearTimeout(existingAsyncTimer);
          asyncValidationTimers.delete(name);

          return {
            fieldDefs: { ...s.fieldDefs, [name]: field },
            fields: { ...s.fields, [name]: slice },
            meta,
            structureVersion: s.structureVersion + 1,
          };
        });
      },

      removeField(name) {
        set((s) => {
          if (!(name in s.fieldDefs)) return {}; // nonexistent name: silent no-op, no version bump

          const fieldDefs = { ...s.fieldDefs };
          delete fieldDefs[name];
          const fields = { ...s.fields };
          delete fields[name];
          const meta = { ...s.meta };
          delete meta[name];

          // EF-R2: clear any pending debounce timer / touched mark for the
          // removed name — otherwise a later addField() re-using the same
          // name inherits a stale timer that fires validateField() against
          // the brand-new (untouched) field.
          const existingTimer = validationTimers.get(name);
          if (existingTimer !== undefined) clearTimeout(existingTimer);
          validationTimers.delete(name);
          touchedFields.delete(name);

          // W4-3 (EF-R2 parity) — see addField's matching comment.
          const existingAsyncTimer = asyncValidationTimers.get(name);
          if (existingAsyncTimer !== undefined) clearTimeout(existingAsyncTimer);
          asyncValidationTimers.delete(name);

          return { fieldDefs, fields, meta, structureVersion: s.structureVersion + 1 };
        });
      },

      async validateField(name) {
        const field = get().fieldDefs[name];
        if (!field) return true;
        const errs = await field.validate(buildCtx(get(), name), get().meta[name]);
        set((s) => ({
          fields: {
            ...s.fields,
            [name]: { ...s.fields[name], errors: errs.map((e) => ({ message: e.message })) },
          },
        }));
        return errs.length === 0;
      },

      setFieldErrors(name, messages) {
        set((s) => {
          if (!(name in s.fieldDefs)) return {}; // unknown field name: silent no-op (see doc comment above)
          return {
            fields: {
              ...s.fields,
              [name]: { ...s.fields[name], errors: messages.map((m) => ({ message: m })) },
            },
          };
        });
      },

      async validateAll() {
        const s = get();
        let valid = true;
        const messagesByField = new Map<string, { message: string }[]>();
        for (const field of sortedFieldDefs(s)) {
          const name = field.getName();
          const errs = await field.validate(buildCtx(s, name), s.meta[name]);
          const messages = errs.map((e) => ({ message: e.message }));
          // W4-3a (D1, spec §5.3/§6.2): async save-gating. A field declaring an
          // AsyncValidation whose value is DIRTY but has not resolved to
          // 'valid' is invalid — NO network here: the sync validate() above
          // stays neutral (AsyncValidation.validate() always succeeds), and
          // this reads the stored tri-state the check already resolved. Gated
          // on `dirty` so an untouched update-form field (its persisted value
          // already confirmed) needs no re-check, and a reverted value
          // (resetValue -> 'unchecked', dirty=false) doesn't block save. See
          // FieldValueSlice.asyncState + form-controller.ts save flow.
          const slice = s.fields[name];
          if (
            findAsyncValidation(field) !== undefined &&
            slice?.dirty === true &&
            slice.asyncState !== 'valid'
          ) {
            messages.push({ message: asyncGateMessage(slice.asyncState) });
          }
          messagesByField.set(name, messages);
          if (messages.length > 0) valid = false;
        }
        // R4 fix (analysis §4.3, MEDIUM): the old `set({ fields })` below
        // replaced the ENTIRE fields map with the `s.fields` snapshot taken
        // at the top of this function (only patched with `errors`). If an
        // in-flight AsyncValidation's own check (runAsyncValidationNow, this
        // file) resolves DURING this loop's await window, its live
        // `set((s) => ...)` write (e.g. asyncState 'checking' -> 'valid')
        // lands on the store — then this function's final non-functional
        // `set({ fields })` clobbered it straight back to the pre-race
        // 'checking' snapshot, sticking the tri-state forever (no further
        // trigger fires for an already-settled check) and permanently
        // blocking save via asyncGateMessage. Fix: merge functionally,
        // reading the FRESHEST `cur.fields` inside the updater, and writing
        // ONLY the computed `errors` key per field — every other key
        // (asyncState/current/dirty/...) keeps whatever the freshest state
        // holds, so a concurrent write can never be undone by this commit.
        set((cur) => {
          const fields = { ...cur.fields };
          for (const [name, messages] of messagesByField) {
            fields[name] = { ...fields[name], errors: messages };
          }
          return { fields };
        });
        return valid;
      },

      async runAsyncValidation(name) {
        const validation = findAsyncValidation(get().fieldDefs[name]);
        if (!validation) return;
        // an explicit call (button click, or a direct caller) always wins
        // over a stale pending 'change'-trigger debounce for the same field —
        // cancel it first so it can't clobber this immediate result later.
        const pending = asyncValidationTimers.get(name);
        if (pending !== undefined) {
          clearTimeout(pending);
          asyncValidationTimers.delete(name);
        }
        await runAsyncValidationNow(name, validation);
      },

      reset() {
        // R11 (analysis §4.4): resetValue() below synchronously reverts each
        // slice's asyncState to 'unchecked' and drops its errors, but a
        // pending validate-on-change trailing debounce (validationTimers) or
        // 'change'-trigger AsyncValidation debounce (asyncValidationTimers)
        // is a closure-captured setTimeout that doesn't know the field was
        // just reset — left alone it still fires later and resurrects a
        // 'checking' badge / stale error on the just-reset field. Same
        // clearTimeout+delete cleanup addField/removeField already do for a
        // single replaced/removed name (EF-R2), applied here to every
        // pending timer since reset() touches every field at once.
        for (const timer of validationTimers.values()) clearTimeout(timer);
        validationTimers.clear();
        for (const timer of asyncValidationTimers.values()) clearTimeout(timer);
        asyncValidationTimers.clear();
        touchedFields.clear();

        set((s) => {
          const fields: Record<string, FieldValueSlice> = {};
          for (const [name, slice] of Object.entries(s.fields)) {
            fields[name] = resetValue(slice, s.renderType);
          }
          return { fields };
        });
      },

      isDirty() {
        return Object.values(get().fields).some((slice) => computeDirty(slice));
      },

      setSaving(saving) {
        set({ saving });
      },

      setTabIndex(tabIndex) {
        set({ tabIndex });
      },

      setTabHidden(tabId, hidden) {
        set((s) => ({ tabHidden: { ...s.tabHidden, [tabId]: hidden } }));
      },

      addMessage(msg) {
        set((s) => ({ messages: [...s.messages.filter((m) => m.key !== msg.key), msg] }));
      },

      removeMessage(key) {
        set((s) => ({ messages: s.messages.filter((m) => m.key !== key) }));
      },

      clearMessages(opts) {
        set((s) => ({
          messages: opts?.includePersistent ? [] : s.messages.filter((m) => m.persistent === true),
        }));
      },

      toSaveData() {
        const s = get();
        // W2-4 (spec §5.2): merge every field's serializeValue keyed
        // contribution — no more per-field-type (manyToOne) branching here;
        // the duck-typed `getIdField` cast this used to need is gone (it now
        // lives on ManyToOneField.serializeValue, many-to-one-field.ts).
        const merged: Record<string, unknown> = {};
        for (const field of Object.values(s.fieldDefs)) {
          if (field.exceptOnSave) continue;
          // EG1 — security hard-gate: a field the session is not permitted
          // for is excluded from the save payload entirely (old parity:
          // EntityForm.tsx:909-916). This is independent of hidden/readOnly —
          // a hidden-but-unpermitted field must never be smuggled through.
          if (!field.isPermitted(userPermissions)) continue;
          const name = field.getName();
          const value = getCurrentValue(s.fields[name], s.renderType);
          Object.assign(merged, field.serializeValue(value, buildCtx(s, name)));
        }
        // dotted-name nesting pass, applied once AFTER the merge (spec §5.2).
        // EF6's submitTransform application used to run here as a final pure
        // pass (data in, data out) — REMOVED (spec §4.2: replaced by the
        // onBeforeSave hook, dispatched by createFormController.save,
        // @listgrid/state/form-controller.ts, AFTER this method returns).
        return nestDottedKeys(merged);
      },
    };
  });
}
