// Transplanted verbatim from src/listgrid/validations/RegexFormularValidation.ts
// (0.3.x; the file was misspelled "Formular" — the class itself was already
// spelled correctly as RegexFormulaValidation, and we keep that canonical
// spelling for the file too).
//
// NOTE this validator is NOT "blank passes" like the other validations here —
// it checks whether the *value itself* is a syntactically valid regex-literal
// string (for a "regex formula" field), and a blank value is definitionally
// not a valid regex formula. 0.3.x fails on blank (`error` defaults to `true`
// and is only cleared once a valid RegExp is parsed) — preserved as-is.
import { getCurrentValue } from '../field/value';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValue } from '../field/types';
import { ValidateResult, ValidationItem } from '../validation';

export class RegexFormulaValidation extends ValidationItem {
  constructor(id: string) {
    super(id);
  }

  async validate(ctx: FieldEvalContext, value: FieldValue | undefined): Promise<ValidateResult> {
    const current = getCurrentValue(value, ctx.renderType);
    const currentValue = current === undefined || current === null ? '' : String(current);

    let error = true;

    if (currentValue !== '') {
      // 정규식의 메타 문자 포함 여부 확인
      const containsMetaChars = /[\^$.*+?()[\]{}|\\]/.test(currentValue);

      if (containsMetaChars) {
        try {
          // 유효한 정규식인지 확인
          new RegExp(currentValue);
          error = false; // 정규식이 유효하다면 error를 false로 설정
        } catch {
          error = true; // 정규식이 유효하지 않다면 error를 true로 유지
        }
      }
    }

    return error
      ? ValidateResult.fail('정규식 문자열을 입력해야 합니다.')
      : ValidateResult.success();
  }
}
