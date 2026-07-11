import type { ReactNode } from 'react';
import type { Session } from './auth';
import type { ConditionalBooleanValue } from './field/conditional';
import type { EntityField } from './field/entity-field';
import type { FieldMetaOverride } from './field/field-meta';
import type { ChangeHandler, FormMutator } from './field/form-mutator';
import type { RenderType } from './field/types';
import type { FormRuntime } from './form-runtime';
import type { SearchForm } from './search/search-form';

/**
 * The context object passed to an {@link InitHandler} (`onInit`, spec §4.1;
 * W2-1). Consolidates the former separate EF3 `OnFetchDataHandler`
 * (`(entityForm, data) => EntityForm`) and `OnInitializeHandler`
 * (`(entityForm, session?) => EntityForm`) arrays into one — a handler
 * branches on {@link data}'s presence itself instead of the engine
 * dispatching two separate passes (spec §4.2). Constructed by
 * initializeFormStore (@listgrid/state) AFTER BIND and BEFORE the store is
 * built (spec §4.2) — {@link form}'s field instances already carry the bound
 * fetched record (if any) by the time the first handler sees them. The SAME
 * ctx instance (closed over the same `form`) is reused across every
 * registered handler in a run.
 */
export interface InitContext {
  /**
   * The draft EntityForm clone — structural changes (`addFields`/
   * `withoutField`/`withTab`/`withGroup`/etc.) are valid here (spec §5.2:
   * FormField builders mutate in place + `return this`, so no
   * re-registration is needed). A handler mutates this IN PLACE; `onInit`
   * does NOT support the old onFetchData/onInitialize "return a replacement
   * EntityForm" pattern — an old handler that used to
   * `return ef.clone().withTitle('X')` becomes an in-place
   * `ctx.form.withTitle('X')` (spec §9 migration table).
   */
  form: EntityForm;
  /**
   * The fetched/provided payload — present in update mode (a record was
   * loaded via the adapter or given via `initialData`), absent in create
   * mode. Branch on this to replicate the old onFetchData-only-with-data
   * gating (spec §4.2): `if (ctx.data) { ... }`.
   */
  data?: Record<string, unknown> | undefined;
  /** Value read/override surface (EF7) — operates on {@link form}'s field instances. */
  values: {
    /**
     * The field's current draft value (post-BIND, mid-hook — reflects any
     * earlier handler's `set`/`setFetched` call in this same run). Equivalent
     * to reading `ctx.form.getField(name)?.value?.current` directly.
     */
    get(name: string): unknown;
    /**
     * Hook override (EF7) — UNCONDITIONALLY overwrites field `name`'s
     * current value. This is the override primitive: calling this AFTER
     * BIND has bound the fetched record onto {@link form} wins over that
     * fetched value (precedence: hook `set` > fetched record > declared
     * default — 0.3.x parity, the old engine ran onInitialize AFTER
     * setFetchedValues for exactly this reason, EntityForm.tsx:181,257).
     * Never touches `fetched`, so a subsequent `reset()` still falls back to
     * the record's original value. No-op if `name` names no declared field.
     */
    set(name: string, value: unknown): void;
    /**
     * Corrects the dirty baseline (EF7) — writes field `name`'s `fetched`
     * value. Also sets `current`, but ONLY when `current` is not already set
     * (a declared `withValue`/an earlier `values.set` call on this field
     * wins) — mirrors the old engine's EntityForm.tsx:135-152
     * `setFetchedValue` verbatim. No-op if `name` names no declared field.
     */
    setFetched(name: string, value: unknown): void;
  };
  /**
   * Shallow-merges `patch` into field `name`'s meta override — the canonical
   * path for hidden/required/readOnly/options toggles inside `onInit` (spec
   * §4.1). Seeds the form store's initial meta override (same contract as
   * `FormMutator.setMeta`, EF1; `createFormStore`'s new `initialMeta` option,
   * @listgrid/state) — does NOT touch {@link form}'s field declarations (for
   * that, mutate {@link form} directly, e.g. `ctx.form.getField('x')
   * ?.withHidden(true)`, spec §5.2).
   */
  setMeta(name: string, patch: FieldMetaOverride): void;
  session?: Session | undefined;
  /**
   * create vs update — id-based, identical to {@link EntityForm.getRenderType}
   * ('update' iff an id is set, spec §3.1). Independent of {@link data}: a
   * create form may carry `data` via `initialData` (prefill/template), so
   * branch on `ctx.data` for "data present", on `renderType` for create/update.
   */
  renderType: RenderType;
}

/**
 * Consolidated init/fetch lifecycle hook (spec §3.3/§4.1; W2-1) — successor
 * to the separate EF3 `OnFetchDataHandler`/`OnInitializeHandler` arrays.
 * Dispatched by initializeFormStore (@listgrid/state), sequentially, in
 * registration order, ALWAYS (create mode too — 0.3.x onInitialize parity,
 * EntityForm.tsx:259-264); a throwing handler is logged and skipped,
 * remaining handlers still run (spec §4.2). Does NOT re-fire after save.
 * Returns void — mutate {@link InitContext.form}/`values`/`setMeta` in
 * place; there is no "return a replacement EntityForm" escape hatch (see
 * {@link InitContext.form} doc).
 */
export type InitHandler = (ctx: InitContext) => void | Promise<void>;

/**
 * Context passed to a {@link BeforeSaveHandler} (`onBeforeSave`, spec
 * §4.1/§6.2; W2-5). Dispatched by `createFormController.save`
 * (@listgrid/state/form-controller.ts), sequentially in registration order,
 * AFTER `toSaveData()` has built the mechanical payload and BEFORE the
 * adapter create/update call (spec §6.2 canonical save flow). Successor to
 * the EF6 `SubmitTransformHandler`/`withSubmitTransform` (single-slot, pure
 * data-in/data-out) — this hook is a LIST (EF2/onInit-style append, not a
 * replace-slot) and additionally carries a cancel escape hatch the old
 * single pure transform never had.
 */
