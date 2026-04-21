import {
  MultipleOptionalField,
  MultipleOptionalFieldProps,
  renderListMultipleOptionalField,
  ViewListProps,
  ViewListResult,
} from './abstract';
import React from 'react';
import { MinMaxLimit, SelectOption } from '../../form/Type';
import { FieldRenderParameters } from '../../config/EntityField';
import { CheckBoxChip } from '../../ui';
import { RadioInput } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { MultiSelectBox } from '../../ui';
import { StatusChangeReason, StatusChangeValidation } from './SelectField';

export interface MultiSelectFieldProps extends MultipleOptionalFieldProps {
  /**
   * 즉시 변경 기능 활성화 여부.
   * true로 설정하면 옵션 선택 즉시 API를 호출하여 상태를 변경합니다.
   */
  enableImmediateChange?: boolean | undefined;

  /**
   * 상태 변경 시 사유 입력 설정.
   * 특정 상태로 변경 시 사유 입력을 요구할 수 있습니다.
   */
  reason?: StatusChangeReason[] | undefined;

  /**
   * 상태 변경 시 검증 로직 설정.
   * 상태 변경 전에 추가적인 검증을 수행할 수 있습니다.
   */
  validateStatusChange?: StatusChangeValidation | undefined;
}

export class MultiSelectField extends MultipleOptionalField<MultiSelectField> {
  /** 즉시 변경 기능 활성화 여부 */
  enableImmediateChange?: boolean | undefined;

  /** 상태 변경 시 사유 입력 설정 */
  reason?: StatusChangeReason[] | undefined;

  /** 상태 변경 시 검증 로직 */
  validateStatusChange?: StatusChangeValidation | undefined;

  constructor(
    name: string,
    order: number,
    options: SelectOption[],
    limit?: MinMaxLimit,
    reason?: StatusChangeReason[],
    validateStatusChange?: StatusChangeValidation,
  ) {
    super(name, order, 'multiselect', options, limit);
    this.reason = reason;
    this.validateStatusChange = validateStatusChange;
  }

  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    const cacheKey = this.createCacheKey();

    return (async () => {
      // combo 설정이 있으면 CheckBoxChip 우선 (다중 선택 전용)
      // NOTE: MultiSelectField 는 값 타입이 배열이므로 RadioInput(단일 선택) 대신
      //       CheckBoxChip 을 사용해야 선택 상태가 정상적으로 표시된다.
      if (this.combo !== undefined && this.combo.direction !== undefined) {
        return (
          <CheckBoxChip
            key={cacheKey}
            options={this.options!}
            limit={this.limit}
            combo={this.combo}
            {...await getInputRendererParameters(this, params)}
          />
        );
      }

      // Chip UI 조건 충족 시 CheckBoxChip 사용
      if (this.shouldRenderAsChip()) {
        return (
          <CheckBoxChip
            key={cacheKey}
            options={this.options!}
            limit={this.limit}
            combo={{ direction: 'row' }}
            {...await getInputRendererParameters(this, params)}
          ></CheckBoxChip>
        );
      }

      return (
        <MultiSelectBox
          key={cacheKey}
          limit={this.limit}
          options={this.options!}
          {...await getInputRendererParameters(this, params)}
        ></MultiSelectBox>
      );
    })();
  }

  /**
   * MultiSelectField 핵심 리스트 아이템 렌더링 로직
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    return renderListMultipleOptionalField(this, props);
  }

  /**
   * MultiSelectField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): MultiSelectField {
    const instance = new MultiSelectField(
      name,
      order,
      this.options!,
      this.limit,
      this.reason,
      this.validateStatusChange,
    );
    instance.enableImmediateChange = this.enableImmediateChange;
    return instance;
  }

  static create(props: MultiSelectFieldProps): MultiSelectField {
    const field = new MultiSelectField(
      props.name,
      props.order,
      props.options!,
      props.limit,
      props.reason,
      props.validateStatusChange,
    );
    field.enableImmediateChange = props.enableImmediateChange;
    return field.copyFields(props, true);
  }

  /**
   * 즉시 변경 기능 활성화.
   * 옵션을 선택하면 즉시 API를 호출하여 상태를 변경합니다.
   * @param enable 활성화 여부 (기본값: true)
   */
  withImmediateChange(enable: boolean = true): this {
    this.enableImmediateChange = enable;
    return this;
  }

  /**
   * 상태 변경 시 사유 입력 설정.
   * 특정 상태로 변경할 때 사유 입력을 요구합니다.
   * @param reason 사유 입력 설정 배열
   */
  withReason(reason?: StatusChangeReason[]): this {
    this.reason = reason;
    return this;
  }

  /**
   * 상태 변경 시 검증 로직 설정.
   * 상태 변경 전에 추가적인 검증을 수행합니다.
   * @param validateStatusChange 검증 로직 설정
   */
  withValidateStatusChange(validateStatusChange?: StatusChangeValidation): this {
    this.validateStatusChange = validateStatusChange;
    return this;
  }
}
