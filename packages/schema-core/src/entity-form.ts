import type { Session } from './auth';
import type { EntityField } from './field/entity-field';
import type { OnChangesHandler } from './field/form-mutator';
import type { RenderType } from './field/types';

/**
 * Imperative lifecycle hook (EF3): runs once per registered handler, in
 * registration order, after data is fetched but BEFORE onInitialize
 * (initializeFormStore, @listgrid/state). Receives the already-normalized
 * fetched DATA payload — NOT a raw response like the 0.3.x
 * ModifyFetchedEntityFormFunc(entityForm, response?) (src/listgrid/config/
 * Config.ts:459) — the new BackendAdapter (ADR-0005 decision D2) already
 * unwraps the envelope, so the handler gets the entity data directly.
 * Pure (EntityForm in, EntityForm out) — no store/mutator, unlike
 * OnChangesHandler, so schema-core stays free of a state dependency.
 */
export type OnFetchDataHandler = (
  entityForm: EntityForm,
  data: Record<string, unknown>,
) => EntityForm | Promise<EntityForm>;

/**
 * Imperative lifecycle hook (EF3): runs once per registered handler, in
 * registration order, after onFetchData and before the form store is built.
 * 0.3.x parity — src/listgrid/config/Config.ts OnInitializeFunc, dispatched
 * at EntityForm.tsx:259-264 (per-handler try/catch: a throwing handler is
 * logged and skipped, remaining handlers still run — initializeFormStore,
 * @listgrid/state, reproduces that contract).
 */
export type OnInitializeHandler = (
  entityForm: EntityForm,
  session?: Session,
) => EntityForm | Promise<EntityForm>;

/**
 * Submit-transform hook (EF6): applied by toSaveData (@listgrid/state) to the
 * mechanical save-payload dump (exceptOnSave dropped, ManyToOne flattened to
 * `<name>Id`) immediately before it is returned to the caller. Successor to
 * the 0.3.x `withOverrideSubmitData` (src/listgrid/config/EntityForm.tsx —
 * CollaboEntityForm.tsx:313-325 was a call site) — single-slot there too (a
 * plain override, not a list), so this hook is single-slot as well (parity,
 * not an EF2-style handler array). Pure (data in, data out) — no store/
 * mutator, same state-agnostic posture as OnFetchDataHandler.
 */
export type SubmitTransformHandler = (
  data: Record<string, unknown>,
  entityForm: EntityForm,
) => Record<string, unknown>;

// EntityForm — the single declaration from which BOTH the list and the form
// screens derive (charter C1). React-free: it is the declaration + query model;
// the RUNTIME value state lives in the form store (ADR-0002 §Decision 5 — the
// class's runtime-state role moves to the store). Successor to the 0.3.x
// src/listgrid/config/EntityForm.tsx, reduced to declaration + structure.

export interface FieldGroupDef {
  id: string;
  label?: string;
  order: number;
}

export interface TabDef {
  id: string;
  label?: string;
  order: number;
}

export interface AddFieldsInput {
  items: EntityField[];
  /** group these fields under a field group; default group id 'default'. */
  fieldGroup?: { id: string; label?: string; order?: number };
  /** place under a tab; default tab id 'default'. */
  tab?: { id: string; label?: string; order?: number };
}

const DEFAULT_TAB = 'default';
const DEFAULT_GROUP = 'default';

export class EntityForm {
  readonly name: string;
  readonly fetchUrl: string;
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
  private onChanges: OnChangesHandler[] = [];
  /**
   * Fetch/init lifecycle hooks (EF3): dispatched by initializeFormStore
   * (@listgrid/state), in this order — onFetchData first (once, if data was
   * fetched/provided), then onInitialize (always, create or update).
   * Successor to the 0.3.x EntityForm.onInitialize array (Config.ts
   * OnInitializeFunc) / modifyFetchedEntityForm (ModifyFetchedEntityFormFunc).
   */
  private onFetchData: OnFetchDataHandler[] = [];
  private onInitialize: OnInitializeHandler[] = [];
  /**
   * Submit-transform hook (EF6): single-slot, unlike the onChanges/onFetchData/
   * onInitialize arrays — 0.3.x `withOverrideSubmitData` was a plain override,
   * not a list, so this mirrors that (parity, not an EF2-style array).
   */
  private submitTransform?: SubmitTransformHandler;

