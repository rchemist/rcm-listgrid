/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */
'use client'

import React from "react";
import {
  ListableFormField,
  ListableFormFieldProps,
  ViewListProps,
  ViewListResult,
  ViewRenderProps,
  ViewRenderResult
} from './abstract';
import {MinMaxLimit} from "@gjcu/ui/form/Type";
import {Currency, Double, NumberInput} from "@gjcu/ui/form/NumberInput";
import {FieldRenderParameters, FilterRenderParameters} from '../../config/EntityField';
import {getInputRendererParameters} from '../helper/FieldRendererHelper';
import {formatPrice} from "@gjcu/ui";
import {IconCoin, IconHash} from "@tabler/icons-react";
import {NumberFilter} from './filter/NumberFilter';
import {EntityForm} from "../../config/EntityForm";
import {Session} from '../../auth/types';
import {ValidateResult} from "../../validations/Validation";


interface NumberFieldProps extends ListableFormFieldProps {
  currency?: Currency;
  double?: Double;
  limit?: MinMaxLimit;
}

export class NumberField extends ListableFormField<NumberField> {
  
  // 이 숫자가 통화를 의미하는지
  currency?: Currency;

  // double 값이 있으면 소수점을 지원한다는 뜻
  double?: Double;
  
  limit?: MinMaxLimit;

  withMin(min?: number): this {
    if (this.limit) {
      this.limit.min = min;
    } else {
      this.limit = {min: min};
    }
    return this;
  }

  withMax(max?: number): this {
    if (this.limit) {
      this.limit.max = max;
    } else {
      this.limit = {max: max};
    }
    return this;
  }

  withLimit(limit?: MinMaxLimit): this {
    this.limit = limit;
    return this;
  }

  withCurrency(currency?: Currency): this {
    this.currency = currency;
    return this;
  }

  withDouble(double?: Double): this {
    this.double = double;
    return this;
  }

  constructor(name: string, order: number, props?: { limit?: MinMaxLimit, currency?: Currency, double?: Double }) {
    super(name, order, 'number');
    this.limit = props?.limit;
    this.currency = props?.currency;
    this.double = props?.double;
  }

  /**
   * NumberField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return <NumberInput limit={this.limit} 
                         currency={this.currency} 
                         double={this.double} 
                         {...await getInputRendererParameters(this, params)}></NumberInput>
    })();
  }

  /**
   * NumberField 핵심 리스트 필터 렌더링 로직
   */
  protected renderListFilterInstance(params: FilterRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return <NumberFilter onChange={(queryConditionType, value) => {
        params.onChange(value, queryConditionType)
      }}
      onRemove={() => {
        params.onChange('')
      }}/>;
    })();
  }

  /**
   * NumberField 핵심 리스트 아이템 렌더링 로직
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    if (props.item[this.name] !== undefined) {
      const numberValue = props.item[this.name];
      return Promise.resolve({result: formatPrice(numberValue)});
    }
    // 기본 값 표시
    const value = String(props.item[this.name] ?? '');
    return Promise.resolve({ result: value });
  }

  /**
   * NumberField View 모드 렌더링 - 숫자 포맷팅
   * compact 모드: 아이콘 없이 깔끔한 텍스트만 표시
   * 일반 모드: 아이콘 + 포맷된 숫자 표시
   */
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    const value = props.item[this.name];

    // null, undefined, 빈 문자열 처리
    if (value === null || value === undefined || value === '') {
      return { result: null };
    }

    const numberValue = Number(value);
    if (isNaN(numberValue)) {
      return { result: String(value) };
    }

    // formatPrice 함수를 사용하여 천단위 구분자 적용
    const formattedValue = formatPrice(numberValue);

    // currency 설정이 있으면 통화 기호 추가
    if (this.currency) {
      const currencyCode = this.currency.currencyCode ?? 'KRW';
      const currencySymbol = currencyCode === 'KRW' ? '원' :
                            currencyCode === 'USD' ? '$' :
                            currencyCode === 'EUR' ? '€' :
                            currencyCode === 'JPY' ? '¥' :
                            currencyCode === 'GBP' ? '£' : '';

      // position에 따라 기호 위치 결정
      const displayText = (this.currency.position === 'after' || currencyCode === 'KRW')
        ? `${formattedValue}${currencySymbol}`
        : `${currencySymbol}${formattedValue}`;

      // compact 모드: 텍스트만 반환
      if (props.compact) {
        return { result: displayText };
      }

      // 일반 모드: 아이콘 + 텍스트
      const IconComponent = this.cardIcon || IconCoin;
      const iconColorClass = this.cardIcon
        ? 'text-gray-400 dark:text-gray-500'
        : 'text-emerald-500 dark:text-emerald-400';

      return {
        result: (
          <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/50">
              <IconComponent className={`h-3.5 w-3.5 ${iconColorClass} shrink-0`} stroke={1.75} />
            </span>
            <span className="font-semibold tabular-nums">{displayText}</span>
          </span>
        )
      };
    }

    // compact 모드: 텍스트만 반환
    if (props.compact) {
      return { result: formattedValue };
    }

    // 일반 모드: 아이콘 + 텍스트
    const IconComponent = this.cardIcon || IconHash;
    const iconColorClass = this.cardIcon
      ? 'text-gray-400 dark:text-gray-500'
      : 'text-violet-500 dark:text-violet-400';

    return {
      result: (
        <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/50">
            <IconComponent className={`h-3.5 w-3.5 ${iconColorClass} shrink-0`} stroke={1.75} />
          </span>
          <span className="font-medium tabular-nums">{formattedValue}</span>
        </span>
      )
    };
  }

  /**
   * NumberField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): NumberField {
    return new NumberField(name, order, {
      limit: this.limit, 
      currency: this.currency, 
      double: this.double
    });
  }

  static create(props: NumberFieldProps): NumberField {
    return new NumberField(props.name, props.order, {limit: props.limit, currency: props.currency, double: props.double})
      .copyFields(props, true);
  }

  async validate(entityForm: EntityForm, session?: Session): Promise<ValidateResult | ValidateResult[]> {
    // hidden 또는 readonly인 경우 min/max 검증 건너뛰기
    if (await this.isHidden({ entityForm, session }) || await this.isReadonly({ entityForm, session })) {
      return ValidateResult.success();
    }

    const result = await super.validate(entityForm, session);

    // result 는 ValidateResult 단수거나 ValidateResult[] 이다.
    // ValidateResult 의 error 여부를 판단해 최종으로 에러가 안 났으면 NumberField 자체의 기본 검증을 처리한다.
    // 여기서 기본 검증이란 min, max 값 검증을 의미한다.

    if (!this.hasError(result)) {
      if (this.limit) {
        const value = await entityForm.getValue(this.name);
        if (value !== undefined && value !== '') {
          const numberValue = Number(value);
          if (this.limit.min !== undefined && numberValue < this.limit.min) {
            return ValidateResult.fail(`${this.getLabel()} 값은 ${this.limit.min} 이상이어야 합니다.`);
          }
          if (this.limit.max !== undefined && numberValue > this.limit.max) {
            return ValidateResult.fail(`${this.getLabel()} 값은 ${this.limit.max} 이하이어야 합니다.`);
          }
        }
      }
      return ValidateResult.success();
    }

    return result;
  }

  private hasError(result: ValidateResult | ValidateResult[]): boolean {
    if (Array.isArray(result)) {
      return result.some(r => r.hasError());
    }
    return result.hasError();
  }
}
