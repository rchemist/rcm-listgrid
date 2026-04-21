import { ListableFormField, ListableFormFieldProps } from './abstract';
import React from 'react';
import { FieldRenderParameters } from '../../config/EntityField';
import { TextInput } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { EntityForm } from '../../config/EntityForm';
import { ValidateResult } from '../../validations/Validation';
import { isBlank } from '../../utils/StringUtil';
import { MinMaxStringLimit } from '../../form/Type';

interface MonthFieldProps extends ListableFormFieldProps {
  limit?: MinMaxStringLimit | undefined;
}

export class MonthField extends ListableFormField<MonthField> {
  // YYYY-MM
  limit?: MinMaxStringLimit | undefined;

  constructor(name: string, order: number, limit?: MinMaxStringLimit) {
    super(name, order, 'month');
    this.limit = limit;
  }

  /**
   * MonthField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <TextInput
          type={'month'}
          min={this.limit?.min}
          max={this.limit?.max}
          {...await getInputRendererParameters(this, params)}
        ></TextInput>
      );
    })();
  }

  /**
   * MonthField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): MonthField {
    return new MonthField(name, order, this.limit);
  }

  withLimit(limit?: MinMaxStringLimit): this {
    this.limit = limit;
    return this;
  }

  async validate(entityForm: EntityForm): Promise<ValidateResult | ValidateResult[]> {
    const result = await super.validate(entityForm);

    let errored = false;

    if (Array.isArray(result)) {
      if (result.length > 0) {
        for (const validateResult of result) {
          if (validateResult.error) {
            errored = true;
            break;
          }
        }
      }
    } else {
      // 단수일 때
      errored = result.error;
    }

    if (!errored) {
      // 에러가 안 난 경우에만 limit 에 의한 validation 처리를 시작한다.
      if (this.limit !== undefined) {
        const value = await this.getCurrentValue(entityForm.getRenderType());

        if (!isBlank(value)) {
          // value 에 값이 있을 때만 비교한다.
          // YYYY-MM 값이기 때문에 단순 비교해도 된다.
          if (this.limit.min !== undefined && this.limit.min > value) {
            return ValidateResult.fail(`최소 ${this.limit.min} 이상의 값을 선택해야 합니다.`);
          } else if (this.limit.max !== undefined && this.limit.max < value) {
            return ValidateResult.fail(`최대 ${this.limit.max} 이하의 값을 선택해야 합니다.`);
          }
        }
      }
    }

    return result;
  }

  static create(props: MonthFieldProps): MonthField {
    return new MonthField(props.name, props.order, props.limit).copyFields(props, true);
  }
}
