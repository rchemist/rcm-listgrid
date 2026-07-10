import type { EntityField } from './field/entity-field';
import type { OnChangesHandler } from './field/form-mutator';
import type { RenderType } from './field/types';

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
    return copy;
  }
}
