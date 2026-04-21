import { FieldType, FieldValue, PlaceHolderType, RenderType, RequiredType } from '../config/Config';
import { ReactNode } from 'react';
import { EntityForm } from '../config/EntityForm';
import { ValidateResult, Validation } from '../validations/Validation';
import { QueryConditionType } from '../form/SearchForm';
import { EntityItem } from '../config/EntityItem';
import { Session } from '../auth/types';

export interface EntityField extends EntityItem {
  value?: FieldValue | undefined; // 필드값
  type: FieldType; // 필드가 표시되는 방법. 모든 EntityField 는 render 메소드를 이용해 화면에 표시된다. 따라서 render 가 각 EntityField 의 구현체 별로 있어야 한다.

  placeHolder?: PlaceHolderType; // placeHolder, string 으로 지정된 경우에는 그냥 신규/수정 모두 동일한 메시지가 표시되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  required?: RequiredType; // 필수값 여부, 이 값이 boolean 으로 지정된 경우에는 신규/수정 모두 동일하게 처리되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  validations?: Validation[];
  exceptOnSave?: boolean;
  requiredPermissions?: string[]; // 이 필드를 보기 위해 필요한 권한 목록. 사용자가 이 중 하나라도 가지고 있으면 필드가 표시됨.

  /**
   * ViewField 할 때 사용할 수 있다.
   * 필드를 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
   * 이 정보는 저장 용도로는 사용되지 않는다.
   */
  attributes?: Map<string, unknown>;

  /**
   * CheckButtonValidation의 검증 상태를 저장
   * 탭 전환 시에도 상태를 유지하기 위함
   */
  validationState?: {
    validated: boolean;
    message?: string;
  };

  /**
   * display value 를 변조할 수 있다.
   * @param field
   * @param renderType
   */
  displayFunc?: (
    entityForm: EntityForm,
    field: EntityField,
    renderType?: RenderType,
  ) => Promise<any>;

  /**
   * view 를 오버라이드 해 사용자정의 렌더링을 처리하는 경우 이 값을 설정한다.
   * ReactNode 나 null 을 반환하면 기존 view 를 완전히 대체하게 되고, undefined 를 반환하면 기존 View 를 사용하게 된다.
   * @param params
   */
  overrideRender?: (params: FieldRenderParameters) => Promise<ReactNode | null | undefined>;

  /**
   * EntityForm 을 저장할 때 생성하는 formData 에 제공할 값을 override 할 수 있다.
   * @param field
   * @param renderType
   */
  saveValue?: (entityForm: EntityForm, field: EntityField, renderType?: RenderType) => Promise<any>;

  view(params: FieldRenderParameters): Promise<ReactNode | null>;

  isDirty(): boolean;

  isRequired(props: FieldInfoParameters): Promise<boolean>;

  isBlank(renderType?: RenderType): Promise<boolean>;

  withDisplayFunc(
    fn: (entityForm: EntityForm, field: EntityField, renderType?: RenderType) => Promise<any>,
  ): this;

  withOverrideRender(
    fn: (params: FieldRenderParameters) => Promise<ReactNode | null | undefined>,
  ): this;

  withPlaceHolder(placeHolder?: PlaceHolderType): this;

  withRequired(required?: RequiredType): this;

  withValue(value: any): this;

  getDisplayValue(entityForm: EntityForm, renderType?: RenderType): Promise<any>;

  getPlaceHolder(props: FieldInfoParameters): Promise<string>;

  getSaveValue(entityForm: EntityForm, renderType?: RenderType): Promise<any>;

  getCurrentValue(renderType?: RenderType): Promise<any>;

  resetValue(renderType?: RenderType): void;

  withValidations(...validation: Validation[]): this;

  validate(entityForm: EntityForm, session?: Session): Promise<ValidateResult | ValidateResult[]>;

  withDefaultValue(value: any): this;

  withAttributes(attributes: Map<string, unknown>): this;

