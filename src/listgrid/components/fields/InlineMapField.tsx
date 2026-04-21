import { FormField, FormFieldProps } from './abstract';
import React from 'react';
import { InlineMapConfig, MapKey } from '../../config/Config';
import { FieldRenderParameters } from '../../config/EntityField';
import { InlineMap, InlineMapPendingRef, KeyValue } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { MinMaxLimit } from '../../form/Type';
import { EntityForm } from '../../config/EntityForm';
import { RenderType } from '../../config/Config';

interface InlineMapFieldProps extends FormFieldProps {
  config?: InlineMapConfig | undefined;
}

export class InlineMapField extends FormField<InlineMapField> {
  config?: InlineMapConfig | undefined;
  pendingRef: { current: InlineMapPendingRef } = { current: { value: undefined, modified: false } };

  constructor(name: string, order: number, config?: InlineMapConfig) {
    super(name, order, 'inlineMap');
    this.config = config;
  }

  isDirty(): boolean {
    if (this.pendingRef.current.modified) {
      return true;
    }
    return super.isDirty();
  }

  async getSaveValue(entityForm: EntityForm, renderType?: RenderType): Promise<any> {
    if (this.pendingRef.current.modified) {
      return this.pendingRef.current.value;
    }
    return super.getSaveValue(entityForm, renderType);
  }

  /**
   * InlineMapField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <InlineMap
          config={this.config}
          pendingRef={this.pendingRef}
          {...await getInputRendererParameters(this, params)}
        ></InlineMap>
      );
    })();
  }

  /**
   * InlineMapField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): InlineMapField {
    const instance = new InlineMapField(name, order, this.config);
    instance.pendingRef = this.pendingRef;
    return instance;
  }

  withKeys(keys?: MapKey[]): this {
    this.config = {
      ...(keys !== undefined ? { keys } : {}),
      ...(this.config?.limit !== undefined ? { limit: this.config.limit } : {}),
      ...(this.config?.resultType !== undefined ? { resultType: this.config.resultType } : {}),
    };
    return this;
  }

  useResultMap(): this {
    this.config = {
      ...(this.config?.keys !== undefined ? { keys: this.config.keys } : {}),
      ...(this.config?.limit !== undefined ? { limit: this.config.limit } : {}),
      resultType: 'Map',
    };
    return this;
  }

  useKeyValue(): this {
    this.config = {
      ...(this.config?.keys !== undefined ? { keys: this.config.keys } : {}),
      ...(this.config?.limit !== undefined ? { limit: this.config.limit } : {}),
      resultType: 'KeyValue',
    };
    return this;
  }

  withLimit(limit?: MinMaxLimit): this {
    this.config = {
      ...(this.config?.keys !== undefined ? { keys: this.config.keys } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(this.config?.resultType !== undefined ? { resultType: this.config.resultType } : {}),
    };
    return this;
  }

  withConfig(config?: InlineMapConfig): this {
    this.config = config;
    return this;
  }

  /**
   * Map 형태 또는 KeyValue[] 형태를 모두 지원한다.
   * @param value
   */
  withDefaultValue(value: KeyValue[] | Map<string, string>): this {
    return super.withDefaultValue(value);
  }

  static create(props: InlineMapFieldProps): InlineMapField {
    return new InlineMapField(props.name, props.order, props.config).copyFields(props, true);
  }
}
