import {
  ADD_ONLY,
  ConditionalValue,
  DEFAULT_FIELD_GROUP_INFO,
  DEFAULT_TAB_INFO,
  FieldType,
  FieldValue,
  getConditionalBoolean,
  getConditionalReactNode,
  getConditionalString,
  HelpTextType,
  HiddenType,
  LabelType,
  LIST_ONLY,
  MODIFY_ONLY,
  PlaceHolderType,
  ReadOnlyType,
  RenderType,
  RequiredType,
  TooltipType,
  VIEW_HIDDEN,
  ViewPreset,
} from '../../../config/Config';
import { ValidateResult, Validation } from '../../../validations/Validation';
import { EntityForm } from '../../../config/EntityForm';
import React, { ReactNode } from 'react';
import {
  EntityField,
  FieldInfoParameters,
  FieldRenderParameters,
} from '../../../config/EntityField';
import { isEqualCollection, isEquals } from '../../../misc';
import { isTrue } from '../../../utils/BooleanUtil';
import { addKoreanWordPostfix } from '../../../utils/StringUtil';
import { Session } from '../../../auth/types';

/**
 * Card View 아이콘 타입
 * Tabler Icons 등의 아이콘 컴포넌트를 지원
 */
export type CardIconType = React.ComponentType<{ className?: string; stroke?: number }>;

/**
 * FieldInfoParameters → ConditionalValue 변환.
 * exactOptionalPropertyTypes 아래에서 undefined 필드는 생략해야 해서 필요.
 */
function toConditionalValue<TForm extends object = any>(
  props: FieldInfoParameters<TForm>,
): ConditionalValue {
  const result: ConditionalValue = {};
  if (props.entityForm !== undefined) result.entityForm = props.entityForm;
  if (props.renderType !== undefined) result.renderType = props.renderType;
  if (props.session !== undefined) result.session = props.session;
  return result;
}

/**
 * View 모드 렌더링을 위한 파라미터
 * CardSubCollectionField 등에서 필드 값을 View 모드로 표시할 때 사용
 *
 * TForm 은 item 타입 (entity row) 으로, FormField<TSelf, TValue, TForm>
 * 의 TForm 과 동일 의미. default `any` 로 소비자 무수정 호환.
 */
export interface ViewRenderProps<TForm extends object = any> {
  /** 아이템 데이터 (필드 값을 포함한 객체) */
  item: TForm;
  /** 엔티티 폼 인스턴스 (옵션) */
  entityForm?: EntityForm<TForm>;
  /**
   * Compact 모드 - 아이콘 없이 깔끔한 텍스트만 표시
   * CardSubCollectionField 등에서 여러 필드를 나열할 때 사용
   */
  compact?: boolean;
}

/**
 * View 모드 렌더링 결과
 */
export interface ViewRenderResult {
  /** 렌더링된 React 노드 */
  result: React.ReactNode | null;
}

/**
 * 필드 레이아웃 타입
 * - 'auto': 필드 타입에 따라 자동 결정 (기본값)
 * - 'full': 항상 전체 너비 (2열 모드에서도 한 줄 전체 사용)
 * - 'half': 항상 절반 너비 (2열 모드에서 한 칸만 차지)
 */
export type FieldLayoutType = 'auto' | 'full' | 'half';

/**
 * 전체 너비(full)를 기본으로 사용하는 필드 타입 목록
 * 이 타입들은 UI 크기가 커서 2열 레이아웃에서 한 줄 전체를 차지하는 것이 적합함
 */
export const FULL_WIDTH_FIELD_TYPES: FieldType[] = [
  'textarea',
  'html',
  'markdown',
  'file',
  'image',
  'custom',
  'tag',
  'multiselect',
  'contentAsset',
  'xrefMapping',
  'xrefPriorityMapping',
  'xrefAvailableMapping',
  'revision',
];

export interface FormFieldProps<TValue = any, TForm extends object = any> {
  value?: FieldValue<TValue>; // 필드값

  // type 은 각 필드에서 알아서 설정된다. Props 로 넘기는 방식이 아니다.
  // type: FieldType;

  placeHolder?: PlaceHolderType; // placeHolder, string 으로 지정된 경우에는 그냥 신규/수정 모두 동일한 메시지가 표시되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  required?: RequiredType; // 필수값 여부, 이 값이 boolean 으로 지정된 경우에는 신규/수정 모두 동일하게 처리되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  validations?: Validation[];

