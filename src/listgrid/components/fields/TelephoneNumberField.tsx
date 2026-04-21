'use client';

import {
  ListableFormField,
  ListableFormFieldProps,
  ViewListProps,
  ViewListResult,
} from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import React, { useState, useEffect } from 'react';
import { Validation } from '../../validations/Validation';
import { RegexValidation } from '../../validations/RegexValidation';
import { readonlyClass } from '../../ui';
import { formatPhoneNumber, removePhoneNumberHyphens } from '../../utils/PhoneUtil';
import { RenderType } from '../../config/Config';
import { EntityForm } from '../../config/EntityForm';

interface TelephoneNumberFieldProps extends ListableFormFieldProps {
  validations?: Validation[];
}

interface TelephoneNumberInputProps {
  name: string;
  value: string | null | undefined;
  onChange: (value: string, commit?: boolean | undefined) => void;
  onError?: ((message: string) => void) | undefined;
  readonly?: boolean | undefined;
  placeHolder?: string | undefined;
  regex?: { pattern: RegExp; message: string } | undefined;
}

/**
 * 전화번호 입력 내부 컴포넌트 (TelephoneNumberField용)
 * 입력 시 하이픈을 자동으로 제거하고, 표시 시 하이픈을 포맷팅합니다.
 */
const TelephoneNumberInput = ({
  name,
  value,
  onChange,
  onError,
  readonly = false,
  placeHolder,
  regex,
}: TelephoneNumberInputProps) => {
  // 표시용 값 (하이픈 포함)
  const [displayValue, setDisplayValue] = useState('');

  // 외부 value가 변경되면 displayValue 동기화 (하이픈 포맷팅)
  useEffect(() => {
    if (value) {
      const formatted = formatPhoneNumber(value);
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 하이픈 제거 (숫자만 추출)
    const digitsOnly = removePhoneNumberHyphens(inputValue);

    // 최대 11자리로 제한
    const truncated = digitsOnly.substring(0, 11);

    // 표시용 값은 하이픈 포함 형식으로 포맷팅
    const formatted = formatPhoneNumber(truncated);
    setDisplayValue(formatted);

    // 저장용 값은 하이픈 제거한 숫자만 전달 (입력 중에는 검증하지 않음)
    onChange(truncated, false);
  };

  const handleBlur = () => {
    const digitsOnly = removePhoneNumberHyphens(displayValue);

    // blur 시에만 검증 (입력이 완료되었을 때)
    if (regex && digitsOnly) {
      const isValid = regex.pattern.test(digitsOnly);
      if (!isValid) {
        onError?.(regex.message);
      } else {
        // 검증 통과 시 에러 초기화
        onError?.('');
      }
    }

    onChange(digitsOnly, true);
  };

  return (
    <input
      type="text"
      className={readonlyClass(readonly, 'form-input')}
      id={name}
      value={displayValue}
      placeholder={placeHolder}
      disabled={readonly}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export class TelephoneNumberField extends ListableFormField<TelephoneNumberField> {
  validations?: Validation[];

  constructor(name: string, order: number, validations?: Validation[]) {
    super(name, order, 'text');
    if (validations !== undefined) {
      this.validations = validations;
    }
  }

  /**
   * TelephoneNumberField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, params);

      // validations에서 RegexValidation 찾기
      let regex: { pattern: RegExp; message: string } | undefined;
      if (this.validations) {
        const regexValidation = this.validations.find((v) => v instanceof RegexValidation) as
          | RegexValidation
          | undefined;
        if (regexValidation) {
          regex = {
            pattern: regexValidation.regex,
            message: regexValidation.message || '전화번호 형식이 올바르지 않습니다.',
          };
        }
      }

      return (
        <TelephoneNumberInput
          name={inputParams.name}
          value={inputParams.value}
          onChange={inputParams.onChange}
          onError={inputParams.onError}
          readonly={inputParams.readonly}
          placeHolder={inputParams.placeHolder}
          regex={regex}
        />
      );
    })();
  }

  /**
   * TelephoneNumberField 표시값 가져오기 (하이픈 포맷팅)
   */
  async getDisplayValue(entityForm: EntityForm, renderType?: RenderType): Promise<any> {
    if (this.displayFunc) {
      return this.displayFunc(entityForm, this, renderType);
    }

    const value = await this.getCurrentValue(renderType);

    // 하이픈 포맷팅 적용
    return formatPhoneNumber(value);
  }

  /**
   * TelephoneNumberField 저장값 가져오기 (하이픈 제거)
   */
  async getSaveValue(entityForm: EntityForm, renderType?: RenderType): Promise<any> {
    if (this.saveValue) {
      return this.saveValue(entityForm, this, renderType);
    }

    const value = await this.getCurrentValue(renderType);

    // 하이픈 제거한 숫자만 반환
    return removePhoneNumberHyphens(value);
  }

  /**
   * TelephoneNumberField 리스트 아이템 렌더링 (하이픈 포맷팅)
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    const value = props.item[this.name];
    const formatted = formatPhoneNumber(value);
    return Promise.resolve({ result: formatted });
  }

  /**
   * TelephoneNumberField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): TelephoneNumberField {
    return new TelephoneNumberField(name, order, this.validations);
  }

  static create(props: TelephoneNumberFieldProps): TelephoneNumberField {
    return new TelephoneNumberField(props.name, props.order, props.validations).copyFields(
      props,
      true,
    );
  }
}
