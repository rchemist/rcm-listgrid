/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {ValidateResult, ValidationItem} from '../validations/Validation';
import {EntityForm} from '../config/EntityForm';
import {FieldValue} from '../config/Config';
import {isBlank} from '@gjcu/ui/utils/StringUtil';

export class RequiredValidation extends ValidationItem {
  constructor(id: string, message?: string) {
    super(id, message ?? '이 값은 반드시 입력해야 합니다.');
  }

  validate(entityForm: EntityForm, value: FieldValue, message?: string): Promise<ValidateResult> {

    const currentValue = this.getValueAsString(entityForm, value);

    const error = isBlank(currentValue);

    return Promise.resolve(this.returnValidateResult(error, message));
  }

}
