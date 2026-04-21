import { RegexValidation } from '../validations/RegexValidation';
import { RegexEmailAddress } from '../misc';

export class EmailValidation extends RegexValidation {
  constructor(id?: string, regex?: RegExp, message?: string) {
    super(
      id ?? 'EmailValidation',
      regex ?? RegexEmailAddress,
      message ?? '이메일 형식으로 입력해주세요',
    );
  }
}
