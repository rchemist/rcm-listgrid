/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { ListableFormField, ListableFormFieldProps, UserListFieldProps } from './abstract';
import React from 'react';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { MinMaxLimit, SelectOption } from '../../form/Type';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { NumberInput } from '../../ui';
import { SelectBox } from '../../ui';
import { MultiSelectBox } from '../../ui';

interface YearFieldProps extends ListableFormFieldProps {
  limit?: MinMaxLimit;
}

export class YearField extends ListableFormField<YearField> {
  limit?: MinMaxLimit;

  constructor(name: string, order: number, limit?: MinMaxLimit) {
    super(name, order, 'year');
    // min/max 기본값 설정: 전달되지 않은 경우 기본값 사용
    const defaultMin = 1900;
    const defaultMax = new Date().getFullYear();
    this.limit = {
      min: limit?.min ?? defaultMin,
      max: limit?.max ?? defaultMax,
    };
  }

  /**
   * YearField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      if (this.limit) {
        const options: SelectOption[] = [];
        const min: number = this.limit.min!;
        const max: number = this.limit.max!;
        // loop min to max
        for (let i = min; i <= max; i++) {
          options.push({ value: `${i}`, label: `${i}` });
        }
        // sort by value desc
        options.sort((a, b) => b.value - a.value);

        return (
          <SelectBox
            options={options}
            {...await getInputRendererParameters(this, params)}
          ></SelectBox>
        );
      }

      return (
        <NumberInput
          limit={this.limit}
          {...await getInputRendererParameters(this, params)}
        ></NumberInput>
      );
    })();
  }

  /**
   * YearField 리스트 필터 렌더링 로직
   * 복수 년도 선택이 가능한 MultiSelectBox로 렌더링
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      if (this.limit) {
        const options: SelectOption[] = [];
        const min: number = this.limit.min!;
        const max: number = this.limit.max!;
        for (let i = min; i <= max; i++) {
          options.push({ value: `${i}`, label: `${i}` });
        }
        // sort by value desc (최신 년도가 위로)
        options.sort((a, b) => Number(b.value) - Number(a.value));

        return (
          <MultiSelectBox
            options={options}
            {...await getInputRendererParameters(this, {
              ...params,
              required: false,
              onChange: (value) => params.onChange(value, 'IN'),
            })}
          />
        );
      }
      return null;
    })();
  }

  /**
   * YearField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): YearField {
    return new YearField(name, order, this.limit);
  }

  /**
   * YearField 목록 필드 설정
   * MultiSelectBox를 사용하므로 multiFilter를 true로 설정
   */
  useListField(props?: number | UserListFieldProps): this {
    if (typeof props === 'number') {
      props = { order: props };
    }
    this.listConfig = {
      ...this.listConfig,
      support: true,
      order: props?.order,
      multiFilter: true,
      op: 'IN',
      sortable: props?.sortable,
      filterable: props?.filterable,
    };
    return this;
  }

  withLimit(limit?: MinMaxLimit): this {
    const defaultMin = 1900;
    const defaultMax = new Date().getFullYear();
    this.limit = {
      min: limit?.min ?? defaultMin,
      max: limit?.max ?? defaultMax,
    };
    return this;
  }

  static create(props: YearFieldProps): YearField {
    return new YearField(props.name, props.order, props.limit).copyFields(props, true);
  }
}
