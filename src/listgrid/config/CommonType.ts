/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { SelectOption } from '../form/Type';

export const AdjustmentTypes: SelectOption[] = [
  { label: '고정 가격', value: 'FIXED_PRICE' },
  { label: '금액 추가', value: 'ADD_AMOUNT' },
  { label: '비율 추가', value: 'ADD_PERCENT' },
  { label: '금액 할인', value: 'OFF_AMOUNT' },
  { label: '비율 할인', value: 'OFF_PERCENT' },
];

export type AdjustmentType =
  | 'FIXED_PRICE'
  | 'ADD_AMOUNT'
  | 'ADD_PERCENT'
  | 'OFF_AMOUNT'
  | 'OFF_PERCENT';

export function getAdjustmentTypeLabel(adjustmentType: AdjustmentType): string {
  for (const type of AdjustmentTypes) {
    if (type.value === adjustmentType) {
      return type.label ?? type.value;
    }
  }
  return adjustmentType;
}
