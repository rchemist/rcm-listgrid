/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {
  getNestedValue,
  ListableFormField,
  ListableFormFieldProps,
  ViewListProps
} from "./ListableFormField";
import {ComboProps, FieldType, RenderType} from '../../../config/Config';
import {MinMaxLimit, SelectOption} from "../../../form/Type";
import {ValidateResult} from '../../../validations/Validation';
import {EntityForm} from '../../../config/EntityForm';
import {Session} from '../../../auth/types';
import {hexHash} from "next/dist/shared/lib/hash";
import {isEquals} from "@gjcu/ui";
import {isTrue} from '../../../utils/BooleanUtil';
import {Badge} from "@gjcu/ui/elements/badges/Badge";
import {isBlank} from '../../../utils/StringUtil';

function isEqualOptions(a?: SelectOption[], b?: SelectOption[]) {
  if (a === undefined && b === undefined) {
    return true;
  }

  if (a === undefined || b === undefined) {
    return false;
  }

  return isEquals(a, b);
}

/**
 * Chip UI 설정
 */
export interface ChipConfig {
  enabled: boolean;           // Chip UI 사용 여부
  maxOptions?: number;        // Chip으로 표시할 최대 옵션 수 (기본값: 10)
  maxLabelLength?: number;    // Chip으로 표시할 최대 라벨 길이 (기본값: 8)
}

// Chip UI 기본 설정값
const DEFAULT_CHIP_MAX_OPTIONS = 10;
const DEFAULT_CHIP_MAX_LABEL_LENGTH = 8;

export interface OptionalFieldProps extends ListableFormFieldProps {
  combo?: ComboProps;    // radio 나 checkbox 타입 으로 보여져야 하는 경우 추가 설정
  options?: SelectOption[];   // option 정보
  preservedOptions?: SelectOption[];    // onChange 의 결과로 option 이 변경되었다면, 롤백을 위해 이 값을 저장해 둔다.
  chipConfig?: ChipConfig;    // Chip UI 설정
  singleFilter?: boolean;    // 목록 필터에서 단일 선택만 허용 (true: EQUAL, false/undefined: IN)
}

export abstract class OptionalField<T extends OptionalField<T>> extends ListableFormField<T> {

  combo?: ComboProps;    // radio 나 checkbox 타입 으로 보여져야 하는 경우 추가 설정
  options?: SelectOption[];   // option 정보
  preservedOptions?: SelectOption[];    // onChange 의 결과로 option 이 변경되었다면, 롤백을 위해 이 값을 저장해 둔다.
  chipConfig?: ChipConfig;    // Chip UI 설정
  singleFilter?: boolean;    // 목록 필터에서 단일 선택만 허용 (true: EQUAL, false/undefined: IN)

  /**
   * 목록 필터에서 단일 선택만 허용하도록 설정합니다.
   * true로 설정하면 필터가 EQUAL 조건으로 동작하고, RadioChip으로 렌더링됩니다.
   * @param enabled 단일 선택 여부 (기본값: true)
   */
  withSingleFilter(enabled: boolean = true): this {
    this.singleFilter = enabled;
    return this;
  }

  /**
   * 이 필드를 라디오 버튼이나 Checkbox 타입으로 표시하는 경우 이 메소드를 호출한다.
   * @param props direction 설정
   */
  withComboType(props?: ComboProps): this {
    this.combo = props;
    return this;
  }

  withOptions(options?: SelectOption[]): this {
    this.options = options ? [...options] : undefined;
    return this;
  }

  withPreservedOptions(options?: SelectOption[]): this {
    this.preservedOptions = options ? [...options] : undefined;
    return this;
  }

  /**
   * Chip UI를 사용하도록 설정
   * @param enabled Chip UI 활성화 여부 (기본값: true)
   * @param config 추가 설정 (maxOptions, maxLabelLength)
   */
  useChip(enabled: boolean = true, config?: Partial<Omit<ChipConfig, 'enabled'>>): this {
    this.chipConfig = {
      enabled,
      maxOptions: config?.maxOptions ?? DEFAULT_CHIP_MAX_OPTIONS,
      maxLabelLength: config?.maxLabelLength ?? DEFAULT_CHIP_MAX_LABEL_LENGTH
    };
    return this;
  }