export interface BeforeSaveContext {
  /**
   * The save payload as of THIS handler's turn — starts as `toSaveData()`'s
   * output, then reflects any earlier handler's `setData` call in this same
   * run (handlers compose, not overwrite from scratch).
   */
  data: Record<string, unknown>;
  /** Replace {@link data} for every handler after this one AND the eventual adapter call. */
  setData(next: Record<string, unknown>): void;
  /** Read-only snapshot of every field's current value (post-validate, pre-serialize — NOT the same shape as {@link data}, which is already serialized/flattened). */
  values: Readonly<Record<string, unknown>>;
  /** create vs update (spec §3.1), identical to `EntityForm.getRenderType()`. */
  renderType: RenderType;
  session?: Session | undefined;
  /**
   * Stops the save flow: no adapter call is made, no further onBeforeSave
   * handlers run, and `createFormController.save` resolves
   * `{ ok: false, reason: 'cancelled', cancelled: reason }` (a reason-less
   * `cancel()` still resolves `reason: 'cancelled'` — D2 #W2-5). `reason`, if
   * given, is also pushed to the store's message banner (`severity: 'info'`,
   * spec §6.2). Distinct from a THROWN error — a handler that throws is logged
   * and SKIPPED (spec §4.2), the flow continues; only an explicit `cancel()`
   * call stops it.
   */
  cancel(reason?: string): void;
}

/**
 * Context passed to an {@link AfterSaveHandler} (`onAfterSave`, spec
 * §4.1/§6.2; W2-5) — dispatched ONLY after a successful adapter create/update
 * call, sequentially, after the store's non-persistent messages have already
 * been cleared (spec §6.2 "clear-on-success" step runs BEFORE onAfterSave).
 */
export interface AfterSaveContext {
  /** the entity the adapter's create/update call returned. */
  result: unknown;
  /** the final save payload actually sent (post every onBeforeSave `setData`). */
  data: Record<string, unknown>;
  renderType: RenderType;
  session?: Session | undefined;
  /** store-backed mutation surface (EF2 parity) — e.g. to seed the newly-created record's id/values back onto the form. */
  mutator: FormMutator;
}

/**
 * Context passed to a {@link BeforeDeleteHandler} (`onBeforeDelete`, spec
 * §4.1/§6.2; W2-5) — dispatched sequentially, before `adapter.remove`. Same
 * cancel/throw contract as {@link BeforeSaveContext.cancel}.
 */
export interface BeforeDeleteContext {
  /** the ids about to be deleted (`opts.ids` if given, else `[entityForm.getId()]`). */
  ids: string[];
  session?: Session | undefined;
  cancel(reason?: string): void;
}

/**
 * Context passed to an {@link AfterDeleteHandler} (`onAfterDelete`, spec
 * §4.1/§6.2; W2-5) — dispatched ONLY after a successful `adapter.remove` call.
 */
export interface AfterDeleteContext {
  ids: string[];
  session?: Session | undefined;
}

/** Save-lifecycle hook (spec §4.1/§6.2; W2-5). See {@link BeforeSaveContext}. */
export type BeforeSaveHandler = (ctx: BeforeSaveContext) => void | Promise<void>;
/** Save-lifecycle hook, success only (spec §4.1/§6.2; W2-5). See {@link AfterSaveContext}. */
export type AfterSaveHandler = (ctx: AfterSaveContext) => void | Promise<void>;
/** Delete-lifecycle hook (spec §4.1/§6.2; W2-5). See {@link BeforeDeleteContext}. */
export type BeforeDeleteHandler = (ctx: BeforeDeleteContext) => void | Promise<void>;
/** Delete-lifecycle hook, success only (spec §4.1/§6.2; W2-5). See {@link AfterDeleteContext}. */
export type AfterDeleteHandler = (ctx: AfterDeleteContext) => void | Promise<void>;

/**
 * Context passed to a {@link BeforeListFetchHandler} (`onBeforeListFetch`,
 * spec §4.1; W2-6) — dispatched by `createListStore`'s `fetch()`
 * (@listgrid/state/list-store.ts), sequentially in registration order,
 * BEFORE `adapter.list` is called. {@link setSearchForm} is the REAL
 * injection path (spec §4.1) — `fetch()` sends the LAST
 * `setSearchForm`-set instance to the adapter; the injection is scoped to
 * THIS fetch call only and is never written back onto the store's own
 * `searchForm` (spec §4.2 — an injected filter must not become sticky
 * across a later pagination/sort/quick-search refetch).
 */
export interface BeforeListFetchContext {
  /**
   * The search state as of THIS handler's turn — starts as the store's
   * current `searchForm`, then reflects any earlier handler's
   * {@link setSearchForm} call in this same run (handlers compose, not
   * overwrite from scratch). Immutable — every SearchForm builder
   * (`addAndFilter`/`withSort`/etc.) returns a NEW instance; mutate via
   * {@link setSearchForm}, never in place.
   */
  searchForm: SearchForm;
  /**
   * The REAL injection path (spec §4.1) — replaces {@link searchForm} for
   * every handler after this one AND the eventual `adapter.list` call.
   */
  setSearchForm(next: SearchForm): void;
  session?: Session | undefined;
}

/**
 * Context passed to an {@link AfterListFetchHandler} (`onAfterListFetch`,
 * spec §4.1; W2-6) — dispatched by `createListStore`'s `fetch()`,
 * sequentially in registration order, AFTER a successful `adapter.list`
 * call and BEFORE the store's own `postFetch` transform (EA-D2-0) runs.
 */
export interface AfterListFetchContext {
  /**
   * The fetched page's rows as of THIS handler's turn — starts as
   * `page.content`, then reflects any earlier handler's {@link setRows}
   * call in this same run.
   */
  rows: unknown[];
  totalElements: number;
  /** Replace {@link rows} for every handler after this one AND the store's `postFetch` input. */
  setRows(rows: unknown[]): void;
  session?: Session | undefined;
}

/** List-fetch lifecycle hook (spec §4.1; W2-6). See {@link BeforeListFetchContext}. */
export type BeforeListFetchHandler = (ctx: BeforeListFetchContext) => void | Promise<void>;
/** List-fetch lifecycle hook, success only (spec §4.1; W2-6). See {@link AfterListFetchContext}. */
export type AfterListFetchHandler = (ctx: AfterListFetchContext) => void | Promise<void>;

// EntityForm — the single declaration from which BOTH the list and the form
// screens derive (charter C1). React-free: it is the declaration + query model;
// the RUNTIME value state lives in the form store (ADR-0002 §Decision 5 — the
// class's runtime-state role moves to the store). Successor to the 0.3.x
// src/listgrid/config/EntityForm.tsx, reduced to declaration + structure.

export interface FieldGroupDef {
  id: string;
  label?: string;
  order: number;
  /** initial expand/collapse state for a collapsible group panel (spec §3.2). */
  open?: boolean;
  /** tab/group permission gate (EG3) — consumption is W3-1, not this task. */
  requiredPermissions?: string[] | undefined;
}

