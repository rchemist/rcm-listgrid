import React, { ReactNode } from 'react';
import { EntityForm } from '../config/EntityForm';
import { FilterItem, SearchForm, SearchValue } from '../form/SearchForm';
import { IListConfig } from '../components/fields/abstract';
import { MinMaxLimit, PageResult, SelectOption } from '../form/Type';
import { TreeNodeData } from '../ui';
import { isEmpty } from '../utils';
import { Session } from '../auth/types';
import { generateSlug, isBlank } from '../utils/StringUtil';
import { ValidateResult } from '../validations/Validation';

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'manyToOne'
  | 'email'
  | 'phone'
  | 'time'
  | 'month'
  | 'tag'
  | 'file'
  | 'year'
  | 'checkbox'
  | 'multiselect'
  | 'textarea'
  | 'password'
  | 'image'
  | 'html'
  | 'markdown'
  | 'inlineMap'
  | 'hidden'
  | 'custom'
  | 'xrefMapping'
  | 'xrefPriorityMapping'
  | 'xrefAvailableMapping'
  | 'revision'
  | 'contentAsset';

/**
 * LabelType 에 따라 라벨 표시 방법이 달라진다.
 * string 은 i18n 으로 라벨 처리
 * ReactNode 면 단순 표시
 * false 면 표시하지 않는다.
 */
export type LabelType = string | ReactNode | false;

export type PermissionType = 'ALL' | 'READ' | 'NONE';

/**
 * EntityForm 을 화면에 출력할 때 create 상황인지, update 상황인지에 대한 분기 처리를 위한 값
 */
export type RenderType = 'create' | 'update';

export type ConditionalReactNodeValue = ReactNode | OptionalReactNode | ValuedReactNode;
export type ConditionalStringValue = string | OptionalString | ValuedString;
export type ConditionalBooleanValue = boolean | OptionalBoolean | ValuedBoolean;

export type TooltipType = ConditionalReactNodeValue;
export type HelpTextType = ConditionalReactNodeValue;
export type PlaceHolderType = ConditionalStringValue;
export type HiddenType = ConditionalBooleanValue;
export type ReadOnlyType = ConditionalBooleanValue;
export type RequiredType = ConditionalBooleanValue;

export interface ConditionalValue {
  entityForm?: EntityForm | undefined;
  renderType?: RenderType | undefined;
  value?: FieldValue | undefined;
  session?: Session | undefined; // session 을 가지고 condition value 를 계산하려면 반드시 ViewEntityForm 이나 ViewListGrid 를 생성할 때 useSession() 을 호출해서 session 값이 존재할 때만 EntityForm 을 활성화 해야 한다. useSession() 값의 변화를 EntityForm 이 감지하지 못하기 때문이다.
}

export type ValuedString = (props: ConditionalValue) => Promise<string>;
export type ValuedBoolean = (props: ConditionalValue) => Promise<boolean>;
export type ValuedReactNode = (props: ConditionalValue) => Promise<ReactNode>;

export interface FieldValue<TValue = any> {
  current?: TValue;
  fetched?: TValue;
  default?: TValue;
}

export interface OptionalBoolean {
  onCreate?: boolean;
  onUpdate?: boolean;
}

export interface OptionalReactNode {
  onCreate?: ReactNode;
  onUpdate?: ReactNode;
}

export interface OptionalString {
  onCreate?: string;
  onUpdate?: string;
}

function isOptionalReactNode(condition: any): condition is OptionalReactNode {
  return (
    condition &&
    (typeof condition.onCreate !== 'undefined' || typeof condition.onUpdate !== 'undefined')
  );
}

export async function getConditionalBoolean(
  props: ConditionalValue,
  condition: ConditionalBooleanValue | undefined,
): Promise<boolean> {
  if (!condition) {
    return false;
  }

  if (typeof condition === 'function') {
    return (await condition(props)) ?? false;
  }

  if (typeof condition === 'boolean') {
    return condition;
  }

  const renderTypeValue: RenderType | undefined =
    props.renderType ?? props.entityForm?.getRenderType();
  const result = renderTypeValue
    ? renderTypeValue === 'create'
      ? condition.onCreate
      : condition.onUpdate
    : (condition.onCreate ?? condition.onUpdate);

  return result ?? false;
}

