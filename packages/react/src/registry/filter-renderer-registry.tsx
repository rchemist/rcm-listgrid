import type { ComponentType } from 'react';
import type { EntityField, QueryConditionType } from '@listgrid/schema-core';

// FilterRenderer registry — the type→component dispatch table for the
// ADVANCED-SEARCH panel embedded in ViewListGrid (spec §7 EG24, CAP-20; W5-3),
// cloned from list-cell-renderer-registry.tsx's shape (module-scope Map +
// register/get pair). Like that sibling (and unlike `registerFieldRenderer`,
// keyed on the closed `FieldType` union today), this registry is keyed on a
// bare `string` — spec §7 states it explicitly ("registerFilterRenderer(type,
// comp) ... string 키(열린 타입)"), so a custom field's own type string can
// register a filter-input renderer with no `FieldType` widening required here.

/**
 * Props every registered filter-input component receives: a controlled value
 * for the field's advanced-search input, its `onChange`, and the backing
 * field declaration (so a renderer can read label/options/etc. off it). No
 * `row`/full-record context — unlike a list cell, a filter input has no row
 * to read sibling values from (mirrors {@link FieldRendererComponentProps}'
 * doc-comment style, kept minimal per the W5-3 brief).
 */
export interface FilterRendererComponentProps {
  field: EntityField;
  value: unknown;
  onChange: (value: unknown, operator?: QueryConditionType) => void;
}

export type FilterRendererComponent = ComponentType<FilterRendererComponentProps>;

const registry = new Map<string, FilterRendererComponent>();

/** Register (or override) the component rendered for a given filter field's `field.type`. */
export function registerFilterRenderer(type: string, component: FilterRendererComponent): void {
  registry.set(type, component);
}

/** Look up the component registered for `type`, if any. */
export function getFilterRenderer(type: string): FilterRendererComponent | undefined {
  return registry.get(type);
}