  getFetchedValue(): Promise<any>;

  /**
   * 이 필드를 보기 위해 필요한 권한을 설정합니다.
   * 사용자가 지정된 권한 중 하나라도 가지고 있으면 필드가 표시됩니다.
   */
  withRequiredPermissions(...permissions: string[]): this;

  /**
   * 사용자가 이 필드를 볼 수 있는 권한이 있는지 확인합니다.
   * requiredPermissions가 없거나 비어있으면 true를 반환합니다.
   * 사용자가 requiredPermissions 중 하나라도 가지고 있으면 true를 반환합니다.
   */
  isPermitted(userPermissions?: string[]): boolean;

  /**
   * View 모드에서 필드 값을 렌더링합니다.
   * 각 필드 타입별로 적절한 포맷팅을 적용합니다.
   * (예: NumberField는 formatPrice, SelectField는 Badge 등)
   * @param props View 렌더링에 필요한 파라미터
   * @returns 렌더링 결과
   */
  viewValue(props: ViewValueProps): Promise<ViewValueResult>;
}

/**
 * EntityField.viewValue 의 props 타입.
 * FormField.viewValue 가 사용하는 ViewRenderProps 와 구조적으로 동일 —
 * TForm 제네릭화 (default `any`) + `compact?: boolean` 선행 버그 fix
 * (CardFieldSection/CardFieldRenderer 호출부가 이미 compact: true 를
 * 넘기고 있었음. 후속 리팩터링에서 타입 계약 정합성 확보).
 */
export interface ViewValueProps<TForm extends object = any> {
  /** 아이템 데이터 (필드 값을 포함한 객체) */
  item: TForm;
  /** 엔티티 폼 인스턴스 (옵션) */
  entityForm?: EntityForm<TForm>;
  /**
   * Compact 모드 - 아이콘 없이 깔끔한 텍스트만 표시.
   * CardSubCollectionField 등에서 여러 필드를 나열할 때 사용.
   */
  compact?: boolean;
}

export interface ViewValueResult {
  /** 렌더링된 React 노드 */
  result: ReactNode | null;
}

export interface FieldRenderParameters<T extends object = any, TValue = any> {
  entityForm: EntityForm<T>;
  session?: Session;
  /**
   * 필드 값이 변경될 때마다 호출된다.
   * @param value
   * @param propagation 상위로 onChange 를 전파할 지 여부, 기본은 true, textarea 나 HTML 에디터 필드와 같은 경우 글자가 변경될 때 마다 상위 전파를 하면 안 되기 때문에 이 값을 선택적으로 설정하게 한다.
   */
  onChange: (value: TValue, propagation?: boolean) => void;
  onError?: (message: string) => void;
  clearError?: () => void;
  required?: boolean;
  readonly?: boolean;
  placeHolder?: string;
  helpText?: ReactNode;
  subCollectionEntity?: boolean;
  /**
   * EntityForm을 업데이트하고 리렌더링을 트리거하는 메서드
   * @param updater EntityForm을 업데이트하는 함수
   */
  updateEntityForm?: (
    updater: (entityForm: EntityForm<T>) => Promise<EntityForm<T>>,
  ) => Promise<void>;
  /**
   * EntityForm을 리셋하고 초기화 상태로 되돌리는 메서드
   * @param delay 리로드 전 지연 시간 (밀리초)
   * @param preserveState 현재 탭 위치 등의 상태 유지 여부
   */
  resetEntityForm?: (delay?: number, preserveState?: boolean) => Promise<void>;
}

export interface FilterRenderParameters<T extends object = any, TValue = any> {
  entityForm: EntityForm<T>;
  onChange: (value: TValue, op?: QueryConditionType) => void;
  placeHolder?: string;
  helpText?: string;
  value?: Promise<TValue>;
}

export interface FieldInfoParameters<T extends object = any> {
  entityForm?: EntityForm<T> | undefined;
  session?: Session | undefined;
  renderType?: RenderType | undefined;
}
