import React, { ReactNode } from 'react';
import { ListableFormField, ListableFormFieldProps } from './ListableFormField';
import { ValidateResult } from '../../../validations/Validation';
import { EntityForm } from '../../../config/EntityForm';
import { FieldInfoParameters, FieldRenderParameters } from '../../../config/EntityField';
import { CheckButtonValidationInput } from '../../../ui';
import { isEmpty } from '../../../utils';

export interface CheckButtonValidationFieldProps<
  TValue = any,
  TForm extends object = any,
> extends ListableFormFieldProps<TValue, TForm> {
  checkButtonValidation?: (entityForm: EntityForm<TForm>, value: string) => Promise<ValidateResult>;
  checkButtonLabel?: string;
}

export abstract class CheckButtonValidationField<
  TSelf extends CheckButtonValidationField<TSelf, TValue, TForm>,
  TValue = any,
  TForm extends object = any,
> extends ListableFormField<TSelf, TValue, TForm> {
  checkButtonValidation?: (entityForm: EntityForm<TForm>, value: string) => Promise<ValidateResult>;

  checkButtonLabel?: string;

  /**
   * 중복확인 버튼을 클릭했을 때 value 를 중복 확인 하는 함수
   * @param checkButtonValidation
   */
  withCheckButtonValidation(
    checkButtonValidation?: (
      entityForm: EntityForm<TForm>,
      value: string,
    ) => Promise<ValidateResult>,
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
    origin: CheckButtonValidationFieldProps<TValue, TForm>,
    includeValue: boolean = true,
  ): this {
    return super
      .copyFields(origin, includeValue)
      .withCheckButtonValidation(origin.checkButtonValidation)
      .withCheckButtonLabel(origin.checkButtonLabel);
  }

  protected renderCheckButtonValidationField(
    params: FieldRenderParameters<TForm, TValue>,
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
            params.onChange(value as TValue);
          }}
          onClear={() => {
            entityForm.clearFieldValidationState(this.getName());
            params.onChange('' as TValue);
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

  async isRequired(props: FieldInfoParameters<TForm>): Promise<boolean> {
    const required = await super.isRequired(props);
    return Promise.resolve(required);
  }
}