  constructor(name: string, fetchUrl: string) {
    this.name = name;
    this.fetchUrl = fetchUrl;
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
  /** Append an onChanges handler (EF2); registration order is dispatch order. */
  withOnChanges(handler: OnChangesHandler): this {
    this.onChanges.push(handler);
    return this;
  }
  /** Append an onFetchData handler (EF3); registration order is dispatch order. */
  withOnFetchData(handler: OnFetchDataHandler): this {
    this.onFetchData.push(handler);
    return this;
  }
  /** Append an onInitialize handler (EF3); registration order is dispatch order. */
  withOnInitialize(handler: OnInitializeHandler): this {
    this.onInitialize.push(handler);
    return this;
  }
  /**
   * Set the submit-transform handler (EF6); single-slot — a later call
   * REPLACES any previously set handler (0.3.x `withOverrideSubmitData`
   * parity, not an append like withOnChanges/withOnFetchData/withOnInitialize).
   */
  withSubmitTransform(handler: SubmitTransformHandler): this {
    this.submitTransform = handler;
    return this;
  }

  addFields(input: AddFieldsInput): this {
    const tabId = input.tab?.id ?? DEFAULT_TAB;
    if (!this.tabs.has(tabId)) {
      this.tabs.set(tabId, {
        id: tabId,
        ...(input.tab?.label !== undefined ? { label: input.tab.label } : {}),
        order: input.tab?.order ?? this.tabSeq++,
      });
    }

    const groupId = input.fieldGroup?.id ?? DEFAULT_GROUP;
    if (!this.groups.has(groupId)) {
      this.groups.set(groupId, {
        id: groupId,
        ...(input.fieldGroup?.label !== undefined ? { label: input.fieldGroup.label } : {}),
        order: input.fieldGroup?.order ?? this.groupSeq++,
      });
    }

    for (const field of input.items) {
      field.form = { tabId, fieldGroupId: groupId };
      this.fields.push(field);
    }
    return this;
  }

  // --- queries ---
  getName(): string {
    return this.name;
  }
  getUrl(): string {
    return this.fetchUrl;
  }
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
  /** registered onChanges handlers, in dispatch order (EF2). */
  getOnChanges(): OnChangesHandler[] {
    return this.onChanges;
  }
  /** registered onFetchData handlers, in dispatch order (EF3). */
  getOnFetchData(): OnFetchDataHandler[] {
    return this.onFetchData;
  }
  /** registered onInitialize handlers, in dispatch order (EF3). */
  getOnInitialize(): OnInitializeHandler[] {
    return this.onInitialize;
  }
  /** the registered submit-transform handler, if any (EF6). */
  getSubmitTransform(): SubmitTransformHandler | undefined {
    return this.submitTransform;
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
    const copy = new EntityForm(this.name, this.fetchUrl);
    if (this.title !== undefined) copy.title = this.title;
    copy.neverDelete = this.neverDelete;
    if (this.id !== undefined) copy.id = this.id;
    copy.groupSeq = this.groupSeq;
    copy.tabSeq = this.tabSeq;
    for (const [k, v] of this.tabs) copy.tabs.set(k, { ...v });
    for (const [k, v] of this.groups) copy.groups.set(k, { ...v });
    for (const f of this.fields) copy.fields.push(f.clone(includeValue));
    // propagate onChanges (0.3.x parity — src/listgrid/config/EntityForm.tsx:94).
    copy.onChanges = [...this.onChanges];
    // propagate onFetchData/onInitialize (EF3, same clone-propagation contract).
    copy.onFetchData = [...this.onFetchData];
    copy.onInitialize = [...this.onInitialize];
    // propagate submitTransform (EF6, same clone-propagation contract).
    if (this.submitTransform !== undefined) copy.submitTransform = this.submitTransform;
    return copy;
  }
}
