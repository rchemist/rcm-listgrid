import {
  OptionalField,
  OptionalFieldProps,
  renderListOptionalField,
  ViewListProps,
  ViewListResult,
} from '../../components/fields/abstract';
import React from 'react';
import { RenderType } from '../../config/Config';
import { SelectBox } from '../../ui';
import { RadioInput } from '../../ui';
import { getInputRendererParameters } from '../../components/helper/FieldRendererHelper';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { hexHash } from '../../utils/hash';
import { SelectOption } from '../../form/Type';
import { getExternalApiDataWithError, isEmpty, isEquals } from '../../misc';
import { CheckBox } from '../../ui';
import { isTrue } from '../../utils/BooleanUtil';
import { MultiSelectBox } from '../../ui';

const customOptionFetchUrl = '/option/by-alias';
const customOptionBulkFetchUrl = '/option/by-aliases';

// alias별 options 캐시 (동일 페이지 내에서 공유)
const customOptionCache = new Map<string, SelectOption[]>();

interface CustomOptionFieldProps extends OptionalFieldProps {
  alias: string;
  multiple?: boolean | undefined;
}

export class CustomOptionField extends OptionalField<CustomOptionField> {
  alias: string;
  multiple?: boolean | undefined;

  constructor(name: string, order: number, alias: string, multiple?: boolean) {
    super(name, order, 'custom');
    this.alias = alias;
    // this.tooltip = <div>이 선택 옵션은 <a href='/academic/system/option'>시스템 옵션</a> 에서 시스템 ID <span style={{ fontWeight: `bold`, marginRight: `4px` }}>{alias}</span> 로 등록된 옵션값 입니다.</div>;
    this.multiple = multiple ?? false;
    this.layout = 'half';
  }

  /**
   * CustomOptionField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      if (this.options === undefined || this.options.length === 0) {
        this.options = await getCustomOptionValues(this.alias);
      }

      const cacheKey = this.createCacheKey();

      if (this.combo !== undefined && this.combo.direction !== undefined) {
        if (isTrue(this.multiple)) {
          return (
            <CheckBox
              key={cacheKey}
              options={this.options!}
              combo={this.combo}
              {...await getInputRendererParameters(this, params)}
            ></CheckBox>
          );
        } else {
          return (
            <RadioInput
              key={cacheKey}
              options={this.options!}
              combo={this.combo}
              {...await getInputRendererParameters(this, params)}
            ></RadioInput>
          );
        }
      }

      if (isTrue(this.multiple)) {
        return (
          <MultiSelectBox
            key={cacheKey}
            options={this.options!}
            {...await getInputRendererParameters(this, params)}
          ></MultiSelectBox>
        );
      } else {
        return (
          <SelectBox
            key={cacheKey}
            options={this.options!}
            {...await getInputRendererParameters(this, params)}
          ></SelectBox>
        );
      }
    })();
  }

  /**
   * CustomOptionField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): CustomOptionField {
    return new CustomOptionField(name, order, this.alias, this.multiple);
  }

  /**
   * CustomOptionField 리스트 필터 렌더링 (기본 renderInstance 사용)
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return this.renderInstance({
      ...params,
      required: false,
      onChange: (value) => params.onChange(value),
    } as FieldRenderParameters);
  }

  /**
   * CustomOptionField 리스트 아이템 렌더링
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    if (this.options === undefined || this.options.length === 0) {
      return (async () => {
        const options = await getCustomOptionValues(this.alias);
        this.options = options;
        return renderListOptionalField(this, props);
      })();
    } else {
      return renderListOptionalField(this, props);
    }
  }

  private createCacheKey(renderType?: RenderType) {
    let key: string = ``;
    for (const option of this.options!) {
      key += `_${option.value}`;
    }

    return hexHash(`${this.getName()}_${this.getCurrentValue(renderType)}_${key}`);
  }

  static create(props: CustomOptionFieldProps): CustomOptionField {
    return new CustomOptionField(props.name, props.order, props.alias, props.multiple).copyFields(
      props,
      true,
    );
  }

  useListField(order?: number): this {
    this.listConfig = { ...this.listConfig, support: true, sortable: false, order: order }; // Select 필드는 Sort 를 지원하지 않는다.
    return this;
  }

  withMultiple(multiple?: boolean): this {
    this.multiple = multiple;
    return this;
  }

  // field 값이 변경되었는지 여부에 대한 판단
  isDirty(): boolean {
    if (this.value) {
      const fetchedValue = this.value.fetched;
      const currentValue = this.value.current;
      const defaultValue = this.value.default;

      if (isTrue(this.multiple)) {
        const isOriginalEmpty =
          fetchedValue === undefined ||
          fetchedValue === null ||
          (Array.isArray(fetchedValue) && fetchedValue.length === 0);
        const isCurrentEmpty =
          currentValue === undefined ||
          currentValue === null ||
          (Array.isArray(currentValue) && currentValue.length === 0);
        if (isOriginalEmpty && isCurrentEmpty) {
          return false;
        }
      }

      if (fetchedValue !== undefined) {
        return !isEquals(fetchedValue, currentValue);
      } else {
        return !isEquals(defaultValue, currentValue);
      }
    }
    return false;
  }
}

export async function getCustomOptionValues(alias: string): Promise<SelectOption[]> {
  // 캐시에 있으면 캐시에서 반환
  if (customOptionCache.has(alias)) {
    return customOptionCache.get(alias)!;
  }

  const response = await getExternalApiDataWithError({
    url: `${customOptionFetchUrl}/${alias}`,
    method: 'GET',
  });
  // 데이터가 정상적으로 들어왔다면 옵션 데이터를 생성해 반환한다. 오류가 발생했다면(alias 가 없거나 하는 경우) 빈 배열을 반환한다.
  if (response.data && !isEmpty(response.data.values)) {
    const options = [
      ...response.data.values.map((item: any) => ({ value: item.value, label: item.label })),
    ];
    customOptionCache.set(alias, options);
    return options;
  }
  return [];
}

/**
 * 여러 alias에 대한 옵션값을 일괄 조회하여 캐시에 저장
 * ViewListGrid에서 목록 렌더링 전에 호출하여 N+1 문제 방지
 */
export async function prefetchCustomOptions(aliases: string[]): Promise<void> {
  // 이미 캐시에 있는 alias 제외
  const uncachedAliases = aliases.filter((alias) => !customOptionCache.has(alias));

  if (uncachedAliases.length === 0) {
    return;
  }

  const params = new URLSearchParams();
  uncachedAliases.forEach((alias) => params.append('aliases', alias));

  const response = await getExternalApiDataWithError({
    url: `${customOptionBulkFetchUrl}?${params.toString()}`,
    method: 'GET',
  });

  if (response.data && Array.isArray(response.data)) {
    for (const optionData of response.data) {
      if (optionData.alias && !isEmpty(optionData.values)) {
        const options = optionData.values.map((item: any) => ({
          value: item.value,
          label: item.label,
        }));
        customOptionCache.set(optionData.alias, options);
      }
    }
  }
}

/**
 * 캐시 초기화 (필요시 사용)
 */
export function clearCustomOptionCache(): void {
  customOptionCache.clear();
}
