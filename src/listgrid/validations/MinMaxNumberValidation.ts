/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { ValidateResult, ValidationItem } from '../validations/Validation';
import { EntityForm } from '../config/EntityForm';
import { FieldValue } from '../config/Config';

export class MinMaxNumberValidation extends ValidationItem {
  limit: { min?: number; max?: number };

  constructor(id: string | undefined, limit: { min?: number; max?: number }, message?: string) {
    super(id ?? 'MinMaxNumberValidation', message);
    this.limit = limit;
  }

  validate(entityForm: EntityForm, value: FieldValue, message?: string): Promise<ValidateResult> {
    const numberValue = this.getValueAsNumber(entityForm, value);

    if (isNaN(numberValue)) {
      return Promise.resolve(this.returnValidateResult(true, message));
    }

    let error = false;

    if (this.limit.min || this.limit.max) {
      if (numberValue === undefined) {
        error = true;
      } else {
        if (this.limit.min && numberValue < this.limit.min) {
          error = true;
        } else if (this.limit.max && numberValue > this.limit.max) {
          error = true;
        }
      }
    }

    return Promise.resolve(this.returnValidateResult(error, message));
  }
}