export async function getConditionalString(
  props: ConditionalValue,
  condition: ConditionalStringValue | undefined,
): Promise<string> {
  if (!condition) {
    return '';
  }

  if (typeof condition === 'function') {
    return (await condition(props)) ?? '';
  }

  if (typeof condition === 'string') {
    return condition;
  }

  const renderTypeValue: RenderType | undefined =
    props.renderType ?? props.entityForm?.getRenderType();
  const result =
    renderTypeValue !== undefined
      ? renderTypeValue === 'update'
        ? condition.onUpdate
        : condition.onCreate
      : (condition.onCreate ?? condition.onUpdate);

  return result ?? '';
}

export async function getConditionalReactNode(
  props: ConditionalValue,
  condition: ConditionalReactNodeValue | undefined,
): Promise<ReactNode> {
  if (!condition) {
    return '';
  }

  if (typeof condition === 'function') {
    return (await condition(props)) ?? '';
  }

  // 이 부분이 질문
  // condition 이 ReactNode 타입인걸 어떻게 확인할 수 있어?
  if (
    typeof condition === 'string' ||
    typeof condition === 'number' ||
    React.isValidElement(condition)
  ) {
    return condition;
  }

  if (isOptionalReactNode(condition)) {
    const renderTypeValue: RenderType | undefined =
      props.renderType ?? props.entityForm?.getRenderType();
    const hidden = renderTypeValue
      ? renderTypeValue === 'create'
        ? condition.onCreate
        : condition.onUpdate
      : (condition.onCreate ?? condition.onUpdate);
    return hidden ?? '';
  }

  return null;
}

export type ViewPresetType = 'ALWAYS' | 'ADD_ONLY' | 'MODIFY_ONLY' | 'LIST_ONLY';

export const ViewPresetTypes: SelectOption[] = [
  { value: 'ALWAYS', label: '항상 표시' },
  { value: 'ADD_ONLY', label: '신규 입력만' },
  { value: 'MODIFY_ONLY', label: '수정만 가능' },
];

export function getViewPreset(type: ViewPresetType): ViewPreset {
  if (type === 'ALWAYS') {
    return ALWAYS;
  } else if (type === 'MODIFY_ONLY') {
    return MODIFY_ONLY;
  } else {
    return ADD_ONLY;
  }
}

export type ViewPreset = {
  readonly?: OptionalBoolean | ConditionalBooleanValue;
  hidden?: OptionalBoolean | ConditionalBooleanValue;
};

export const NO_FILTER_SORT_ON_LIST: IListConfig = {
  support: true,
  sortable: false,
  filterable: false,
};

export const ALWAYS: ViewPreset = {
  hidden: {
    onCreate: false,
    onUpdate: false,
  },
};

export const HIDDEN: ViewPreset = {
  hidden: {
    onCreate: true,
    onUpdate: true,
  },
};

export const ADD_ONLY: ViewPreset = {
  readonly: {
    onCreate: false,
    onUpdate: true,
  },
};

export const MODIFY_ONLY: ViewPreset = {
  readonly: {
    onCreate: true,
    onUpdate: false,
  },
  hidden: {
    onCreate: true,
    onUpdate: false,
  },
};

export const VIEW_ONLY: ViewPreset = {
  readonly: {
    onCreate: true,
    onUpdate: true,
  },
  hidden: {
    onCreate: true,
    onUpdate: false,
  },
};

export const LIST_ONLY: ViewPreset = {
  readonly: {
    onCreate: true,
    onUpdate: true,
  },
  hidden: {
    onCreate: true,
    onUpdate: true,
  },
};

export const VIEW_HIDDEN: ViewPreset = {
  readonly: {
    onCreate: false,
    onUpdate: true,
  },
  hidden: {
    onCreate: false,
    onUpdate: true,
  },
};

export type ModifiableType =
  | 'ALWAYS'
  | 'ADD_ONLY'
  | 'MODIFY_ONLY'
  | 'VIEW_ONLY'
  | 'VIEW_HIDDEN'
  | 'HIDDEN';

export const ModifiableTypes: SelectOption[] = [
  { value: 'ALWAYS', label: '항상 표시' },
  { value: 'ADD_ONLY', label: '신규 입력만' },
  { value: 'MODIFY_ONLY', label: '수정만 가능' },
  { value: 'VIEW_ONLY', label: '읽기만 가능' },
  { value: 'VIEW_HIDDEN', label: '읽기만 표시' },
  { value: 'HIDDEN', label: '숨김' },
];