export interface TabDef {
  id: string;
  label?: string;
  order: number;
  /**
   * Declared-level tab-hidden (EC3-0). When true, the tab bar BUTTON for
   * this tab is suppressed (0.3.x getViewableTabs parity — old engine's
   * withHidden({type:'TAB', ...})). Does NOT cascade to field-level
   * `hidden` meta on the tab's fields — unlike the 0.3.x dual write
   * (EntityForm.tsx:349-353/413-428), the new engine keeps validation
   * running for fields in a hidden tab unless the form author ALSO calls
   * setMeta(name, { hidden: true }) on them (see the FormMutator runtime
   * tab-hidden setter's doc for the full contract). Read at store-build time
   * as the seed for FormStoreState.tabHidden; a runtime override
   * (EntityForm.withTab({hidden}) pre-store, or the mutator/store's runtime
   * tab-hidden setter post-store) wins over this declared value. Conditional
   * (C2, spec §3.2) — resolution of a non-boolean ConditionalBooleanValue is
   * W3-1's scope.
   */
  hidden?: ConditionalBooleanValue;
  /** tab/group permission gate (EG3) — consumption is W3-1, not this task. */
  requiredPermissions?: string[] | undefined;
}

/** `addFields` tab placement input (spec §3.2). */
export interface TabInput {
  id: string;
  label?: string;
  order?: number;
  hidden?: boolean;
  /** type-only slot — consumption is W3-1, not this task. */
  requiredPermissions?: string[] | undefined;
}

/**
 * Declared create-mode wizard step (spec §3.2, C6; W4-2) — `withSteps`/
 * `getSteps`. Distinct from {@link TabDef}: a step groups fields by NAME
 * reference (`fields`) instead of each field declaring its own tabId — the
 * wizard is an independent, additive create-mode rendering mode (spec §3.2),
 * not a replacement for the tab/group model (update mode keeps rendering
 * tabs/groups even when steps are declared, `@listgrid/react`'s
 * ViewEntityForm, W4-2). `hidden` reuses {@link ConditionalBooleanValue}
 * (CAP-10, L5 — no new conditional type is introduced for this); resolving a
 * non-boolean value needs a {@link FieldEvalContext} this pure declaration
 * layer doesn't have, so that's the render layer's job, same posture as
 * `TabDef.hidden`.
 */
export interface StepDef {
  id: string;
  label: string;
  order?: number | undefined;
  fields: string[];
  description?: string | undefined;
  hidden?: ConditionalBooleanValue | undefined;
}

/**
 * Deep-copy a StepDef, INCLUDING its `fields` array (spec §3.2; W4-2) — the
 * copy shares no mutable structure with the input, so a caller mutating the
 * array/objects it passed to `withSteps` after the call (or mutating what
 * `getSteps()`/`clone()` handed back) can never reach into this instance's
 * storage. Every optional key is assigned unconditionally (both StepDef and
 * this fn's return type declare `| undefined` explicitly — no
 * exactOptionalPropertyTypes conditional-spread dance needed, Capabilities/
 * FormAction precedent).
 */
function cloneStepDef(step: StepDef): StepDef {
  return {
    id: step.id,
    label: step.label,
    order: step.order,
    fields: [...step.fields],
    description: step.description,
    hidden: step.hidden,
  };
}

/**
 * CRUD capability declaration (spec §3.4, CAP-06/CAP-22) — successor to the
 * 0.3.x `withNeverDelete` (a single delete-only inert flag). Each key
 * defaults to allowed when omitted (`undefined` = true, spec §3.4 "기본 전부
 * true"); a declared {@link ConditionalBooleanValue} is resolved by the
 * engine (controller for the save/delete execution gate — async, view for
 * button-visibility affordance — sync approximation, W3-1 pattern).
 * `withCapabilities({ delete: false })` is the honest replacement for
 * `withNeverDelete()` (CAP-22).
 */
export interface Capabilities {
  create?: ConditionalBooleanValue | undefined;
  update?: ConditionalBooleanValue | undefined;
  delete?: ConditionalBooleanValue | undefined;
}

/**
 * Declared custom form action (spec §3.4, CAP-09; W3-3) — the sole way to add
 * a button to the ViewEntityForm action bar beyond the built-in Save/Delete
 * (which are derived from {@link Capabilities}, not declared as FormActions —
 * see `EntityForm.addAction` doc). `replaces: 'save' | 'delete'` lets a
 * custom action occupy a built-in's slot (the built-in candidate with that id
 * is dropped before merge, spec §3.4) instead of merely appending alongside
 * it. Resolution — visible/enabled/render, the built-in merge, click
 * dispatch — is entirely the VIEW's job (`@listgrid/react`'s ViewEntityForm,
 * W3-3); this interface is a pure declaration (L7 — schema-core never
 * executes a `run`/`render`).
 */
export interface FormAction {
  id: string;
  /** required when {@link render} is absent — runtime-checked by the view (dev warn + skip, not a throw; spec §3.4). */
  label?: string | undefined;
  variant?: 'primary' | 'secondary' | 'danger' | undefined;
  /** style escape hatch (former `withClassName`, gjcu `withButtons`/`withHeaderArea` class usage — spec §9). */
  className?: string | undefined;
  order?: number | undefined;
  visible?: ConditionalBooleanValue | undefined;
  enabled?: ConditionalBooleanValue | undefined;
  /** occupies a built-in action's slot instead of appending — spec §3.4. */
  replaces?: 'save' | 'delete' | undefined;
  run?: ((ctx: ActionContext) => void | Promise<void>) | undefined;
  /**
   * Fully custom rendered node (former ReactNode-button pattern, spec §3.4).
   * When present, the view renders THIS instead of the default `<Button>` —
   * `label`/`run` become optional (the render fn owns its own click wiring
   * via `ctx`), while `order`/`visible`/`enabled` still gate this action the
   * same as a label+run action.
   */
  render?: ActionRender | undefined;
}

/**
 * Context passed to a {@link FormAction.run}/{@link FormAction.render} (spec
 * §3.4; W3-3) — assembled by the VIEW (ViewEntityForm, `@listgrid/react`),
 * never by this module (L7: schema-core declares the shape only). `controller`
 * is the same {@link FormRuntime} instance the built-in Save/Delete actions
 * call — a structural reference only (§6.2; no layer violation, schema-core
 * never imports `@listgrid/state`, verified feasibility-1).
 */
export interface ActionContext {
  controller: FormRuntime;
  mutator: FormMutator;
  values: Readonly<Record<string, unknown>>;
  session?: Session | undefined;
}

/**
 * Fully custom action render fn (spec §3.4; W3-3) — type-only `ReactNode`
 * (L6, the `ConditionalReactNodeValue` precedent); resolution/rendering is
 * entirely the react layer's responsibility.
 */
