import { useState } from 'react';
import type { ReactNode } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import type {
  ActionContext,
  EntityField,
  EntityForm,
  FieldGroupDef,
  FormAction,
  FormMutator,
  FormRuntime,
  RenderType,
  Session,
  TabDef,
} from '@listgrid/schema-core';
import {
  extractPermissions,
  getCurrentValue,
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
// field, form-level errors, and a unified action bar (W3-3, spec §3.4/§7):
// built-in Save/Delete derived from capabilities + `addAction` custom actions,
// merged/resolved here. Deliberately minimal — no stepper/sub-collection/
// theme system (that's the 0.3.x surface this replaces, not this V0.4 slice).

/**
 * A `FormSlots` slot value (spec §7) — either a plain ReactNode or a render
 * fn receiving the same {@link ActionContext} an action's `run`/`render`
 * gets (undefined when no `controller` prop was supplied — see
 * `buildActionCtx`). Local to this component (not barrel-exported, W3-3
 * brief Do-NOT — keeps `/schema`'s ceiling untouched).
 */
type SlotRender = ReactNode | ((ctx: ActionContext) => ReactNode);

/** `ViewEntityForm`'s `slots` prop (spec §7) — additive escape hatches for title/header/the action bar. */
export interface FormSlots {
  /** replaces the default `<h2>{title}</h2>`. */
  title?: SlotRender;
  /** rendered after the title, before the tab bar/body — no default content (additive). */
  header?: SlotRender;
  /** replaces the ENTIRE derived action bar (built-ins + custom actions) — full escape hatch. */
  actions?: SlotRender;
}

function resolveSlot(slot: SlotRender | undefined, ctx: ActionContext | undefined): ReactNode {
  if (slot === undefined) return undefined;
  if (typeof slot === 'function') return ctx ? slot(ctx) : undefined;
  return slot;
}

export interface ViewEntityFormProps {
  entityForm: EntityForm;
  store: StoreApi<FormStoreState>;
  /** FormRuntime (spec §6.2; W2-5/W3-3) — powers the built-in Save/Delete +
   *  every `addAction`'s {@link ActionContext}. Without it, only a legacy
   *  Save (validateAll + `onSave`) renders; Delete/custom actions/`render`
   *  slots are omitted (dev warn) — see this task's Needs-Review deviation. */
  controller?: FormRuntime;
  onSave?: (data: Record<string, unknown>) => void | Promise<void>;
  slots?: FormSlots;
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

// ActionContext assembly (spec §3.4; W3-3) — built by the VIEW (L7:
// schema-core only declares the shape, never executes a hook/action). The
// mutator mirrors form-controller.ts's `buildMutator` (@listgrid/state)
// field-by-field rather than importing it: that helper is a closure-private
// const, not part of the FormRuntime/FormStoreState public surface, and
// exporting it just for this call site would be a bigger blast-radius change
// than this task's scope (W3-3 briefing Do-NOT: form-controller.ts untouched).
// This ~15-line duplication is deliberate; a later wave may unify the two.
// Returns undefined when no `controller` was supplied — the built-in Save
// still works via its legacy (validateAll + onSave) path in that case, but
// Delete/custom actions/`render` slots have nothing to call and are omitted
// by the caller (see the W3-3 Needs-Review deviation on this exact gap:
// `ActionContext.controller` is required while the view's `controller` prop
// is optional).
function buildActionCtx(
  store: StoreApi<FormStoreState>,
  entityForm: EntityForm,
  controller: FormRuntime | undefined,
  session: Session | undefined,
): ActionContext | undefined {
  if (!controller) return undefined;
  function snapshotValues(): Record<string, unknown> {
    const s = store.getState();
    const values: Record<string, unknown> = {};
    for (const [name, slice] of Object.entries(s.fields)) {
      values[name] = getCurrentValue(slice, s.renderType);
    }
    return values;
  }
  const mutator: FormMutator = {
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
  return {
    controller,
    mutator,
    values: snapshotValues(),
    ...(session !== undefined ? { session } : {}),
  };
}

export function ViewEntityForm({
  entityForm,
  store,
  controller,
  onSave,
  slots,
}: ViewEntityFormProps) {
  return (
    <FormStoreProvider store={store}>
      <ViewEntityFormInner
        entityForm={entityForm}
        store={store}
        {...(controller !== undefined ? { controller } : {})}
        {...(onSave !== undefined ? { onSave } : {})}
        {...(slots !== undefined ? { slots } : {})}
      />
    </FormStoreProvider>
  );
}

function ViewEntityFormInner({
  entityForm,
  store,
  controller,
  onSave,
  slots,
}: ViewEntityFormProps) {
  const { Button } = useUI();
  const tabIndex = useStore(store, (s) => s.tabIndex);
  const messages = useStore(store, (s) => s.messages);
  // action-in-flight marker (W3-3 briefing Do-NOT: no new form-store slice —
  // this is local view state, not persisted/shared). Replaces the removed
  // store `saving` WRITE (setSaving is no longer called from this view; the
  // store's `saving` slice is form-store's own concern, read-only if ever
  // needed — Save's in-flight indicator is now `runningActionId === 'save'`).
  const [runningActionId, setRunningActionId] = useState<string | undefined>(undefined);
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

  const actionCtx = buildActionCtx(store, entityForm, controller, session);

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

  // Save rewire (W3-3 briefing §설계 결정 2 — deviation: onSave repurpose) —
  // controller present: SINGLE validate happens inside controller.save()
  // (resolves the old double-validate — this view no longer calls
  // validateAll() itself first), onSave becomes a post-save success
  // callback (e.g. host navigation), a11y focus-first-invalid is preserved
  // on the ok:false branch. controller absent: legacy path unchanged
  // (validateAll → onSave(data) as the save transport itself).
  async function runBuiltinSave(): Promise<void> {
    if (controller) {
      const outcome = await controller.save();
      if (outcome.ok) {
        await onSave?.(store.getState().toSaveData());
      } else {
        focusFirstInvalidField();
      }
    } else {
      const valid = await store.getState().validateAll();
      if (valid) {
        await onSave?.(store.getState().toSaveData());
      } else {
        focusFirstInvalidField();
      }
    }
  }

  // Delete (W3-3 briefing §설계 결정 1 — built-in Delete is update-mode-only,
  // controller-required; confirm dialog + E2E is W3-4, not this task).
  async function runBuiltinDelete(ctrl: FormRuntime): Promise<void> {
    await ctrl.delete();
  }

  // --- built-in action synthesis (spec §3.4; CAP-06 capability → visible) ---
  const caps = entityForm.getCapabilities();
  const saveCap = renderType === 'create' ? caps.create : caps.update;
  const saveBuiltin: FormAction = {
    id: 'save',
    label: 'Save',
    variant: 'primary',
    order: 1000,
    ...(saveCap !== undefined ? { visible: saveCap } : {}),
    run: runBuiltinSave,
  };
  const builtins: FormAction[] = [saveBuiltin];
  // Delete built-in is a candidate ONLY in update mode with a controller
  // (W3-3 §설계 결정 1 — group-cap-map:55g "delete NEVER shows in create
  // mode"); its own capability-derived `visible` is still applied below in
  // the shared visible-filter pass, same as every other action.
  if (renderType === 'update' && controller) {
    const ctrl = controller;
    builtins.push({
      id: 'delete',
      label: 'Delete',
      variant: 'danger',
      order: 1010,
      ...(caps.delete !== undefined ? { visible: caps.delete } : {}),
      run: () => runBuiltinDelete(ctrl),
    });
  }

  // --- merge: replaces / id-collision drop, then order-sort (spec §3.4) ---
  const custom = entityForm.getActions();
  const replacedSlots = new Set<string>(
    custom.map((a) => a.replaces).filter((r): r is 'save' | 'delete' => r !== undefined),
  );
  const customIds = new Set(custom.map((a) => a.id));
  const remainingBuiltins = builtins.filter(
    (b) => !replacedSlots.has(b.id) && !customIds.has(b.id),
  );
  const merged = [...remainingBuiltins, ...custom].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // --- visible filter (sync approximation, getStaticConditionalBoolean — W3-1 pattern) ---
  // (W3-3 briefing §설계 결정 6 / Needs-Review) — when `controller` is absent,
  // `actionCtx` is undefined and NO custom action (label+run OR render) can
  // be given one; the built-in Delete candidate was already excluded at
  // synthesis time (only pushed when `controller` is truthy, above), so the
  // only action ever allowed through here is the built-in Save (id 'save'),
  // which still works via its legacy (validateAll + onSave) path. A custom
  // action that `replaces: 'save'` is ALSO omitted in this case (it IS a
  // custom action) — the built-in Save it displaced does not come back, so
  // no Save button renders at all; a deliberate, literal reading of the
  // decision, not an invented carve-out.
  const visibleActions = merged
    .filter((a) =>
      a.visible === undefined ? true : getStaticConditionalBoolean(a.visible, renderType),
    )
    .filter((a) => actionCtx !== undefined || a.id === 'save');

  async function runAction(action: FormAction): Promise<void> {
    setRunningActionId(action.id);
    try {
      // (W3-3 briefing §설계 결정 6 / Needs-Review — controller-optional vs
      // ActionContext.controller: FormRuntime required) — when `controller`
      // is absent, `actionCtx` is undefined and the ONLY action ever
      // reachable here is the built-in Save (every other candidate was
      // already omitted at merge/render time, see `renderAction` below);
      // `runBuiltinSave` ignores its `ctx` argument entirely (it closes
      // over `controller`/`store`/`onSave` directly), so this cast is safe
      // in practice despite the type-level mismatch.
      await action.run?.(actionCtx as ActionContext);
    } finally {
      setRunningActionId(undefined);
    }
  }

  function renderAction(action: FormAction): ReactNode {
    const enabledResolved =
      action.enabled === undefined ? true : getStaticConditionalBoolean(action.enabled, renderType);

    let node: ReactNode;
    if (action.render) {
      if (!actionCtx) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[@listgrid/react] addAction('${action.id}').render needs a controller ` +
              '(ActionContext) — no <ViewEntityForm controller> prop was supplied; skipping.',
          );
        }
        return null;
      }
      node = action.render(actionCtx);
    } else if (action.label === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[@listgrid/react] addAction('${action.id}') has neither 'label' nor 'render' ` +
            '(spec §3.4 requires one) — skipping.',
        );
      }
      return null;
    } else {
      node = (
        <Button
          type="button"
          {...(action.variant !== undefined ? { variant: action.variant } : {})}
          disabled={!enabledResolved || runningActionId === action.id}
          onClick={() => void runAction(action)}
        >
          {action.label}
        </Button>
      );
    }

    return (
      <span key={action.id} className={action.className}>
        {node}
      </span>
    );
  }

  return (
    <div data-entity-form={entityForm.name}>
      {slots?.title !== undefined ? resolveSlot(slots.title, actionCtx) : title && <h2>{title}</h2>}

      {slots?.header !== undefined && resolveSlot(slots.header, actionCtx)}

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

      {slots?.actions !== undefined ? (
        resolveSlot(slots.actions, actionCtx)
      ) : (
        <div data-form-actions="">{visibleActions.map(renderAction)}</div>
      )}
    </div>
  );
}
