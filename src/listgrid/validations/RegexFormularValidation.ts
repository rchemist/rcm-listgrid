import { ValidateResult, ValidationItem } from '../validations/Validation';
import { EntityForm } from '../config/EntityForm';
import { FieldValue } from '../config/Config';
import { isBlank } from '../utils/StringUtil';

// currentValue가 정규식 패턴인지 확인
const regexPattern = /^\/.*\/[gimsuy]*$/;

export class RegexFormulaValidation extends ValidationItem {
  constructor(id: string) {
    super(id);
  }

  validate(entityForm: EntityForm, value: FieldValue, message?: string): Promise<ValidateResult> {
    const currentValue = this.getValueAsString(entityForm, value);

    let error: boolean = true;

    if (!isBlank(currentValue)) {
      // 정규식의 메타 문자 포함 여부 확인
      const containsMetaChars = /[\^\$\.\*\+\?\(\)\[\]\{\}\|\\]/.test(currentValue);

      if (containsMetaChars) {
        try {
          // 유효한 정규식인지 확인
          new RegExp(currentValue);
          error = false; // 정규식이 유효하다면 error를 false로 설정
        } catch (e) {
          error = true; // 정규식이 유효하지 않다면 error를 true로 유지
        }
      }
    }

    return Promise.resolve(this.returnValidateResult(error, '정규식 문자열을 입력해야 합니다.'));
  }
}
