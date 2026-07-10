// Transplanted from src/listgrid/validations/RegexValidation.ts (0.3.x).
// Signature change (ADR-0003 §Decision 4): validate()'s first param narrows
// EntityForm → FieldEvalContext. The 0.3.x version read the value via
// `getValueAsString(entityForm, value)` (a EntityForm-carrying convenience
// method on the old ValidationItem, not present on the new React-free base);
// this reads the same effective value via the already-transplanted
// `getCurrentValue(value, ctx.renderType)` free function instead — same
// current→default/fetched fallback, EntityForm-free.
import { getCurrentValue } from '../field/value';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValue } from '../field/types';
import { ValidateResult, ValidationItem } from '../validation';

/** Resolve a field's effective value to a string for regex-style checks. */
export function toStringValue(ctx: FieldEvalContext, value: FieldValue | undefined): string {
  const current = getCurrentValue(value, ctx.renderType);
  if (current === undefined || current === null) return '';
  return String(current);
}

export class RegexValidation extends ValidationItem {
  regex: RegExp;

  constructor(id: string, regex: RegExp, message?: string) {
    super(id, message);
    this.regex = regex;
  }

  async validate(
    ctx: FieldEvalContext,
    value: FieldValue | undefined,
    message?: string,
  ): Promise<ValidateResult> {
    const currentValue = toStringValue(ctx, value);

    // required 에 대한 검증은 field 의 required 설정을 통해 해야 한다 — blank passes.
    if (currentValue === '') {
      return ValidateResult.success();
    }

    const error = !this.regex.test(currentValue);
    return error
      ? ValidateResult.fail(message ?? this.getErrorMessage())
      : ValidateResult.success();
  }
}