export function getModifiableType(type: ModifiableType): ViewPreset {
  if (type === 'ALWAYS') {
    return ALWAYS;
  } else if (type === 'ADD_ONLY') {
    return ADD_ONLY;
  } else if (type === 'MODIFY_ONLY') {
    return MODIFY_ONLY;
  } else if (type === 'VIEW_ONLY') {
    return VIEW_ONLY;
  } else if (type === 'VIEW_HIDDEN') {
    return VIEW_HIDDEN;
  } else if (type === 'HIDDEN') {
    return HIDDEN;
  } else {
    return ALWAYS;
  }
}

export const HAS_VALUE_READONLY: ViewPreset = {
  readonly: (props: ConditionalValue) => {
    return props.value?.current || props.value?.fetched
      ? Promise.resolve(true)
      : Promise.resolve(false);
  },
};

export const HAS_VALUE_HIDDEN: ViewPreset = {
  hidden: (props: ConditionalValue) => {
    return props.value?.current || props.value?.fetched
      ? Promise.resolve(true)
      : Promise.resolve(false);
  },
};

export interface ManyToOneConfig {
  entityForm: EntityForm;
  tree?: ManyToOneTreeView;
  field?: { id?: string; name?: string | ((value: any) => string) };
  filter?: ManyToOneFilter[];
  filterable?: boolean;
  displayFunc?: (value: any) => Promise<string>;
  fetch?: (value: any) => Promise<any>; // 필드값이 id 로s 들어 왔을 때 이 id 를 가지고 entity 로 바꿔주는 구문을 override 할 수 있다.
  modifiable?: boolean | { roles: string[] }; // 수정 가능 여부: 이 값을 명시적으로 true 로 설정해야만 ManyToOneField 를 호출하는 쪽에서 해당 정보를 수정할 수 있게 한다. 또는 roles 로 넘어 온 경우에는 EntityForm 의 session 을 확인해 roles 에 지정된 role 중 하나라도 있는 경우에 이 값이 true 로 설정된다.
  hideAdvancedSearch?: boolean; // ManyToOneField 팝업에서 통합 검색 버튼을 숨길지 여부
}

export type ManyToOneFilter = (entityForm: EntityForm) => Promise<FilterItem[]>;

/**
 * 자기 자신을 ManyToOneField 로 가지고 있는 경우 (location.parentLocation 과 같이)
 * manyToOne 을 lookup 할 때 자기 자신을 제외하는 필터
 */
export function excludeSelfOnManyToOneLookup(): ManyToOneFilter {
  return (entityForm: EntityForm) => {
    // 업데이트일 때 자기 자신은 대상에서 제외한다.
    const id = entityForm.getId()!;
    return Promise.resolve([
      // 여기서는 NOT_IN 으로 해야 한다. Backend 서버의 LocationController#search 메소드에서 id 에 대한 NOT_EQUALS 를 자동으로 parent Id 를 전부 제외하는 쿼리로 변경하기 때문이다.
      { name: 'id', queryConditionType: 'NOT_IN', values: [id] },
    ]);
  };
}

export function excludeIdListOnManyToOneLookUp(idList?: string[]): ManyToOneFilter {
  return async (entityForm: EntityForm) => {
    if (isEmpty(idList)) {
      return [{ name: '__blank__', queryConditionType: 'NULL' }];
    }
    return [{ name: 'id', queryConditionType: 'NOT_IN', values: idList }];
  };
}

export interface ManyToOneTreeView {
  icon?: ReactNode | ReactNode[];
  exceptId?: string;
  rootSelectable?: boolean;
  leafSelectable?: boolean;
  fetch?: {
    url: string; // URL 을 입력하면 API 를 호출해 데이터를 가져온다.
    method?: 'GET' | 'POST';
    convert?: (item: any) => TreeNodeData[];
    requestBody?: any;
  };
  treeData?: TreeNodeData[]; // 데이터를 미리 지정하면 api fetch 를 하지 않고 집어 넣은 데이터를 이용해 트리를 표시한다.
  onSelectConvert?: (data: TreeNodeData) => any;
}

