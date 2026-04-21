import { RegexPasswordNormal } from '../misc';
import { RegexValidation } from '../validations/RegexValidation';

export class PasswordValidation extends RegexValidation {
  constructor(id?: string, regex?: RegExp, message?: string) {
    super(id ?? 'PasswordValidation', regex ?? RegexPasswordNormal, message);
  }
}
