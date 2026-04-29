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

/**
 * InlineMap 의 pendingRef.value 가 비어있는지 판정.
 * - undefined / null → blank
 * - Map / 객체 → entries 가 0개면 blank
 * - 배열 (KeyValue[]) → 길이 0 이면 blank
 */
export function isInlineMapValueBlank(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (value instanceof Map) {
    return value.size === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value as object).length === 0;
  }
  return false;
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
   * 사용자가 InlineMap UI 에서 입력한 값은 `pendingRef.current.value` 에 누적되며,
   * `getSaveValue`/`isDirty` 시점에서야 form value 로 반영됩니다.
   * 따라서 검증 단계의 `isBlank` 도 pendingRef 가 modified 된 경우에는
   * pendingRef 값을 우선해서 봐야 합니다. 그렇지 않으면 사용자가 값을 입력했음에도
   * "필수 값입니다" 검증에 막혀 저장이 차단됩니다.
   */
  async isBlank(renderType: RenderType = 'create'): Promise<boolean> {
    if (this.pendingRef.current.modified) {
      const pendingValue = this.pendingRef.current.value;
      return isInlineMapValueBlank(pendingValue);
    }
    return super.isBlank(renderType);
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