/**
 * many to one 필드에 대해 필터를 적용할 때, ManyToOne 필드의 fieldValue 를 그대로 searchForm 에 넣으면 안 되는 문제가 있다. 보통 ManyToOne 필드의 FieldValue 는 id 만 있지 않기 때문이다.
 * 이럴 때 FieldValue 를 꺼내서 parent의 SearchForm에 맞게 변형해 주고, 필터가 해제되면 다시 해당 필드를 제거하는 처리가 필요하다.
 */
export interface ParentSearchWith {
  append?: (name: string, value: any, entityForm?: EntityForm) => Promise<SearchValue>;
  clear?: string[]; // ManyToOne 필드에 대한 필터가 해제되면 SearchForm 에서 어떤 필터를 제거할 것인지.
}

export interface IAssetConfig {
  maxSize?: number | undefined; // 개별 파일의 크기 제한이 있는지 mb 단위, 아무 것도 설정하지 않으면 기본값은 10mb
  maxCount?: number | undefined; // 한번에 몇개의 파일을 업로드할 수 있는지, 아무것도 설정하지 않으면 기본값은 1개
  extensions?: string[] | undefined; // 허용되는 확장자, 지정하지 않으면 모두 허용
  fileTypes?: string[] | undefined; // 허용되는 파일 타입 - ['image/*'], ...
}

export class AssetConfig implements IAssetConfig {
  maxSize?: number | undefined; // 개별 파일의 크기 제한이 있는지 mb 단위
  maxCount?: number | undefined; // 한번에 몇개의 파일을 업로드할 수 있는지
  extensions?: string[] | undefined; // 허용되는 확장자, 지정하지 않으면 모두 허용

  public static create(maxSize?: number, maxCount?: number, ...extensions: string[]): AssetConfig {
    return new AssetConfig()
      .withMaxSize(maxSize ?? 10)
      .withMaxCount(maxCount ?? 1)
      .withExtensions(...extensions);
  }

  withMaxSize(maxSize?: number): AssetConfig {
    this.maxSize = maxSize;
    return this;
  }

  withMaxCount(maxCount?: number): AssetConfig {
    this.maxCount = maxCount;
    return this;
  }

  withExtensions(...extensions: string[]) {
    this.extensions = extensions;
    return this;
  }
}

export interface ComboProps {
  direction?: 'column' | 'row';
  columns?: number;
}

export type MapKey = { key: string; label?: string; required?: boolean };

export type InlineMapConfig = {
  keys?: MapKey[]; // 허용되는 key 만 따로 입력한다.
  limit?: MinMaxLimit; // 최소 X개, 최대 Y개 입력 제한
  resultType?: 'KeyValue' | 'Map'; // Backend 와 연동하기 위해 Map 을 사용할지, KeyValue[] 를 사용할지
  label?: { key?: string; value?: string };
};

export type ModifyEntityFormFunc<T extends object = any> = (
  entityForm: EntityForm<T>,
  name?: string,
) => Promise<EntityForm<T>>;
export type ModifyFetchedEntityFormFunc<T extends object = any> = (
  entityForm: EntityForm<T>,
  response?: any,
) => Promise<EntityForm<T>>;
export type OnInitializeFunc<T extends object = any> = (
  entityForm: EntityForm<T>,
  session?: Session,
) => Promise<EntityForm<T>>;

export type TabInfo = {
  id: string;
  label: string;
  order: number;
  hidden?: boolean | undefined; // Status 탭과 같이 일반적인 형태로 표시되지 않는 탭은 hidden 을 true 로 처리한다.
  description?: string | React.ReactNode | undefined;
  requiredPermissions?: string[] | undefined; // 이 탭을 보기 위해 필요한 권한 목록. 사용자가 이 중 하나라도 가지고 있으면 탭이 표시됨.
};

export type FieldGroupConfig = {
  open?: boolean;
};

export type FieldGroupInfo = {
  id: string;
  label: string;
  order: number;
  description?: string | undefined;
  config?: FieldGroupConfig | undefined;
  requiredPermissions?: string[] | undefined; // 이 필드그룹을 보기 위해 필요한 권한 목록. 사용자가 이 중 하나라도 가지고 있으면 필드그룹이 표시됨.
};

