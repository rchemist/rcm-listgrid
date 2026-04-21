import React from 'react';
import {
  CheckButtonValidationField,
  CheckButtonValidationFieldProps,
  getNestedValue,
  ViewListProps,
  ViewListResult,
  ViewRenderProps,
  ViewRenderResult,
} from '../../components/fields/abstract';
import { TextInput } from '../../ui';
import { getInputRendererParameters } from '../../components/helper/FieldRendererHelper';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { CopyableTextView, CopyButton } from './view/CopyableTextView';

interface StringFieldProps extends CheckButtonValidationFieldProps {
  useCopy?: boolean;
}

export class StringField extends CheckButtonValidationField<StringField> {
  useCopy?: boolean;

  constructor(name: string, order: number, useCopy?: boolean) {
    super(name, order, 'text');
    this.useCopy = useCopy ?? false;
  }

  /**
   * Enable copy button in list view
   */
  withCopy(enabled: boolean = true): this {
    this.useCopy = enabled;
    return this;
  }

  /**
   * StringField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    const renderNode = async (extraProps?: Record<string, unknown>) => {
      // readonly + maskedValueFunc: display masked value without touching original value
      if (params.readonly && this.maskedValueFunc) {
        const inputParams = await getInputRendererParameters(this, params);
        if (inputParams.value != null && inputParams.value !== '') {
          const maskedValue = await this.maskedValueFunc!(params.entityForm, inputParams.value);
          return <TextInput {...inputParams} {...extraProps} value={maskedValue}></TextInput>;
        }
        return <TextInput {...inputParams} {...extraProps}></TextInput>;
      }

      if (this.checkButtonValidation !== undefined) {
        return this.renderCheckButtonValidationField(params);
      }

      return (
        <TextInput {...await getInputRendererParameters(this, params)} {...extraProps}></TextInput>
      );
    };

    if (this.useCopy) {
      return (async () => {
        const value = await params.entityForm.getValue(this.name);

        if (!value) {
          return renderNode();
        }

        // 복사 버튼이 붙으므로 우측 라운드와 테두리를 제거
        const node = await renderNode({
          className: 'rounded-r-none border-r-0',
        });

        return (
          <div className="rcm-input-group-stretch">
            <div className="rcm-input-group-grow">{node}</div>
            <CopyButton value={String(value)} className="rcm-copy-addon-wrap" />
          </div>
        );
      })();
    }

    return renderNode();
  }

  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <TextInput
          name={`${this.name}_${params.entityForm.id}`}
          onChange={(value: string) => {
            params.onChange(value, 'LIKE');
          }}
          value={params.value}
        ></TextInput>
      );
    })();
  }

  /**
   * StringField View 모드 렌더링 - 텍스트 표시
   * cardIcon이 설정된 경우 아이콘과 함께 표시
   */
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    const value = getNestedValue(props.item, this.name);

    // null, undefined, 빈 문자열 처리
    if (value === null || value === undefined || value === '') {
      return { result: null };
    }

    // maskedValueFunc: apply masking in view mode
    let textValue = String(value);
    if (this.maskedValueFunc && props.entityForm) {
      textValue = await this.maskedValueFunc(props.entityForm, value);
    }

    // If copy is enabled, use CopyableTextView
    if (this.useCopy) {
      return {
        result: <CopyableTextView value={String(value)} displayValue={textValue} />,
      };
    }

    // cardIcon이 설정된 경우 아이콘과 함께 표시
    if (this.cardIcon) {
      const IconComponent = this.cardIcon;
      return {
        result: (
          <span className="rcm-bool-wrap">
            <span className="rcm-icon-frame">
              <IconComponent className="rcm-icon" data-size="sm" stroke={1.75} />
            </span>
            <span className="font-medium">{textValue}</span>
          </span>
        ),
      };
    }

    return { result: textValue };
  }

  /**
   * StringField 리스트 아이템 렌더링 (복사 기능 지원)
   */
  protected async renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    let value = getNestedValue(props.item, this.name);

    if (this.displayFunc) {
      const originalValue = this.value;
      this.value = { current: value, fetched: value };
      try {
        value = await this.displayFunc(props.entityForm, this);
      } finally {
        if (originalValue !== undefined) {
          this.value = originalValue;
        } else {
          delete this.value;
        }
      }
    }

    // maskedValueFunc: apply masking in list mode
    if (this.maskedValueFunc && value != null && value !== '') {
      value = await this.maskedValueFunc(props.entityForm, value);
    }

    // If copy is enabled and we have a value, use CopyableTextView
    if (this.useCopy && value) {
      return {
        result: <CopyableTextView value={String(value)} />,
        linkOnCell: true,
      };
    }

    return { result: value };
  }

  /**
   * StringField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): StringField {
    return new StringField(name, order, this.useCopy);
  }

  static create(props: StringFieldProps): StringField {
    return new StringField(props.name, props.order, props.useCopy).copyFields(props, true);
  }
}
