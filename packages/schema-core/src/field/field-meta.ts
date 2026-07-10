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
  options?: SelectOption[];
  validations?: Validation[];
}
