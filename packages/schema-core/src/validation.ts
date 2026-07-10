import type { FieldEvalContext } from './field/eval-context';
import type { FieldValue } from './field/types';

// Validation contract (charter C5 — "검증은 필드에 선언한다"). This is the base
// contract only; the 11 concrete validations (Email/Regex/MinMax/Phone/…) are
// transplanted under the P2 oracle in P4. Transplanted from
// src/listgrid/validations/Validation.tsx (0.3.x), with two changes:
//   - `validate()`'s first param narrowed from EntityForm → FieldEvalContext
//     (ADR-0003 §Decision 4; validations were already React-free).
//   - new home is `.ts` (the source `.tsx` held zero JSX — extension was misleading).

/** The outcome of one validation run. Transplanted from Validation.tsx:32-57. */
export class ValidateResult {
  constructor(
    public error: boolean,
    public message: string,
  ) {}

  static fail(message: string): ValidateResult {
    return new ValidateResult(true, message);
  }

  static success(): ValidateResult {
    return new ValidateResult(false, '');
  }

  hasError(): boolean {
    return this.error;
  }

  withMessage(message: string): this {
    this.message = message;
    return this;
  }
}

/** A single declared validation rule. Transplanted from Validation.tsx:6-30. */
export interface Validation {
  id: string;
  message?: string;
  validate(
    ctx: FieldEvalContext,
    value: FieldValue | undefined,
    message?: string,
  ): Promise<ValidateResult>;
  getErrorMessage(): string;
}

/** Abstract base the concrete validations extend. Transplanted from Validation.tsx:59-136. */
export abstract class ValidationItem implements Validation {
  id: string;
  message?: string;

  protected constructor(id: string, message?: string) {
    this.id = id;
    if (message !== undefined) {
      this.message = message;
    }
  }

  abstract validate(
    ctx: FieldEvalContext,
    value: FieldValue | undefined,
    message?: string,
  ): Promise<ValidateResult>;

  getErrorMessage(): string {
    return this.message ?? '';
  }
}
