/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

export function isTrue(value: boolean | string | undefined | unknown, defaultValue?: boolean): boolean {
  if (value === undefined || value === null || value === '') {
    return defaultValue ?? false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return (value === 'true' || value === '1' || value === 'on' || value === 'yes' || value === '예');
}
