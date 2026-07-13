import type { DataFieldSpec, EntityForm, SelectOption } from '@listgrid/schema-core';
import type { ValueTransformOption } from './value-transform';
import { isAutoDeriveExcluded, warnAutoDeriveExcluded } from './value-transform';

// Shared field-resolution helpers for export-core.ts / import-core.ts (W6-2b,
// decision 5 — "auto-derive exclusion"). Both sides source their
// `DataFieldSpec[]` the same way (EntityForm.getDataTransfer()) and apply the
// same TIER-3 filter, so this module is the single place that logic lives —
// export and import can never diverge on which fields get dropped, same
// symmetry principle as schema-core's `resolveTransferFields` (W6-1, :448
// fix).

/**
 * Drop TIER-3 fields (no flat xlsx-cell representation — `isAutoDeriveExcluded`,
 * value-transform.ts) from a `DataFieldSpec[]` resolved via
 * `EntityForm.getDataTransfer()`, warning once per dropped field.
 *
 * DESIGN NOTE (W6-2b interpretation of decision 5 — documented, not
 * invented): `EntityForm.getDataTransfer()`'s return is fully RESOLVED
 * (schema-core `data-transfer.ts` doc) — it carries no discriminator for
 * "this field list was auto-derived" vs "the consumer declared it verbatim
 * via `export.fields`/`import.fields`" (both cases produce an identical
 * `DataFieldSpec[]` shape). The wave-entry brief's own wording — "so /excel
 * filters TIER-3 out of the auto-derived set here" — is read literally: this
 * filter applies to whatever field list `DataExporter`/`DataImporter` obtain
 * FROM `getDataTransfer()`, uniformly, because that is the only field-list
 * source this component has (no separate `fields` prop was specified in the
 * brief, and inventing one would be a spec-uncovered addition). This does
 * not contradict the schema layer's "명시하면 그대로 전달" promise, which
 * describes `resolveDataTransferSpec`'s OWN behavior (it never drops
 * composite types, by design) — the additional TIER-3 filter is entirely
 * this `/excel` layer's, applied once, here.
 */
export function filterFlatFields(fields: readonly DataFieldSpec[]): DataFieldSpec[] {
  const result: DataFieldSpec[] = [];
  for (const spec of fields) {
    if (spec.type !== undefined && isAutoDeriveExcluded(spec.type)) {
      warnAutoDeriveExcluded(spec.name, spec.type);
      continue;
    }
    result.push(spec);
  }
  return result;
}

/**
 * The declared `SelectOption[]` for a field, when the underlying
 * `EntityField` carries one (select/multiselect only, TIER 1's option-aware
 * types) — `DataFieldSpec` itself never carries `options` (it is a pure
 * name/label/type projection, schema-core `data-transfer.ts`), so this looks
 * the concrete `EntityField` back up on `entityForm` by name. `EntityField`
 * (entity-field.ts) does not type `options` on its shared interface (only
 * `SelectField`/`MultiSelectField` — via `OptionsField` — carry it), so this
 * uses the same duck-typed cast `@listgrid/react`'s renderers already use
 * for the identical lookup (`multi-select-renderer.tsx`).
 */
export function getFieldSelectOptions(
  entityForm: EntityForm,
  name: string,
): ValueTransformOption[] | undefined {
  const field = entityForm.getField(name);
  if (!field) return undefined;
  const withOptions = field as unknown as { options?: SelectOption[] };
  return withOptions.options;
}

/**
 * The configured `labelField` for a `manyToOne` field (the key on the nested
 * related-entity object whose value the grid displays — `ManyToOneField.
 * getLabelField()`, default `'name'`). `DataFieldSpec` carries no `labelField`
 * (pure name/label/type projection), so — exactly like `getFieldSelectOptions`
 * — this looks the concrete `EntityField` back up on `entityForm` by name and
 * duck-types its `getLabelField()` accessor (only `ManyToOneField` defines it).
 * Returns `undefined` for any field that has no such accessor.
 */
export function getFieldManyToOneLabelField(
  entityForm: EntityForm,
  name: string,
): string | undefined {
  const field = entityForm.getField(name);
  if (!field) return undefined;
  const withLabel = field as unknown as { getLabelField?: () => string };
  return typeof withLabel.getLabelField === 'function' ? withLabel.getLabelField() : undefined;
}
