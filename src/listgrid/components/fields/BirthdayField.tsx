'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ListableFormField,
  ListableFormFieldProps,
  ViewListProps,
  ViewListResult,
} from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { readonlyClass } from '../../ui';

interface BirthdayFieldProps extends ListableFormFieldProps {
  /** 반환값에 하이픈(-) 포함 여부 (기본값: false) */
  includeHyphen?: boolean;
}

interface BirthdayInputProps {
  name: string;
  value: string;
  onChange: (value: string, commit?: boolean | undefined) => void;
  readonly?: boolean | undefined;
  hasError?: boolean | undefined;
  placeholder?: string | undefined;
  includeHyphen?: boolean | undefined;
}

/**
 * 생년월일 입력 내부 컴포넌트
 * 숫자만 입력 가능하며, YYYY-MM-DD 형식으로 자동 포맷팅
 */
const BirthdayInput = ({
  name,
  value,
  onChange,
  readonly = false,
  hasError = false,
  placeholder = 'YYYY-MM-DD',
  includeHyphen = false,
}: BirthdayInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // 외부 value가 변경되면 displayValue 동기화
  useEffect(() => {
    if (value) {
      // 외부 값이 YYYYMMDD 형식인 경우 YYYY-MM-DD로 변환
      if (/^\d{8}$/.test(value)) {
        const formatted = `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`;
        setDisplayValue(formatted);
        validateDate(formatted);
      } else {
        setDisplayValue(value);
        validateDate(value);
      }
    } else {
      setDisplayValue('');
      setValidationError(null);
    }
  }, [value]);

  // 날짜 유효성 검증
  const validateDate = useCallback((dateStr: string): boolean => {
    // 빈 값은 검증하지 않음
    if (!dateStr || dateStr.replace(/-/g, '').length === 0) {
      setValidationError(null);
      return true;
    }

    const digitsOnly = dateStr.replace(/-/g, '');

    // 입력 중인 경우 (8자리 미만) - 부분 검증
    if (digitsOnly.length < 8) {
      // 년도 검증 (4자리 이상일 때)
      if (digitsOnly.length >= 4) {
        const year = parseInt(digitsOnly.substring(0, 4));
        if (year < 1900 || year > new Date().getFullYear()) {
          setValidationError('올바른 연도를 입력해 주세요 (1900~현재)');
          return false;
        }
      }

      // 월 검증 (6자리 이상일 때)
      if (digitsOnly.length >= 6) {
        const month = parseInt(digitsOnly.substring(4, 6));
        if (month < 1 || month > 12) {
          setValidationError('올바른 월을 입력해 주세요 (01~12)');
          return false;
        }
      }

      setValidationError(null);
      return true;
    }

    // 완전한 날짜 검증 (8자리)
    const year = parseInt(digitsOnly.substring(0, 4));
    const month = parseInt(digitsOnly.substring(4, 6));
    const day = parseInt(digitsOnly.substring(6, 8));

    // 연도 범위 검증
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      setValidationError('올바른 연도를 입력해 주세요 (1900~현재)');
      return false;
    }

    // 월 범위 검증
    if (month < 1 || month > 12) {
      setValidationError('올바른 월을 입력해 주세요 (01~12)');
      return false;
    }

    // 일 범위 검증
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      setValidationError(`올바른 일을 입력해 주세요 (01~${daysInMonth})`);
      return false;
    }

    // 미래 날짜 검증
    const inputDate = new Date(year, month - 1, day);
    if (inputDate > new Date()) {
      setValidationError('미래 날짜는 입력할 수 없습니다');
      return false;
    }

    setValidationError(null);
    return true;
  }, []);

  // 숫자를 YYYY-MM-DD 형식으로 포맷팅
  const formatToDate = (digits: string): string => {
    let formatted = '';

    if (digits.length > 0) {
      formatted = digits.substring(0, Math.min(4, digits.length));
    }
    if (digits.length > 4) {
      formatted += '-' + digits.substring(4, Math.min(6, digits.length));
    }
    if (digits.length > 6) {
      formatted += '-' + digits.substring(6, Math.min(8, digits.length));
    }

    return formatted;
  };

  // 반환값 형식 변환 (includeHyphen 옵션에 따라)
  const getReturnValue = (formatted: string): string => {
    if (includeHyphen) {
      return formatted;
    }
    return formatted.replace(/-/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 숫자와 하이픈만 허용하되, 하이픈은 자동으로 추가되므로 숫자만 추출
    const digitsOnly = inputValue.replace(/\D/g, '');

    // 최대 8자리 (YYYYMMDD)
    const truncated = digitsOnly.substring(0, 8);

    // 포맷팅된 값
    const formatted = formatToDate(truncated);

    setDisplayValue(formatted);
    onChange(getReturnValue(formatted), false);
    validateDate(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 백스페이스 처리 - 하이픈 앞에서 백스페이스 누르면 하이픈도 함께 삭제
    if (e.key === 'Backspace') {
      const input = e.currentTarget;
      const cursorPos = input.selectionStart || 0;

      // 커서가 하이픈 바로 뒤에 있으면 하이픈과 앞 숫자 함께 삭제
      if (cursorPos > 0 && displayValue[cursorPos - 1] === '-') {
        e.preventDefault();
        const digitsOnly = displayValue.replace(/\D/g, '');
        const newDigits = digitsOnly.substring(0, digitsOnly.length - 1);
        const formatted = formatToDate(newDigits);
        setDisplayValue(formatted);
        onChange(getReturnValue(formatted), false);
        validateDate(formatted);
      }
    }
  };

  const handleBlur = () => {
    // blur 시 commit 처리
    onChange(getReturnValue(displayValue), true);
  };

  return (
    <div className="rcm-stack" data-gap="xs">
      <input
        id={name}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={readonly}
        className={readonlyClass(readonly, 'rcm-input')}
        data-state={hasError || validationError ? 'error' : undefined}
        maxLength={10} // YYYY-MM-DD = 10자
      />
      {validationError && <p className="rcm-field-error">{validationError}</p>}
    </div>
  );
};

/**
 * 생년월일 입력 필드
 *
 * - 숫자만 입력 가능
 * - YYYY-MM-DD 형식으로 자동 포맷팅
 * - 실시간 유효성 검증
 * - includeHyphen 옵션으로 반환값 형식 설정 (기본값: false → YYYYMMDD)
 */
export class BirthdayField extends ListableFormField<BirthdayField> {
  /** 반환값에 하이픈(-) 포함 여부 */
  includeHyphen: boolean;

  constructor(name: string, order: number, includeHyphen: boolean = false) {
    super(name, order, 'custom');
    this.includeHyphen = includeHyphen;
    this.helpText = '생년월일 8자리를 입력해 주세요 (예: 19900101)';
  }

  /**
   * BirthdayField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, params);

      return (
        <BirthdayInput
          name={inputParams.name}
          value={inputParams.value ?? ''}
          onChange={(value, commit) => {
            inputParams.onChange?.(value, commit);
          }}
          readonly={inputParams.readonly}
          placeholder={inputParams.placeHolder}
          includeHyphen={this.includeHyphen}
        />
      );
    })();
  }

  /**
   * 목록에 표시될 때의 렌더링 로직
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    const value = props.item[this.name];
    if (!value) {
      return Promise.resolve({ result: '' });
    }

    // YYYYMMDD 형식을 YYYY-MM-DD로 표시
    if (/^\d{8}$/.test(value)) {
      const formatted = `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`;
      return Promise.resolve({ result: formatted });
    }

    return Promise.resolve({ result: value });
  }

  /**
   * BirthdayField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): BirthdayField {
    return new BirthdayField(name, order, this.includeHyphen);
  }

  /**
   * includeHyphen 설정
   * @param includeHyphen 하이픈 포함 여부
   */
  withIncludeHyphen(includeHyphen: boolean): this {
    this.includeHyphen = includeHyphen;
    return this;
  }

  static create(props: BirthdayFieldProps): BirthdayField {
    return new BirthdayField(props.name, props.order, props.includeHyphen).copyFields(props, true);
  }
}
