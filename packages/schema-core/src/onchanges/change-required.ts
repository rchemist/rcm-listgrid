import type { ChangeHandler, FormMutator } from '../field/form-mutator';
import type { ConditionalMetaClause } from './change-hidden';

function isMatched(clause: ConditionalMetaClause, value: unknown): boolean {
  return typeof clause.value === 'function'
    ? (clause.value as (value: unknown) => boolean)(value)
    : clause.value === value;
}

/**
 * Builds an onChanges handler that sets `required` on target fields based on
 * `sourceField`'s current value. Pure port of 0.3.x onChangeSetFieldRequired
 * (src/listgrid/config/OnChangeEntityForm.ts:293-327), mutating via
 * FormMutator.setMeta (EF1) instead of field.withRequired. Same clause
 * semantics and dispatch-filter rationale as {@link import('./change-hidden').changeHidden}
 * — see that file's doc comment.
 */
export function changeRequired(
  sourceField: string,
  when: ConditionalMetaClause | ConditionalMetaClause[],
): ChangeHandler {
  return (m: FormMutator, changedField: string) => {
    if (changedField !== sourceField) return;
    const value = m.getValue(sourceField);
    if (Array.isArray(when)) {
      for (const clause of when) {
        if (isMatched(clause, value)) {
          for (const [field, required] of Object.entries(clause.result)) {
            m.setMeta(field, { required });
          }
        }
      }
    } else {
      const matched = isMatched(when, value);
      for (const [field, required] of Object.entries(when.result)) {
        m.setMeta(field, { required: matched ? required : !required });
      }
    }
  };
}
