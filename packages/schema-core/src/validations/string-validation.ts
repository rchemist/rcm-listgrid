// Transplanted from src/listgrid/validations/StringValidation.ts (0.3.x).
//
// DELIBERATE DEVIATION from 0.3.x (same rationale as
// min-max-number-validation.ts): a blank value now passes before the
// length/regex checks run, instead of falling through to a `0 < minLength`
// failure — required-ness is the field's job. The bound comparisons and
// default messages are otherwise preserved verbatim.
import { getCurrentValue, isBlank } from '../field/value';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValue } from '../field/types';
import type { MinMaxLimit } from '../field/basic-fields';
import { ValidateResult, ValidationItem } from '../validation';

export class StringValidation extends ValidationItem {
  length?: MinMaxLimit;
  regex?: RegExp;

  constructor(args: { length?: MinMaxLimit; regex?: RegExp; id: string }, message?: string) {
    super(args.id ?? 'StringValidation', message);
    if (args.length !== undefined) {
      this.length = args.length;
    }
    if (args.regex !== undefined) {
      this.regex = args.regex;
    }
  }

  async validate(
    ctx: FieldEvalContext,
    value: FieldValue | undefined,
    message?: string,
  ): Promise<ValidateResult> {
    if (isBlank(value, ctx.renderType)) {
      return ValidateResult.success();
    }

    const current = getCurrentValue(value, ctx.renderType);
    const currentValue = current === undefined || current === null ? '' : String(current);

    if (this.length) {
      if (this.length.min) {
        if (currentValue.length < this.length.min) {
          return ValidateResult.fail(message ?? `Minimum length is ${this.length.min}`);
        }
      }

      if (this.length.max) {
        if (currentValue.length > this.length.max) {
          return ValidateResult.fail(message ?? `Maximum length is ${this.length.max}`);
        }
      }
    }

    if (this.regex) {
      if (!this.regex.test(currentValue)) {
        return ValidateResult.fail(this.getErrorMessage());
      }
    }

    return ValidateResult.success();
  }
}
