import { ValidateResult, ValidationItem } from '../validations/Validation';
import { EntityForm } from '../config/EntityForm';
import { FieldValue } from '../config/Config';

export class CustomValidation extends ValidationItem {
  validateFunction: (
    entityForm: EntityForm,
    value: FieldValue,
    message?: string,
  ) => Promise<ValidateResult>;

  constructor(
    id: string,
    validateFunction: (
      entityForm: EntityForm,
      value: FieldValue,
      message?: string,
    ) => Promise<ValidateResult>,
    errorMessage?: string,
  ) {
    super(id, errorMessage);
    this.validateFunction = validateFunction;
  }

  validate(entityForm: EntityForm, value: FieldValue, message?: string): Promise<ValidateResult> {
    return this.validateFunction(entityForm, value, message);
  }
}
