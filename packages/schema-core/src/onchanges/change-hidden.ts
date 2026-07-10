import type { FormMutator, OnChangesHandler } from '../field/form-mutator';

/**
 * A single "when sourceField's value matches, apply these booleans" clause.
 * Shared shape for changeHidden/changeRequired — a Record-keyed adaptation of
 * 0.3.x ConditionalProps (src/listgrid/config/OnChangeEntityForm.ts:9), which
 * used a Map<string, boolean>.
 */
export interface ConditionalMetaClause {
  /** matched by strict equality, or by predicate if a function. */
  value: unknown | ((value: unknown) => boolean);
  /** target field name -> the boolean to apply when this clause matches. */
  result: Record<string, boolean>;
}

function isMatched(clause: ConditionalMetaClause, value: unknown): boolean {
  return typeof clause.value === 'function'
    ? (clause.value as (value: unknown) => boolean)(value)
    : clause.value === value;
}

/**
 * Builds an onChanges handler that sets `hidden` on target fields based on
 * `sourceField`'s current value. Pure port of 0.3.x onChangeSetFieldHidden
 * (OnChangeEntityForm.ts:328-361), mutating via FormMutator.setMeta (EF1)
 * instead of field.withHidden. Semantics preserved:
 *  - single clause: EVERY target in `result` is written on every dispatch —
 *    matched -> the declared boolean, unmatched -> its negation (old
 *    "singular option" branch).
 *  - array of clauses: only clauses whose value matches apply (no negation,
 *    no revert-on-no-match — old array branch never reverted hidden).
 * Only dispatches when `changedField === sourceField`: the 0.3.x handler
 * recomputed unconditionally on every field's change, but its result only
 * ever depends on sourceField's value, so skipping dispatches that cannot
 * have changed that value is a no-op-equivalent optimization, not a
 * semantic change.
 */
export function changeHidden(
  sourceField: string,
  when: ConditionalMetaClause | ConditionalMetaClause[],
): OnChangesHandler {
  return (m: FormMutator, changedField: string) => {
    if (changedField !== sourceField) return;
    const value = m.getValue(sourceField);
    if (Array.isArray(when)) {
      for (const clause of when) {
        if (isMatched(clause, value)) {
          for (const [field, hidden] of Object.entries(clause.result)) {
            m.setMeta(field, { hidden });
          }
        }
      }
    } else {
      const matched = isMatched(when, value);
      for (const [field, hidden] of Object.entries(when.result)) {
        m.setMeta(field, { hidden: matched ? hidden : !hidden });
      }
    }
  };
}
