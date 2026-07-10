import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  getCurrentValue,
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
// pre-existing fields; EF3's initializeFormStore relies on hydrate covering
// both flat and dotted names since it builds/hydrates AFTER onInitialize may
// have added a dotted-named field).
function resolveFetchedValue(data: Record<string, unknown>, name: string): unknown {
  if (!name.includes('.')) return data[name];
  let cur: unknown = data;
  for (const part of name.split('.')) {
    if (cur === undefined || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

// createFormStore — the per-instance, value-slice form store (ADR-0002). The
// store holds ONLY the value slices + form-level UI state; the field META lives
// on the EntityForm/field instances. Renderers subscribe to a single field's
// slice (`state.fields[name]`), so a keystroke re-renders one field, not the
// whole form (decision D4 — the 0.3.x clone(true) path is gone).

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
  renderType: RenderType;
  tabIndex: string;
  initialized: boolean;
  saving: boolean;
  formErrors: string[];

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
  /** validate every field; returns whether the whole form is valid. */
  validateAll(): Promise<boolean>;
  /** reset every slice to its baseline (create→default, update→fetched). */
  reset(): void;
  isDirty(): boolean;
  setSaving(saving: boolean): void;
  setTabIndex(tabIndex: string): void;
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
  const renderType = opts.renderType ?? entityForm.getRenderType();
  const session = opts.session;
  const validateOnChangeConfig = resolveValidateOnChange(opts.validateOnChange);

  // seed a slice from a field's declaration values (default / declared
  // current) — shared by the initial-fields build below AND addField (EF4),
  // which reruns the same seeding for a field registered mid-lifecycle.
  function seedSlice(field: EntityField): FieldValueSlice {
    const seed = field.value;
    const slice: FieldValueSlice = {};
    if (seed?.default !== undefined) slice.default = seed.default;
    if (seed && Object.prototype.hasOwnProperty.call(seed, 'current')) {
      slice.current = seed.current;
    }
    return slice;
  }

  const initialFieldDefs: Record<string, EntityField> = {};
  const initialFields: Record<string, FieldValueSlice> = {};
  for (const field of entityForm.getFields()) {
    initialFieldDefs[field.getName()] = field;
    initialFields[field.getName()] = seedSlice(field);
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

    // EF4 — the last hydrated data payload, retained so a field registered
    // AFTER hydrate() (a post-init addField, e.g. from an onChanges handler)
    // can still rebind its fetched value (0.3.x EntityForm.tsx:268-302 late-
    // added-field parity; init-time additions never hit this path — EF3's
    // build-after-hooks pipe already seeds them via the hydrate() call that
    // follows onInitialize).
    let fetchedData: Record<string, unknown> | undefined;

    function dispatchOnChanges(changedField: string): void {
      for (const handler of entityForm.getOnChanges()) {
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
      } finally {
        if (isTopLevel) dispatchBatch = null;
      }
    }

    // Store-backed FormMutator adapter (EF2) injected into every onChanges
    // handler. Keeps schema-core's OnChangesHandler state-agnostic
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
    };

    return {
      fields: initialFields,
      meta: {},
      fieldDefs: initialFieldDefs,
      structureVersion: 0,
      renderType,
      tabIndex: entityForm.getTabs()[0]?.id ?? 'default',
      initialized: true,
      saving: false,
      formErrors: [],

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

      async validateAll() {
        const s = get();
        let valid = true;
        const fields = { ...s.fields };
        for (const field of sortedFieldDefs(s)) {
          const name = field.getName();
          const errs = await field.validate(buildCtx(s, name), s.meta[name]);
          fields[name] = { ...fields[name], errors: errs.map((e) => ({ message: e.message })) };
          if (errs.length > 0) valid = false;
        }
        set({ fields });
        return valid;
      },

      reset() {
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

      toSaveData() {
        const s = get();
        const out: Record<string, unknown> = {};
        for (const field of Object.values(s.fieldDefs)) {
          if (field.exceptOnSave) continue;
          const name = field.getName();
          const value = getCurrentValue(s.fields[name], s.renderType);
          if (field.type === 'manyToOne' && value && typeof value === 'object') {
            const idField = (field as { getIdField?: () => string }).getIdField?.() ?? 'id';
            out[`${name}Id`] = (value as Record<string, unknown>)[idField];
          } else {
            out[name] = value;
          }
        }
        return out;
      },
    };
  });
}
