/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

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
