/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React from "react";
import {
  CheckButtonValidationField,
  CheckButtonValidationFieldProps,
  ViewListProps,
  ViewListResult
} from './abstract';
import {TextInput} from "../../ui";
import {getInputRendererParameters} from '../helper/FieldRendererHelper';
import {FieldRenderParameters, FilterRenderParameters} from '../../config/EntityField';
import {LinkFieldView} from "./view/LinkFieldView";
import {IconExternalLink} from "@tabler/icons-react";
import {isBlank} from '../../utils/StringUtil';
import {normalizeUrl} from "../../misc";

interface LinkFieldProps extends CheckButtonValidationFieldProps {

}

export class LinkField extends CheckButtonValidationField<LinkField> {

  constructor(name: string, order: number) {
    super(name, order, 'text');
  }

  /**
   * LinkField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    if (this.checkButtonValidation !== undefined) {
      return super.renderCheckButtonValidationField(params);
    }

    return (async () => {
      return <LinkFieldView {...await getInputRendererParameters(this, params)}></LinkFieldView>;
    })();
  }

  /**
   * LinkField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): LinkField {
    return new LinkField(name, order);
  }

  /**
   * LinkField 리스트 필터 렌더링 (원본 renderListFilter 로직 보존)
   */
  protected renderListFilterInstance(params: FilterRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return <TextInput
        name={`${this.name}_${params.entityForm.id}`}
        onChange={(value) => {
          params.onChange(value, 'LIKE');
        }}
        value={params.value}></TextInput>;
    })();
  }

  /**
   * LinkField 리스트 아이템 렌더링 (원본 renderListItem 로직 보존)
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    const value = String(props.item[this.name] ?? '');
    
    if (isBlank(value)) {
      return Promise.resolve({ result: value });
    }

    // 링크가 존재하는 경우 클릭 가능한 링크로 렌더링
    const linkElement = (
      <div className="flex items-center gap-1.5">
        <span className="truncate">{value}</span>
        {!isBlank(value) && (
          <button 
            type="button" 
            className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
            onClick={(e) => {
              e.stopPropagation();
              window.open(normalizeUrl(value), "_blank");
            }}
          >
            <IconExternalLink 
              className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" 
            />
          </button>
        )}
      </div>
    );

    return Promise.resolve({ 
      result: linkElement,
    });
  }

  static create(props: LinkFieldProps) : LinkField {
    return new LinkField(props.name, props.order)
      .copyFields(props, true);
  }

}
