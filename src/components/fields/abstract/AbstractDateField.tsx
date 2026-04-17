/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {ListableFormField, ListableFormFieldProps} from "./ListableFormField";
import {FieldType} from '../../../config/Config';
import {MinMaxStringLimit} from "@gjcu/ui/form/Type";

export interface AbstractDateFieldProps extends ListableFormFieldProps {
  limit?: MinMaxStringLimit;
  range?: boolean;
}

export abstract class AbstractDateField<T extends AbstractDateField<T>> extends ListableFormField<T> {

  limit?: MinMaxStringLimit;
  range?: boolean;

  protected constructor(name: string, order: number, type: FieldType, limit?: MinMaxStringLimit, range?: boolean) {
    super(name, order, type);
    this.limit = limit;
    this.range = range;
  }

  /**
   * range 가 true 면, 시작 시각 ~ 종료 시각 두 가지를 입력받게 됩니다.
   * @param range
   */
  withRange(range?: boolean): this {
    this.range = range;
    return this;
  }

  /**
   * 최소, 최대값 설정
   * @param limit
   */
  withLimit(limit?: MinMaxStringLimit): this {
    this.limit = limit;
    return this;
  }

  /**
   * 최소값 설정
   * @param min
   */
  withMin(min?: string): this {
    this.limit = { min: min, max: this.limit?.max }
    return this;
  }

  /**
   * 최대값 설정
   * @param max
   */
  withMax(max?: string): this {
    this.limit = { min: this.limit?.min, max: max };
    return this;
  }

  protected copyFields(origin: ListableFormFieldProps, includeValue: boolean = true): this {
    return super.copyFields(origin, includeValue).withLimit(this.limit).withRange(this.range);
  }
} 