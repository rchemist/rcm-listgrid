import React from 'react';
import {
  OptionalField,
  OptionalFieldProps,
  renderListOptionalField,
  ViewListProps,
  ViewListResult,
  ViewRenderProps,
  ViewRenderResult,
} from './abstract';
import { BooleanRadio } from '../../ui';
import { RadioChip } from '../../ui';
import {
  FieldInfoParameters,
  FieldRenderParameters,
  FilterRenderParameters,
} from '../../config/EntityField';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { RenderType } from '../../config/Config';
import { IconCheck, IconX } from '@tabler/icons-react';

interface BooleanFieldProps extends OptionalFieldProps {
  emptyLabel?: string | undefined;
}

export class BooleanField extends OptionalField<BooleanField> {
  emptyLabel?: string | undefined;

  constructor(name: string, order: number, emptyLabel?: string) {
    super(name, order, 'boolean');
    this.emptyLabel = emptyLabel;
  }

  /**
   * BooleanField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <BooleanRadio
          options={this.options}
          combo={this.combo}
          {...await getInputRendererParameters(this, params)}
          emptyLabel={this.emptyLabel}
        ></BooleanRadio>
      );
    })();
  }

  /**
   * BooleanField 리스트 필터 렌더링 로직
   * Chip 스타일의 Radio 버튼으로 "예/아니오/전체" 세 가지 옵션 제공
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    // 필터용 옵션 설정 (예/아니오/전체)
    const filterOptions = [
      { label: '예', value: 'true' },
      { label: '아니오', value: 'false' },
      { label: '전체', value: '' },
    ];

    return (async () => {
      const inputParams = await getInputRendererParameters(this, {
        ...params,
        required: false,
        onChange: (value) => {
          // string 'true'/'false' 를 boolean으로 변환, 빈 값은 undefined
          if (value === 'true') params.onChange(true);
          else if (value === 'false') params.onChange(false);
          else params.onChange(undefined);
        },
      });

      // 현재 값을 string으로 변환
      // URL에서 오는 필터 값은 문자열 "true"/"false"이므로 문자열 비교도 처리
      let currentValue = '';
      if (inputParams.value === true || inputParams.value === 'true') currentValue = 'true';
      else if (inputParams.value === false || inputParams.value === 'false') currentValue = 'false';

      return (
        <RadioChip
          {...inputParams}
          value={currentValue}
          options={filterOptions}
          combo={{ direction: 'row' }}
        ></RadioChip>
      );
    })();
  }

  /**
   * BooleanField 핵심 리스트 아이템 렌더링 로직
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    return renderListOptionalField(this, props);
  }

  /**
   * BooleanField View 모드 렌더링 - 아이콘으로 true/false 표시
   * cardIcon이 설정된 경우 해당 아이콘을 우선 사용
   */
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    const value = props.item[this.name];

    // null, undefined 처리
    if (value === null || value === undefined) {
      return { result: null };
    }

    // options가 있으면 해당 label 찾기
    if (this.options && this.options.length > 0) {
      const option = this.options.find((opt) => opt.value === value);
      if (option) {
        // cardIcon이 있으면 아이콘과 함께 표시
        if (this.cardIcon) {
          const IconComponent = this.cardIcon;
          return {
            result: (
              <span className="rcm-bool-wrap">
                <span className="rcm-icon-frame">
                  <IconComponent className="rcm-icon" data-size="sm" stroke={1.75} />
                </span>
                <span className="rcm-text" data-weight="medium">
                  {option.label}
                </span>
              </span>
            ),
          };
        }
        return { result: option.label };
      }
    }

    // boolean 값에 따른 아이콘 렌더링
    if (value === true) {
      const IconComponent = this.cardIcon || IconCheck;
      const frameColor = this.cardIcon ? undefined : 'success';

      return {
        result: (
          <span className="rcm-bool-wrap">
            <span className="rcm-icon-frame" data-color={frameColor}>
              <IconComponent className="rcm-icon" data-size="sm" stroke={2} />
            </span>
            <span className="rcm-text" data-weight="medium" data-color="success">
              예
            </span>
          </span>
        ),
      };
    }

    // false 값
    const IconComponent = this.cardIcon || IconX;

    return {
      result: (
        <span className="rcm-bool-wrap">
          <span className="rcm-icon-frame">
            <IconComponent className="rcm-icon" data-size="sm" data-tone="disabled" stroke={2} />
          </span>
          <span className="rcm-text" data-weight="medium" data-tone="muted">
            아니오
          </span>
        </span>
      ),
    };
  }

  /**
   * BooleanField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): BooleanField {
    return new BooleanField(name, order, this.emptyLabel);
  }

  static create(props: BooleanFieldProps): BooleanField {
    return new BooleanField(props.name, props.order, props.emptyLabel).copyFields(props, true);
  }

  async getCurrentValue(renderType?: RenderType): Promise<boolean | undefined> {
    const value = await super.getCurrentValue(renderType);

    if (await this.isRequired({ renderType })) {
      if (value === undefined) {
        const value = this.options?.[0]?.value ?? false;
        this.withValue(value);
        return value;
      }
    }

    return value;
  }

  async isRequired(props: FieldInfoParameters): Promise<boolean> {
    const renderTypeValue = props.renderType ?? props.entityForm?.getRenderType() ?? 'create';

    if (renderTypeValue === 'update') {
      if (this.required !== undefined && typeof this.required === 'function') {
        return await this.required(props);
      }

      // required 가 명시적으로 false 로 설정된 경우 우선 적용
      if (this.required === false) {
        return false;
      }

      // boolean field 의 경우 save 된 값이 undefined 가 아니라면 이 필드는 required 가 된다.
      const value = await super.getCurrentValue(props.renderType);
      if (value !== undefined) {
        return true;
      }
    }

    return super.isRequired(props);
  }

  withEmptyLabel(emptyLabel?: string): this {
    this.emptyLabel = emptyLabel;
    return this;
  }
}
