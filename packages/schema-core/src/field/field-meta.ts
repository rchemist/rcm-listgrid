import type { Validation } from '../validation';
import type { SelectOption } from './basic-fields';

/**
 * Imperative, runtime per-field meta overrides held in the form store (EF1).
 * When a key is set (non-undefined), it WINS over the field's declared /
 * predicate-resolved meta. This is the reactivity substrate the imperative
 * lifecycle (onChanges/onInitialize, EF2/EF3) mutates to reshape a live form.
 */
export interface FieldMetaOverride {
  required?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  /**
   * `| undefined` (beyond plain optionality) is intentional: EF2's
   * changeSelectOptions builder explicitly writes `{ options: undefined }`
   * to REVERT a prior options override back to the field's declared list
   * (the merge is `metaOptions ?? declaredOptions` — see FieldRenderer's
   * SelectRenderer) — under `exactOptionalPropertyTypes`, that explicit-undefined
   * write needs the wider type, not just an absent key.
   */
  options?: SelectOption[] | undefined;
  validations?: Validation[];
}
