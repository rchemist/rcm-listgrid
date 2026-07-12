import type { EntityField, EntityForm, FieldListConfig, FormField } from '@listgrid/schema-core';

// List-column derivation (spec §5.1/§7, CAP-19; W5-2) — the SINGLE source of
// truth for "which fields participate in a list", shared by ViewListGrid's
// own implicit-columns branch (no explicit `columns` prop) AND
// XrefPreferMappingRenderer's display-grid default columns. Both used to
// independently duck-type `'showInList' in field`; this module replaces both
// with one `getListConfig()`-driven derivation. Pure data — no JSX; each
// consumer decides how to turn a derived field into a rendered
// column/header/cell.

/**
 * Every concrete field extends `FormField` (schema-core's field hierarchy —
 * see e.g. `ManyToOneField`), which is where `getListConfig()` (spec §5.1;
 * W5-1) actually lives. The `EntityField` interface
 * (`entityForm.getFields(): EntityField[]`) doesn't (yet) re-declare it, so
 * this narrows via the concrete `FormField` base class schema-core already
 * exports publicly. NOT the business-logic duck-typing this task removes
 * (the old `'showInList' in field` check inspected a boolean VALUE to decide
 * list membership) — this is a structural TS narrowing of a member every
 * field is guaranteed, by schema-core's own class hierarchy, to carry.
 */
function listConfigOf(field: EntityField): FieldListConfig | false | undefined {
  return (field as FormField).getListConfig();
}

/**
 * `field.getDisplayValue` (spec §5.2) isn't implemented by any field class
 * yet — it's a later wave's seam. Looking it up defensively (existence
 * check, not a hard interface member) lets the cell-rendering chain
 * (registry → getDisplayValue → String) degrade gracefully today and pick up
 * real implementations later with no ViewListGrid change.
 */
export function getFieldDisplayValue(field: EntityField, value: unknown): string | undefined {
  const withDisplay = field as unknown as { getDisplayValue?: (value: unknown) => string };
  return typeof withDisplay.getDisplayValue === 'function'
    ? withDisplay.getDisplayValue(value)
    : undefined;
}

export interface DerivedListField {
  field: EntityField;
  config: FieldListConfig;
}

/**
 * Fields participating in the list: `getListConfig()` truthy (an object;
 * `false` = explicit exclude, `undefined` = never declared — spec §5.1).
 * Sub-collections are never columns (child grids, not scalars). Sorted by
 * `config.order ?? field.getOrder()` — a STABLE sort over
 * `entityForm.getFields()` (itself already order-sorted), so ties keep
 * declaration order. Magic fallback ABOLISHED (spec §5.1): 0 truthy
 * declarations yields `[]`, never "first ~4 non-hidden fields".
 */
export function deriveListFields(entityForm: EntityForm): DerivedListField[] {
  const candidates: DerivedListField[] = [];
  for (const field of entityForm.getFields()) {
    if (field.type === 'subCollection') continue;
    const config = listConfigOf(field);
    if (config === undefined || config === false) continue;
    candidates.push({ field, config });
  }
  return candidates.sort(
    (a, b) => (a.config.order ?? a.field.getOrder()) - (b.config.order ?? b.field.getOrder()),
  );
}

/**
 * Just the ordered field NAMES — XrefPreferMappingRenderer's need (it
 * prepends these to its own synthetic `preferred` column as bare
 * `ViewListGridColumn` strings, never the full derived shape).
 */
export function deriveListFieldNames(entityForm: EntityForm): string[] {
  return deriveListFields(entityForm).map(({ field }) => field.getName());
}
