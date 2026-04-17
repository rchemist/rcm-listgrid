/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {RegexPasswordNormal} from "@gjcu/ui";
import {RegexValidation} from '../validations/RegexValidation';

export class PasswordValidation extends RegexValidation {

  constructor(id?: string, regex?: RegExp, message?: string) {
    super(id ?? 'PasswordValidation', regex ?? RegexPasswordNormal, message);
  }

}