export type ActionRender = (ctx: ActionContext) => ReactNode;

/** `addFields` group placement input (spec §3.2). */
export interface GroupInput {
  id: string;
  label?: string;
  order?: number;
  /** type-only slot — consumption is W3-1, not this task. */
  requiredPermissions?: string[] | undefined;
}

export interface AddFieldsInput {
  items: EntityField[];
  /** place under a tab; default tab id 'default'. */
  tab?: TabInput;
  /** group these fields under a field group; default group id 'default'. */
  group?: GroupInput;
}

const DEFAULT_TAB = 'default';
const DEFAULT_GROUP = 'default';

/**
 * Normalized `withTitle` storage (spec §3.1) — `withTitle(string)`
 * normalizes to `{ text: string }`; the object form is copied key-by-key
 * (only DEFINED keys, exactOptionalPropertyTypes — no conditional spread).
 * `getTitle`'s resolution chain reads this.
 */
interface TitleSpec {
  text?: string | undefined;
  fromField?: string | undefined;
}

/**
 * Resolution-chain "empty" test (spec §3.1) shared by every `getTitle` step:
 * `null`/`undefined`/`''`/whitespace-only all count as empty (String-convert
 * then trim, so a value like `0`/`false` is NOT empty — `String(0) === '0'`).
 */
function nonEmptyString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value);
  return str.trim().length === 0 ? undefined : str;
}

export class EntityForm {
  readonly name: string;
  readonly url: string;
  private titleSpec: TitleSpec = {};
  private capabilities: Capabilities = {};
  /**
   * `withMeta`'s storage (spec §3.1, CAP-23) — the sole escape hatch
   * replacing the 0.3.x 9-way attribute-bag sprawl. Shallow-merged on each
   * `withMeta` call (never replaced), same clobber-avoidance posture as
   * {@link capabilities}.
   */
  private meta: Record<string, unknown> = {};
  /**
   * Declared form-level read-only (spec §3.1, CAP-27) — the store
   * `formReadOnly` seed source. Defaults false (unset = editable).
   */
  private formReadOnly = false;
  private id?: string;

