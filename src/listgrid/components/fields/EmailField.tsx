import { CheckButtonValidationField, CheckButtonValidationFieldProps } from './abstract';
import React from 'react';
import { ValidateResult, Validation } from '../../validations/Validation';
import { EmailValidation } from '../../validations/EmailValidation';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { TextInput } from '../../ui';
import { DEFAULT_EMAIL_DOMAINS, EmailDomainCheckButtonInput, EmailDomainInput } from '../../ui';
import { isEmpty } from '../../utils';

interface EmailFieldProps extends CheckButtonValidationFieldProps {
  text?: boolean;
  commonDomains?: string[];
}

export class EmailField extends CheckButtonValidationField<EmailField> {
  text: boolean = true;
  commonDomains: string[] = DEFAULT_EMAIL_DOMAINS;

  constructor(name: string, order: number, validations?: Validation[]) {
    super(name, order, 'email');
    if (validations) {
      this.validations = [...validations];
    } else {
      this.validations = [new EmailValidation()];
    }
  }

  withText(text: boolean): this {
    this.text = text;
    return this;
  }

  withCommonDomains(commonDomains: string[]): this {
    this.commonDomains = commonDomains;
    return this;
  }

  /**
   * EmailField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    if (this.checkButtonValidation !== undefined) {
      if (this.text) {
        // text mode with checkButtonValidation
        return this.renderCheckButtonValidationField(params);
      }
      // complex mode with checkButtonValidation
      return this.renderCheckButtonValidationEmailDomainInput(params);
    }

    if (this.text) {
      return (async () => {
        return <TextInput {...await getInputRendererParameters(this, params)}></TextInput>;
      })();
    }

    // Complex mode: [localPart] @ [domain select/input]
    return this.renderEmailDomainInput(params);
  }

  /**
   * EmailDomainInput 렌더링 (복합 입력 모드)
   */
  private renderEmailDomainInput(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const entityForm = params.entityForm;
      const value = await entityForm.getValue(this.getName());

      return (
        <EmailDomainInput
          value={value}
          name={this.getName()}
          readonly={params.readonly}
          required={params.required}
          commonDomains={this.commonDomains}
          onChange={(newValue: any) => params.onChange(newValue)}
        />
      );
    })();
  }

  /**
   * EmailDomainCheckButtonInput 렌더링 (복합 입력 모드 + 중복확인 버튼)
   */
  private renderCheckButtonValidationEmailDomainInput(
    params: FieldRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      const entityForm = params.entityForm;
      const value = await entityForm.getValue(this.getName());

      return (
        <EmailDomainCheckButtonInput
          name={this.getName()}
          entityForm={entityForm}
          onError={params.onError}
          readonly={params.readonly}
          required={params.required}
          commonDomains={this.commonDomains}
          buttonLabel={this.checkButtonLabel}
          value={value}
          defaultValue={this.value?.fetched ?? this.value?.default ?? ''}
          onValid={(newValue: any) => {
            entityForm.setFieldValidationState(this.getName(), {
              validated: true,
              color: 'success',
            });
            params.onChange(newValue);
          }}
          onClear={() => {
            entityForm.clearFieldValidationState(this.getName());
            params.onChange('');
          }}
          onCheck={async (checkValue: any) => {
            if (!isEmpty(this.validations)) {
              const currentValue = { ...this.value };
              this.value = { ...this.value, current: checkValue };

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

            const result = await this.checkButtonValidation!(entityForm, checkValue);
            entityForm.setFieldValidationState(this.getName(), {
              validated: !result.error,
              message: result.message,
              color: result.error ? 'secondary' : 'success',
            });
            return result;
          }}
        />
      );
    })();
  }

  /**
   * EmailField 핵심 리스트 필터 렌더링 로직
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <TextInput
          {...await getInputRendererParameters(this, {
            ...params,
            onChange: (value) => params.onChange(value, 'LIKE'),
          })}
        ></TextInput>
      );
    })();
  }

  /**
   * EmailField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): EmailField {
    return new EmailField(name, order, this.validations)
      .withText(this.text)
      .withCommonDomains(this.commonDomains);
  }

  static create(props: EmailFieldProps): EmailField {
    const field = new EmailField(props.name, props.order, props.validations).copyFields(
      props,
      true,
    );

    if (props.text !== undefined) {
      field.withText(props.text);
    }
    if (props.commonDomains !== undefined) {
      field.withCommonDomains(props.commonDomains);
    }

    return field;
  }
}