export const DEFAULT_TAB_INFO: TabInfo = {
  id: 'default',
  label: '기본 정보',
  order: 1,
};

export const DEFAULT_FIELD_GROUP_INFO: FieldGroupInfo = {
  id: 'default',
  label: '기본 정보',
  order: 1,
};

export const STATUS_TAB_INFO: TabInfo = {
  id: 'status',
  label: '상태 정보',
  order: 1000000,
  hidden: false,
};

export interface InputProps extends AbstractInputProps {
  value?: any;
  onChange: (value: any, propagation?: boolean) => void;
}

export interface InputRendererProps extends InputProps {
  onError?: (message: string) => void;
  clearError?: () => void;
  regex?: { pattern: RegExp; message: string };
}

export interface AbstractInputProps {
  name: string;
  label?: LabelType; // if label is undefined, use name instead.
  errors?: string[];
  required?: boolean;
  readonly?: boolean;
  placeHolder?: string;
  attributes?: Map<string, unknown>;
  subCollectionEntity?: boolean;
}

export interface EntityFormActionResult {
  entityForm: EntityForm;
  actionType?: RenderType;
  errors?: string[];
  redirectUrl?: string; // 특정 url 로 redirect 해야 하는 경우
  refreshOrList?: boolean; // 화면을 리프레시 하거나, parent 창을 refresh 해야 하는 경우
  messages?: string[]; // 알림 메시지 목록
  modifiedFields?: string[];
}

export type EntityButtonLinkProps = {
  onClickList?: () => Promise<void>; // 리스트를 클릭했을 때
  onSave?: EntityButtonResultProps; // 저장 버튼을 클릭해 성공 / 실패 케이스 오버라이드
  onDelete?: EntityButtonResultProps; // 삭제 버튼을 클릭해 성공 / 실패 케이스 오버라이드
};

interface EntityButtonResultProps {
  success?: (result: EntityFormActionResult) => void;
  failed?: (result: EntityFormActionResult) => void;
}

export interface CreateStep {
  id: string;
  label: string;
  order: number;
  hidden?: boolean;
  description?: string;
  fields: string[];
}

export interface ManageEntityForm {
  create: boolean;
  update: boolean;
  delete: boolean;
}

export const MANAGE_ENTITY_ALL: ManageEntityForm = Object.freeze({
  create: true,
  update: true,
  delete: true,
});

export const MANAGE_ENTITY_CREATE: ManageEntityForm = {
  create: true,
  update: false,
  delete: false,
};

export const MANAGE_ENTITY_UPDATE: ManageEntityForm = {
  create: false,
  update: true,
  delete: false,
};

export const MANAGE_ENTITY_NOT_DELETE: ManageEntityForm = {
  create: true,
  update: true,
  delete: false,
};

export async function onChangeNameToSlug(
  entityForm: EntityForm,
  fieldName: string,
  targetFieldName: string,
) {
  if (entityForm.getRenderType() === 'create') {
    const nameValue = await entityForm.getValue(fieldName);
    const generatedSlug = generateSlug(nameValue);
    entityForm = entityForm.setValue(targetFieldName, generatedSlug).withShouldReload(true);
  }
  return entityForm;
}

export interface CheckButtonValidationFieldProps {
  url: string;
  fieldName: string;
  label: string;
  parent?: {
    fieldName: string;
    value?: string; // value 가 없으면 부모 엔티티의 id 를 사용한다.
  };
}

export function checkDuplicateValueProcess({
  url,
  fieldName,
  label,
  ...props
}: CheckButtonValidationFieldProps) {
  return async (entityForm: EntityForm, value: any) => {
    const searchForm = SearchForm.create().handleAndFilter(fieldName, value);

    if (props.parent) {
      searchForm.handleAndFilter(props.parent.fieldName, props.parent.value ?? entityForm.parentId);
    }

    if (!isBlank(entityForm.id)) {
      searchForm.handleAndFilter('id', entityForm.id, 'NOT_EQUAL');
    }

    const pageResult = await PageResult.fetchListData(url, searchForm);

    if ((pageResult?.totalCount ?? 0) > 0) {
      return ValidateResult.fail(
        `중복된 ${label} - '${value}' 가 존재합니다. 이 값은 중복될 수 없습니다.`,
      );
    } else {
      return ValidateResult.success();
    }
  };
}
