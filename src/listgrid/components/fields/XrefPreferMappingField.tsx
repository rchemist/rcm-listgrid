import { FormField, FormFieldProps } from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import React from 'react';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { EntityForm } from '../../config/EntityForm';
import { XrefPreferMappingValue, XrefPreferMappingView } from './view/XrefPreferMappingView';
import { RenderType } from '../../config/Config';
import { isEmpty } from '../../utils';
import { FilterItem } from '../../form/SearchForm';

export interface XrefPreferMappingFieldProps extends FormFieldProps {
  entityForm: EntityForm;
  showPreferred?: boolean | undefined;
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
  preferredLabel?: string | undefined;
}

export class XrefPreferMappingField extends FormField<XrefPreferMappingField> {
  entityForm: EntityForm;
  showPreferred?: boolean | undefined;
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
  preferredLabel?: string | undefined;

  constructor(props: XrefPreferMappingFieldProps) {
    super(props.name, props.order, 'xrefMapping');
    this.entityForm = props.entityForm;
    this.helpText = '이 정보를 변경한 후 반드시 저장 버튼을 눌러야 변경 사항이 반영됩니다.';
    this.showPreferred = props.showPreferred;
    this.filters = props.filters;
    this.preferredLabel = props.preferredLabel;
  }

  public static create(props: XrefPreferMappingFieldProps): XrefPreferMappingField {
    return new XrefPreferMappingField(props).copyFields(props, true);
  }

  /**
   * XrefPreferMappingField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(
    params: FieldRenderParameters,
  ): Promise<React.ReactNode | null | undefined> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, { ...params });
      return (
        <XrefPreferMappingView
          {...(inputParams as React.ComponentProps<typeof XrefPreferMappingView>)}
          showPreferred={this.showPreferred}
          entityForm={this.entityForm}
          parentEntityForm={params.entityForm}
          filters={this.filters}
          preferredLabel={this.preferredLabel}
        />
      );
    })();
  }

  /**
   * XrefPreferMappingField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): XrefPreferMappingField {
    return new XrefPreferMappingField({
      name,
      order,
      entityForm: this.entityForm,
      showPreferred: this.showPreferred,
      filters: this.filters,
      preferredLabel: this.preferredLabel,
    });
  }

  // override
  async isBlank(renderType: RenderType = 'create'): Promise<boolean> {
    const value = await this.getCurrentValue(renderType);

    if (value === undefined || value === null || value === '') {
      return true;
    }

    const mappingValue: XrefPreferMappingValue = value as XrefPreferMappingValue;

    return isEmpty(mappingValue.mapped);
  }

  withPreferredLabel(preferredLabel: string): XrefPreferMappingField {
    this.preferredLabel = preferredLabel;
    return this;
  }
}
