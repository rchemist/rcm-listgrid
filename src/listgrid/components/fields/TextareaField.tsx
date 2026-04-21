import { FormField, FormFieldProps } from './abstract';
import React from 'react';
import { RenderType } from '../../config/Config';
import { FieldRenderParameters } from '../../config/EntityField';
import { Textarea } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { MinMaxLimit } from '../../form/Type';

interface TextareaFieldProps extends FormFieldProps {
  rows?: number | undefined;

  limit?: MinMaxLimit | undefined;
}

export class TextareaField extends FormField<TextareaField> {
  rows?: number | undefined;

  limit?: MinMaxLimit | undefined;

  constructor(name: string, order: number, rows?: number, limit?: MinMaxLimit) {
    super(name, order, 'textarea');
    this.rows = rows ?? 10; // 기본 10줄 표시
    this.limit = limit;
  }

  async getCurrentValue(renderType?: RenderType): Promise<any> {
    const renderTypeValue = renderType ?? 'create';
    if (this.value !== undefined) {
      return this.value?.current !== undefined
        ? this.value?.current
        : renderTypeValue === 'create'
          ? this.value?.default
          : this.value?.fetched;
    }
    return undefined;
  }

  /**
   * TextareaField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <Textarea rows={this.rows} {...await getInputRendererParameters(this, params)}></Textarea>
      );
    })();
  }

  /**
   * TextareaField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): TextareaField {
    return new TextareaField(name, order, this.rows, this.limit);
  }

  withRows(rows?: number): this {
    this.rows = rows;
    return this;
  }

  withLimit(limit?: MinMaxLimit): this {
    this.limit = limit;
    return this;
  }

  static create(props: TextareaFieldProps): TextareaField {
    return new TextareaField(props.name, props.order, props.rows, props.limit).copyFields(
      props,
      true,
    );
  }
}
