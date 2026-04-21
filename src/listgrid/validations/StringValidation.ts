import { ValidateResult, ValidationItem } from '../validations/Validation';
import { EntityForm } from '../config/EntityForm';
import { FieldValue } from '../config/Config';
import { MinMaxLimit } from '../form/Type';

export class StringValidation extends ValidationItem {
  length?: MinMaxLimit;
  regex?: RegExp;

  validate(entityForm: EntityForm, value: FieldValue, message?: string): Promise<ValidateResult> {
    const currentValue = this.getValueAsString(entityForm, value);

    if (this.length) {
      if (this.length.min) {
        if ((currentValue?.length ?? 0) < this.length.min) {
          return Promise.resolve(
            this.returnValidateResult(true, message ?? `Minimum length is ${this.length.min}`),
          );
        }
      }

      if (this.length.max) {
        if ((currentValue?.length ?? 0) > this.length.max) {
          return Promise.resolve(
            this.returnValidateResult(true, message ?? `Maximum length is ${this.length.max}`),
          );
        }
      }
    }

    if (this.regex) {
      if (!this.regex.test(currentValue)) {
        return Promise.resolve(this.returnValidateResult(true));
      }
    }

    return Promise.resolve(this.returnValidateResult(false));
  }

  constructor(
    args: { length?: { min?: number; max?: number }; regex?: RegExp; id: string },
    message?: string,
  ) {
    super(args.id ?? `StringValidation`, message);
    if (args.length !== undefined) {
      this.length = args.length;
    }
    if (args.regex !== undefined) {
      this.regex = args.regex;
    }
  }
}
