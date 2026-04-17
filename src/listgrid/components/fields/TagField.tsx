/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {
  MultipleOptionalField,
  MultipleOptionalFieldProps,
  renderListMultipleOptionalField,
  ViewListProps,
  ViewListResult,
} from './abstract';
import React from "react";
import {MinMaxLimit, SelectOption} from "../../form/Type";
import {FieldRenderParameters, FilterRenderParameters} from '../../config/EntityField';
import {TagsInput} from "@gjcu/ui/form/TagsInput/index";
import {TagValidationResult} from "../../form/TagsInput/types";
import {isEmpty} from "../../utils";
import classes from "./TagField.module.css";

interface TagFieldProps extends MultipleOptionalFieldProps {
  tagValidation?: (value: string) => TagValidationResult | Promise<TagValidationResult>;
}

export class TagField extends MultipleOptionalField<TagField> {

  tagValidation?: (value: string) => TagValidationResult | Promise<TagValidationResult>;

  constructor(name: string, order: number, options?: SelectOption[], limit?: MinMaxLimit,) {
    super(name, order, 'tag', options, limit);
  }

  /**
   * 태그 추가 시 실시간 검증 함수를 설정합니다.
   * @param validation 검증 함수 (태그 값을 받아 TagValidationResult 반환)
   */
  withTagValidation(validation: (value: string) => TagValidationResult | Promise<TagValidationResult>): TagField {
    this.tagValidation = validation;
    return this;
  }

  /**
   * TagField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    let tagData: string[] | undefined = undefined;

    if (this.options !== undefined && !isEmpty(this.options)) {
      tagData = this.options.map((option) => option.value);
    }

    const optionsFilter = (options: string[], search: string) => {
      const splittedSearch = search.toLowerCase().trim().split(' ');
      return options.filter((option) => {
        const words = option.toLowerCase().trim().split(' ');
        return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
      });
    };

    return (async () => {
        return <TagsInput
          size={'md'}
          readOnly={params.readonly}
          required={params.required}
          disabled={params.readonly}
          minTags={this.limit?.min}
          classNames={{
            root: classes.root,
            input: classes.input,
            wrapper: classes.wrapper
          }}
          maxTags={this.limit?.max}
          data={tagData}
          filter={optionsFilter}
          clearable
          onChange={(value) => {
            params.onChange(value);
          }}
          onValidateTag={this.tagValidation}
          {...{
            value: await this.getDisplayValue(params.entityForm, params.entityForm.getRenderType()),
          }}
        />
      }
    )();
  }

  /**
   * TagField 핵심 리스트 필터 렌더링 로직 (기본 renderInstance 사용)
   */
  protected renderListFilterInstance(params: FilterRenderParameters): Promise<React.ReactNode | null> {
    return this.renderInstance({ 
      ...params, 
      required: false, 
      onChange: (value) => params.onChange(value) 
    } as FieldRenderParameters);
  }

  /**
   * TagField 핵심 리스트 아이템 렌더링 로직
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    return renderListMultipleOptionalField(this, props);
  }

  /**
   * TagField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): TagField {
    const instance = new TagField(name, order, this.options, this.limit);
    instance.tagValidation = this.tagValidation;
    return instance;
  }

  static create(props: TagFieldProps): TagField {
    const field = new TagField(props.name, props.order, props.options, props.limit)
      .copyFields(props, true);
    if (props.tagValidation) {
      field.tagValidation = props.tagValidation;
    }
    return field;
  }

}

