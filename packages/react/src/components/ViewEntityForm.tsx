import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import type {
  EntityField,
  EntityForm,
  FieldGroupDef,
  RenderType,
  TabDef,
} from '@listgrid/schema-core';
import {
  extractPermissions,
  getStaticConditionalBoolean,
  isPermitted,
} from '@listgrid/schema-core';
import type { FormStoreState } from '@listgrid/state';
import { useSession } from '../providers/auth';
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
// runtime tabHidden override for the tab id, falling back to the STATIC
// resolution of the declared TabDef.hidden (getStaticConditionalBoolean —
// literal/OptionalBoolean branches only; an async ValuedBoolean resolves to
// `false` here and is re-evaluated per-field at render instead, blueprint
// EG4 sync 근사), falling back to visible. This does NOT filter the tab's
// fields out of `fields` — a hidden tab's fields still render if some OTHER
// visible tab is never made active for them (they simply have no tab to be
// shown under), and still validate (see FormMutator.setTabHidden doc,
// @listgrid/schema-core, for the non-cascading contract).
//
// CAP-02/CAP-03 (W3-1) — additionally gated on the tab's own
// `requiredPermissions` (isPermitted) and on whether the tab has any visible
// content at all (tabHasVisibleContent below — old-engine getViewableTabs/
// getViewableFieldGroups semantics): a tab with zero permitted+visible
// fields across every one of its groups is suppressed even when nothing
// ever declared it `hidden`.
function deriveTabs(
  entityForm: EntityForm,
  fields: EntityField[],
  tabHidden: Record<string, boolean>,
  userPermissions: string[],
  renderType: RenderType,
): TabDef[] {
  const byId = new Map(entityForm.getTabs().map((t) => [t.id, t]));
  let seq = byId.size;
  for (const field of fields) {
    const tabId = field.getTabId() || DEFAULT_TAB_ID;
    if (!byId.has(tabId)) byId.set(tabId, { id: tabId, order: seq++ });
  }
  return [...byId.values()]
    .filter((t) => {
      const hidden = tabHidden[t.id] ?? getStaticConditionalBoolean(t.hidden, renderType);
      if (hidden) return false;
      if (!isPermitted(t.requiredPermissions, userPermissions)) return false; // CAP-02
      return tabHasVisibleContent(entityForm, fields, t.id, userPermissions, renderType); // CAP-03
    })
    .sort((a, b) => a.order - b.order);
}

// CAP-02/CAP-03 (W3-1) — a group is included only when it has fields routed
// to it (existing activeIds check), the group ITSELF is permitted
// (requiredPermissions), and it has at least one visible field
// (groupHasVisibleContent below).
function deriveGroups(
  entityForm: EntityForm,
  fields: EntityField[],
  tabId: string,
  userPermissions: string[],
  renderType: RenderType,
): FieldGroupDef[] {
  const inTab = fields.filter((f) => f.getTabId() === tabId);
  const byId = new Map(entityForm.getFieldGroups(tabId).map((g) => [g.id, g]));
  let seq = byId.size;
  for (const field of inTab) {
    const groupId = field.getFieldGroupId() || DEFAULT_GROUP_ID;
    if (!byId.has(groupId)) byId.set(groupId, { id: groupId, order: seq++ });
  }
  const activeIds = new Set(inTab.map((f) => f.getFieldGroupId() || DEFAULT_GROUP_ID));
  return [...byId.values()]
    .filter(
      (g) =>
        activeIds.has(g.id) &&
        isPermitted(g.requiredPermissions, userPermissions) && // CAP-02
        groupHasVisibleContent(fields, tabId, g.id, userPermissions, renderType), // CAP-03
    )
    .sort((a, b) => a.order - b.order);
}

function deriveGroupFields(fields: EntityField[], tabId: string, groupId: string): EntityField[] {
  return fields.filter(
    (f) => f.getTabId() === tabId && (f.getFieldGroupId() || DEFAULT_GROUP_ID) === groupId,
  );
}

// CAP-03 (W3-1) hasVisibleContent — old-engine semantics (group-capability-
// map:403-406): a field counts as "visible" here iff the session is
// permitted for it AND it isn't STATICALLY hidden (an async-hidden field
// counts as visible at this derivation layer — the render layer,
// FieldRenderer, null-renders it once the real async predicate resolves;
// that per-field truth isn't available synchronously here, blueprint EG4). A
// group is viewable iff it has >=1 such field; a tab is viewable iff it has
// >=1 viewable group — reusing `deriveGroups` directly folds the group
// permission gate into the tab's own viewability the same way the old
// engine's getViewableTabs -> getViewableFieldGroups chain did (DRY).
function fieldIsVisible(
  f: EntityField,
  userPermissions: string[],
  renderType: RenderType,
): boolean {
  return f.isPermitted(userPermissions) && !getStaticConditionalBoolean(f.hidden, renderType);
}

function groupHasVisibleContent(
  fields: EntityField[],
  tabId: string,
  groupId: string,
  userPermissions: string[],
  renderType: RenderType,
): boolean {
  return deriveGroupFields(fields, tabId, groupId).some((f) =>
    fieldIsVisible(f, userPermissions, renderType),
  );
}

function tabHasVisibleContent(
  entityForm: EntityForm,
  fields: EntityField[],
  tabId: string,
  userPermissions: string[],
  renderType: RenderType,
): boolean {
  return deriveGroups(entityForm, fields, tabId, userPermissions, renderType).length > 0;
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
  const messages = useStore(store, (s) => s.messages);
  const saving = useStore(store, (s) => s.saving);
  // EF4/EC3-0: subscribe to structureVersion and tabHidden ONLY — a value
  // edit must NOT re-derive tabs/groups (D4 stays intact, per
  // FieldRenderer/useFormField); an addField/removeField bump or a
  // setTabHidden call are the only things that re-run the derivation below.
  // session (CAP-02/03, W3-1) and renderType are also read here, but neither
  // changes on a value edit (session is per-mount from AuthProvider,
  // renderType is fixed for the store's lifetime), so reading them does not
  // weaken the D4 guarantee.
  useStore(store, (s) => s.structureVersion);
  const tabHidden = useStore(store, (s) => s.tabHidden);
  const session = useSession();
  const userPermissions = extractPermissions(session);
  const renderType = useStore(store, (s) => s.renderType); // FieldRenderer eval-ctx와 동일 소스

  const fields = liveFields(store.getState().fieldDefs);
  const tabs = deriveTabs(entityForm, fields, tabHidden, userPermissions, renderType);
  // if the active tab became hidden, tabs.find(...) misses and this falls
  // back to the first still-visible tab (EC3-0 active-tab-fallback contract).
  const activeTabId = tabs.find((t) => t.id === tabIndex)?.id ?? tabs[0]?.id ?? DEFAULT_TAB_ID;
  const groups = deriveGroups(entityForm, fields, activeTabId, userPermissions, renderType);
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

      {messages.length > 0 && (
        <ul role="alert" data-form-errors="">
          {messages.map((m) => (
            <li key={m.key} data-severity={m.severity}>
              {m.text}
            </li>
          ))}
        </ul>
      )}

      <Button type="button" onClick={() => void handleSave()} disabled={saving}>
        Save
      </Button>
    </div>
  );
}
