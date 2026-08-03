import type { EntityForm } from '../entity-form';
import type { FieldEvalContext } from './eval-context';
import { FormField } from './form-field';

/**
 * SubCollection config (charter C3 — OneToMany/ManyToMany relations inline in
 * the parent form). The child entity's form is a LAZY THUNK (decision D1 — the
 * child references may cycle back to the parent). `mappedBy` names the child
 * field that points at the parent (auto-hidden in the child form).
 */
export interface SubCollectionConfig {
  /** lazy reference to the child entity's form (D1). */
  childEntityForm: () => EntityForm;
  /** the child field referencing the parent (auto-filtered/hidden). */
  mappedBy?: string;
  /**
   * Persistence strategy. `embedded` preserves the original contract: the
   * array is held in, and serialized with, the parent form. `child-resource`
   * opts into adapter-backed child CRUD and excludes the array from the
   * parent payload.
   *
   * `child-resource` requires {@link mappedBy}; construction fails fast when
   * it is omitted because neither the child write nor its read filter can be
   * related to the parent safely.
   */
  persistence?: 'embedded' | 'child-resource';
  /** presentation — inline table (default) / card. */
  variant?: 'table' | 'card' | 'inline';
}

/**
 * A child collection edited inside the parent form (charter C3). Its value is
 * an array of child rows held in the parent form store; add/edit each row
 * through an ISOLATED child form store (ADR-0002 §Decision 4 — child gets its
 * own store, communicates back by explicit callback). Embedded mode includes
 * the array under the collection name; child-resource mode excludes it.
 */
export class SubCollectionField extends FormField<Record<string, unknown>[]> {
  config: SubCollectionConfig;

  constructor(name: string, order: number, config: SubCollectionConfig) {
    super(name, order, 'subCollection');
    if (config.persistence === 'child-resource' && !config.mappedBy) {
      throw new Error(
        `SubCollectionField "${name}" requires mappedBy when persistence is "child-resource".`,
      );
    }
    this.config = config;
    // Reuse EntityField's canonical payload-exclusion mechanism. The default
    // embedded mode leaves the inherited flag untouched, preserving the
    // existing save payload byte-for-byte.
    if (config.persistence === 'child-resource') this.exceptOnSave = true;
  }

  getChildEntityForm(): EntityForm {
    return this.config.childEntityForm();
  }
  getMappedBy(): string | undefined {
    return this.config.mappedBy;
  }
  getPersistence(): 'embedded' | 'child-resource' {
    return this.config.persistence ?? 'embedded';
  }
  /**
   * Child-list filter name, preserving the 0.3 SubCollection relation rule:
   * a write field ending in `Id` maps to the related entity's `.id` path.
   */
  getMappedByFilterName(): string | undefined {
    const mappedBy = this.getMappedBy();
    if (mappedBy === undefined) return undefined;
    return mappedBy.endsWith('Id') ? `${mappedBy.slice(0, -2)}.id` : mappedBy;
  }
  override serializeValue(
    value: Record<string, unknown>[],
    ctx: FieldEvalContext,
  ): Record<string, unknown> {
    return this.getPersistence() === 'child-resource' ? {} : super.serializeValue(value, ctx);
  }
  getVariant(): 'table' | 'card' | 'inline' {
    return this.config.variant ?? 'table';
  }
}
