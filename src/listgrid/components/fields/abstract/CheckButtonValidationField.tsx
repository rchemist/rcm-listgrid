/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React, { ReactNode } from 'react';
import { ListableFormField, ListableFormFieldProps } from './ListableFormField';
import { ValidateResult } from '../../../validations/Validation';
import { EntityForm } from '../../../config/EntityForm';
import { FieldInfoParameters, FieldRenderParameters } from '../../../config/EntityField';
import { CheckButtonValidationInput } from '../../../ui';
import { isEmpty } from '../../../utils';

export interface CheckButtonValidationFieldProps extends ListableFormFieldProps {
  checkButtonValidation?: (entityForm: EntityForm, value: string) => Promise<ValidateResult>;
  checkButtonLabel?: string;
}

export abstract class CheckButtonValidationField<
  T extends CheckButtonValidationField<T>,
> extends ListableFormField<T> {
  checkButtonValidation?: (entityForm: EntityForm, value: string) => Promise<ValidateResult>;

  checkButtonLabel?: string;

  /**
   * 중복확인 버튼을 클릭했을 때 value 를 중복 확인 하는 함수
   * @param checkButtonValidation
   */
  withCheckButtonValidation(
    checkButtonValidation?: (entityForm: EntityForm, value: string) => Promise<ValidateResult>,
  ): this {
    if (checkButtonValidation !== undefined) this.checkButtonValidation = checkButtonValidation;
    else delete this.checkButtonValidation;
    return this;
  }

  withCheckButtonLabel(checkButtonLabel?: string): this {
    if (checkButtonLabel !== undefined) this.checkButtonLabel = checkButtonLabel;
    else delete this.checkButtonLabel;
    return this;
  }

  protected copyFields(
    origin: CheckButtonValidationFieldProps,
    includeValue: boolean = true,
  ): this {
    return super
      .copyFields(origin, includeValue)
      .withCheckButtonValidation(origin.checkButtonValidation)
      .withCheckButtonLabel(origin.checkButtonLabel);
  }

  protected renderCheckButtonValidationField(
    params: FieldRenderParameters,
  ): Promise<ReactNode | null> {
    return (async () => {
      const entityForm = params.entityForm;

      return (
        <CheckButtonValidationInput
          name={this.getName()}
          entityForm={entityForm}
          onError={params.onError}
          readonly={params.readonly}
          buttonProp={{
            label: this.checkButtonLabel,
          }}
          inputProp={{
            value: await entityForm.getValue(this.getName()),
            required: params.required,
          }}
          defaultValue={this.value?.fetched ?? this.value?.default ?? ''}
          onValid={(value: any) => {
            entityForm.setFieldValidationState(this.getName(), {
              validated: true,
              color: 'success',
            });
            params.onChange(value);
          }}
          onClear={() => {
            entityForm.clearFieldValidationState(this.getName());
            params.onChange('');
          }}
          onCheck={async (value: any) => {
            if (!isEmpty(this.validations)) {
              const currentValue = { ...this.value };
              this.value = { ...this.value, current: value };

              const validateResult = await this.validate(entityForm);
              if (Array.isArray(validateResult)) {
                for (const result of validateResult) {
                  if (result.hasError()) {
                    this.value = currentValue;
                    entityForm.setFieldValidationState(this.getName(), {
                      validated: false,
                      message: result.message,
                      color: 'secondary',
                    });
                    return ValidateResult.fail(
                      result.message + ' 입력 값을 변경하고 중복확인을 눌러 주세요.',
                    );
                  }
                }
              } else {
                if (validateResult.hasError()) {
                  this.value = currentValue;
                  entityForm.setFieldValidationState(this.getName(), {
                    validated: false,
                    message: validateResult.message,
                    color: 'secondary',
                  });
                  return ValidateResult.fail(
                    validateResult.message + ' 입력 값을 변경하고 중복확인을 눌러 주세요.',
                  );
                }
              }
            }

            const result = await this.checkButtonValidation!(entityForm, value);
            entityForm.setFieldValidationState(this.getName(), {
              validated: !result.error,
              message: result.message,
              color: result.error ? 'secondary' : 'success',
            });
            return result;
          }}
        ></CheckButtonValidationInput>
      );
    })();
  }

  async isRequired(props: FieldInfoParameters): Promise<boolean> {
    const required = await super.isRequired(props);
    return Promise.resolve(required);
  }
}
