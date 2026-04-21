import React from 'react';
import { Validation } from '../../validations/Validation';
import { PasswordValidation } from '../../validations/PasswordValidation';
import { FormField, FormFieldProps } from './abstract';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { FieldRenderParameters } from '../../config/EntityField';
import { PasswordStrength, PasswordStrengthView } from '../../ui';
import { TextInput } from '../../ui';
import { RegexValidation } from '../../validations/RegexValidation';

interface PasswordFieldProps extends FormFieldProps {
  strength?: PasswordStrength;
}

export class PasswordField extends FormField<PasswordField> {
  strength?: PasswordStrength;

  constructor(
    name: string,
    order: number,
    validations?: Validation[],
    strength?: PasswordStrength,
  ) {
    super(name, order, 'password');
    if (validations) {
      this.validations = [...validations];
    } else {
      this.validations = [new PasswordValidation()];
    }
    if (strength) {
      this.strength = strength;
      if (strength.regex) {
        const newValidations: Validation[] = [];
        for (const regex of strength.regex) {
          newValidations.push(
            new RegexValidation('passwordStrength-' + name, regex.pattern, regex.error),
          );
        }
        this.validations = [...this.validations, ...newValidations];
      }
    }
  }

  /**
   * PasswordField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    if (this.strength === undefined) {
      return (async () => {
        return <TextInput {...await getInputRendererParameters(this, params)}></TextInput>;
      })();
    }

    return (async () => {
      return (
        <PasswordStrengthView
          strength={this.strength!}
          {...await getInputRendererParameters(this, params)}
        ></PasswordStrengthView>
      );
    })();
  }

  /**
   * PasswordField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): PasswordField {
    return new PasswordField(name, order).withStrength(this.strength);
  }

  withStrength(strength?: PasswordStrength): this {
    this.strength = strength;
    // strength 필드를 사용하는 경우 기본 validation 을 사용하지 않는다.
    if (strength !== undefined && this.validations !== undefined && this.validations.length > 0) {
      const newValidations: Validation[] = [];
      for (const validation of this.validations) {
        if (validation.id !== 'PasswordValidation') {
          newValidations.push({ ...validation });
        }
      }
      // Add RegexValidation from strength.regex
      if (strength.regex) {
        for (const regex of strength.regex) {
          newValidations.push(
            new RegexValidation('passwordStrength-' + this.name, regex.pattern, regex.error),
          );
        }
      }
      this.validations = newValidations;
    }
    return this;
  }

  static create(props: PasswordFieldProps): PasswordField {
    return new PasswordField(props.name, props.order, props.validations, props.strength).copyFields(
      props,
      true,
    );
  }
}
