import type { SelectOption } from '../field/basic-fields';
import type { FormMutator, OnChangesHandler } from '../field/form-mutator';

/**
 * A single "when sourceField's value matches, apply these option lists"
 * clause. Record-keyed adaptation of 0.3.x ConditionalSelectOptionProps
 * (src/listgrid/config/OnChangeEntityForm.ts:10-14). The 0.3.x
 * `defaultValue` member is dropped: its own call sites
 * (OnChangeEntityForm.ts:203-292, the `changeOptions({...})` calls) never
 * actually passed it through, so it was already dead in the source.
 */
export interface ConditionalSelectOptionsClause {
  /** matched by strict equality, or by predicate if a function. */
  value: unknown | ((value: unknown) => boolean);
  /** target field name -> the SelectField options to apply when matched. */
  result: Record<string, SelectOption[]>;
}

function isMatched(clause: ConditionalSelectOptionsClause, value: unknown): boolean {
  return typeof clause.value === 'function'
    ? (clause.value as (value: unknown) => boolean)(value)
    : clause.value === value;
}

/**
 * Builds an onChanges handler that sets a SelectField's `options` on target
 * fields based on `sourceField`'s current value. Pure port of 0.3.x
 * onChangeSetSelectOptions (OnChangeEntityForm.ts:203-292), mutating via
 * FormMutator.setMeta (EF1) instead of OptionalField.changeOptions/
 * revertOptions. Unlike changeHidden/changeRequired, 0.3.x treated the
 * singular- and array-clause branches identically here (match -> apply,
 * no-match -> revert in BOTH branches), so both modes share one loop.
 * "Revert" = setMeta(field, { options: undefined }) — an undefined override
 * falls back to the field's declared options via the EF1 `??` merge (see
 * FieldRenderer's SelectRenderer), matching 0.3.x revertOptions's effect.
 * Only dispatches when `changedField === sourceField` — see changeHidden's
 * doc comment for why that is dispatch-equivalent to the 0.3.x unconditional
 * recompute.
 */
export function changeSelectOptions(
  sourceField: string,
  when: ConditionalSelectOptionsClause | ConditionalSelectOptionsClause[],
): OnChangesHandler {
  return (m: FormMutator, changedField: string) => {
    if (changedField !== sourceField) return;
    const value = m.getValue(sourceField);
    const clauses = Array.isArray(when) ? when : [when];
    for (const clause of clauses) {
      if (isMatched(clause, value)) {
        for (const [field, options] of Object.entries(clause.result)) {
          m.setMeta(field, { options });
        }
      } else {
        for (const field of Object.keys(clause.result)) {
          m.setMeta(field, { options: undefined });
        }
      }
    }
  };
}
