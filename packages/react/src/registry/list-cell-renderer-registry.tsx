import type { ComponentType } from 'react';
import type { EntityField } from '@listgrid/schema-core';

// ListCellRenderer registry — the type→component dispatch table for LIST
// GRID cells (spec §7 EG23, CAP-19; W5-2), cloned from field-renderer-
// registry.tsx's shape (module-scope Map + register/get pair). Unlike
// `registerFieldRenderer` (keyed on the closed `FieldType` union today),
// this registry is keyed on a bare `string` — spec §7 states it explicitly
// ("registerListCellRenderer(type, comp) ... string 키(열린 타입)"), so a
// custom field's own type string can register a list-cell renderer with no
// `FieldType` widening required here.

/**
 * Props every registered list-cell component receives: the cell's raw row
 * value, the FULL row (for composite cells that read sibling columns), and
 * the backing field declaration (optional — `ViewListGrid`'s own explicit-
 * `columns`-prop escape hatch renders synthetic columns with no backing
 * field, so a cell component must tolerate its absence).
 */
export interface ListCellRendererComponentProps {
  value: unknown;
  row: Record<string, unknown>;
  field?: EntityField;
}

export type ListCellRendererComponent = ComponentType<ListCellRendererComponentProps>;

const registry = new Map<string, ListCellRendererComponent>();

/** Register (or override) the component rendered for a given list column `field.type`. */
export function registerListCellRenderer(type: string, component: ListCellRendererComponent): void {
  registry.set(type, component);
}

/** Look up the component registered for `type`, if any. */
export function getListCellRenderer(type: string): ListCellRendererComponent | undefined {
  return registry.get(type);
}
