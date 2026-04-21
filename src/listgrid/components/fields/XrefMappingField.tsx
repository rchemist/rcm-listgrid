import { FormField, FormFieldProps } from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import React from 'react';
import { XrefMappingValue, XrefMappingView } from './view/XrefMappingView';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { EntityForm } from '../../config/EntityForm';
import { isTrue } from '../../utils/BooleanUtil';
import { XrefPriorityMappingValue, XrefPriorityMappingView } from './view/XrefPriorityMappingView';
import { RenderType } from '../../config/Config';
import { isEmpty } from '../../utils';
import { FilterItem } from '../../form/SearchForm';

export interface XrefMappingFieldProps extends FormFieldProps {
  supportPriority?: boolean | undefined;
  excludeId?: string | undefined; // 목록에서 반드시 제외해야 할 id 가 있다면 입력한다. 예를 들어 카테고리에서 상위 카테고리를 선택할 때 XrefMappingForm 을 사용한다면 자기 자신의 id 값을 excludeId 로 설정하면 된다.
  add?: boolean | undefined; // XrefMappingField 에서 대상 엔티티폼을 새로 추가할 수 있는지 여부, 기본값은 false
  entityForm: EntityForm;
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
}

export class XrefMappingField extends FormField<XrefMappingField> {
  entityForm: EntityForm;
  supportPriority?: boolean | undefined;
  excludeId?: string | undefined; // 목록에서 반드시 제외해야 할 id 가 있다면 입력한다. 예를 들어 카테고리에서 상위 카테고리를 선택할 때 XrefMappingForm 을 사용한다면 자기 자신의 id 값을 excludeId 로 설정하면 된다.
  add?: boolean | undefined; // XrefMappingField 에서 대상 엔티티폼을 새로 추가할 수 있는지 여부, 기본값은 false
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;

  constructor({
    name,
    order,
    entityForm,
    supportPriority,
    excludeId,
    add,
    filters,
  }: XrefMappingFieldProps) {
    super(name, order, 'xrefMapping');
    this.entityForm = entityForm;
    this.supportPriority = supportPriority;
    this.helpText = '이 정보를 변경한 후 반드시 저장 버튼을 눌러야 변경 사항이 반영됩니다.';
    this.excludeId = excludeId;
    this.add = add ?? false;
    this.filters = filters;
  }

  /**
   * XrefMappingField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(
    params: FieldRenderParameters,
  ): Promise<React.ReactNode | null | undefined> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, { ...params });
      if (isTrue(this.supportPriority)) {
        return (
          <XrefPriorityMappingView
            {...(inputParams as React.ComponentProps<typeof XrefPriorityMappingView>)}
            parentEntityForm={params.entityForm}
            entityForm={this.entityForm}
            excludeId={this.excludeId}
            add={this.add}
            filters={this.filters}
          />
        );
      }

      return (
        <XrefMappingView
          {...(inputParams as React.ComponentProps<typeof XrefMappingView>)}
          parentEntityForm={params.entityForm}
          entityForm={this.entityForm}
          excludeId={this.excludeId}
          add={this.add}
          filters={this.filters}
        />
      );
    })();
  }

  /**
   * XrefMappingField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): XrefMappingField {
    return new XrefMappingField({
      name,
      order,
      entityForm: this.entityForm,
      supportPriority: this.supportPriority,
      excludeId: this.excludeId,
      add: this.add,
      filters: this.filters,
    });
  }

  // override
  async isBlank(renderType: RenderType = 'create'): Promise<boolean> {
    const value = await this.getCurrentValue(renderType);

    if (value === undefined || value === null || value === '') {
      return true;
    }

    if (isTrue(this.supportPriority)) {
      const mappingValue: XrefPriorityMappingValue = value as XrefPriorityMappingValue;
      return isEmpty(mappingValue.mapped);
    } else {
      const mappingValue: XrefMappingValue = value as XrefMappingValue;
      return isEmpty(mappingValue.mapped);
    }
  }
}