  /**
   * display value 를 변조할 수 있다.
   * @param field
   * @param renderType
   */
  displayFunc?: (
    entityForm: EntityForm<TForm>,
    field: EntityField,
    renderType?: RenderType,
  ) => Promise<TValue>;
  overrideRender?: (
    params: FieldRenderParameters<TForm, TValue>,
  ) => Promise<ReactNode | null | undefined>;
  order: number; // 필드 표시 순서, 필요하다면 list 의 필드 순서를 별도로 지정할 수 있다.
  name: string; // 필드 이름 - 시스템에서 사용하는 이름으로, 하나의 엔티티 폼에서 필드는 반드시 유니크 해야 한다. equlas 비교를 해야 하기 때문에 가급적 영문/숫자를 이용한다.
  label?: LabelType; // 화면에 표시되는 필드의 label. i18n 을 자동 지원한다.
  tooltip?: TooltipType; // tooltip, string 으로 지정된 경우에는 그냥 신규/수정 모두 동일한 메시지가 표시되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  helpText?: HelpTextType; // helpText, string 으로 지정된 경우에는 그냥 신규/수정 모두 동일한 메시지가 표시되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  hidden?: HiddenType; // 필드 표시 여부, boolean 으로 지정된 경우에는 그냥 신규/수정 모두 동일하게 처리되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  readonly?: ReadOnlyType; // 수정 불가 여부, boolean 으로 지정된 경우에는 그냥 신규/수정 모두 동일하게 처리되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  attributes?: Map<string, unknown>; // 필드의 attributes
  hideLabel?: boolean; // 필드 렌더러에서 필드의 라벨을 표시할지 여부
  requiredPermissions?: string[]; // 이 필드를 보기 위해 필요한 권한 목록. 사용자가 이 중 하나라도 가지고 있으면 필드가 표시됨.
  layout?: FieldLayoutType; // 필드 레이아웃 타입 (auto: 자동, full: 전체 너비, half: 절반 너비)
  lineBreak?: boolean; // 이 필드 뒤에서 줄바꿈 (다음 필드가 새 줄에서 시작)
  cardIcon?: CardIconType; // Card View 모드에서 표시할 커스텀 아이콘

  viewPreset?: ViewPreset; // view preset 을 설정하면 readonly, hidden 을 한번에 설정할 수 있다. 이 값은 맨 마지막에 설정된다.

  // // tab, fieldGroup 의 ID, 이 값은 EntityForm 이 initialize 될 때 자동으로 처리된다. 외부에서 입력할 필요가 없는 값이다.
  form?: { tabId: string; fieldGroupId: string };

  saveValue?: (
    entityForm: EntityForm<TForm>,
    field: EntityField,
    renderType?: RenderType,
  ) => Promise<TValue>;
  maskedValueFunc?: (entityForm: EntityForm<TForm>, value: TValue) => Promise<string>;
  exceptOnSave?: boolean;
}

export abstract class FormField<
  TSelf extends FormField<TSelf, TValue, TForm>,
  TValue = any,
  TForm extends object = any,
