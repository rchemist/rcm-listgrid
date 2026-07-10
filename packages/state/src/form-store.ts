import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  getCurrentValue,
  isDirty as computeDirty,
  resetValue,
  type EntityForm,
  type FieldEvalContext,
  type FieldValueSlice,
  type RenderType,
  type Session,
} from '@listgrid/schema-core';

// createFormStore — the per-instance, value-slice form store (ADR-0002). The
// store holds ONLY the value slices + form-level UI state; the field META lives
// on the EntityForm/field instances. Renderers subscribe to a single field's
// slice (`state.fields[name]`), so a keystroke re-renders one field, not the
// whole form (decision D4 — the 0.3.x clone(true) path is gone).

export interface FormStoreState {
  fields: Record<string, FieldValueSlice>;
  renderType: RenderType;
  tabIndex: string;
  initialized: boolean;
  saving: boolean;
  formErrors: string[];

  // --- actions ---
  setValue(name: string, value: unknown): void;
  getValue(name: string): unknown;
  /** fill fetched values from a server entity (create → update). */
  hydrate(data: Record<string, unknown>): void;
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
}

export function createFormStore(
  entityForm: EntityForm,
  opts: CreateFormStoreOptions = {},
): StoreApi<FormStoreState> {
  const renderType = opts.renderType ?? entityForm.getRenderType();
  const session = opts.session;

  // seed slices from the field declaration values (default / declared current)
  const initialFields: Record<string, FieldValueSlice> = {};
  for (const field of entityForm.getFields()) {
    const seed = field.value;
    const slice: FieldValueSlice = {};
    if (seed?.default !== undefined) slice.default = seed.default;
    if (seed && Object.prototype.hasOwnProperty.call(seed, 'current')) {
      slice.current = seed.current;
    }
    initialFields[field.getName()] = slice;
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

  return createStore<FormStoreState>((set, get) => ({
    fields: initialFields,
    renderType,
    tabIndex: entityForm.getTabs()[0]?.id ?? 'default',
    initialized: true,
    saving: false,
    formErrors: [],

    getValue(name) {
      return getCurrentValue(get().fields[name], get().renderType);
    },

    setValue(name, value) {
      set((s) => {
        const prev = s.fields[name] ?? {};
        const next: FieldValueSlice = { ...prev, current: value };
        next.dirty = computeDirty(next);
        return { fields: { ...s.fields, [name]: next } };
      });
    },

    hydrate(data) {
      set((s) => {
        const fields = { ...s.fields };
        for (const field of entityForm.getFields()) {
          const name = field.getName();
          const prev = fields[name] ?? {};
          // the loaded record is the new baseline: fetched = record value, and
          // current follows it (no edits yet) so the create-time default is
          // dropped (0.3.x update-mode: defaults don't apply). dirty = false.
          const next: FieldValueSlice = {
            ...prev,
            fetched: data[name],
            current: data[name],
            dirty: false,
          };
          fields[name] = next;
        }
        return { fields, renderType: 'update' as RenderType, initialized: true };
      });
    },

    async validateField(name) {
      const field = entityForm.getField(name);
      if (!field) return true;
      const errs = await field.validate(buildCtx(get(), name));
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
      for (const field of entityForm.getFields()) {
        const name = field.getName();
        const errs = await field.validate(buildCtx(s, name));
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
      for (const field of entityForm.getFields()) {
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
  }));
}
