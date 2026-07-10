import type { EntityForm } from '../entity-form';
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
  /** presentation — inline table (default) / card. */
  variant?: 'table' | 'card' | 'inline';
}

/**
 * A child collection edited inside the parent form (charter C3). Its value is
 * an array of child rows held in the parent form store; add/edit each row
 * through an ISOLATED child form store (ADR-0002 §Decision 4 — child gets its
 * own store, communicates back by explicit callback). Save includes the array
 * under the collection name.
 */
export class SubCollectionField extends FormField<Record<string, unknown>[]> {
  config: SubCollectionConfig;

  constructor(name: string, order: number, config: SubCollectionConfig) {
    super(name, order, 'subCollection');
    this.config = config;
  }

  getChildEntityForm(): EntityForm {
    return this.config.childEntityForm();
  }
  getMappedBy(): string | undefined {
    return this.config.mappedBy;
  }
  getVariant(): 'table' | 'card' | 'inline' {
    return this.config.variant ?? 'table';
  }
}
