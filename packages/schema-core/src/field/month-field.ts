import { ValidateResult } from '../validation';
import type { MinMaxStringLimit } from './basic-fields';
import type { FieldEvalContext } from './eval-context';
import type { FieldMetaOverride } from './field-meta';
import { FormField } from './form-field';
import { getCurrentValue, isBlank } from './value';

// Month field (EA-A fan-out). Transplant of 0.3.x
// `src/listgrid/components/fields/MonthField.tsx:15-94` — META ONLY (charter
// C4): the renderer (native `<input type="month">`, `@listgrid/react`
// month-renderer.tsx) owns rendering; this class owns the declaration +
// limit-bound validate() override.

/**
 * Month picker (0.3.x `MonthField`, type 'month'). Value is a `YYYY-MM`
 * string. `limit` bounds are compared LEXICOGRAPHICALLY — deliberate, not a
 * bug: for the fixed-width `YYYY-MM` shape, string order equals chronological
 * order, so the 0.3.x engine skipped date parsing entirely
 * (`MonthField.tsx:79-82`). Faithful transplant — do not "fix" this into a
 * Date-parsing comparison.
 */
export class MonthField extends FormField<string> {
  limit?: MinMaxStringLimit;

  constructor(name: string, order: number, limit?: MinMaxStringLimit) {
    super(name, order, 'month');
    if (limit !== undefined) this.limit = limit;
  }

  /** Transplant of `MonthField.withLimit:47-50`. */
  withLimit(limit?: MinMaxStringLimit): this {
    if (limit !== undefined) this.limit = limit;
    else delete this.limit;
    return this;
  }

  /**
   * Transplant of `MonthField.validate:52-89`: run the base `validate()`
   * (required-blank + declared validations) first; only on a clean base
   * result, and only when a `limit` is declared and the value is non-blank,
   * lexicographically compare the `YYYY-MM` current value against
   * `limit.min`/`limit.max` (min-then-max, `else if` in the original — same
   * short-circuit here since only one of the two can fire per call).
   */
  async validate(ctx: FieldEvalContext, override?: FieldMetaOverride): Promise<ValidateResult[]> {
    const results = await super.validate(ctx, override);
    if (results.length > 0) return results;
    if (this.limit === undefined) return results;
    if (isBlank(ctx.value, ctx.renderType)) return results;

    const value = getCurrentValue(ctx.value, ctx.renderType);
    if (typeof value !== 'string') return results;

    if (this.limit.min !== undefined && this.limit.min > value) {
      return [ValidateResult.fail(`최소 ${this.limit.min} 이상의 값을 선택해야 합니다.`)];
    } else if (this.limit.max !== undefined && this.limit.max < value) {
      return [ValidateResult.fail(`최대 ${this.limit.max} 이하의 값을 선택해야 합니다.`)];
    }

    return results;
  }
}
