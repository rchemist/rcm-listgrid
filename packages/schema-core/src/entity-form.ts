import type { Session } from './auth';
import type { ConditionalBooleanValue } from './field/conditional';
import type { EntityField } from './field/entity-field';
import type { FieldMetaOverride } from './field/field-meta';
import type { ChangeHandler, FormMutator } from './field/form-mutator';
import type { RenderType } from './field/types';
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
   * `{ ok: false, cancelled: reason }`. `reason`, if given, is also pushed to
   * the store's message banner (`severity: 'info'`, spec §6.2). Distinct
   * from a THROWN error — a handler that throws is logged and SKIPPED (spec
   * §4.2), the flow continues; only an explicit `cancel()` call stops it.
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

export class EntityForm {
  readonly name: string;
  readonly url: string;
  private title?: string;
  private neverDelete = false;
  private id?: string;

  private readonly fields: EntityField[] = [];
  private readonly tabs = new Map<string, TabDef>();
  private readonly groups = new Map<string, FieldGroupDef>();
  private groupSeq = 0;
  private tabSeq = 0;
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

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
  }

  // --- builders (charter C1 grammar) ---
  withTitle(title: string): this {
    this.title = title;
    return this;
  }
  withNeverDelete(): this {
    this.neverDelete = true;
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
      });
    }

    const groupId = input.group?.id ?? DEFAULT_GROUP;
    if (!this.groups.has(groupId)) {
      this.groups.set(groupId, {
        id: groupId,
        ...(input.group?.label !== undefined ? { label: input.group.label } : {}),
        order: input.group?.order ?? this.groupSeq++,
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

  // --- queries ---
  getTitle(): string | undefined {
    return this.title;
  }
  getId(): string | undefined {
    return this.id;
  }
  isNeverDelete(): boolean {
    return this.neverDelete;
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

  /** Declaration clone (charter C1: `userForm.clone().withId(id)` for the form screen). */
  clone(includeValue = false): EntityForm {
    const copy = new EntityForm(this.name, this.url);
    if (this.title !== undefined) copy.title = this.title;
    copy.neverDelete = this.neverDelete;
    if (this.id !== undefined) copy.id = this.id;
    copy.groupSeq = this.groupSeq;
    copy.tabSeq = this.tabSeq;
    for (const [k, v] of this.tabs) copy.tabs.set(k, { ...v });
    for (const [k, v] of this.groups) copy.groups.set(k, { ...v });
    for (const f of this.fields) copy.fields.push(f.clone(includeValue));
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
    return copy;
  }
}
