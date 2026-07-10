import { ValidateResult } from '../validation';
import type { MinMaxLimit, SelectOption } from './basic-fields';
import type { FieldEvalContext } from './eval-context';
import type { FieldMetaOverride } from './field-meta';
import { FormField } from './form-field';
import { getCurrentValue } from './value';

// Options-carrying field bases (EA-A0 pre-stage, PART 3 item 1). MINIMAL
// transplant of 0.3.x `abstract/OptionalField.tsx:55-346` — only the pieces
// every options-carrying field actually needs to declare + validate:
//   - options (the SelectOption[] the field renders from)
//   - a selected-count limit + the min/max-count validate() override
// EXCLUDED (UX-variant knobs, not core to "a field backed by options"; can be
// added to a fan-out field individually if a consumer needs them):
// combo/chipConfig/preservedOptions/singleFilter/changeOptions/revertOptions.
// Consumers: CheckboxField/MultiSelectField/TagField (EA-A fan-out, PART 2).

/**
 * A field whose value is drawn from a declared set of {@link SelectOption}s
 * (0.3.x `OptionalField`, `OptionalField.tsx:55-201` — MINIMAL: options only).
 */
export abstract class OptionsField<TValue = unknown> extends FormField<TValue> {
  options?: SelectOption[];

  /** Transplant of `OptionalField.withOptions:86-90`. */
  withOptions(options?: SelectOption[]): this {
    if (options !== undefined) this.options = [...options];
    else delete this.options;
    return this;
  }
}

/**
 * An {@link OptionsField} that can hold MULTIPLE selected values, with a
 * selected-count limit (min/max) enforced at validate() (0.3.x
 * `MultipleOptionalField`, `OptionalField.tsx:210-345` — MINIMAL: limit +
 * the validate() override only; `createCacheKey` is dropped — store-driven
 * rendering makes memo-key computation the renderer's concern, not the
 * field's).
 */
export abstract class MultiOptionsField<TValue = unknown> extends OptionsField<TValue> {
  limit?: MinMaxLimit;

  /** Transplant of `MultipleOptionalField.withLimit:223-227`. */
  withLimit(limit?: MinMaxLimit): this {
    if (limit !== undefined) this.limit = limit;
    else delete this.limit;
    return this;
  }

  /** Transplant of `MultipleOptionalField.withMin:233-239`. */
  withMin(min?: number): this {
    const newLimit: MinMaxLimit = {};
    if (min !== undefined) newLimit.min = min;
    if (this.limit?.max !== undefined) newLimit.max = this.limit.max;
    this.limit = newLimit;
    return this;
  }

  /** Transplant of `MultipleOptionalField.withMax:245-251`. */
  withMax(max?: number): this {
    const newLimit: MinMaxLimit = {};
    if (this.limit?.min !== undefined) newLimit.min = this.limit.min;
    if (max !== undefined) newLimit.max = max;
    this.limit = newLimit;
    return this;
  }

  /**
   * Selected-count validate override — transplant of
   * `MultipleOptionalField.validate`/`validateWithLimit`
   * (`OptionalField.tsx:281-345`) semantics: run the base `validate()`
   * first (required-blank + declared validations); if that already failed,
   * limit checking is skipped (no noise on top of an existing error, same
   * as the 0.3.x `!errored` guard). Only on a clean base result, and only
   * when a `limit` is declared, compare the array-valued current value's
   * length against `limit.min`/`limit.max`. A defined-but-non-array value
   * with `limit.min` set fails too (0.3.x's singular-value branch,
   * `OptionalField.tsx:336-339`).
   */
  async validate(ctx: FieldEvalContext, override?: FieldMetaOverride): Promise<ValidateResult[]> {
    const results = await super.validate(ctx, override);
    if (results.length > 0) return results;
    if (this.limit === undefined) return results;

    const value = getCurrentValue(ctx.value, ctx.renderType);
    if (value === undefined) return results;

    if (Array.isArray(value)) {
      const selected = value.length;
      if (this.limit.min !== undefined && selected < this.limit.min) {
        return [ValidateResult.fail(`최소 ${this.limit.min}개 이상을 선택해야 합니다.`)];
      }
      if (this.limit.max !== undefined && selected > this.limit.max) {
        return [ValidateResult.fail(`최대 ${this.limit.max}개까지 선택할 수 있습니다.`)];
      }
    } else if (this.limit.min !== undefined) {
      return [ValidateResult.fail(`최소 ${this.limit.min}개 이상을 선택해야 합니다.`)];
    }

    return results;
  }
}
