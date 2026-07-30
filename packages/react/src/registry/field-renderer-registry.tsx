import type { ComponentType } from 'react';
import type { EntityField, FieldType } from '@listgrid/schema-core';

// FieldRenderer registry — the type→component dispatch table (ADR-0003 §2:
// "render dispatch on `field.type` moves to the FieldRenderer registry in
// @listgrid/react", schema-core stays pure meta). One registry per process
// (module-scope Map), matching the 0.3.x theme-registry precedent and the
// task's registerFieldRenderer/getFieldRenderer contract — a host overrides a
// single type by re-registering it, or swaps the whole vocabulary.

/**
 * Props every registered field-type component receives. `readOnly` is an
 * additive convenience (not in the original {field, name} minimum) so the
 * FieldRenderer wrapper's resolved readOnly state can reach the concrete
 * input without every renderer re-deriving it via `field.isReadOnly()`.
 */
export interface FieldRendererComponentProps {
  field: EntityField;
  name: string;
  /**
   * Identity declared on the owning EntityForm. It is not part of the form's
   * field values and therefore does not require an `id` field declaration.
   */
  entityId?: string | undefined;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

export type FieldRendererComponent = ComponentType<FieldRendererComponentProps>;

const registry = new Map<FieldType, FieldRendererComponent>();

/** Register (or override) the component rendered for a given `field.type`. */
export function registerFieldRenderer(type: FieldType, component: FieldRendererComponent): void {
  registry.set(type, component);
}

/** Look up the component registered for `type`, if any. */
export function getFieldRenderer(type: FieldType): FieldRendererComponent | undefined {
  return registry.get(type);
}