  private readonly fields: EntityField[] = [];
  private readonly tabs = new Map<string, TabDef>();
  private readonly groups = new Map<string, FieldGroupDef>();
  private groupSeq = 0;
  private tabSeq = 0;
  /**
   * Declared create-mode wizard steps (spec §3.2, C6; W4-2) — `withSteps`'s
   * storage. A whole-array REPLACE slot (L1 `with*` semantics), not a
   * per-id map like `tabs`/`groups` — there's no addFields-driven
   * incremental registration to dedupe against.
   */
  private steps: StepDef[] = [];
  /**
   * Declared revision/audit-trail entity name (spec §3.1, C6, CAP-07; W4-4) —
   * `withRevision`'s storage. `undefined` = not declared (the default —
   * NEITHER save/delete payload injection happens, spec §6.2 "설정 시에만").
   * Successor to the 0.3.x `EntityFormBase.revisionEntityName`
   * (EntityFormBase.tsx:43); this field is declared `| undefined` explicitly
   * (exactOptionalPropertyTypes) rather than left implicit.
   */
  private revisionEntityName: string | undefined = undefined;
  /**
   * Imperative lifecycle hooks (EF2): dispatched by the form store after
   * setValue (see @listgrid/state createFormStore). Successor to the 0.3.x
   * `EntityForm.onChanges` array (src/listgrid/config/EntityForm.tsx:94,
   * 122-127) — now typed against the state-agnostic FormMutator instead of
   * carrying the store/EntityForm instance directly (ADR-0003 purity).
   */
  private changeHandlers: ChangeHandler[] = [];
  /**
   * Init/fetch lifecycle hooks (spec §3.3/§4.1 `onInit`; W2-1): dispatched by
   * initializeFormStore (@listgrid/state), in registration order, ALWAYS
   * (create mode too), AFTER BIND and BEFORE the store is built. Consolidates
   * the former separate onFetchData (once, if data was fetched/provided) and
   * onInitialize (always) arrays into one — a handler branches on
   * `InitContext.data` itself (spec §4.2). Successor to the 0.3.x
   * EntityForm.onInitialize array (Config.ts OnInitializeFunc) /
   * modifyFetchedEntityForm (ModifyFetchedEntityFormFunc).
   */
  private initHandlers: InitHandler[] = [];
  /**
   * Save-lifecycle hooks (spec §4.1/§6.2; W2-5) — dispatched by
   * `createFormController.save` (@listgrid/state/form-controller.ts),
   * sequentially in registration order, AFTER `toSaveData()`/BEFORE the
   * adapter call. Successor to the EF6 `submitTransform` single-slot (see
   * {@link BeforeSaveContext} doc) — an append-list like `changeHandlers`/
   * `initHandlers`, not a replace-slot.
   */
  private beforeSaveHandlers: BeforeSaveHandler[] = [];
  /** Save-lifecycle hooks, success only (spec §4.1/§6.2; W2-5). Dispatched after adapter success + clear-on-success. */
  private afterSaveHandlers: AfterSaveHandler[] = [];
  /** Delete-lifecycle hooks (spec §4.1/§6.2; W2-5). Dispatched before `adapter.remove`. */
  private beforeDeleteHandlers: BeforeDeleteHandler[] = [];
  /** Delete-lifecycle hooks, success only (spec §4.1/§6.2; W2-5). Dispatched after `adapter.remove` succeeds. */
  private afterDeleteHandlers: AfterDeleteHandler[] = [];
  /**
   * List-fetch lifecycle hooks (spec §4.1; W2-6) — dispatched by
   * `createListStore`'s `fetch()` (@listgrid/state/list-store.ts),
   * sequentially in registration order, BEFORE `adapter.list`. See
   * {@link BeforeListFetchContext} for the `setSearchForm` injection
   * contract.
   */
  private beforeListFetchHandlers: BeforeListFetchHandler[] = [];
  /** List-fetch lifecycle hooks, success only (spec §4.1; W2-6). Dispatched after `adapter.list` succeeds, before the store's `postFetch` transform. */
  private afterListFetchHandlers: AfterListFetchHandler[] = [];
  /**
   * Declared custom form actions (spec §3.4, CAP-09; W3-3) — appended via
   * `addAction`, in registration order (order-sorted by `getActions`). The
   * built-in Save/Delete are NOT stored here — they're derived from
   * {@link Capabilities} by the view (ViewEntityForm), which merges them
   * with this list (a `replaces`-carrying custom action drops its built-in
   * counterpart before merge).
   */
  private actions: FormAction[] = [];

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
  }

  // --- builders (charter C1 grammar) ---
  /**
   * Declare the form's title (spec §3.1) — REPLACES any previously-declared
   * title (L1 `with*` default semantics: set/replace, no merge — unlike
   * `withCapabilities`/`withMeta`, which document merge explicitly). A plain
   * string normalizes to `{ text: string }`. This setter does no
   * resolution/emptiness validation itself — `getTitle` resolves the final
   * displayed string (spec §3.1 5-step chain) from whatever is stored here.
   * ReactNode is NOT accepted (L6) — a fully custom rendered title is
   * `ViewEntityForm`'s `slots.title` (`@listgrid/react`, W3-3), not this
   * schema-core declaration.
   */
  withTitle(title: string | { text?: string | undefined; fromField?: string | undefined }): this {
    if (typeof title === 'string') {
      this.titleSpec = { text: title };
      return this;
    }
    const next: TitleSpec = {};
    if (title.text !== undefined) next.text = title.text;
    if (title.fromField !== undefined) next.fromField = title.fromField;
    this.titleSpec = next;
    return this;
  }
  /**
   * Declare CRUD capabilities (spec §3.4, CAP-06) — shallow-merges `caps`
   * into any previously-declared capabilities (withMeta §3.1
   * clobber-avoidance precedent — a preset composing with a later call
   * doesn't blow away sibling keys the preset didn't touch). Successor to
   * `manageEntityForm`/`withNeverDelete`.
   */
  withCapabilities(caps: Capabilities): this {
    this.capabilities = { ...this.capabilities, ...caps };
    return this;
  }
  /**
   * Declare the whole form read-only (spec §3.1, CAP-27). Defaults to
   * `true` when called with no argument; `withReadOnly(false)` clears a
   * previously-declared read-only. A store built from this form seeds
   * `formReadOnly` from it, which ORs into every field's effective
   * readOnly + hides the built-in Save affordance (spec §6.1). A
   * **display/edit-affordance contract only** — it does not block writes;
   * for write-blocking use `withCapabilities({ update: false })`. Declared
   * property, so it propagates through `clone()` and into embedded M2O
   * child forms (successor to the 0.3.x `setReadOnly`).
   */
  withReadOnly(readOnly = true): this {
    this.formReadOnly = readOnly;
    return this;
  }
  /**
   * Append a custom form action (spec §3.4, CAP-09; W3-3). The built-in
   * Save/Delete are derived from {@link Capabilities}, not declared this
   * way — `addAction({ ..., replaces: 'save' })` is how a custom action
   * occupies the Save slot instead of merely appending beside it. Merge/
   * visible/enabled/render resolution is the view's job (ViewEntityForm).
   */
  addAction(action: FormAction): this {
    this.actions.push(action);
    return this;
  }
  /** Mark this instance as an existing-record (update) form. */
  withId(id: string): this {
    this.id = id;
    return this;
  }
  /** Append an onChange handler (EF2; spec §3.3, formerly `withOnChanges`); registration order is dispatch order. */
  onChange(handler: ChangeHandler): this {
    this.changeHandlers.push(handler);
    return this;
  }
  /**
   * Append an onInit handler (spec §3.3/§4.1; W2-1 — formerly the separate
   * `withOnFetchData`/`withOnInitialize`); registration order is dispatch
   * order. See {@link InitHandler}/{@link InitContext} for the contract.
   */
  onInit(handler: InitHandler): this {
    this.initHandlers.push(handler);
    return this;
  }
  /**
   * Append an onBeforeSave handler (spec §4.1/§6.2; W2-5 — successor to EF6
   * `withSubmitTransform`); registration order is dispatch order. See
   * {@link BeforeSaveHandler}/{@link BeforeSaveContext} for the contract.
   */
  onBeforeSave(handler: BeforeSaveHandler): this {
    this.beforeSaveHandlers.push(handler);
    return this;
  }
  /** Append an onAfterSave handler (spec §4.1/§6.2; W2-5); registration order is dispatch order. See {@link AfterSaveHandler}. */
  onAfterSave(handler: AfterSaveHandler): this {
    this.afterSaveHandlers.push(handler);
    return this;
  }
  /** Append an onBeforeDelete handler (spec §4.1/§6.2; W2-5); registration order is dispatch order. See {@link BeforeDeleteHandler}. */
  onBeforeDelete(handler: BeforeDeleteHandler): this {
    this.beforeDeleteHandlers.push(handler);
    return this;
  }
  /** Append an onAfterDelete handler (spec §4.1/§6.2; W2-5); registration order is dispatch order. See {@link AfterDeleteHandler}. */
  onAfterDelete(handler: AfterDeleteHandler): this {
    this.afterDeleteHandlers.push(handler);
    return this;
  }
  /**
   * Append an onBeforeListFetch handler (spec §4.1; W2-6); registration
   * order is dispatch order. See {@link BeforeListFetchHandler}/
   * {@link BeforeListFetchContext} for the `setSearchForm` injection
   * contract.
   */
  onBeforeListFetch(handler: BeforeListFetchHandler): this {
    this.beforeListFetchHandlers.push(handler);
    return this;
  }
  /** Append an onAfterListFetch handler (spec §4.1; W2-6); registration order is dispatch order. See {@link AfterListFetchHandler}. */
  onAfterListFetch(handler: AfterListFetchHandler): this {
    this.afterListFetchHandlers.push(handler);
    return this;
  }

  addFields(input: AddFieldsInput): this {
    const tabId = input.tab?.id ?? DEFAULT_TAB;
    if (!this.tabs.has(tabId)) {
      this.tabs.set(tabId, {
        id: tabId,
        ...(input.tab?.label !== undefined ? { label: input.tab.label } : {}),
        order: input.tab?.order ?? this.tabSeq++,
        ...(input.tab?.hidden !== undefined ? { hidden: input.tab.hidden } : {}),
        ...(input.tab?.requiredPermissions !== undefined
          ? { requiredPermissions: input.tab.requiredPermissions }
          : {}),
      });
    }

    const groupId = input.group?.id ?? DEFAULT_GROUP;
    if (!this.groups.has(groupId)) {
      this.groups.set(groupId, {
        id: groupId,
        ...(input.group?.label !== undefined ? { label: input.group.label } : {}),
        order: input.group?.order ?? this.groupSeq++,
        ...(input.group?.requiredPermissions !== undefined
          ? { requiredPermissions: input.group.requiredPermissions }
          : {}),
      });
    }

    for (const field of input.items) {
      field.form = { tabId, fieldGroupId: groupId };
      this.fields.push(field);
    }
    return this;
  }

  /**
   * Declaration-time structural removal of field `name` (spec §3.2 — successor
   * to the 0.3.x `removeField`). Shared-abstract-form variation: a caller
   * clones a base EntityForm and drops fields the variant doesn't want. No-op
   * if no field named `name` is declared. Distinct from the runtime
   * `mutator.removeField` (no naming collision — L1 without* group).
   */
  withoutField(name: string): this {
    const idx = this.fields.findIndex((f) => f.getName() === name);
    if (idx !== -1) this.fields.splice(idx, 1);
    return this;
  }

  /**
   * Declaration-time structural removal of tab `tabId` (spec §3.2 — successor
   * to the 0.3.x `removeTab`/`removeTabs`). Deletes the TabDef AND every
   * field routed to it (cascade — avoids orphaned fields whose `form.tabId`
   * no longer resolves to a declared tab). This is REMOVAL, not a hide
   * downgrade — a caller who only wants to hide the tab should call
   * `withTab(tabId, { hidden: true })` instead. No-op if `tabId` was never
   * declared.
   */
  withoutTab(tabId: string): this {
    if (!this.tabs.delete(tabId)) return this;
    for (let i = this.fields.length - 1; i >= 0; i--) {
      if (this.fields[i]?.form?.tabId === tabId) this.fields.splice(i, 1);
    }
    return this;
  }

  /**
   * Adjust a declared tab's label/order/hidden/requiredPermissions (spec
   * §3.2). If `tabId` was never declared (no `addFields()` call has targeted
   * it), a minimal TabDef stub is created so the tab still surfaces once a
   * field is later routed to it — this stub-create preserves the removed
   * pre-store tab-hidden setter's contract (an onInitialize handler can flip
   * a not-yet-declared tab hidden ahead of time). Only the DEFINED keys of
   * `patch` are applied/assigned (exactOptionalPropertyTypes — no conditional
   * spread). `hidden` accepts a `ConditionalBooleanValue` (C2); resolving a
   * non-boolean conditional here is W3-1's scope.
   */
  withTab(
    tabId: string,
    patch: {
      label?: string;
      order?: number;
      hidden?: ConditionalBooleanValue;
      requiredPermissions?: string[];
    },
  ): this {
    const existing = this.tabs.get(tabId);
    if (existing) {
      if (patch.label !== undefined) existing.label = patch.label;
      if (patch.order !== undefined) existing.order = patch.order;
      if (patch.hidden !== undefined) existing.hidden = patch.hidden;
      if (patch.requiredPermissions !== undefined) {
        existing.requiredPermissions = patch.requiredPermissions;
      }
    } else {
      const stub: TabDef = { id: tabId, order: patch.order ?? this.tabSeq++ };
      if (patch.label !== undefined) stub.label = patch.label;
      if (patch.hidden !== undefined) stub.hidden = patch.hidden;
      if (patch.requiredPermissions !== undefined) {
        stub.requiredPermissions = patch.requiredPermissions;
      }
      this.tabs.set(tabId, stub);
    }
    return this;
  }

  /**
   * Adjust a declared field group's label/order/open/requiredPermissions
   * (spec §3.2 — absorbs the 0.3.x `withFieldGroupConfig`). Groups stay
   * groupId-keyed (0.4 current structure) — `tabId` is accepted per the
   * public signature but NOT used for lookup in this wave; reserved for
   * future tab-scoped groups. If `groupId` was never declared, a minimal
   * FieldGroupDef stub is created (same stub-create contract as `withTab`).
   * Only the DEFINED keys of `patch` are applied (exactOptionalPropertyTypes).
   */
  withGroup(
    tabId: string,
    groupId: string,
    patch: { label?: string; order?: number; open?: boolean; requiredPermissions?: string[] },
  ): this {
    const existing = this.groups.get(groupId);
    if (existing) {
      if (patch.label !== undefined) existing.label = patch.label;
      if (patch.order !== undefined) existing.order = patch.order;
      if (patch.open !== undefined) existing.open = patch.open;
      if (patch.requiredPermissions !== undefined) {
        existing.requiredPermissions = patch.requiredPermissions;
      }
    } else {
      const stub: FieldGroupDef = { id: groupId, order: patch.order ?? this.groupSeq++ };
      if (patch.label !== undefined) stub.label = patch.label;
      if (patch.open !== undefined) stub.open = patch.open;
      if (patch.requiredPermissions !== undefined) {
        stub.requiredPermissions = patch.requiredPermissions;
      }
      this.groups.set(groupId, stub);
    }
    return this;
  }

  /**
   * Declare the create-mode wizard's steps (spec §3.2, C6; W4-2) — REPLACES
   * any previously-declared steps (L1 `with*` default semantics,
   * `withTitle` precedent — set/replace, no merge). `undefined` clears back
   * to no wizard: `getSteps()` returns `[]`, and the view (ViewEntityForm)
   * falls back to its normal tab/group rendering since the wizard gate is
   * "declared steps non-empty" (W4-2). Each StepDef — and its `fields`
   * array — is deep-copied into storage ({@link cloneStepDef}) so a later
   * mutation of the caller's input array/objects can't reach into this
   * instance.
   */
  withSteps(steps: StepDef[] | undefined): this {
    this.steps = steps === undefined ? [] : steps.map((s) => cloneStepDef(s));
    return this;
  }

  /**
   * Declare escape-hatch metadata (spec §3.1, CAP-23) — the **sole** escape
   * hatch replacing the 0.3.x 9-way attribute-bag sprawl. **Shallow-merges**
   * `patch` into any previously-declared meta (never replaces — the
   * `withCapabilities` clobber-avoidance precedent: a preset/wrapper
   * composing via multiple `withMeta` calls must not blow away sibling keys
   * an earlier call set, verified dx-6). A key set to `undefined` in `patch`
   * REMOVES that key from the stored meta (L4 "undefined = clear"), rather
   * than storing an `undefined` value — so `getMeta()` never reports a key
   * with an `undefined` value.
   *
   * W4-6 FIX #2 (phase-end hardening) — a nested value/array given in
   * `patch` (e.g. `withMeta({ tags: ['a'] })`) is stored BY REFERENCE, not
   * deep-cloned (arbitrary meta values aren't safely structuredClone-able).
   * To change such a value, call `withMeta` again with a brand-new
   * value/array — do NOT mutate the one you already passed in, or one read
   * back via `getMeta()`; see that getter's treat-as-immutable doc.
   */
  withMeta(patch: Record<string, unknown>): this {
    const next = { ...this.meta };
    for (const key of Object.keys(patch)) {
      if (patch[key] === undefined) {
        delete next[key];
      } else {
        next[key] = patch[key];
      }
    }
    this.meta = next;
    return this;
  }

  /**
   * Declare the revision/audit-trail entity name (spec §3.1, C6, CAP-07;
   * W4-4) — successor to the 0.3.x `withRevisionEntityName`. `undefined`
   * CLEARS a previously-declared value back to "not declared" (L1 `with*`
   * default semantics, `withSteps(undefined)` precedent) — from that point
   * on `getRevisionEntityName()` reports `undefined` again and save/delete
   * payload injection stops (spec §6.2 "설정 시에만"). Unlike the 0.3.x
   * `getRevisionEntityName()`, there is NO always-truthy `menuUrl`/`name`
   * fallback here — that was a named 0.3.x defect (every
   * `if (getRevisionEntityName())` guard elsewhere was dead code, since
   * `name` is a required constructor arg); this setter/getter pair reports
   * exactly what was declared, honestly.
   */
  withRevision(entityName: string | undefined): this {
    this.revisionEntityName = entityName;
    return this;
  }

  // --- queries ---
  /**
   * Resolve the display title (spec §3.1) — ALWAYS a non-empty string (the
   * old engine's `''` default is a named 0.3.x defect, L8: a caller that
   * never called `withTitle` still gets a usable title). 5-step chain, each
   * step's "empty" test is {@link nonEmptyString} (null/undefined/''/
   * whitespace-only all fall through to the next step):
   *   1. declared `text` (`withTitle(string)` or `withTitle({text})`).
   *   2. declared `fromField`'s value read off `values`
   *      (`values?.[fromField]`, `withTitle({fromField})`).
   *   3. the `name` FIELD's value read off `values` (`values?.['name']` —
   *      NOT {@link EntityForm.name}, this entity-form's own identity
   *      string; this is the declared field literally named `"name"`, if
   *      any, and only surfaces when the caller passes its live value in
   *      via `values`, e.g. the store's current field values).
   *   4. `getId()` — the record's id, when this is an update-mode form.
   *   5. final fallback — spec §3.1 calls for a "renderType 기본문구" here
   *      but does not specify its copy (spec-silent, this task's
   *      DEVIATIONS): {@link EntityForm.name} is used instead — a minimal,
   *      constructor-guaranteed-non-empty fallback, no invented
   *      consumer-facing copy.
   */
  getTitle(values?: Record<string, unknown>): string {
    const text = nonEmptyString(this.titleSpec.text);
    if (text !== undefined) return text;

    const fromField = this.titleSpec.fromField;
    if (fromField !== undefined) {
      const fromFieldValue = nonEmptyString(values?.[fromField]);
      if (fromFieldValue !== undefined) return fromFieldValue;
    }

    const nameFieldValue = nonEmptyString(values?.['name']);
    if (nameFieldValue !== undefined) return nameFieldValue;

    const id = nonEmptyString(this.id);
    if (id !== undefined) return id;

    return this.name;
  }
  getId(): string | undefined {
    return this.id;
  }
  /**
   * Declared raw capabilities (undefined key = default-allowed).
   * Resolution (default-true + {@link ConditionalBooleanValue} evaluation) is
   * the engine's job (controller/view), not this getter's.
   */
  getCapabilities(): Capabilities {
    return this.capabilities;
  }
  /** Declared form-level read-only (spec §3.1) — `withReadOnly`'s reader pair; the store `formReadOnly` seed source. */
  getReadOnly(): boolean {
    return this.formReadOnly;
  }
  /**
   * Declared custom form actions, order-sorted (spec §3.4, CAP-09; W3-3).
   * The built-in Save/Delete are NOT included — merging them in (capability
   * derivation + `replaces`) is the view's job, not this getter's.
   */
  getActions(): FormAction[] {
    return [...this.actions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  /** create vs update — update iff an id is set (0.3.x getRenderType semantics). */
  getRenderType(): RenderType {
    return this.id !== undefined ? 'update' : 'create';
  }
  /** registered onChange handlers, in dispatch order (EF2; engine-internal — not barrel-exported). */
  getChangeHandlers(): ChangeHandler[] {
    return this.changeHandlers;
  }
  /** registered onInit handlers, in dispatch order (spec §3.3/§4.1; engine-internal — not barrel-exported). */
  getInitHandlers(): InitHandler[] {
    return this.initHandlers;
  }
  /** registered onBeforeSave handlers, in dispatch order (spec §4.1/§6.2; engine-internal — not barrel-exported). */
  getBeforeSaveHandlers(): BeforeSaveHandler[] {
    return this.beforeSaveHandlers;
  }
  /** registered onAfterSave handlers, in dispatch order (spec §4.1/§6.2; engine-internal — not barrel-exported). */
  getAfterSaveHandlers(): AfterSaveHandler[] {
    return this.afterSaveHandlers;
  }
  /** registered onBeforeDelete handlers, in dispatch order (spec §4.1/§6.2; engine-internal — not barrel-exported). */
  getBeforeDeleteHandlers(): BeforeDeleteHandler[] {
    return this.beforeDeleteHandlers;
  }
  /** registered onAfterDelete handlers, in dispatch order (spec §4.1/§6.2; engine-internal — not barrel-exported). */
  getAfterDeleteHandlers(): AfterDeleteHandler[] {
    return this.afterDeleteHandlers;
  }
  /** registered onBeforeListFetch handlers, in dispatch order (spec §4.1; engine-internal — not barrel-exported). */
  getBeforeListFetchHandlers(): BeforeListFetchHandler[] {
    return this.beforeListFetchHandlers;
  }
  /** registered onAfterListFetch handlers, in dispatch order (spec §4.1; engine-internal — not barrel-exported). */
  getAfterListFetchHandlers(): AfterListFetchHandler[] {
    return this.afterListFetchHandlers;
  }

  /** All fields, ordered by their declared `order`. */
  getFields(): EntityField[] {
    return [...this.fields].sort((a, b) => a.order - b.order);
  }
  getField(name: string): EntityField | undefined {
    return this.fields.find((f) => f.getName() === name);
  }
  getTabs(): TabDef[] {
    return [...this.tabs.values()].sort((a, b) => a.order - b.order);
  }
  getFieldGroups(tabId?: string): FieldGroupDef[] {
    const groupIds = new Set(
      this.fields
        .filter((f) => tabId === undefined || f.getTabId() === tabId)
        .map((f) => f.getFieldGroupId() || DEFAULT_GROUP),
    );
    return [...this.groups.values()]
      .filter((g) => groupIds.has(g.id))
      .sort((a, b) => a.order - b.order);
  }
  /** Fields under a tab+group, ordered. */
  getGroupFields(tabId: string, groupId: string): EntityField[] {
    return this.getFields().filter(
      (f) => f.getTabId() === tabId && (f.getFieldGroupId() || DEFAULT_GROUP) === groupId,
    );
  }
  /**
   * Declared wizard steps (spec §3.2, C6; W4-2), order-sorted ascending
   * (stable sort — `getTabs()`/`getFields()` precedent, missing `order`
   * treated as 0). Declaration order is NOT dispatch/render order. `hidden`
   * is NOT filtered here — `getSteps()` always returns every declared step,
   * hidden or not (spec §3.2: resolving a non-boolean
   * `ConditionalBooleanValue` needs a `FieldEvalContext` this pure
   * declaration layer doesn't have; that resolution, and the hidden-step
   * exclusion it drives, is the view's job — `@listgrid/react`'s
   * ViewEntityForm, W4-2).
   */
  getSteps(): StepDef[] {
    return [...this.steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /**
   * Declared escape-hatch metadata (spec §3.1, CAP-23) — `withMeta`'s reader
   * pair. Defaults to `{}` (never called). Same no-defensive-copy posture as
   * {@link getCapabilities} — returns the LIVE stored object, not a clone.
   * W4-6 FIX #2 (phase-end hardening) — **treat the return value as
   * IMMUTABLE** (same posture `getCapabilities` already documents):
   * consumers REPLACE a value via `withMeta({ key: newValue })`, and must
   * NOT mutate the object (or a nested value/array inside it) this getter
   * hands back. `clone()` only gives independence at the TOP-LEVEL-KEY
   * granularity (see `clone()`'s doc) — a nested value/array is shared BY
   * REFERENCE between an original and its clone, so mutating one through
   * this getter's return value is visible through the other's `getMeta()`
   * too. This is a documentation contract, not an enforced one — `withMeta`
   * is the only sanctioned write path.
   */
  getMeta(): Record<string, unknown> {
    return this.meta;
  }

  /**
   * Declared revision/audit-trail entity name (spec §3.1, C6, CAP-07; W4-4)
   * — `withRevision`'s reader pair. Returns EXACTLY the stored value —
   * `undefined` when never declared (or cleared via `withRevision(undefined)`
   * — this is the "honest undefined" spec §3.1 calls for, sealing the 0.3.x
   * always-truthy `revisionEntityName || menuUrl || name` fallback bug (no
   * `menuUrl`/`name` fallback here, ever). The save flow
   * (`createFormController.save`, @listgrid/state) and delete flow
   * (`adapter.remove(url, ids, revision?)`) both read this directly and
   * inject/pass it ONLY when it is not `undefined` (spec §6.2 "설정 시에만").
   */
  getRevisionEntityName(): string | undefined {
    return this.revisionEntityName;
  }

  /** Declaration clone (charter C1: `userForm.clone().withId(id)` for the form screen). */
  clone(includeValue = false): EntityForm {
    const copy = new EntityForm(this.name, this.url);
    copy.titleSpec = { ...this.titleSpec };
    copy.capabilities = { ...this.capabilities };
    // propagate escape-hatch meta (spec §3.1, CAP-23) — SHALLOW copy, so
    // clone independence holds at the TOP-LEVEL-KEY granularity only (a
    // later withMeta call on either instance rebuilds its own top-level
    // object, never mutating the other's), same posture as `capabilities`
    // above. W4-6 FIX #2 (phase-end hardening) — a NESTED value/array
    // stored under a key (e.g. withMeta({ tags: ['a'] })) is SHARED BY
    // REFERENCE between `this` and `copy`: mutating it in place (e.g.
    // `copy.getMeta().tags.push('b')`) is visible through BOTH instances'
    // getMeta(). Documented and intentional, NOT deep-cloned (arbitrary
    // meta values aren't safely structuredClone-able) — getMeta()'s
    // treat-as-immutable contract is what actually prevents this in
    // practice; see that doc.
    copy.meta = { ...this.meta };
    copy.formReadOnly = this.formReadOnly;
    if (this.id !== undefined) copy.id = this.id;
    copy.groupSeq = this.groupSeq;
    copy.tabSeq = this.tabSeq;
    for (const [k, v] of this.tabs) copy.tabs.set(k, { ...v });
    for (const [k, v] of this.groups) copy.groups.set(k, { ...v });
    for (const f of this.fields) copy.fields.push(f.clone(includeValue));
    // propagate wizard steps (spec §3.2, C6; W4-2) — DEEP copy via
    // cloneStepDef, and every declared step INCLUDING a hidden one (no
    // hidden filter here, mirrors getSteps() — the historical GJCU 0.3.x
    // clone dropped hidden steps entirely; this clone does not).
    copy.steps = this.steps.map((s) => cloneStepDef(s));
    // propagate revision/audit-trail entity name (spec §3.1, C6, CAP-07;
    // W4-4) — a plain string-or-undefined value, so assignment alone gives
    // clone independence (no shared mutable structure to deep-copy, unlike
    // `steps`).
    copy.revisionEntityName = this.revisionEntityName;
    // propagate changeHandlers (0.3.x parity — src/listgrid/config/EntityForm.tsx:94).
    copy.changeHandlers = [...this.changeHandlers];
    // propagate initHandlers (spec §3.3/§4.1, same clone-propagation contract).
    copy.initHandlers = [...this.initHandlers];
    // propagate save/delete lifecycle hooks (spec §4.1/§6.2; W2-5, same clone-propagation contract).
    copy.beforeSaveHandlers = [...this.beforeSaveHandlers];
    copy.afterSaveHandlers = [...this.afterSaveHandlers];
    copy.beforeDeleteHandlers = [...this.beforeDeleteHandlers];
    copy.afterDeleteHandlers = [...this.afterDeleteHandlers];
    // propagate list-fetch lifecycle hooks (spec §4.1; W2-6, same clone-propagation contract).
    copy.beforeListFetchHandlers = [...this.beforeListFetchHandlers];
    copy.afterListFetchHandlers = [...this.afterListFetchHandlers];
    // propagate declared actions (spec §3.4, CAP-09; W3-3) — shallow-copy each
    // FormAction (function refs shared, not values — L3's deep-clone contract
    // is about structural independence of the ARRAY, not the handler
    // closures it carries, same posture as the hook arrays above).
    copy.actions = this.actions.map((a) => ({ ...a }));
    return copy;
  }
}