  /**
   * Chip UI로 렌더링할 조건을 충족하는지 확인
   * - chipConfig가 undefined: 옵션 수/라벨 길이 조건 자동 체크
   * - useChip(true): 강제 Chip 사용
   * - useChip(false): 강제 Chip 사용 안 함
   */
  shouldRenderAsChip(): boolean {
    // useChip(false)로 명시적 비활성화
    if (this.chipConfig?.enabled === false) {
      return false;
    }

    const maxOptions = this.chipConfig?.maxOptions ?? DEFAULT_CHIP_MAX_OPTIONS;
    const maxLabelLength = this.chipConfig?.maxLabelLength ?? DEFAULT_CHIP_MAX_LABEL_LENGTH;

    // 옵션이 없으면 Chip 불가
    if (!this.options || this.options.length === 0) {
      return false;
    }

    // useChip(true)로 명시적 활성화 시 조건 체크 생략
    if (this.chipConfig?.enabled === true) {
      return true;
    }

    // chipConfig가 undefined일 때: 자동 조건 체크
    // 옵션 수 체크
    if (this.options.length > maxOptions) {
      return false;
    }

    // 모든 옵션의 라벨 길이 체크
    for (const option of this.options) {
      const label = option.label ?? option.value;
      if (label.length > maxLabelLength) {
        return false;
      }
    }

    return true;
  }

  changeOptions(options: SelectOption[], defaultValue?: any): boolean {
    if (this.preservedOptions === undefined || !isEqualOptions(this.options, options)) {
      this.preservedOptions = this.options ? [...this.options] : undefined;
      this.options = [...options];

      if (defaultValue !== undefined) {
        this.withDefaultValue(defaultValue);
      }

      return true;
    }
    return false;
  }

  revertOptions(renderType?: RenderType): boolean {
    if (this.preservedOptions !== undefined) {
      if (!isEqualOptions(this.preservedOptions, this.options)) {
        this.resetValue(renderType);
        this.options = [...this.preservedOptions];
        this.preservedOptions = undefined;
        return true;
      }
    }
    return false;
  }

  protected copyFields(origin: OptionalFieldProps, includeValue: boolean = true): this {
    const result = super.copyFields(origin, includeValue).withComboType(origin.combo).withOptions(origin.options)
      .withPreservedOptions(origin.preservedOptions);
    if (origin.chipConfig) {
      result.chipConfig = { ...origin.chipConfig };
    }
    if (origin.singleFilter !== undefined) {
      result.singleFilter = origin.singleFilter;
    }
    return result;
  }
}

export interface MultipleOptionalFieldProps extends OptionalFieldProps {
  limit?: MinMaxLimit;
}

export abstract class MultipleOptionalField<T extends MultipleOptionalField<T>> extends OptionalField<T> {
  limit?: MinMaxLimit;

  /**
   * 복수 선택할 수 있는 최소, 최대 개수 설정
   * 설정된 최소값이 있다면 해당 개수 미만을 선택하면 에러
   * 설정된 최대값이 있다면 해당 개수를 초과하면 에러
   * @param limit
   */
  withLimit(limit?: MinMaxLimit): this {
    this.limit = limit;
    return this;
  }

  /**
   * 복수 선택할 수 있는 최소 개수만 설정
   * @param min
   */
  withMin(min?: number): this {
    this.limit = { min: min, max: this.limit?.max };
    return this;
  }

  /**
   * 복수 선택할 수 있는 최대 개수 설정
   * @param max
   */
  withMax(max?: number): this {
    this.limit = { min: this.limit?.min, max: max };
    return this;
  }

  protected createCacheKey(renderType?: RenderType) {

    let key: string = ``;
    for (const option of this.options!) {
      key += `_${option.value}`
    }

    return hexHash(`${this.getName()}_${this.getCurrentValue(renderType)}_${key}`);
  }

  protected constructor(name: string, order: number, type: FieldType, options?: SelectOption[], limit?: MinMaxLimit) {
    super(name, order, type);
    this.options = options;
    this.limit = limit;
  }

  protected copyFields(origin: OptionalFieldProps, includeValue: boolean = true): this {
    return super.copyFields(origin, includeValue)
      .withLimit(this.limit);
  }

