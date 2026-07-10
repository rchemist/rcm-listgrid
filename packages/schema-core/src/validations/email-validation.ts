// Transplanted verbatim from src/listgrid/validations/EmailValidation.ts (0.3.x).
import { RegexEmailAddress } from '../util/regex';
import { RegexValidation } from './regex-validation';

export class EmailValidation extends RegexValidation {
  constructor(id?: string, regex?: RegExp, message?: string) {
    super(
      id ?? 'EmailValidation',
      regex ?? RegexEmailAddress,
      message ?? '이메일 형식으로 입력해주세요',
    );
  }
}
