import React from 'react';
import { FormField, FormFieldProps, ViewRenderProps, ViewRenderResult } from './FormField';
import {
  EntityField,
  FieldRenderParameters,
  FilterRenderParameters,
} from '../../../config/EntityField';
import { EntityForm } from '../../../config/EntityForm';
import { LabelType, RenderType } from '../../../config/Config';
import { TextAlignType } from '../../../common/type';
import { isTrue } from '../../../utils/BooleanUtil';
import { QueryConditionType } from '../../../form/SearchForm';

/**
 * 중첩 객체에서 dot notation 경로로 값을 가져온다.
 * 예: getNestedValue(item, 'score.student.name') -> item.score.student.name
 * @param obj 대상 객체
 * @param path dot notation 경로 (예: 'score.student.name')
 * @returns 경로에 해당하는 값 또는 undefined
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  // dot notation이 아니면 직접 접근
  if (!path.includes('.')) {
    return obj[path];
  }

  // dot notation 경로를 따라 값을 가져옴
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

export interface ViewListProps {
  entityForm: EntityForm;
  item: any;
  router: any;
  viewUrl: string;
}

export interface ViewListResult {
  result: React.ReactNode | null;
  linkOnCell?: boolean; // td 에 링크를 걸 것인지, 아니면 result 가 버튼이거나 해서 td 에 링크를 걸면 안 되는지에 대한 처리
}

export interface IListConfig {
  // 목록 표시 여부
  support?: boolean | undefined;

  // 퀵서치로 사용 가능한지
  // 이 값이 true인 필드가 여러 개인 경우 order 값이 가장 낮은(우선순위가 높은) 필드를 사용
  quickSearch?: boolean | undefined;

  // 검색 가능 여부, default 는 true
  filterable?: boolean | undefined;

  // 정렬 가능 여부, default 는 true
  sortable?: boolean | undefined;

  // 목록에 표시될 때의 순서
  // 지정하지 않으면 field 자체의 order 를 사용
  order?: number | undefined;

  // 목록에 표시될 때 라벨
  // 지정하지 않으면 필드 자체의 라벨 사용
  label?: LabelType | undefined;

  // 목록에 표시될 때 TD 내에 정렬 방향 ('left' | 'center' | 'right')
  // 기본값은 left
  align?: TextAlignType | undefined;

  // 목록에 필드값을 출력할 때 별도의 포맷 변환처리 없이 일반 문자열로 다루고 싶을 때 이 값을 true 로 한다.
  viewRaw?: boolean | undefined;

  // 필터 처리할 때 QueryCondition 타입, 필터의 속성마다 컨디션이 다를 수 있다.
  // tag 필드인 경우에는 in 이 될 수 있고, date 관련 필드는 between 이 될 수 있다.
  op?: QueryConditionType | undefined;

  // 다중 필터 사용 여부 (ManyToOne 필드에서 복수 선택 가능)
  // true인 경우 IN operator를 사용하여 여러 값을 선택 가능
  // 기본값은 false (단일 선택, EQUAL operator)
  multiFilter?: boolean | undefined;
}

export interface UserListFieldProps {
  order?: number;
  quickSearch?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  multiFilter?: boolean;
}

export interface ListableFormFieldProps<
  TValue = any,
  TForm extends object = any,
> extends FormFieldProps<TValue, TForm> {
  listConfig?: IListConfig;

  // static create 에서만 사용되는 편의성 필드. 이 값이 true 면 useListField() 를 한 것과 동일한 효과를 가진다.
  showList?: boolean;

  overrideRenderListItem?: (props: ViewListProps) => Promise<ViewListResult>;

  overrideRenderListFilter?(
    params: FilterRenderParameters<TForm, TValue>,
  ): Promise<React.ReactNode | null>;
}

export abstract class ListableFormField<
  TSelf extends ListableFormField<TSelf, TValue, TForm>,
  TValue = any,
  TForm extends object = any,
> extends FormField<TSelf, TValue, TForm> {
  listConfig?: IListConfig;

  overrideRenderListItem?: (props: ViewListProps) => Promise<ViewListResult>;

  overrideRenderListFilter?(
    params: FilterRenderParameters<TForm, TValue>,
  ): Promise<React.ReactNode | null>;

  /**
   * 각 필드의 핵심 리스트 필터 렌더링 로직을 구현하는 추상 메소드
   * null을 반환하면 기본 필터 로직(원본 renderListFilter)을 적용
   */
  protected async renderListFilterInstance(
    params: FilterRenderParameters<TForm, TValue>,
  ): Promise<React.ReactNode | null> {
    return null;
  }

  /**
   * 각 필드의 핵심 리스트 아이템 렌더링 로직을 구현하는 추상 메소드
   * null을 반환하면 기본 리스트 아이템 로직(원본 renderListItem)을 적용
   */
  protected async renderListItemInstance(props: ViewListProps): Promise<ViewListResult | null> {
    return null;
  }

  /**
   * ListGrid 에서 List 를 출력할 때 각 항목을 출력하는 방식.
   * EntityForm 설정에서 overrideRenderList 를 이용해 오버라이드 할 수 있다.
   * @param props
   */
  async viewListItem(props: ViewListProps): Promise<ViewListResult> {
    if (this.overrideRenderListItem) {
      return this.overrideRenderListItem(props);
    }
    return this.renderListItem(props);
  }

  /**
   * 목록의 통합 검색 표시
   * EntityForm 을 설정할 때 overrideRenderListFilter 를 통해 override 할 수도 있다.
   * 설정된 오버라이드가 없으면 #renderListFilter 를 실행한다.
   * @param params
   */
  async viewListFilter(
    params: FilterRenderParameters<TForm, TValue>,
  ): Promise<React.ReactNode | null> {
    if (this.overrideRenderListFilter) {
      return this.overrideRenderListFilter?.(params);
    }
    return this.renderListFilter(params);
  }

  /**
   * 리스트 필터 렌더링 - renderListFilterInstance가 null이면 원본 기본 로직 사용
   */
  protected renderListFilter(
    params: FilterRenderParameters<TForm, TValue>,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      const customFilter = await this.renderListFilterInstance(params);
      if (customFilter !== null) {
        return customFilter;
      }

      // 원본 기본 필터 로직 실행
      return this.renderListFilterOriginal(params);
    })();
  }

  /**
   * 각 필드 별로 목록에 필터 처리가 될 때 어떻게 표시해야 하는지에 대한 기본 설정.
   * ListableFormField 를 구현한 필드들에서 기본적인 렌더링 외에 필요한 처리가 있다면 이 메소드를 오버라이드 한다.
   * 예를 들어, 날짜 필드는 단순 날짜 입력이 아니라 날짜 범위 입력이 가능하게 해야 한다든가 하는 등의 처리를 한다.
   * @param onChange
   * @param params
   * @protected
   */
  protected renderListFilterOriginal({
    onChange,
    ...params
  }: FilterRenderParameters<TForm, TValue>): Promise<React.ReactNode | null> {
    return this.render({
      ...params,
      required: false,
      onChange: (value: TValue) => onChange(value),
    } as FieldRenderParameters<TForm, TValue>);
  }

  /**
   * 리스트 아이템 렌더링 - renderListItemInstance가 null이면 원본 기본 로직 사용
   */
  protected renderListItem(props: ViewListProps): Promise<ViewListResult> {
    return (async () => {
      const customItem = await this.renderListItemInstance(props);
      if (customItem !== null) {
        return customItem;
      }

      // 원본 기본 리스트 아이템 로직 실행
      return this.renderListItemOriginal(props);
    })();
  }

  /**
   * 각 필드 별로 목록에 표시할 때 어떻게 표시해야 하는지 처리한다.
   * 기본적으로는 단순 문자열로 취급하지만,
   * Boolean 타입인 경우 Badge 로 표시한다든가 날짜일 때는 몇 시간 전, 등의 표시로 바꾼다든가 각 필드 별로 이 메소드를 오버라이드 해 사용한다.
   * @param props
   * @protected
   */
  protected renderListItemOriginal(props: ViewListProps): Promise<ViewListResult> {
    // 중첩 객체 접근 지원 (예: score.student.name)
    const value = String(getNestedValue(props.item, this.name) ?? '');
    return Promise.resolve({ result: value });
  }

  /**
   * View 모드에서 필드 값을 렌더링하는 메소드 (ListableFormField 오버라이드)
   * renderListItemInstance의 로직을 재사용하여 일관된 포맷 제공
   *
   * @param props View 렌더링에 필요한 파라미터
   * @returns 렌더링 결과
   */
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    // ViewListProps 형태로 변환하여 renderListItemInstance 호출
    const viewListProps: ViewListProps = {
      entityForm: props.entityForm ?? ({} as EntityForm),
      item: props.item,
      router: null,
      viewUrl: '',
    };

    // 기존 renderListItemInstance 로직 재사용
    const listResult = await this.renderListItemInstance(viewListProps);

    if (listResult !== null) {
      return { result: listResult.result };
    }

    // renderListItemInstance가 null을 반환하면 기본 로직 사용
    const originalResult = await this.renderListItemOriginal(viewListProps);
    return { result: originalResult.result };
  }

  useListField(props?: number | UserListFieldProps): this {
    if (typeof props === 'number') {
      props = { order: props };
    }

    const base: IListConfig = { ...this.listConfig, support: true };
    if (props?.order !== undefined) base.order = props.order;
    this.listConfig = base;
    // quickSearch는 명시적으로 설정된 경우에만 적용
    // (원칙: quickSearch: true가 명시적으로 설정된 필드들만 대상으로 한다)
    if (props?.quickSearch !== undefined) {
      this.listConfig.quickSearch = props.quickSearch;
    }
    if (props?.sortable !== undefined) {
      this.listConfig.sortable = props.sortable;
    }
    if (props?.filterable !== undefined) {
      this.listConfig.filterable = props.filterable;
    }
    return this;
  }

  withListConfig(list?: IListConfig): this {
    if (list) {
      this.listConfig = { ...list };
      if (this.listConfig.label === undefined) {
        this.listConfig.label = this.getLabel();
      }
      if (this.listConfig.support === undefined) {
        this.listConfig.support = true;
      }
    } else {
      delete this.listConfig;
    }
    return this;
  }

  withOverrideRenderListItem(
    overrideRenderList?: (props: ViewListProps) => Promise<ViewListResult>,
  ): this {
    if (overrideRenderList !== undefined) this.overrideRenderListItem = overrideRenderList;
    else delete this.overrideRenderListItem;
    return this;
  }

  withOverrideRenderListFilter(
    overrideRenderFilter?: (
      params: FilterRenderParameters<TForm, TValue>,
    ) => Promise<React.ReactNode | null>,
  ): this {
    if (overrideRenderFilter !== undefined) this.overrideRenderListFilter = overrideRenderFilter;
    else delete this.overrideRenderListFilter;
    return this;
  }

  isSupportList(): boolean {
    return this.listConfig !== undefined && isTrue(this.listConfig.support);
  }

  getListConfig(): IListConfig | undefined {
    const listConfig = { ...this.listConfig } as IListConfig;

    if (!this.isSupportList()) {
      return listConfig;
    }

    // 기본값 설정
    if (!listConfig.order) {
      listConfig.order = this.order;
    }

    if (!listConfig.label) {
      listConfig.label = this.getLabel();
    }

    return listConfig;
  }

  getListFieldAlignType(): TextAlignType {
    const config = this.getListConfig();

    if (config?.align !== undefined) {
      return config.align;
    }

    if (
      this.type === 'select' ||
      this.type === 'multiselect' ||
      this.type === 'date' ||
      this.type === 'datetime' ||
      this.type === 'boolean' ||
      this.type === 'year' ||
      this.type === 'month' ||
      this.type === 'time' ||
      this.type === 'file' ||
      this.type === 'image'
    ) {
      return 'center';
    }

    return 'left';
  }

  /**
   * 목록 필터 사용 여부 설정.
   * 설정이 없는 한 필터 사용은 true 이다.
   * 하지만 필터 처리를 하지 말아야 하는 경우에는 이 값을 false 로 명시적으로 선언해야 한다.
   * @param filterable
   */
  withFilterable(filterable?: boolean): this {
    this.listConfig = { ...this.getListConfig(), filterable: isTrue(filterable, true) };
    return this;
  }

  /**
   * EntityForm 이 저장될 때 서버로 전송할 값을 override 하는 메소드
   * @param saveValue
   */
  withSaveValue(
    saveValue: (
      entityForm: EntityForm<TForm>,
      field: EntityField,
      renderType?: RenderType,
    ) => Promise<TValue>,
  ): this {
    this.saveValue = saveValue;
    return this;
  }

  /**
   * 목록 정렬 사용 여부 설정
   * 설정이 없는 한 정렬 사용은 true 이다.
   * 하지만 정렬을 하지 말아야 하는 경우에는 이 값을 false 로 명시적으로 선언해야 한다.
   * @param sortable
   */
  withSortable(sortable?: boolean): this {
    this.listConfig = { ...this.getListConfig(), sortable: isTrue(sortable, true) };

    return this;
  }

  isFilterable() {
    if (!this.isSupportList()) {
      if (this.listConfig !== undefined) {
        return isTrue(this.listConfig.filterable, true);
      }

      return false;
    }

    return isTrue(this.getListConfig()?.filterable, true);
  }

  isSortable() {
    if (!this.isSupportList()) {
      if (this.listConfig !== undefined) {
        return isTrue(this.listConfig.sortable, true);
      }
      return false;
    }

    return isTrue(this.getListConfig()?.sortable, true);
  }

  protected copyFields(
    origin: ListableFormFieldProps<TValue, TForm>,
    includeValue: boolean = true,
  ): this {
    super
      .copyFields(origin, includeValue)
      .withListConfig(origin.listConfig)
      .withOverrideRenderListItem(origin.overrideRenderListItem);

    if (isTrue(origin.showList)) {
      this.useListField();
    }

    return this;
  }
}
