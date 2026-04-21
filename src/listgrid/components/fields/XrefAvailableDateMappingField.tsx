import { FormField, FormFieldProps } from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import React from 'react';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { EntityForm } from '../../config/EntityForm';
import {
  XrefAvailableDateMappingValue,
  XrefAvailableDateMappingView,
} from './view/XrefAvailableDateMappingView';
import { RenderType } from '../../config/Config';
import { isEmpty } from '../../utils';

export interface XrefAvailableDateMappingFieldProps extends FormFieldProps {
  entityForm: EntityForm;
}

export class XrefAvailableDateMappingField extends FormField<XrefAvailableDateMappingField> {
  entityForm: EntityForm;

  constructor(name: string, order: number, entityForm: EntityForm) {
    super(name, order, 'xrefMapping');
    this.entityForm = entityForm;
    this.helpText = '이 정보를 변경한 후 반드시 저장 버튼을 눌러야 변경 사항이 반영됩니다.';
  }

  public static create(props: XrefAvailableDateMappingFieldProps): XrefAvailableDateMappingField {
    return new XrefAvailableDateMappingField(props.name, props.order, props.entityForm).copyFields(
      props,
      true,
    );
  }

  /**
   * XrefAvailableDateMappingField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(
    params: FieldRenderParameters,
  ): Promise<React.ReactNode | null | undefined> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, { ...params });
      return (
        <XrefAvailableDateMappingView
          {...(inputParams as React.ComponentProps<typeof XrefAvailableDateMappingView>)}
          entityForm={this.entityForm}
        />
      );
    })();
  }

  /**
   * XrefAvailableDateMappingField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): XrefAvailableDateMappingField {
    return new XrefAvailableDateMappingField(name, order, this.entityForm);
  }

  // override
  async isBlank(renderType: RenderType = 'create'): Promise<boolean> {
    const value = await this.getCurrentValue(renderType);

    if (value === undefined || value === null || value === '') {
      return true;
    }

    const mappingValue: XrefAvailableDateMappingValue = value as XrefAvailableDateMappingValue;

    return isEmpty(mappingValue.mapped);
  }
}