  async validate(entityForm: EntityForm, session?: Session): Promise<ValidateResult | ValidateResult[]> {
    return await this.validateWithLimit({
      previousResult: await super.validate(entityForm, session),
      entityForm: entityForm,
      required: await this.isRequired({ entityForm, session }),
      limit: this.limit,
      value: this.getCurrentValue(entityForm.getRenderType())
    });
  }

  private async validateWithLimit(props: ValidateWithLimitProps) {
    const result = props.previousResult;

    let errored = false;

    if (Array.isArray(result)) {
      if (result.length > 0) {
        for (const validateResult of result) {
          if (validateResult.error) {
            errored = true;
            break;
          }
        }
      }
    } else {
      // 단수일 때
      errored = result.error;
    }

    if (!errored) {
      // 에러가 안 난 경우에만 limit 에 대한 체크 에러를 시작한다.

      if (props.limit !== undefined) {

        const value = props.value;

        if (value !== undefined) {
          if (Array.isArray(value)) {
            // value 가 array 타입인 경우
            const selected = value.length;

            if (props.limit.min !== undefined && selected < props.limit.min) {
              return ValidateResult.fail(`최소 ${props.limit.min}개 이상을 선택해야 합니다.`);
            } else if (props.limit.max !== undefined && selected > props.limit.max) {
              return ValidateResult.fail(`최대 ${props.limit.max}개까지 선택할 수 있습니다.`)
            }

          } else {

            if (props.limit.min !== undefined) {
              return ValidateResult.fail(`최소 ${props.limit.min}개 이상을 선택해야 합니다.`);
            }

          }
        }

      }

    }
    return result;
  }
}

interface ValidateWithLimitProps {
  previousResult: ValidateResult | ValidateResult[];
  entityForm: EntityForm;
  required: boolean;
  limit?: MinMaxLimit;
  value: any;
} 

export function renderListOptionalField(field: OptionalField<any>, props: ViewListProps) {
    // 중첩 객체 접근 지원 (예: score.student.name)
    const value = String(getNestedValue(props.item, field.name) ?? '');
  
    if (isBlank(value)) {
      return Promise.resolve({ result: '' });
    }
  
  
    const option = field.options?.find(option => option.value === value);
  
    if (option) {
      const color = option.color ?? (field.type === 'boolean' ? (isTrue(value) ? 'info' : 'secondary') : 'primary');
      const label = option.listLabel ?? (option.label ?? option.value);
      return Promise.resolve({
        result: <Badge color={color} variant={'outline'}>{label}</Badge>,
        linkOnCell: true
      });
    }
  
    const color = field.type === 'boolean' ? isTrue(value) ? 'info' : 'dark' : undefined;
    const label = field.type === 'boolean' ? isTrue(value) ? '예' : '아니오' : value;
  
    return Promise.resolve({ result: <Badge color={color} variant={'outline'}>{label}</Badge>, linkOnCell: true });
  }
  
  
  export function renderListMultipleOptionalField(field: OptionalField<any>, props: ViewListProps) {
    // 중첩 객체 접근 지원 (예: score.student.name)
    const value = getNestedValue(props.item, field.name);
  
    if (isBlank(value) || (Array.isArray(value) && value.length === 0)) {
      return Promise.resolve({ result: '' });
    }
  
    function getDisplayValue(value: any) {
      if (field.options) {
        for (const option of field.options) {
          if (option.value === value) {
            return option.listLabel ?? (option.label ?? option.value);
          }
        }
      }
      return value;
    }
  
  
    if (Array.isArray(value)) {
      return Promise.resolve({
        result: <span className={'space-x-0.5'}>{value.map((v, index) => <Badge
          color={v.color ?? 'secondary'}
          variant={'outline'}
          key={`${field.name}_${index}`}>{getDisplayValue(v)}</Badge>)}</span>
      }); // 여러개 선택시 배열로 반환한다.
    }
  
    const option = field.options?.find(option => option.value === value);
    if (option) {
      return Promise.resolve({ result: <Badge color={option.color ?? undefined}>{option.label}</Badge>, linkOnCell: false });
    }
  
    return Promise.resolve({ result: <Badge>{value}</Badge>, linkOnCell: false });
  
  }