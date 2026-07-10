// Transplanted verbatim from src/listgrid/validations/PasswordValidation.ts
// (0.3.x). Note: unlike EmailValidation/PhoneNumberValidation, 0.3.x gives
// this no default Korean message — `message` stays undefined when the caller
// doesn't pass one, so getErrorMessage() falls back to the base default.
import { RegexPasswordNormal } from '../util/regex';
import { RegexValidation } from './regex-validation';

export class PasswordValidation extends RegexValidation {
  constructor(id?: string, regex?: RegExp, message?: string) {
    super(id ?? 'PasswordValidation', regex ?? RegexPasswordNormal, message);
  }
}
