// Transplanted from src/listgrid/validations/MinMaxNumberValidation.ts (0.3.x).
//
// DELIBERATE DEVIATION from 0.3.x: the original computed `numberValue =
// getValueAsNumber(entityForm, value)` unconditionally and failed whenever
// that was NaN — including on a genuinely blank/unset value (Number(undefined)
// === NaN), which meant a MinMaxNumberValidation attached to an optional
// numeric field silently doubled as a required-check. Per the transplant
// brief, required-ness is the field's job, not a range validation's — so a
// blank value now explicitly passes before the NaN/range check runs. The
// bound comparisons themselves (including the `this.limit.min ||
// this.limit.max` truthy guard — a min of `0` is treated as "unset", exactly
// as 0.3.x did) are preserved verbatim.
import { getCurrentValue, isBlank } from '../field/value';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValue } from '../field/types';
import type { MinMaxLimit } from '../field/basic-fields';
import { ValidateResult, ValidationItem } from '../validation';

export class MinMaxNumberValidation extends ValidationItem {
  limit: MinMaxLimit;

  constructor(id: string | undefined, limit: MinMaxLimit, message?: string) {
    super(id ?? 'MinMaxNumberValidation', message);
    this.limit = limit;
  }

  async validate(
    ctx: FieldEvalContext,
    value: FieldValue | undefined,
    message?: string,
  ): Promise<ValidateResult> {
    if (isBlank(value, ctx.renderType)) {
      return ValidateResult.success();
    }

    const numberValue = Number(getCurrentValue(value, ctx.renderType));

    if (isNaN(numberValue)) {
      return ValidateResult.fail(message ?? this.getErrorMessage());
    }

    let error = false;

    if (this.limit.min || this.limit.max) {
      if (this.limit.min && numberValue < this.limit.min) {
        error = true;
      } else if (this.limit.max && numberValue > this.limit.max) {
        error = true;
      }
    }

    return error
      ? ValidateResult.fail(message ?? this.getErrorMessage())
      : ValidateResult.success();
  }
}