> implements EntityField {
  order: number;
  name: string;
  type: FieldType;
  exceptOnSave?: boolean;

  constructor(name: string, order: number, type: FieldType) {
    this.name = name;
    this.order = order;
    this.type = type;
  }

  value?: FieldValue<TValue>;
  tooltip?: TooltipType;
  helpText?: HelpTextType;
  placeHolder?: PlaceHolderType;
  hidden?: HiddenType;
  label: LabelType;
  readonly?: ReadOnlyType;
  required?: RequiredType;
  hideLabel?: boolean;
  attributes?: Map<string, unknown>;
  requiredPermissions?: string[];
  cardIcon?: CardIconType;
  layout?: FieldLayoutType;
  lineBreak?: boolean;

  form?: { tabId: string; fieldGroupId: string };

  validations?: Validation[];
  overrideRender?: (
    params: FieldRenderParameters<TForm, TValue>,
  ) => Promise<React.ReactNode | null | undefined>;
  saveValue?: (
    entityForm: EntityForm<TForm>,
    field: EntityField,
    renderType?: RenderType,
  ) => Promise<TValue>;
  displayFunc?: (
    entityForm: EntityForm<TForm>,
    field: EntityField,
    renderType?: RenderType,
  ) => Promise<TValue>;
  maskedValueFunc?: (entityForm: EntityForm<TForm>, value: TValue) => Promise<string>;

  /**
   * 새로운 필드 인스턴스를 생성하는 추상 메소드
   * 각 구체 클래스에서 자신의 타입으로 구현해야 함
   */
  protected abstract createInstance(name: string, order: number): TSelf;

  /**
   * 각 필드의 핵심 렌더링 로직을 구현하는 추상 메소드
   * 기존 render() 메소드의 핵심 부분만 구현
   */
  protected abstract renderInstance(
    params: FieldRenderParameters<TForm, TValue>,
  ): Promise<React.ReactNode | null>;

  /**
   * View 모드에서 필드 값을 렌더링하는 메소드
   * 기본 구현은 단순 문자열 변환. 각 필드에서 오버라이드하여 적절한 포맷 적용.
   * 예: NumberField는 formatPrice(), SelectField는 Badge 컴포넌트 사용
   *
   * @param props View 렌더링에 필요한 파라미터
   * @returns 렌더링 결과
   */
  protected async renderViewInstance(props: ViewRenderProps<TForm>): Promise<ViewRenderResult> {
    const value = (props.item as Record<string, unknown>)[this.name];
    const compact = props.compact;

    // null, undefined, 빈 문자열 처리
    if (value === null || value === undefined || value === '') {
      return { result: null };
    }

    // boolean 처리
    if (typeof value === 'boolean') {
      return { result: value ? '예' : '아니오' };
    }

    // Date 처리
    if (value instanceof Date) {
      return { result: value.toLocaleDateString() };
    }

    // 객체 처리 (name, title, label 순서로 표시)
    if (typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as { name?: unknown; title?: unknown; label?: unknown };
      if (obj.name) return this.wrapWithCardIcon(String(obj.name), compact);
      if (obj.title) return this.wrapWithCardIcon(String(obj.title), compact);
      if (obj.label) return this.wrapWithCardIcon(String(obj.label), compact);
      return { result: JSON.stringify(value) };
    }

    // 배열 처리
    if (Array.isArray(value)) {
      if (value.length === 0) return { result: null };
      return this.wrapWithCardIcon(value.join(', '), compact);
    }

    // 기본: 문자열 변환
    return this.wrapWithCardIcon(String(value), compact);
  }

  /**
   * cardIcon이 설정된 경우 값을 아이콘과 함께 감싸서 반환
   * compact 모드이거나 아이콘이 없으면 텍스트만 반환
   *
   * @param text 표시할 텍스트
   * @param compact true이면 아이콘 없이 텍스트만 반환
   */
  protected wrapWithCardIcon(text: string, compact?: boolean): ViewRenderResult {
    // compact 모드에서는 항상 텍스트만 반환
    if (compact) {
      return { result: text };
    }

    if (this.cardIcon) {
      const IconComponent = this.cardIcon;
      return {
        result: (
          <span className="rcm-bool-wrap">
            <IconComponent className="rcm-icon" data-size="sm" data-tone="muted" stroke={1.75} />
            <span>{text}</span>
          </span>
        ),
      };
    }
    return { result: text };
  }

  /**
   * View 모드에서 필드 값을 렌더링하는 공개 메소드
   * CardSubCollectionField 등에서 호출하여 사용
   *
   * @param props View 렌더링에 필요한 파라미터
   * @returns 렌더링 결과
   */
  public async viewValue(props: ViewRenderProps<TForm>): Promise<ViewRenderResult> {
    return this.renderViewInstance(props);
  }

  /**
   * 공통 clone 로직 - 모든 필드에서 사용
   * StateTracker 로직 포함
   */
  clone(includeValue?: boolean): TSelf {
    const fieldTypeName = this.constructor.name;

    const cloned = this.createInstance(this.name, this.order).copyFields(this, includeValue);

    return cloned;
  }

  protected copyFields(origin: FormFieldProps<TValue, TForm>, includeValue: boolean = true): this {
    if (includeValue) {
      this.value = { ...origin.value };
    }
    if (origin.form !== undefined) this.form = origin.form;
    if (origin.tooltip !== undefined) this.tooltip = origin.tooltip;
    if (origin.helpText !== undefined) this.helpText = origin.helpText;
    if (origin.placeHolder !== undefined) this.placeHolder = origin.placeHolder;
    if (origin.hidden !== undefined) this.hidden = origin.hidden;
    if (origin.label !== undefined) this.label = origin.label;
    if (origin.readonly !== undefined) this.readonly = origin.readonly;
    if (origin.required !== undefined) this.required = origin.required;
    this.validations = origin.validations ? [...origin.validations] : [];
    if (origin.attributes !== undefined) this.attributes = origin.attributes;
    if (origin.overrideRender !== undefined) this.overrideRender = origin.overrideRender;
    if (origin.displayFunc !== undefined) this.displayFunc = origin.displayFunc;
    if (origin.saveValue !== undefined) this.saveValue = origin.saveValue;
    if (origin.maskedValueFunc !== undefined) this.maskedValueFunc = origin.maskedValueFunc;
    if (origin.hideLabel !== undefined) this.hideLabel = origin.hideLabel;
    if (origin.exceptOnSave !== undefined) this.exceptOnSave = origin.exceptOnSave;
    if (origin.requiredPermissions !== undefined) {
      this.requiredPermissions = [...origin.requiredPermissions];
    } else {
      delete this.requiredPermissions;
    }
    if (origin.cardIcon !== undefined) this.cardIcon = origin.cardIcon;
    if (origin.layout !== undefined) this.layout = origin.layout;
    if (origin.lineBreak !== undefined) this.lineBreak = origin.lineBreak;
    if (origin.viewPreset !== undefined) {
      this.withViewPreset(origin.viewPreset);
    }

    return this;
  }

  getTabId(): string {
    return this.form?.tabId ?? DEFAULT_TAB_INFO.id;
  }

  getFieldGroupId(): string {
    return this.form?.fieldGroupId ?? DEFAULT_FIELD_GROUP_INFO.id;
  }

  withTabId(tabId: string): this {
    if (this.form) {
      this.form.tabId = tabId;
    } else {
      this.form = { tabId: tabId, fieldGroupId: DEFAULT_FIELD_GROUP_INFO.id };
    }
    return this;
  }

  withFieldGroupId(fieldGroupId: string): this {
    if (this.form) {
      this.form.fieldGroupId = fieldGroupId;
    } else {
      this.form = { tabId: DEFAULT_TAB_INFO.id, fieldGroupId };
    }
    return this;
  }

  async getDisplayValue(entityForm: EntityForm<TForm>, renderType?: RenderType): Promise<any> {
    if (this.displayFunc) {
      return this.displayFunc(entityForm, this, renderType);
    }

    const value: any = await this.getCurrentValue(renderType);

    // ManyToOneField의 경우 빈 객체를 undefined로 변환하여 반환
    if (this.type === 'manyToOne' && value && typeof value === 'object') {
      // id 필드명 추출 (기본값: 'id')
      const idField = (this as any).config?.field?.id ?? 'id';

      // id 필드가 비어있으면 undefined 반환
      if (value[idField] === undefined || value[idField] === null || value[idField] === '') {
        return undefined;
      }
    }

    return value;
  }

  withDisplayFunc(
    fn: (
      entityForm: EntityForm<TForm>,
      field: EntityField,
      renderType?: RenderType,
    ) => Promise<TValue>,
  ): this {
    this.displayFunc = fn;
    return this;
  }

  /**
   * Set a masking function for readonly display.
   * When the field is readonly and has a value, the maskedValueFunc is called
   * to produce a masked display string. The original value is never modified.
   */
  withMaskedValue(fn: (entityForm: EntityForm<TForm>, value: TValue) => Promise<string>): this {
    this.maskedValueFunc = fn;
    return this;
  }

  withAddOnly(): this {
    return this.withViewPreset(ADD_ONLY);
  }

  withModifyOnly(): this {
    return this.withViewPreset(MODIFY_ONLY);
  }

  withViewHidden(): this {
    return this.withViewPreset(VIEW_HIDDEN);
  }

  withListOnly(): this {
    return this.withViewPreset(LIST_ONLY);
  }

  withViewPreset(type?: ViewPreset): this {
    if (type) {
      if (type.hidden !== undefined) this.hidden = type.hidden;
      if (type.readonly !== undefined) this.readonly = type.readonly;
    }
    return this;
  }

  withHideLabel(hideLabel?: boolean): this {
    this.hideLabel = isTrue(hideLabel);
    return this;
  }

  /**
   * Card View 모드에서 표시할 커스텀 아이콘을 설정합니다.
   * Tabler Icons 등의 아이콘 컴포넌트를 전달할 수 있습니다.
   *
   * @example
   * ```typescript
   * import { IconUser, IconMail } from '@tabler/icons-react';
   *
   * TextField.create({ name: 'email', order: 1 })
   *   .withCardIcon(IconMail)
   *   .withLabel('이메일');
   * ```
   */
  withCardIcon(icon?: CardIconType): this {
    if (icon !== undefined) this.cardIcon = icon;
    else delete this.cardIcon;
    return this;
  }

  withLayout(layout: FieldLayoutType): this {
    this.layout = layout;
    return this;
  }

  withLineBreak(lineBreak?: boolean): this {
    this.lineBreak = lineBreak ?? true;
    return this;
  }

  async view(
    params: FieldRenderParameters<TForm, TValue>,
  ): Promise<React.ReactNode | null | undefined> {
    if (this.overrideRender) {
      const result = await this.overrideRender(params);

      if (result !== undefined) {
        return result;
      }
    }
    return this.render(params);
  }

  /**
   * 공통 render 로직 - 모든 필드에서 사용
   * StateTracker, Performance tracking, Error handling 포함
   */
  public render(
    params: FieldRenderParameters<TForm, TValue>,
  ): Promise<React.ReactNode | null | undefined> {
    const fieldTypeName = this.constructor.name;

    return (async () => {
      // 필드별 핵심 렌더링 로직 호출
      const result = await this.renderInstance(params);

      return result;
    })();
  }

  /**
   * 이 필드를 View 화면에서 렌더링하는 로직을 override 할 수 있습니다.
   * @param fn
   */
  withOverrideRender(
    fn: (
      params: FieldRenderParameters<TForm, TValue>,
    ) => Promise<React.ReactNode | null | undefined>,
  ): this {
    this.overrideRender = fn;
    return this;
  }

  withOrder(order: number): this {
    this.order = order;
    return this;
  }

  async isBlank(renderType: RenderType = 'create'): Promise<boolean> {
    const value = await this.getCurrentValue(renderType);

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return value === undefined || value === null || value === '';
  }

  // field 값이 변경되었는지 여부에 대한 판단
  isDirty(): boolean {
    if (this.value) {
      // fetched와 current가 모두 undefined면 아직 설정되지 않은 필드 → dirty 아님
      // (백엔드가 해당 필드를 응답에 포함하지 않은 경우)
      if (this.value.fetched === undefined && this.value.current === undefined) {
        return false;
      }

      // Create 모드: fetched가 undefined인 경우 current와 default 비교
      if (this.value.fetched === undefined && this.value.current !== undefined) {
        const normalizedCurrent = this.normalizeEmptyValue(this.value.current);
        const normalizedDefault = this.normalizeEmptyValue(this.value.default);

        // 빈값으로 정규화된 경우와 default가 같으면 dirty 아님
        if (normalizedCurrent === undefined && normalizedDefault === undefined) {
          return false;
        }
        if (normalizedCurrent === normalizedDefault) {
          return false;
        }
        if (Array.isArray(normalizedCurrent) && Array.isArray(normalizedDefault)) {
          return !isEqualCollection(normalizedCurrent, normalizedDefault, true);
        }
        if (
          typeof normalizedCurrent === 'object' &&
          normalizedCurrent !== null &&
          typeof normalizedDefault === 'object' &&
          normalizedDefault !== null
        ) {
          return !isEquals(normalizedCurrent, normalizedDefault);
        }
        return true;
      }

      // Update 모드: 기존 로직 유지
      const originalValue =
        this.value.fetched !== undefined ? this.value.fetched : this.value.default;
      const currentValue = this.value.current;

      // 배열인 경우 순서와 관계없이 값이 동일하면 dirty가 아님
      if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
        return !isEqualCollection(originalValue, currentValue, true);
      }

      // 배열이 아닌 경우 기존 비교 로직 사용
      return !isEquals(originalValue, currentValue);
    }
    return false;
  }

  /**
   * 빈값을 undefined로 정규화하는 헬퍼 메서드
   * isDirty() 비교 시 빈 문자열, null, 빈 객체 등을 undefined로 통일
   */
  private normalizeEmptyValue(value: any): any {
    // null, undefined, 빈 문자열은 undefined로 정규화
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    // 빈 객체도 undefined로 처리 (ManyToOneField 등에서 선택 안 한 경우)
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
      return undefined;
    }
    return value;
  }

  withTooltip(tooltip?: TooltipType): this {
    if (tooltip !== undefined) this.tooltip = tooltip;
    else delete this.tooltip;
    return this;
  }

  withHelpText(helpText?: HelpTextType): this {
    if (helpText !== undefined) this.helpText = helpText;
    else delete this.helpText;
    return this;
  }

  withPlaceHolder(placeHolder?: PlaceHolderType): this {
    if (placeHolder !== undefined) this.placeHolder = placeHolder;
    else delete this.placeHolder;
    return this;
  }

  withHidden(hidden?: HiddenType): this {
    if (hidden !== undefined) this.hidden = hidden;
    else delete this.hidden;
    return this;
  }

  withLabel(label?: LabelType): this {
    if (label !== undefined) this.label = label;
    return this;
  }

  withReadOnly(readOnly?: ReadOnlyType): this {
    this.readonly = readOnly === undefined ? true : readOnly;
    return this;
  }

  withRequired(required?: RequiredType): this {
    this.required = required === undefined ? true : required;
    return this;
  }

  withValue(value: TValue | FieldValue<TValue> | any): this {
    if (value !== undefined && value !== null) {
      // value 가 FieldValue 타입인지 확인하고 해당 타입이면 값을 복사해 넣는다.
      // FieldValue는 정확히 current, default, fetched 속성만 가지고 있어야 함
      const isFieldValue =
        typeof value === 'object' &&
        (value.current !== undefined ||
          value.default !== undefined ||
          value.fetched !== undefined) &&
        Object.keys(value).every((key) => ['current', 'default', 'fetched'].includes(key));

      if (isFieldValue) {
        this.value = { ...this.value, ...value };
      } else {
        // value 가 FieldValue 타입이 아니라 그냥 실제 값이라면, current 에만 넣어 준다.
        this.value = { ...this.value, current: value };
      }
    } else {
      this.value = { ...this.value, current: value };
    }

    return this;
  }

  getOrder(): number {
    return this.order;
  }

  getName(): string {
    return this.name;
  }

  getLabel(): LabelType {
    if (this.label) {
      return this.label;
    }
    return this.name;
  }

  withAttributes(attributes: Map<string, unknown>): this {
    this.attributes = attributes;
    return this;
  }

  viewLabel(t: any): ReactNode {
    if (this.label) {
      if (typeof this.label === 'string') {
        return t(this.label) || this.getName();
      } else {
        return this.label;
      }
    }
    return this.getName();
  }

  async getTooltip(props: FieldInfoParameters<TForm>): Promise<ReactNode> {
    return await getConditionalReactNode(toConditionalValue(props), this.tooltip);
  }

  async getHelpText(props: FieldInfoParameters<TForm>): Promise<ReactNode> {
    return await getConditionalReactNode(toConditionalValue(props), this.helpText);
  }

  async getPlaceHolder(props: FieldInfoParameters<TForm>): Promise<string> {
    return await getConditionalString(toConditionalValue(props), this.placeHolder);
  }

  async isRequired(props: FieldInfoParameters<TForm>): Promise<boolean> {
    return await getConditionalBoolean(toConditionalValue(props), this.required);
  }

  async isHidden(props: FieldInfoParameters<TForm>): Promise<boolean> {
    return await getConditionalBoolean(toConditionalValue(props), this.hidden);
  }

  async isReadonly(props: FieldInfoParameters<TForm>): Promise<boolean> {
    return await getConditionalBoolean(toConditionalValue(props), this.readonly);
  }

  async getCurrentValue(renderType?: RenderType): Promise<TValue | undefined> {
    const renderTypeValue = renderType ?? 'create';
    if (this.value !== undefined) {
      // current 값이 명시적으로 설정된 경우 (undefined 포함) 해당 값을 반환
      if (this.value.hasOwnProperty('current')) {
        return this.value.current;
      }
      // current 값이 설정되지 않은 경우에만 default/fetched 값을 사용
      return renderTypeValue === 'create' ? this.value?.default : this.value?.fetched;
    }
    return undefined;
  }

  async getSaveValue(
    entityForm: EntityForm<TForm>,
    renderType?: RenderType,
  ): Promise<TValue | undefined> {
    if (this.saveValue) {
      return this.saveValue(entityForm, this, renderType);
    }

    return this.getCurrentValue(renderType);
  }

  async getFetchedValue(): Promise<TValue | undefined> {
    if (this.value !== undefined) {
      return this.value?.fetched;
    }
    return undefined;
  }

  resetValue(renderType?: RenderType) {
    const renderTypeValue = renderType ?? 'create';
    if (this.value) {
      const resetTo = renderTypeValue === 'update' ? this.value.fetched : this.value.default;
      if (resetTo === undefined) {
        delete this.value.current;
      } else {
        this.value.current = resetTo;
      }
    }
  }

  withForm(form: { tabId: string; fieldGroupId: string }): this {
    this.form = form;
    return this;
  }

  withValidations(...validation: (Validation | undefined)[]): this {
    this.validations = validation.filter((v): v is Validation => v !== undefined);
    return this;
  }

  async validate(
    entityForm: EntityForm<TForm>,
    session?: Session,
  ): Promise<ValidateResult | ValidateResult[]> {
    const infoParams: FieldInfoParameters<TForm> =
      session !== undefined ? { entityForm, session } : { entityForm };

    if ((await this.isHidden(infoParams)) || (await this.isReadonly(infoParams))) {
      // hidden 으로 가려지거나 readonly 된 필드에 대해서는 validation 을 하지 않는다.
      return ValidateResult.success();
    }

    // 권한이 없는 필드에 대해서는 validation 을 하지 않는다.
    // session.roles 또는 session.authentication?.roles 에서 사용자 권한을 가져온다.
    const userPermissions = session?.roles ?? session?.authentication?.roles;
    if (!this.isPermitted(userPermissions)) {
      return ValidateResult.success();
    }

    if (await this.isRequired(infoParams)) {
      // 필수값인 경우
      if (await this.isBlank(entityForm.getRenderType())) {
        const fieldLabel: string =
          typeof this.getLabel() === 'string' ? this.getLabel() + '' : this.getName();
        return ValidateResult.fail(addKoreanWordPostfix('1', fieldLabel) + '  필수 값입니다.');
      }
    }

    if (this.validations && this.validations.length > 0) {
      const result: ValidateResult[] = [];

      for (const val of this.validations) {
        const test = await val.validate(entityForm, this.value, val.message);
        if (test.hasError()) {
          // 오류난 것만 체크한다.
          result.push(test);
        }
      }
      if (result.length > 0) {
        return result;
      }
    }

    return ValidateResult.success();
  }

  withDefaultValue(value: TValue | any): this {
    const next: FieldValue<TValue> = { default: value };
    const fetched = this.value?.fetched;
    if (fetched !== undefined) next.fetched = fetched;
    const currentSource = this.value?.current ?? value;
    if (currentSource !== undefined) next.current = currentSource;
    this.value = next;
    return this;
  }

  /**
   * 이 필드를 보기 위해 필요한 권한을 설정합니다.
   * 사용자가 지정된 권한 중 하나라도 가지고 있으면 필드가 표시됩니다.
   */
  withRequiredPermissions(...permissions: string[]): this {
    if (!this.requiredPermissions) {
      this.requiredPermissions = [];
    }
    const uniquePermissions = new Set([...this.requiredPermissions, ...permissions]);
    this.requiredPermissions = Array.from(uniquePermissions);
    return this;
  }

  /**
   * 사용자가 이 필드를 볼 수 있는 권한이 있는지 확인합니다.
   * requiredPermissions가 없거나 비어있으면 true를 반환합니다.
   * 사용자가 requiredPermissions 중 하나라도 가지고 있으면 true를 반환합니다.
   */
  isPermitted(userPermissions?: string[]): boolean {
    if (!this.requiredPermissions || this.requiredPermissions.length === 0) {
      return true;
    }
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    return this.requiredPermissions.some((permission) => userPermissions.includes(permission));
  }
}
