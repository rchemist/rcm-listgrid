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

// EC3-0 — a tab is filtered out of the tab bar entirely (0.3.x
// getViewableTabs parity) when its EFFECTIVE hidden is true: the store's
// runtime tabHidden override for the tab id, falling back to the declared
// TabDef.hidden, falling back to visible. This does NOT filter the tab's
// fields out of `fields` — a hidden tab's fields still render if some OTHER
// visible tab is never made active for them (they simply have no tab to be
// shown under), and still validate (see FormMutator.setTabHidden doc,
// @listgrid/schema-core, for the non-cascading contract).
function deriveTabs(
  entityForm: EntityForm,
  fields: EntityField[],
  tabHidden: Record<string, boolean>,
): TabDef[] {
  const byId = new Map(entityForm.getTabs().map((t) => [t.id, t]));
  let seq = byId.size;
  for (const field of fields) {
    const tabId = field.getTabId() || DEFAULT_TAB_ID;
    if (!byId.has(tabId)) byId.set(tabId, { id: tabId, order: seq++ });
  }
  return [...byId.values()]
    .filter((t) => !(tabHidden[t.id] ?? (typeof t.hidden === 'boolean' ? t.hidden : false))) // TODO(W3-1): resolve ConditionalBooleanValue
    .sort((a, b) => a.order - b.order);
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
  // EF4/EC3-0: subscribe to structureVersion and tabHidden ONLY — a value
  // edit must NOT re-derive tabs/groups (D4 stays intact, per
  // FieldRenderer/useFormField); an addField/removeField bump or a
  // setTabHidden call are the only things that re-run the derivation below.
  useStore(store, (s) => s.structureVersion);
  const tabHidden = useStore(store, (s) => s.tabHidden);

  const fields = liveFields(store.getState().fieldDefs);
  const tabs = deriveTabs(entityForm, fields, tabHidden);
  // if the active tab became hidden, tabs.find(...) misses and this falls
  // back to the first still-visible tab (EC3-0 active-tab-fallback contract).
  const activeTabId = tabs.find((t) => t.id === tabIndex)?.id ?? tabs[0]?.id ?? DEFAULT_TAB_ID;
  const groups = deriveGroups(entityForm, fields, activeTabId);
  const title = entityForm.getTitle();

  // Focus-first-error (a11y gap C): after a failed validateAll(), errors are
  // already committed to the store (form-store.ts validateAll sets
  // fields[name].errors for every field). Find the first invalid field in
  // declaration order and move focus to its input.
  //
  // EB-R1 finding 1: this MUST scan the UNFILTERED field list (all of
  // state.fieldDefs, sorted by order — the same ordering source
  // validateAll() itself uses), not liveFields() (which drops `renderedBy`
  // fields from standalone iteration, EB2 above). A suppressed sibling (e.g.
  // an AddressField's postalCode/address1) still validates on its own store
  // slice and still renders an input carrying id={fieldName} — just via the
  // owning composite's renderer (AddressFieldRenderer) instead of a
  // standalone <FieldRenderer>. Scanning liveFields() here would blind this
  // function to an address-only-invalid form: save stays blocked (validateAll
  // is unaffected by renderedBy) but focus would silently never move. Fields
  // with no element in the DOM (id lookup misses) are simply skipped, so this
  // is safe for any hidden/not-yet-mounted field too.
  function focusFirstInvalidField(): void {
    if (typeof document === 'undefined') return;
    const state = store.getState();
    const invalidFields = Object.values(state.fieldDefs)
      .filter((f) => (state.fields[f.getName()]?.errors?.length ?? 0) > 0)
      .sort((a, b) => a.getOrder() - b.getOrder());
    for (const field of invalidFields) {
      const el = document.getElementById(field.getName());
      if (el) {
        el.focus();
        return;
      }
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
    <div data-entity-form={entityForm.name}>
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
