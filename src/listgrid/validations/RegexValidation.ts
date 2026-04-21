import { ValidateResult, ValidationItem } from '../validations/Validation';
import { EntityForm } from '../config/EntityForm';
import { FieldValue } from '../config/Config';
import { isBlank } from '../utils/StringUtil';

export class RegexValidation extends ValidationItem {
  regex: RegExp;

  constructor(id: string, regex: RegExp, message?: string) {
    super(id, message);
    this.regex = regex;
  }

  validate(entityForm: EntityForm, value: FieldValue, message?: string): Promise<ValidateResult> {
    const currentValue = this.getValueAsString(entityForm, value);

    // required 에 대한 검증은 field 의 required 설정을 통해 해야 한다.
    if (isBlank(currentValue)) {
      return Promise.resolve(this.returnValidateResult(false, message));
    }

    const error = !this.regex!.test(currentValue);

    return Promise.resolve(this.returnValidateResult(error, message));
  }
}
