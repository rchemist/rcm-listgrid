import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type {
  ActionContext,
  EntityField,
  EntityForm,
  FieldEvalContext,
  FieldGroupDef,
  FormAction,
  FormMutator,
  FormRuntime,
  RenderType,
  Session,
  StepDef,
  TabDef,
} from '@listgrid/schema-core';
import {
  extractPermissions,
  getConditionalBoolean,
  getCurrentValue,
  getStaticConditionalBoolean,
  isPermitted,
} from '@listgrid/schema-core';
import type { FormStoreState } from '@listgrid/state';
import { useSession } from '../providers/auth';
import { useUI } from '../providers/ui';
import { FormStoreProvider, snapshotFieldValues } from '../providers/form-store';
import { FieldRenderer } from './FieldRenderer';
import { getMessages } from '../messages';
import { getLabels } from '../labels';

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

// W3-4 — built-in Delete confirm gate (CAP-08): messages registry showConfirm,
// not a bespoke modal (Do-NOT). A host that never calls configureMessages()
// gets the messages.ts console-fallback (returns false) — delete is a no-op
// until the host wires showConfirm, by design (fail-closed, not fail-open).

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

function FieldGroupPanel({
  group,
  fields,
  saving,
  entityId,
}: {
  group: FieldGroupDef;
  fields: EntityField[];
  saving: boolean;
  entityId?: string | undefined;
}) {
  const collapsible = group.open !== undefined;
  const [open, setOpen] = useState(group.open ?? true);

  return (
    <fieldset className="rcm-fieldgroup" data-field-group={group.id} disabled={saving}>
      {(group.label || collapsible) && (
        <legend className="rcm-fieldgroup-header">
          <span className="rcm-fieldgroup-title">{group.label ?? group.id}</span>
          {collapsible ? (
            <button
              type="button"
              className={`rcm-fieldgroup-collapse${!open ? ' rcm-rotate-180' : ''}`}
              aria-expanded={open}
              aria-controls={`field-group-${group.id}`}
              aria-label={group.label ?? group.id}
              onClick={() => setOpen((value) => !value)}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          ) : null}
        </legend>
      )}
      <div className="rcm-field-grid" id={`field-group-${group.id}`} hidden={collapsible && !open}>
        {fields.map((field) => (
          <FieldRenderer key={field.getName()} field={field} entityId={entityId} />
        ))}
      </div>
    </fieldset>
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

// create-mode wizard (spec §3.2, C6; W4-2) — StepDef.hidden resolution is
// the SAME hybrid pattern as the action bar's visible/enabled (W3-6 Fix#1),
// wired inside the component below (resolveStepHidden): literal/
// OptionalBoolean resolve sync via getStaticConditionalBoolean; a
// function-typed `hidden` resolves ASYNCHRONOUSLY via getConditionalBoolean
// (the `stepFnHidden` state + effect), defaulting to NOT hidden while
// pending. Naively using getStaticConditionalBoolean for the function
// branch (it always returns `false`, regardless of what the function would
// actually decide) is the exact restrictive-gate mis-resolution W3-6 fixed
// for actions' visible/enabled — see this component's `fnFlags` doc above
// for the full writeup; step `hidden` reuses the identical fix shape.

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
    ...(entityForm.getId() !== undefined ? { entityId: entityForm.getId() } : {}),
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
  const labels = getLabels();
  const tabIndex = useStore(store, (s) => s.tabIndex);
  const messages = useStore(store, (s) => s.messages);
  const globalErrors = useStore(store, (s) => s.globalErrors);
  const fieldErrors = useStore(
    store,
    useShallow((s) =>
      Object.fromEntries(Object.entries(s.fields).map(([name, field]) => [name, field.errors])),
    ),
  );
  const saving = useStore(store, (s) => s.saving);
  const [errorSummaryExpanded, setErrorSummaryExpanded] = useState(false);
  // action-in-flight marker covers non-save custom/delete actions. Save also
  // drives the shared store.saving flag from FormController so every field
  // renderer is locked for the full validation + request lifecycle.
  const [runningActionId, setRunningActionId] = useState<string | undefined>(undefined);
  // W3-6 Fix#1 — async-resolved function-conditional (ValuedBoolean)
  // visible/enabled per action id; literal/OptionalBoolean never populate
  // this (they resolve sync in resolveVisible/resolveEnabled below). See the
  // effect further down for how/when it's (re)computed.
  const [fnFlags, setFnFlags] = useState<Record<string, { visible: boolean; enabled: boolean }>>(
    {},
  );
  // latest `merged` (computed below, after builtins/custom are assembled) —
  // read by the resolution effect without making `merged` itself an effect
  // dep (a new array identity every render would otherwise re-run it every
  // render, W3-6 브리프 mergedRef pattern).
  const mergedRef = useRef<FormAction[]>([]);
  // create-mode wizard (spec §3.2, C6; W4-2) — async-resolved function-typed
  // StepDef.hidden, keyed by step id (W3-6 Fix#1 hybrid pattern, same shape
  // as `fnFlags` above); literal/OptionalBoolean never populate this (they
  // resolve sync in `resolveStepHidden` below). Local view state — no new
  // form-store slice.
  const [stepFnHidden, setStepFnHidden] = useState<Record<string, boolean>>({});
  // the wizard's current position, as an INDEX INTO `visibleSteps` (computed
  // below) — local view state (ephemeral UI position, not form data).
  // Clamped to the visible range at render time (`clampedStepIndex` below)
  // rather than reset via an effect, so a step becoming hidden mid-wizard
  // degrades gracefully instead of throwing/blanking.
  const [stepIndex, setStepIndex] = useState(0);
  // latest declared steps (`entityForm.getSteps()` returns a NEW array every
  // call) — read by the async hidden-resolution effect without making it an
  // effect dep (mergedRef precedent immediately above).
  const rawStepsRef = useRef<StepDef[]>([]);
  // EF4/EC3-0: subscribe to structureVersion and tabHidden ONLY — a value
  // edit must NOT re-derive tabs/groups (D4 stays intact, per
  // FieldRenderer/useFormField); an addField/removeField bump or a
  // setTabHidden call are the only things that re-run the derivation below.
  // session (CAP-02/03, W3-1) and renderType are also read here, but neither
  // changes on a value edit (session is per-mount from AuthProvider,
  // renderType is fixed for the store's lifetime), so reading them does not
  // weaken the D4 guarantee. structureVersion doubles as a dep of the W3-6
  // Fix#1 resolution effect below (an addField/removeField that adds/removes
  // a custom action's target field should re-resolve its condition).
  const structureVersion = useStore(store, (s) => s.structureVersion);
  const tabHidden = useStore(store, (s) => s.tabHidden);
  const session = useSession();
  const userPermissions = extractPermissions(session);
  // FieldRenderer eval-ctx와 동일 소스 — deriveTabs/deriveGroups/field hidden
  // 해석 ONLY (W3-6 Fix#3: fetchedData/initialData가 있으면 getId()와 무관하게
  // 'update'로 flip되므로, 액션 바 자체의 CRUD 판단에는 쓰지 않는다— 아래
  // actionRenderType 참조).
  const renderType = useStore(store, (s) => s.renderType);
  // Declared-level form read-only (spec §6.1, CAP-27; W3-5) — hides the
  // built-in Save affordance only. Delete stays capability-governed
  // (formReadOnly does not gate it — spec §6.1 names Save only).
  const formReadOnly = useStore(store, (s) => s.formReadOnly);

  // W3-6 Fix#3 — the action bar's OWN CRUD decisions (saveCap, Delete
  // candidacy, visible/enabled resolution) use the id-based renderType —
  // identical to what form-controller.ts/entityForm.getRenderType() itself
  // branches on — NOT the store's `renderType` above. deriveTabs/deriveGroups
  // intentionally keep using the store's `renderType` (must match
  // FieldRenderer's eval-ctx source for field/tab hidden resolution).
  const actionRenderType = entityForm.getRenderType();

  const actionCtx = buildActionCtx(store, entityForm, controller, session);

  // --- create-mode wizard derivation (spec §3.2, C6; W4-2) ---
  // Gate: declared steps non-empty AND create mode — id-based
  // `actionRenderType` (W3-6 Fix#3 precedent: a create-mode wizard is about
  // whether this is a NEW record, not about whether initialData/fetchedData
  // pre-filled it). Steps undeclared or update mode ⇒ wizardActive is
  // false, and the tab/group rendering below is UNCHANGED (Do-NOT: no
  // regression to the non-wizard path).
  const rawSteps = entityForm.getSteps();
  rawStepsRef.current = rawSteps;
  const wizardActive = actionRenderType === 'create' && rawSteps.length > 0;

  // literal/OptionalBoolean: sync exact (getStaticConditionalBoolean,
  // actionRenderType — Fix#3 precedent). function branch: async
  // stepFnHidden, defaulting to NOT hidden while pending (never
  // hidden-by-default — see the module comment above, W3-6 Fix#1 shape).
  function resolveStepHidden(step: StepDef): boolean {
    if (step.hidden === undefined) return false;
    if (typeof step.hidden === 'function') return stepFnHidden[step.id] ?? false;
    return getStaticConditionalBoolean(step.hidden, actionRenderType);
  }

  const visibleSteps = wizardActive ? rawSteps.filter((s) => !resolveStepHidden(s)) : [];
  const clampedStepIndex = Math.min(stepIndex, Math.max(visibleSteps.length - 1, 0));
  const currentStep = visibleSteps[clampedStepIndex];
  const isLastStep = clampedStepIndex >= visibleSteps.length - 1;

  function goToPrevStep(): void {
    setStepIndex((i) => Math.max(i - 1, 0));
  }
  function goToNextStep(): void {
    setStepIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
  }

  const fields = liveFields(store.getState().fieldDefs);
  const errorSummaryItems = Object.values(store.getState().fieldDefs)
    .sort((a, b) => a.getOrder() - b.getOrder())
    .flatMap((field) => {
      const fieldName = field.getName();
      const definitionLabel = field.getLabel();
      const fieldLabel = typeof definitionLabel === 'string' ? definitionLabel : fieldName;
      return (fieldErrors[fieldName] ?? []).map((error, index) => ({
        key: `${fieldName}:${index}:${error.message}`,
        fieldName,
        fieldLabel,
        message: error.message,
      }));
    });

  function scrollAndFocusErrorField(fieldName: string): boolean {
    if (typeof document === 'undefined') return false;
    const escapedFieldName = fieldName.replace(/["\\]/g, '\\$&');
    const fieldElement = document.querySelector<HTMLElement>(
      `[data-field-name="${escapedFieldName}"]`,
    );
    if (!fieldElement) return false;
    fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    fieldElement
      .querySelector<HTMLElement>(
        'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
      )
      ?.focus();
    return true;
  }

  function retryScrollAndFocusErrorField(fieldName: string, remainingFrames: number): void {
    if (scrollAndFocusErrorField(fieldName) || remainingFrames <= 0) return;
    requestAnimationFrame(() => retryScrollAndFocusErrorField(fieldName, remainingFrames - 1));
  }

  function moveToErrorField(fieldName: string): void {
    if (scrollAndFocusErrorField(fieldName)) return;

    if (wizardActive) {
      const targetStepIndex = visibleSteps.findIndex((step) => step.fields.includes(fieldName));
      if (targetStepIndex === -1 || targetStepIndex === clampedStepIndex) return;
      setStepIndex(targetStepIndex);
      requestAnimationFrame(() => retryScrollAndFocusErrorField(fieldName, 3));
      return;
    }

    const targetField = fields.find((field) => field.getName() === fieldName);
    if (!targetField) return;
    const targetTabId = targetField.getTabId() || DEFAULT_TAB_ID;
    const targetTab = tabs.find((tab) => tab.id === targetTabId);
    if (!targetTab || targetTab.id === activeTabId) return;
    store.getState().setTabIndex(targetTab.id);
    requestAnimationFrame(() => retryScrollAndFocusErrorField(fieldName, 3));
  }
  // the current step's fields ONLY (spec §3.2 — "각 step은 step.fields에
  // 나열된 필드만 표시"), in the same declaration/order-sorted sequence
  // `fields` already carries (deriveGroupFields precedent below — step.fields
  // is a membership set, not a render-order override).
  const stepFields =
    wizardActive && currentStep
      ? fields.filter((f) => currentStep.fields.includes(f.getName()))
      : [];
  const tabs = wizardActive
    ? []
    : deriveTabs(entityForm, fields, tabHidden, userPermissions, renderType);
  // if the active tab became hidden, tabs.find(...) misses and this falls
  // back to the first still-visible tab (EC3-0 active-tab-fallback contract).
  const activeTabId = tabs.find((t) => t.id === tabIndex)?.id ?? tabs[0]?.id ?? DEFAULT_TAB_ID;
  const groups = wizardActive
    ? []
    : deriveGroups(entityForm, fields, activeTabId, userPermissions, renderType);
  // spec §3.1 — getTitle's resolution chain (fromField/name-field steps)
  // reads live field values; pass the store's current snapshot so a
  // fromField/name-driven title reflects fetched/edited data, not just the
  // declared `text`. Read via store.getState() (not a useStore subscription)
  // — same D4-compliant, non-keystroke-reactive posture as `actionCtx` above
  // (title updates on structural re-renders, not every keystroke).
  const title = entityForm.getTitle(snapshotFieldValues(store.getState()));

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

  // W4-6 FIX #1 (phase-end hardening) — wizard Save dead-end: 다음 never
  // validates the step it leaves (spec §3.2), so a required field on a
  // NON-current step can still be invalid when Save's validateAll() runs
  // (both controller.save() and the legacy store.validateAll() validate
  // EVERY declared field, not just the current step's). Only the CURRENT
  // step's fields are mounted (`stepFields` above) — an off-step invalid
  // field has no element in the DOM, so `focusFirstInvalidField`'s
  // `document.getElementById` lookup silently misses: no focus move, no
  // visible error, the user is stuck on the last step with zero feedback.
  // Navigate to the step that OWNS the first invalid field BEFORE focusing,
  // so that field actually mounts and its error renders. No-op when not
  // wizardActive (non-wizard forms: every field is already mounted,
  // unaffected — Do-NOT regress the existing path) or when no invalid
  // field/owning step is found (defensive — should not happen the instant
  // validateAll() has just reported failure).
  function jumpToInvalidStep(): boolean {
    if (!wizardActive) return false;
    const state = store.getState();
    const invalidFields = Object.values(state.fieldDefs)
      .filter((f) => (state.fields[f.getName()]?.errors?.length ?? 0) > 0)
      .sort((a, b) => a.getOrder() - b.getOrder());
    const firstInvalid = invalidFields[0];
    if (!firstInvalid) return false;
    const targetIndex = visibleSteps.findIndex((s) => s.fields.includes(firstInvalid.getName()));
    if (targetIndex !== -1 && targetIndex !== clampedStepIndex) {
      setStepIndex(targetIndex);
      return true;
    }
    return false;
  }

  function restoreInvalidFieldFocus(): void {
    if (jumpToInvalidStep()) {
      requestAnimationFrame(focusFirstInvalidField);
      return;
    }
    focusFirstInvalidField();
  }

  // Save rewire (W3-3 briefing §설계 결정 2 — deviation: onSave repurpose) —
  // controller present: SINGLE validate happens inside controller.save()
  // (resolves the old double-validate — this view no longer calls
  // validateAll() itself first), onSave becomes a post-save success
  // callback (e.g. host navigation), a11y focus-first-invalid is preserved
  // on the ok:false branch. controller absent: legacy path unchanged
  // (validateAll → onSave(data) as the save transport itself). W4-6 FIX #1
  // — restoreInvalidFieldFocus() moves to an off-step invalid field and waits
  // one animation frame for that field to mount before focusing it. An
  // invalid field already on the current step is focused synchronously.
  async function runBuiltinSave(): Promise<void> {
    if (controller) {
      const outcome = await controller.save();
      if (outcome.ok) {
        await onSave?.(store.getState().toSaveData());
      } else {
        restoreInvalidFieldFocus();
      }
    } else {
      const valid = await store.getState().validateAll();
      if (valid) {
        await onSave?.(store.getState().toSaveData());
      } else {
        restoreInvalidFieldFocus();
      }
    }
  }

  // Delete (W3-3 briefing §설계 결정 1 — built-in Delete is update-mode-only,
  // controller-required). W3-4 §설계 결정 1/2: confirm gate via the messages
  // registry (showConfirm) — cancel is a no-op (controller.delete is never
  // called, no message emitted); confirm proceeds to controller.delete().
  async function runBuiltinDelete(ctrl: FormRuntime): Promise<void> {
    const confirmed = await getMessages().showConfirm(labels.deleteConfirm);
    if (!confirmed) return;
    await ctrl.delete();
  }

  // --- built-in action synthesis (spec §3.4; CAP-06 capability → visible) ---
  const caps = entityForm.getCapabilities();
  // W3-6 Fix#3 — id-based actionRenderType (was store's renderType, which
  // flips to 'update' on fetchedData/initialData regardless of getId()).
  const saveCap = actionRenderType === 'create' ? caps.create : caps.update;
  const saveBuiltin: FormAction = {
    id: 'save',
    label: labels.save,
    variant: 'primary',
    order: 1000,
    ...(saveCap !== undefined ? { visible: saveCap } : {}),
    run: runBuiltinSave,
  };
  // formReadOnly excludes the Save candidate entirely (spec §6.1 — Save
  // ONLY; Delete is unaffected, see the builtins.push below).
  const builtins: FormAction[] = formReadOnly ? [] : [saveBuiltin];
  // Delete built-in is a candidate ONLY in update mode (id-based, W3-6
  // Fix#3 — getId() !== undefined) with a controller (W3-3 §설계 결정 1 —
  // group-cap-map:55g "delete NEVER shows in create mode"); its own
  // capability-derived `visible` is still applied below in the shared
  // visible-filter pass, same as every other action.
  if (actionRenderType === 'update' && controller) {
    const ctrl = controller;
    builtins.push({
      id: 'delete',
      label: labels.delete,
      variant: 'danger',
      order: 1010,
      ...(caps.delete !== undefined ? { visible: caps.delete } : {}),
      run: () => runBuiltinDelete(ctrl),
    });
  }

  // --- merge: replaces / id-collision drop, then order-sort (spec §3.4) ---
  // #W3-5b (D2, spec §3.1, 2026-07-12) — formReadOnly hides the Save
  // AFFORDANCE, not merely the built-in: a custom action that `replaces: 'save'`
  // occupies that same Save slot, so a read-only form must drop it too
  // (otherwise a custom save-slot button renders on a form declared read-only —
  // defeating withReadOnly). `replaces: 'delete'` and plain custom actions are
  // unaffected — formReadOnly gates the Save affordance ONLY (spec §6.1).
  const custom = formReadOnly
    ? entityForm.getActions().filter((a) => a.replaces !== 'save')
    : entityForm.getActions();
  const replacedSlots = new Set<string>(
    custom.map((a) => a.replaces).filter((r): r is 'save' | 'delete' => r !== undefined),
  );
  const customIds = new Set(custom.map((a) => a.id));
  const remainingBuiltins = builtins.filter(
    (b) => !replacedSlots.has(b.id) && !customIds.has(b.id),
  );
  const merged = [...remainingBuiltins, ...custom].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  mergedRef.current = merged;

  // W3-6 Fix#1 — function-conditional (ValuedBoolean) `visible`/`enabled`
  // resolved ASYNCHRONOUSLY, mirroring FieldRenderer's async-predicate
  // pattern. getStaticConditionalBoolean's function branch always returns
  // `false` (conditional.ts — correct polarity for HIDDEN's
  // permissive-false default, WRONG for visible/enabled/capability's
  // restrictive-false default): a function-typed visible/enabled/capability
  // action was ALWAYS hidden/disabled, for every user — including ones the
  // predicate should have permitted (the controller, which gates the same
  // condition via async getConditionalBoolean, would still have let the
  // action run — "button hidden, action still works" — the bug this fixes).
  // Literal/OptionalBoolean stay on the sync getStaticConditionalBoolean
  // path (resolveVisible/resolveEnabled below) — unchanged, no flash, no
  // regression; ONLY the function branch is deferred to this effect,
  // defaulting to visible+enabled while pending (never hidden-by-default,
  // FieldRenderer precedent).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const s = store.getState();
      const evalCtx: FieldEvalContext = {
        ...(entityForm.getId() !== undefined ? { entityId: entityForm.getId() } : {}),
        renderType: actionRenderType, // id-based — matches controller (Fix#3)
        values: snapshotFieldValues(s),
        ...(session !== undefined ? { session } : {}),
      };
      const next: Record<string, { visible: boolean; enabled: boolean }> = {};
      for (const a of mergedRef.current) {
        if (typeof a.visible === 'function' || typeof a.enabled === 'function') {
          next[a.id] = {
            visible:
              typeof a.visible === 'function'
                ? await getConditionalBoolean(evalCtx, a.visible)
                : true,
            enabled:
              typeof a.enabled === 'function'
                ? await getConditionalBoolean(evalCtx, a.enabled)
                : true,
          };
        }
      }
      if (!cancelled) setFnFlags(next);
    })();
    return () => {
      cancelled = true;
    };
    // Value-dependent conditions resolve off a SNAPSHOT (D4 — not a
    // keystroke-reactive whole-store subscription; documented limitation,
    // W3-6 브리프). Re-resolves on structural/renderType/session/
    // capability/formReadOnly/controller changes only.
  }, [store, session, entityForm, formReadOnly, controller, structureVersion, actionRenderType]);

  // create-mode wizard (spec §3.2, C6; W4-2) — function-typed StepDef.hidden
  // resolved ASYNCHRONOUSLY, identical shape to the W3-6 Fix#1 effect above
  // (this is the SAME restrictive-gate mis-resolution class: naively
  // resolving a function-typed `hidden` via getStaticConditionalBoolean
  // always returns `false`, i.e. never the function's real answer — Do-NOT
  // reach for that sync helper here). Literal/OptionalBoolean stay on the
  // sync path (`resolveStepHidden` above) — unchanged, no flash. Skipped
  // entirely when the wizard isn't active (no steps declared / update mode).
  useEffect(() => {
    if (!wizardActive) return;
    const functionSteps = rawStepsRef.current.filter((s) => typeof s.hidden === 'function');
    if (functionSteps.length === 0) return;
    let cancelled = false;
    void (async () => {
      const s = store.getState();
      const evalCtx: FieldEvalContext = {
        ...(entityForm.getId() !== undefined ? { entityId: entityForm.getId() } : {}),
        renderType: actionRenderType, // id-based — matches the action bar (Fix#3)
        values: snapshotFieldValues(s),
        ...(session !== undefined ? { session } : {}),
      };
      const next: Record<string, boolean> = {};
      for (const step of functionSteps) {
        next[step.id] = await getConditionalBoolean(evalCtx, step.hidden);
      }
      if (!cancelled) setStepFnHidden((prev) => ({ ...prev, ...next }));
    })();
    return () => {
      cancelled = true;
    };
    // Same D4-compliant snapshot posture as the Fix#1 effect above.
    // Re-resolves on structural/renderType/session changes + wizardActive
    // itself (a form that flips out of create mode / loses its steps stops
    // re-resolving).
  }, [store, session, entityForm, structureVersion, actionRenderType, wizardActive]);

  // literal/OptionalBoolean: sync exact (getStaticConditionalBoolean, W3-1
  // pattern, actionRenderType — Fix#3). function branch: async fnFlags,
  // default show/enabled while pending (Fix#1).
  function resolveVisible(a: FormAction): boolean {
    if (a.visible === undefined) return true;
    if (typeof a.visible === 'function') return fnFlags[a.id]?.visible ?? true;
    return getStaticConditionalBoolean(a.visible, actionRenderType);
  }
  function resolveEnabled(a: FormAction): boolean {
    if (a.enabled === undefined) return true;
    if (typeof a.enabled === 'function') return fnFlags[a.id]?.enabled ?? true;
    return getStaticConditionalBoolean(a.enabled, actionRenderType);
  }

  // --- visible filter (W3-1 sync-approximation pattern + W3-6 Fix#1 async function branch) ---
  // (W3-3 briefing §설계 결정 6 / Needs-Review) — when `controller` is absent,
  // NO custom action (label+run OR render) can be given an ActionContext;
  // the built-in Delete candidate was already excluded at synthesis time
  // (only pushed when `controller` is truthy, above), so the only action
  // ever allowed through here is the built-in Save ITSELF — identity-
  // checked (`a === saveBuiltin`, W3-6 Fix#4), not `a.id === 'save'` (a
  // CUSTOM action reusing id 'save' would otherwise pass this filter too,
  // then crash at click time — runAction below assumes id 'save' implies
  // the built-in's `run`, which ignores `ctx` entirely; a same-id custom
  // action's own `run` would receive `ctx=undefined` unguarded). It still
  // works via its legacy (validateAll + onSave) path. A custom action that
  // `replaces: 'save'` is ALSO omitted in this case (it IS a custom
  // action) — the built-in Save it displaced does not come back, so no
  // Save button renders at all; a deliberate, literal reading of the
  // decision, not an invented carve-out.
  const visibleActions = merged
    .filter((a) => resolveVisible(a))
    .filter((a) => controller !== undefined || a === saveBuiltin);

  async function runAction(action: FormAction): Promise<void> {
    setRunningActionId(action.id);
    try {
      // W3-6 Fix#2 — a FRESH ActionContext built at CLICK time, not the
      // render-time `actionCtx` closed over above: D4 (FieldRenderer/
      // useFormField field-level subscription) means a keystroke in a
      // field does NOT re-render ViewEntityFormInner, so a render-time
      // actionCtx captured before the keystroke would hand a custom
      // action's `run` STALE `values` (e.g. `ctx.values.name` reading
      // `undefined` after the user typed into `name`, because the ctx was
      // built before the keystroke). Building it here reads
      // store.getState() at the moment of the click, guaranteeing current
      // values regardless of whether the component re-rendered since.
      //
      // (W3-3 briefing §설계 결정 6 / Needs-Review — controller-optional vs
      // ActionContext.controller: FormRuntime required) — when `controller`
      // is absent, `ctx` is undefined and the ONLY action ever reachable
      // here is the built-in Save (every other candidate is excluded by
      // the identity filter above, Fix#4); `runBuiltinSave` ignores its
      // `ctx` argument entirely (it closes over `controller`/`store`/
      // `onSave` directly), so this cast is safe in practice despite the
      // type-level mismatch.
      const ctx = buildActionCtx(store, entityForm, controller, session);
      await action.run?.(ctx as ActionContext);
    } finally {
      setRunningActionId(undefined);
    }
  }

  function renderAction(action: FormAction): ReactNode {
    // W3-6 Fix#1 — same resolveEnabled as the visible filter above (literal
    // sync-exact / function async fnFlags).
    const enabledResolved = resolveEnabled(action);

    const actionDisabled = !enabledResolved || runningActionId !== undefined || saving;
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
      if (actionDisabled && isValidElement(node)) {
        node = cloneElement(
          node as ReactElement<{ disabled?: boolean; 'aria-disabled'?: boolean }>,
          { disabled: true, 'aria-disabled': true },
        );
      }
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
          disabled={actionDisabled}
          onClick={() => void runAction(action)}
        >
          {action.label}
        </Button>
      );
    }

    return (
      <span
        key={action.id}
        className={action.className}
        aria-disabled={actionDisabled || undefined}
        inert={actionDisabled ? true : undefined}
      >
        {node}
      </span>
    );
  }

  return (
    <div data-entity-form={entityForm.name}>
      {slots?.title !== undefined ? resolveSlot(slots.title, actionCtx) : title && <h2>{title}</h2>}

      {slots?.header !== undefined && resolveSlot(slots.header, actionCtx)}

      {errorSummaryItems.length > 0 && (
        <div
          className="rcm-error-summary"
          data-error-summary
          data-expanded={errorSummaryExpanded ? '' : undefined}
        >
          <button
            type="button"
            className="rcm-error-summary-toggle"
            data-error-summary-toggle
            aria-expanded={errorSummaryExpanded}
            onClick={() => setErrorSummaryExpanded((expanded) => !expanded)}
          >
            <span className="rcm-error-summary-title" data-error-summary-title>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 3 2.5 20h19L12 3Z" />
                <path d="M12 9v5m0 3h.01" />
              </svg>
              {errorSummaryExpanded
                ? labels.errorSummaryExpandedTitle
                : labels.errorSummaryCollapsedTitle}
            </span>
            <span className="rcm-error-summary-count" data-error-summary-count>
              {labels.errorSummaryCount(errorSummaryItems.length)}
            </span>
          </button>
          {errorSummaryExpanded && (
            <ul className="rcm-error-summary-list" data-error-summary-list>
              {errorSummaryItems.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className="rcm-error-summary-item"
                    data-error-summary-item
                    data-field={item.fieldName}
                    onClick={() => moveToErrorField(item.fieldName)}
                  >
                    {item.fieldLabel}: {item.message}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tabs.length > 1 && (
        <div role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === activeTabId}
              disabled={saving || tab.id === activeTabId}
              onClick={() => store.getState().setTabIndex(tab.id)}
            >
              {tab.label ?? tab.id}
            </button>
          ))}
        </div>
      )}

      {groups.map((group) => (
        <FieldGroupPanel
          key={group.id}
          group={group}
          fields={deriveGroupFields(fields, activeTabId, group.id)}
          saving={saving}
          entityId={entityForm.getId()}
        />
      ))}

      {/* create-mode wizard (spec §3.2, C6; W4-2) — replaces the tab bar/groups
          above (both derive to [] when wizardActive, so nothing else renders
          there) with a step indicator + the CURRENT step's fields only. */}
      {wizardActive && (
        <div role="list" data-steps-indicator="" aria-label="steps">
          {visibleSteps.map((step, i) => (
            <span
              key={step.id}
              role="listitem"
              data-step-indicator={step.id}
              aria-current={i === clampedStepIndex ? 'step' : undefined}
            >
              {i + 1}. {step.label}
            </span>
          ))}
        </div>
      )}

      {wizardActive && currentStep && (
        <fieldset key={currentStep.id} data-step={currentStep.id} disabled={saving}>
          <legend>{currentStep.label}</legend>
          {currentStep.description && <p>{currentStep.description}</p>}
          {stepFields.map((field) => (
            <FieldRenderer key={field.getName()} field={field} entityId={entityForm.getId()} />
          ))}
        </fieldset>
      )}

      {messages.length > 0 && (
        <ul role="alert" data-form-errors="">
          {messages.map((m) => (
            <li key={m.key} data-severity={m.severity}>
              {m.text}
            </li>
          ))}
        </ul>
      )}

      {globalErrors.length > 0 && (
        <ul role="alert" data-global-errors="">
          {globalErrors.map((message, index) => (
            <li key={`${index}:${message}`}>{message}</li>
          ))}
        </ul>
      )}

      {slots?.actions !== undefined ? (
        resolveSlot(slots.actions, actionCtx)
      ) : wizardActive && !isLastStep ? (
        // non-last wizard step: prev/next navigation ONLY — no Save/Delete/
        // custom actions (spec §3.2 — "마지막 step에서 기존 Save 어포던스").
        <div data-form-actions="" data-wizard-nav="">
          {clampedStepIndex > 0 && (
            <Button type="button" onClick={goToPrevStep} disabled={saving}>
              이전
            </Button>
          )}
          <Button type="button" onClick={goToNextStep} disabled={saving}>
            다음
          </Button>
        </div>
      ) : (
        // non-wizard tabs/groups OR the wizard's LAST step: the existing
        // action bar (Save/Delete/custom) — plus a wizard "이전" affordance
        // when this IS the wizard's last step and there's somewhere to go
        // back to (minimal, non-invented nav — Do-NOT: no step-level
        // validation gating).
        <div data-form-actions="">
          {wizardActive && clampedStepIndex > 0 && (
            <Button type="button" onClick={goToPrevStep} disabled={saving}>
              이전
            </Button>
          )}
          {visibleActions.map(renderAction)}
        </div>
      )}
    </div>
  );
}
