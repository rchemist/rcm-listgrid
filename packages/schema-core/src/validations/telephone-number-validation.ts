// Transplanted from src/listgrid/validations/TelephoneNumberValidation.ts
// (0.3.x). NOTE: near-identical to ./phone-number-validation.ts — see the
// comment there for why the duplication is preserved rather than merged.
import { removePhoneNumberHyphens } from '../util/phone';
import { RegexTelephoneNumber } from '../util/regex';
import { getCurrentValue } from '../field/value';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValue } from '../field/types';
import { ValidateResult } from '../validation';
import { RegexValidation } from './regex-validation';

export class TelephoneNumberValidation extends RegexValidation {
  constructor(id?: string, regex?: RegExp, message?: string) {
    super(
      id ?? 'TelephoneNumberValidation',
      regex ?? RegexTelephoneNumber,
      message ?? '전화번호 형식이 올바르지 않습니다.',
    );
  }

  /**
   * 전화번호 검증 시 하이픈을 제거한 후 검증합니다.
   * 빈 값인 경우 검증을 통과시킵니다 (required 검증은 필드의 required 설정으로 처리).
   */
  override async validate(
    ctx: FieldEvalContext,
    value: FieldValue | undefined,
    message?: string,
  ): Promise<ValidateResult> {
    const current = getCurrentValue(value, ctx.renderType);
    const currentValue = current === undefined || current === null ? '' : String(current);

    // 빈 값이면 검증 통과 (required 검증은 필드의 required 설정으로 처리)
    if (currentValue === '') {
      return ValidateResult.success();
    }

    // 하이픈 제거 후 검증
    const digitsOnly = removePhoneNumberHyphens(currentValue);
    const error = !this.regex.test(digitsOnly);

    return error
      ? ValidateResult.fail(message ?? this.getErrorMessage())
      : ValidateResult.success();
  }
}
