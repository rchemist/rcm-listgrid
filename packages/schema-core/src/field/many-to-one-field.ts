import type { EntityForm } from '../entity-form';
import type { FieldEvalContext } from './eval-context';
import type { FilterItem } from '../search/search-form';
import { FormField } from './form-field';

/**
 * ManyToOne relation config (charter C3 — relations are 1급). The referenced
 * target is a LAZY THUNK `() => EntityForm` (decision D1) — the 0.3.x engine
 * passed an eager EntityForm instance and relied on a `child?` boolean to
 * short-circuit the College↔Professor↔Major mutual recursion; a thunk defers
 * construction so the cycle never eagerly instantiates.
 */
export interface ManyToOneConfig {
  /** lazy reference to the target entity's form (D1). */
  entityForm: () => EntityForm;
  /** id property on the referenced entity (default 'id'). Save flattens value → `<name>Id`. */
  idField?: string;
  /** property shown as the selected/option label (default 'name'). */
  labelField?: string;
  /** render as a searchable tree instead of a flat picker. */
  tree?: boolean;
  /**
   * EA-D2-0 (decision ②, §3): resolved when the picker opens; the returned
   * `FilterItem[]` is AND-ed into the picker's `SearchForm` as
   * `initialSearch` (ManyToOneRenderer). Covers both the XrefPrefer
   * mini-form filter channel and a self-referencing entity's exclude-self
   * filter (e.g. `parentMajor`'s `NOT_EQUAL` on its own id).
   *
   * NARROWED from the briefing's sketched `(parentEntityForm?) =>
   * Promise<FilterItem[]>` (§3) to zero-arg: `FieldRendererComponentProps`
   * carries no `EntityForm` reference and `FormStoreState` (the renderer's
   * only other context) does not hold one either (fields live as
   * `state.fieldDefs`, not a wrapped `EntityForm`) — there is no CURRENT
   * renderer-context value to pass as `parentEntityForm` without a wiring
   * change out of scope for EA-D2-0. Recorded as a deviation; widening this
   * back to `(parentEntityForm?) => ...` is additive (optional param) if a
   * later task threads the parent form through.
   */
  filter?: () => Promise<FilterItem[]>;
}

/** Searchable reference to another entity (0.3.x ManyToOneField, type 'manyToOne'). */
export class ManyToOneField<TValue = unknown> extends FormField<TValue> {
  config: ManyToOneConfig;

  constructor(name: string, order: number, config: ManyToOneConfig) {
    super(name, order, 'manyToOne');
    this.config = config;
  }

  /** Resolve the target entity's form (calls the thunk — D1). */
  getEntityForm(): EntityForm {
    return this.config.entityForm();
  }
  getIdField(): string {
    return this.config.idField ?? 'id';
  }
  getLabelField(): string {
    return this.config.labelField ?? 'name';
  }

  /**
   * Show this reference as a column in the parent's list grid. Delegates to
   * the base `FormField.withList()` (spec §5.1; W5-2) — ManyToOne no longer
   * carries its own `showInList` boolean; it participates in list
   * derivation exactly like every other field, via `getListConfig()`.
   */
  useListField(): this {
    return this.withList();
  }

  /**
   * Override (spec §5.2): flattens the selected related-entity object to its
   * id under `<name>Id` — the exact `toSaveData` M2O branch this replaces
   * (old form-store.ts duck-typed `getIdField` cast). Non-object values
   * (undefined/null/a raw id already) fall through to the base `{ [name]:
   * value }` shape unchanged — same as the old `else` branch.
   */
  override serializeValue(value: TValue, _ctx: FieldEvalContext): Record<string, unknown> {
    if (value && typeof value === 'object') {
      return { [`${this.getName()}Id`]: (value as Record<string, unknown>)[this.getIdField()] };
    }
    return { [this.getName()]: value };
  }
}
