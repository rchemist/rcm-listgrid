import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import type { EntityField, EntityForm, FieldGroupDef, TabDef } from '@listgrid/schema-core';
import type { FormStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { FieldRenderer } from './FieldRenderer';

// ViewEntityForm — the top-level form screen (task item 5): title, a simple
// tab bar (only rendered when there's more than one tab — single/no-tab forms
// like College just render their one group), field groups → FieldRenderer per
// field, form-level errors, and a Save button that validates before calling
// back out to the host's persistence (`onSave`). Deliberately minimal — no
// stepper/sub-collection/theme system (that's the 0.3.x surface this
// replaces, not this V0.4 slice).

export interface ViewEntityFormProps {
  entityForm: EntityForm;
  store: StoreApi<FormStoreState>;
  onSave?: (data: Record<string, unknown>) => void | Promise<void>;
}

const DEFAULT_TAB_ID = 'default';
const DEFAULT_GROUP_ID = 'default';

// EF4 — tabs/groups/field-list are re-derived from the store's LIVE field
// registry (state.fieldDefs), not entityForm.getFields()/getTabs()/
// getFieldGroups()/getGroupFields() directly: addField/removeField (via
// FormMutator, mid-lifecycle) mutate the store's registry, NOT the EntityForm
// instance (schema-core stays untouched by EF4 — see reuse review). This
// replaces the 0.3.x shouldReload full-clone/cacheKey-remount path
// (EntityFormBase.tsx:75-76/636-638, useEntityFormLogic.ts:263-273) with a
// precise re-derivation: field VALUE state is never disturbed, only which
// tabs/groups/fields exist.
//
// entityForm's declared TabDef/FieldGroupDef maps are still consulted for the
// label/order of a tab/group a dynamic field targets that was already
// declared; an id a declaration never named (a field routed somewhere new)
// falls back to an id-only entry, ordered after the declared ones — mirrors
// the `tab.label ?? tab.id` fallback already used below for unlabeled tabs.

// EB2 — fields carrying a `renderedBy` marker (form-field.ts doc: "this field's editor is
// rendered by the named composite field's renderer, e.g. AddressField's AddressRenderer") are
// excluded from EVERY standalone-iteration surface: tab/group derivation, the rendered field
// list, AND the focus-first-error scan below. This is a RENDER-layer suppression only —
// `renderedBy` is never consulted by FormField.validate()/validateAll (@listgrid/state), so a
// suppressed field's required/validations still run exactly as if it were rendered standalone;
// only its own standalone <FieldRenderer> is skipped (the owning composite's renderer is
// expected to render/own that a11y surface instead — see AddressFieldRenderer).
function liveFields(fieldDefs: Record<string, EntityField>): EntityField[] {
  return Object.values(fieldDefs)
    .filter((f) => f.renderedBy === undefined)
    .sort((a, b) => a.getOrder() - b.getOrder());
}

function deriveTabs(entityForm: EntityForm, fields: EntityField[]): TabDef[] {
  const byId = new Map(entityForm.getTabs().map((t) => [t.id, t]));
  let seq = byId.size;
  for (const field of fields) {
    const tabId = field.getTabId() || DEFAULT_TAB_ID;
    if (!byId.has(tabId)) byId.set(tabId, { id: tabId, order: seq++ });
  }
  return [...byId.values()].sort((a, b) => a.order - b.order);
}

function deriveGroups(
  entityForm: EntityForm,
  fields: EntityField[],
  tabId: string,
): FieldGroupDef[] {
  const inTab = fields.filter((f) => f.getTabId() === tabId);
  const byId = new Map(entityForm.getFieldGroups(tabId).map((g) => [g.id, g]));
  let seq = byId.size;
  for (const field of inTab) {
    const groupId = field.getFieldGroupId() || DEFAULT_GROUP_ID;
    if (!byId.has(groupId)) byId.set(groupId, { id: groupId, order: seq++ });
  }
  const activeIds = new Set(inTab.map((f) => f.getFieldGroupId() || DEFAULT_GROUP_ID));
  return [...byId.values()].filter((g) => activeIds.has(g.id)).sort((a, b) => a.order - b.order);
}

function deriveGroupFields(fields: EntityField[], tabId: string, groupId: string): EntityField[] {
  return fields.filter(
    (f) => f.getTabId() === tabId && (f.getFieldGroupId() || DEFAULT_GROUP_ID) === groupId,
  );
}

export function ViewEntityForm({ entityForm, store, onSave }: ViewEntityFormProps) {
  return (
    <FormStoreProvider store={store}>
      <ViewEntityFormInner
        entityForm={entityForm}
        store={store}
        {...(onSave !== undefined ? { onSave } : {})}
      />
    </FormStoreProvider>
  );
}

function ViewEntityFormInner({ entityForm, store, onSave }: ViewEntityFormProps) {
  const { Button } = useUI();
  const tabIndex = useStore(store, (s) => s.tabIndex);
  const formErrors = useStore(store, (s) => s.formErrors);
  const saving = useStore(store, (s) => s.saving);
  // EF4: subscribe to structureVersion ONLY — a value edit must NOT re-derive
  // tabs/groups (D4 stays intact, per FieldRenderer/useFormField); an
  // addField/removeField bump is the only thing that re-runs the derivation
  // below.
  useStore(store, (s) => s.structureVersion);

  const fields = liveFields(store.getState().fieldDefs);
  const tabs = deriveTabs(entityForm, fields);
  const activeTabId = tabs.find((t) => t.id === tabIndex)?.id ?? tabs[0]?.id ?? DEFAULT_TAB_ID;
  const groups = deriveGroups(entityForm, fields, activeTabId);
  const title = entityForm.getTitle();

  // Focus-first-error (a11y gap C): after a failed validateAll(), errors are
  // already committed to the store (form-store.ts validateAll sets
  // fields[name].errors for every field). Find the first invalid field in
  // declaration order (liveFields() is sorted by field.order — the same
  // traversal validateAll() itself uses, over the same live registry) and
  // move focus to its input, which carries id={fieldName} (FieldRenderer ->
  // primitive wiring).
  function focusFirstInvalidField(): void {
    if (typeof document === 'undefined') return;
    const state = store.getState();
    const firstInvalid = liveFields(state.fieldDefs).find(
      (f) => (state.fields[f.getName()]?.errors?.length ?? 0) > 0,
    );
    if (firstInvalid) {
      document.getElementById(firstInvalid.getName())?.focus();
    }
  }

  async function handleSave(): Promise<void> {
    store.getState().setSaving(true);
    try {
      const valid = await store.getState().validateAll();
      if (!valid) {
        focusFirstInvalidField();
        return;
      }
      await onSave?.(store.getState().toSaveData());
    } finally {
      store.getState().setSaving(false);
    }
  }

  return (
    <div data-entity-form={entityForm.getName()}>
      {title && <h2>{title}</h2>}

      {tabs.length > 1 && (
        <div role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === activeTabId}
              disabled={tab.id === activeTabId}
              onClick={() => store.getState().setTabIndex(tab.id)}
            >
              {tab.label ?? tab.id}
            </button>
          ))}
        </div>
      )}

      {groups.map((group) => (
        <fieldset key={group.id}>
          {group.label && <legend>{group.label}</legend>}
          {deriveGroupFields(fields, activeTabId, group.id).map((field) => (
            <FieldRenderer key={field.getName()} field={field} />
          ))}
        </fieldset>
      ))}

      {formErrors.length > 0 && (
        <ul role="alert" data-form-errors="">
          {formErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}

      <Button type="button" onClick={() => void handleSave()} disabled={saving}>
        Save
      </Button>
    </div>
  );
}
