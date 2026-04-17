/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {RegexValidation} from '../validations/RegexValidation';
import {RegexTelephoneNumber} from "@gjcu/ui";
import {ValidateResult} from '../validations/Validation';
import {EntityForm} from '../config/EntityForm';
import {FieldValue} from '../config/Config';
import {removePhoneNumberHyphens} from "@gjcu/ui/utils/PhoneUtil";
import {isBlank} from '@gjcu/ui/utils/StringUtil';

export class TelephoneNumberValidation extends RegexValidation {
  constructor(id?: string, regex?: RegExp, message?: string) {
    super(id ?? 'TelephoneNumberValidation', regex ?? RegexTelephoneNumber, message ?? '전화번호 형식이 올바르지 않습니다.');
  }

  /**
   * 전화번호 검증 시 하이픈을 제거한 후 검증합니다.
   * 빈 값인 경우 검증을 통과시킵니다 (required 검증은 필드의 required 설정으로 처리).
   */
  async validate(entityForm: EntityForm, value: FieldValue, message?: string): Promise<ValidateResult> {
    const currentValue = this.getValueAsString(entityForm, value);
    
    // 빈 값이면 검증 통과 (required 검증은 필드의 required 설정으로 처리)
    if (isBlank(currentValue)) {
      return Promise.resolve(this.returnValidateResult(false, message));
    }
    
    // 하이픈 제거 후 검증
    const digitsOnly = removePhoneNumberHyphens(currentValue);
    const error = !this.regex!.test(digitsOnly);
    
    return Promise.resolve(this.returnValidateResult(error, message));
  }

}
