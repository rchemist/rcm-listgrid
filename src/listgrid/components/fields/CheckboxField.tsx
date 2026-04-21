import {
  MultipleOptionalField,
  MultipleOptionalFieldProps,
  renderListMultipleOptionalField,
  ViewListProps,
  ViewListResult,
} from './abstract';
import React from 'react';
import { MinMaxLimit, SelectOption } from '../../form/Type';
import { FieldRenderParameters } from '../../config/EntityField';
import { CheckBox } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';

interface CheckboxFieldProps extends MultipleOptionalFieldProps {}

export class CheckboxField extends MultipleOptionalField<CheckboxField> {
  constructor(name: string, order: number, options: SelectOption[], limit?: MinMaxLimit) {
    super(name, order, 'checkbox', options, limit);
  }

  /**
   * CheckboxField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const cacheKey = this.createCacheKey();
      return (
        <CheckBox
          key={cacheKey}
          limit={this.limit}
          combo={this.combo}
          options={this.options ?? []}
          {...await getInputRendererParameters(this, params)}
        ></CheckBox>
      );
    })();
  }

  /**
   * CheckboxField 핵심 리스트 아이템 렌더링 로직
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    return renderListMultipleOptionalField(this, props);
  }

  /**
   * CheckboxField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): CheckboxField {
    return new CheckboxField(name, order, this.options!, this.limit);
  }

  static create(props: CheckboxFieldProps): CheckboxField {
    return new CheckboxField(props.name, props.order, props.options!, props.limit).copyFields(
      props,
      true,
    );
  }
}
