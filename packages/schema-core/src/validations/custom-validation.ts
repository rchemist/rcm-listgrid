// Transplanted from src/listgrid/validations/CustomValidation.ts (0.3.x).
// Signature change (ADR-0003 §Decision 4, same as every other concrete
// validation here): the wrapped validateFunction's first param narrows
// EntityForm → FieldEvalContext.
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValue } from '../field/types';
import { ValidateResult, ValidationItem } from '../validation';

export class CustomValidation extends ValidationItem {
  validateFunction: (
    ctx: FieldEvalContext,
    value: FieldValue | undefined,
    message?: string,
  ) => Promise<ValidateResult>;

  constructor(
    id: string,
    validateFunction: (
      ctx: FieldEvalContext,
      value: FieldValue | undefined,
      message?: string,
    ) => Promise<ValidateResult>,
    errorMessage?: string,
  ) {
    super(id, errorMessage);
    this.validateFunction = validateFunction;
  }

  validate(
    ctx: FieldEvalContext,
    value: FieldValue | undefined,
    message?: string,
  ): Promise<ValidateResult> {
    return this.validateFunction(ctx, value, message);
  }
}
