import { FormField, FormFieldProps } from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import React from 'react';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { EntityForm } from '../../config/EntityForm';
import { XrefPreferMappingValue } from './view/XrefPreferMappingView';
import { RenderType } from '../../config/Config';
import { isEmpty } from '../../utils';
import { XrefPriceMappingView } from './view/XrefPiceMappingView';
import { FilterItem } from '../../form/SearchForm';

interface XrefPriceAdditionalProps {
  entityForm: EntityForm;
  initPrice: (entityForm: EntityForm, rowValue: any) => Promise<void>;
  priceHelpText?: string | undefined;
  filterItems?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
}

export interface XrefPriceMappingFieldProps extends FormFieldProps, XrefPriceAdditionalProps {}

export class XrefPriceMappingField extends FormField<XrefPriceMappingField> {
  entityForm: EntityForm;
  initPrice: (entityForm: EntityForm, rowValue: any) => Promise<void>;
  priceHelpText?: string | undefined;
  filterItems?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;

  constructor(name: string, order: number, props: XrefPriceAdditionalProps) {
    super(name, order, 'xrefMapping');
    this.entityForm = props.entityForm;
    this.helpText = '이 정보를 변경한 후 반드시 저장 버튼을 눌러야 변경 사항이 반영됩니다.';
    this.initPrice = props.initPrice;
    this.priceHelpText = props.priceHelpText;
    this.filterItems = props.filterItems;
  }

  public static create(props: XrefPriceMappingFieldProps): XrefPriceMappingField {
    return new XrefPriceMappingField(props.name, props.order, {
      entityForm: props.entityForm,
      initPrice: props.initPrice,
      priceHelpText: props.priceHelpText,
      filterItems: props.filterItems,
    }).copyFields(props, true);
  }

  /**
   * XrefPriceMappingField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(
    params: FieldRenderParameters,
  ): Promise<React.ReactNode | null | undefined> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, { ...params });
      return (
        <XrefPriceMappingView
          {...(inputParams as React.ComponentProps<typeof XrefPriceMappingView>)}
          priceHelpText={this.priceHelpText}
          initPrice={this.initPrice}
          parentEntityForm={params.entityForm}
          filters={this.filterItems}
          entityForm={this.entityForm}
        />
      );
    })();
  }

  /**
   * XrefPriceMappingField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): XrefPriceMappingField {
    return new XrefPriceMappingField(name, order, {
      entityForm: this.entityForm,
      initPrice: this.initPrice,
      priceHelpText: this.priceHelpText,
      filterItems: this.filterItems,
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

  withFilterItem(filterItems: FilterItem[]) {
    this.filterItems = filterItems;
    return this;
  }
}
