import { EntityItem } from '../config/EntityItem';
import { EntityForm } from '../config/EntityForm';
import {
  ConditionalReactNodeValue,
  DEFAULT_FIELD_GROUP_INFO,
  DEFAULT_TAB_INFO,
  getConditionalBoolean,
  getConditionalReactNode,
  HelpTextType,
  HiddenType,
  LabelType,
  ManyToOneFilter,
  OptionalBoolean,
  ReadOnlyType,
  ViewPreset,
} from '../config/Config';
import { ListGrid } from '../config/ListGrid';
import { isEmpty } from '../utils';
import { AbstractManyToOneField, ListableFormField } from '../components/fields/abstract';
import { ReactNode } from 'react';
import { ViewListGridOptionProps } from '../components/list/types/ViewListGrid.types';
import { FilterItem } from '../form/SearchForm';
import { FieldInfoParameters } from './EntityField';
import { Session } from '../auth/types';
import { ViewListGrid } from '../components/list/ViewListGrid';

export class SubCollectionField implements EntityItem {
  order: number; // 필드 표시 순서, 필요하다면 list 의 필드 순서를 별도로 지정할 수 있다.
  name: string; // 필드 이름 - 시스템에서 사용하는 이름으로, 하나의 엔티티 폼에서 필드는 반드시 유니크 해야 한다. equlas 비교를 해야 하기 때문에 가급적 영문/숫자를 이용한다.
  label?: LabelType | undefined; // 화면에 표시되는 필드의 label. i18n 을 자동 지원한다.
  helpText?: HelpTextType | undefined; // helpText, string 으로 지정된 경우에는 그냥 신규/수정 모두 동일한 메시지가 표시되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  hidden?: HiddenType | undefined; // 필드 표시 여부, boolean 으로 지정된 경우에는 그냥 신규/수정 모두 동일하게 처리되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  readonly?: ReadOnlyType | undefined; // 수정 불가 여부, boolean 으로 지정된 경우에는 그냥 신규/수정 모두 동일하게 처리되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  dynamicUrl?: ((parentEntityForm: EntityForm) => string) | undefined; // sub collection 의 url 이 parent entityForm 의 id 기반으로 생성된다면 이 메소드를 통해 url 을 동적으로 생성할 수 있다.

  // // tab, fieldGroup 의 ID, 이 값은 EntityForm 이 initialize 될 때 자동으로 처리된다. 외부에서 입력할 필요가 없는 값이다.
  form?: { tabId: string; fieldGroupId: string } | undefined;

  entityForm: EntityForm;
  hideLabel?: boolean | undefined;

  relation: SubCollectionRelation;

  // EntityForm 에서 리스트로 지정한 필드 중 subCollection 에서만 따로 목록 조회 필드를 정의하고 싶을 때 사용한다.
  listViewFields?: string[] | undefined;

  viewListOptions?: ViewListGridOptionProps | undefined;

  constructor(props: {
    entityForm: EntityForm;
    relation: SubCollectionRelation;
    order: number;
    name: string;
    label?: LabelType | undefined;
    helpText?: HelpTextType | undefined;
    hidden?: HiddenType | undefined;
    readonly?: ReadOnlyType | undefined;
    dynamicUrl?: ((parentEntityForm: EntityForm) => string) | undefined;
    viewListOptions?: ViewListGridOptionProps | undefined;
  }) {
    this.entityForm = props.entityForm;
    this.relation = props.relation;
    this.order = props.order;
    this.name = props.name;
    this.label = props.label;
    this.helpText = props.helpText;
    this.hidden = props.hidden;
    this.readonly = props.readonly;
    this.viewListOptions = props.viewListOptions;
    this.dynamicUrl = props.dynamicUrl;
  }

  withTooltip(tooltip?: ConditionalReactNodeValue): this {
    console.error('not supported');
    return this;
  }

  clone(): SubCollectionField {
    const collectionField = new SubCollectionField({
      entityForm: this.entityForm,
      relation: this.relation,
      order: this.order,
      name: this.name,
      label: this.label,
      helpText: this.helpText,
      hidden: this.hidden,
      readonly: this.readonly,
      viewListOptions: this.viewListOptions,
      dynamicUrl: this.dynamicUrl,
    });

    collectionField.form = this.form;
    collectionField.listViewFields = this.listViewFields;

    return collectionField;
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

  withHelpText(helpText?: HelpTextType): this {
    this.helpText = helpText;
    return this;
  }

  withHidden(hidden?: boolean | OptionalBoolean): this {
    this.hidden = hidden;
    return this;
  }

  withLabel(label?: LabelType): this {
    this.label = label;
    return this;
  }

  withReadOnly(readOnly?: boolean | OptionalBoolean): this {
    this.readonly = readOnly;
    return this;
  }

  withHideLabel(hideLabel?: boolean): this {
    this.hideLabel = hideLabel;
    return this;
  }

  withOrder(order: number): this {
    this.order = order;
    return this;
  }

  withViewListGridOptionProps(props: ViewListGridOptionProps): this {
    this.viewListOptions = props;
    return this;
  }

  getViewListGridOptionProps(): ViewListGridOptionProps {
    return this.viewListOptions ?? {};
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

  async getHelpText(props: FieldInfoParameters): Promise<ReactNode> {
    return await getConditionalReactNode(props, this.helpText);
  }

  async isHidden(props: FieldInfoParameters): Promise<boolean> {
    return await getConditionalBoolean(props, this.hidden);
  }

  async isReadonly(props: FieldInfoParameters): Promise<boolean> {
    return await getConditionalBoolean(props, this.readonly);
  }

  withForm(form: { tabId: string; fieldGroupId: string }): this {
    this.form = form;
    return this;
  }

  withViewPreset(type: ViewPreset): this {
    this.hidden = type.hidden;
    this.readonly = type.readonly;
    return this;
  }

  withListViewFields(...listViewFields: string[]): this {
    this.listViewFields = listViewFields;
    return this;
  }

  withDynamicUrl(props: (parentEntityForm: EntityForm) => string): this {
    this.dynamicUrl = props;
    return this;
  }

  getListGrid(parentEntityForm: EntityForm): ListGrid {
    const entityForm = this.entityForm.clone(true).withParentId(parentEntityForm.id);
    if (this.listViewFields !== undefined && !isEmpty(this.listViewFields)) {
      entityForm.fields.forEach((field, key) => {
        if (field instanceof ListableFormField) {
          if (this.listViewFields!.includes(field.name)) {
            field.useListField();
          } else {
            delete field.listConfig;
          }
        }
      });
    }

    return new ListGrid(entityForm);
  }

  async render({
    entityForm,
    session,
  }: {
    entityForm: EntityForm;
    session?: Session;
  }): Promise<ReactNode | null> {
    const listGrid = this.getListGrid(entityForm);
    const collectionEntityForm = listGrid.getEntityForm();

    if (this.relation?.subCollectionEntityForm?.manyToOneFilter) {
      collectionEntityForm.fields.forEach((field, key) => {
        if (field instanceof AbstractManyToOneField) {
          if (this.relation.subCollectionEntityForm?.manyToOneFilter?.[key] !== undefined) {
            const filters = this.relation.subCollectionEntityForm.manyToOneFilter[key];
            if (!isEmpty(filters)) {
              field.config.filter = [...(field.config.filter ?? []), ...filters];
            }
          }
        }
      });
    }

    if (this.dynamicUrl !== undefined) {
      const url = this.dynamicUrl(entityForm);
      if (url !== undefined) {
        // url override
        listGrid.getEntityForm().withUrl(url);
      }
    }

    const readonly = await this.isReadonly({ entityForm, session });

    const options = this.getViewListGridOptionProps();

    // 사용자 정의 filters를 저장
    const userFilters = options.filters;

    // mappedBy 필터를 항상 포함하도록 filters를 재정의
    // 서브 콜렉션의 필터에 들어가는 id는 Subcollection 엔티티의 entityForm 의 id 가 아니라 부모의 entityForm 의 id 이다.
    options.filters = async (ef: EntityForm) => {
      const mappedByFilter = this.getMappedByFilter(entityForm);

      if (userFilters) {
        // 사용자 정의 filters가 있으면 실행하고 mappedBy 필터를 첫 번째 조건에 추가
        const additionalFilters = await userFilters(ef);
        if (additionalFilters.length > 0 && additionalFilters[0]!.items) {
          // mappedBy 필터가 이미 있는지 확인하고 없으면 추가
          const hasMappedByFilter = additionalFilters[0]!.items.some(
            (item: FilterItem) => item.name === mappedByFilter.name,
          );
          if (!hasMappedByFilter) {
            additionalFilters[0]!.items.unshift(mappedByFilter);
          }
        }
        return additionalFilters;
      }

      // 기본: mappedBy 필터만 반환
      return [
        {
          condition: 'AND',
          items: [mappedByFilter],
        },
      ];
    };

    if (options.readonly === undefined) {
      options.readonly = readonly;
    }

    const subCollection = {
      ...this.viewListOptions?.subCollection,
      name: this.getName(),
      mappedBy: this.viewListOptions?.subCollection?.mappedBy ?? this.relation.mappedBy,
      mappedValue:
        this.viewListOptions?.subCollection?.mappedValue ?? this.getMappedByValue(entityForm),
    };

    return Promise.resolve(
      <ViewListGrid
        listGrid={listGrid}
        {...(entityForm.id !== undefined ? { parentId: entityForm.id } : {})}
        options={{
          ...options,
          subCollection: subCollection,
        }}
      />,
    );
  }

  protected getMappedByFilter(entityForm: EntityForm): FilterItem {
    const mappedBy = this.relation.mappedBy;
    // mappedBy 가 entityId 일 때 이걸 entity.id 로 변환해야 한다.
    // 연산자 우선순위: ?? 보다 삼항연산자가 먼저 평가되도록 괄호 추가
    const filterBy =
      this.relation.filterBy ??
      (mappedBy.endsWith('Id') ? mappedBy.replace('Id', '') + '.id' : mappedBy);
    const mappedValue: FilterItem = { name: filterBy };

    const mappedByValue = this.getMappedByValue(entityForm);
    if (mappedByValue !== undefined) {
      mappedValue.value = String(mappedByValue);
    }

    return mappedValue;
  }

  protected getMappedByValue(entityForm: EntityForm): string | number | undefined {
    const valueProperty = this.relation.valueProperty ?? 'id';

    if (valueProperty === 'id') {
      return entityForm.id;
    } else {
      const value = entityForm.getValue(valueProperty);
      // 타입 안정성: string 또는 number만 반환
      if (typeof value === 'string' || typeof value === 'number') {
        return value;
      }
      return undefined;
    }
  }
}

interface SubCollectionRelation {
  /**
   * Create/Update Form 전송 시 부모 엔티티 ID를 담을 필드명.
   *
   * [주의] JPA의 @ManyToOne mappedBy와 다른 개념입니다!
   *
   * - 용도: 백엔드 CreateForm/UpdateForm에 전송되는 필드명
   * - 형식: 보통 'parentEntityId' 형태 (예: 'practiceId', 'syllabusId')
   * - 조회 필터 변환: 'xxxId' 형태면 자동으로 'xxx.id'로 변환되어 조회 필터에 사용됨
   *
   * 예시:
   * - mappedBy: 'practiceId' → Create 시 { practiceId: '...' } 전송
   *                          → 조회 시 practice.id 필터로 자동 변환
   */
  mappedBy: string;

  /**
   * 조회 필터에 사용할 필드명 (선택사항).
   *
   * - 용도: 서브 콜렉션 목록 조회 시 부모 ID로 필터링할 필드명
   * - 형식: 보통 'entity.id' 형태 (예: 'practice.id', 'syllabus.id')
   * - 미지정 시: mappedBy가 'xxxId' 형태면 자동으로 'xxx.id'로 변환
   *
   * 명시적 지정이 필요한 경우:
   * - mappedBy와 다른 필드명으로 조회해야 할 때
   * - 자동 변환 규칙이 맞지 않을 때
   */
  filterBy?: string;

  /**
   * 부모 엔티티에서 mappedBy 값으로 사용할 프로퍼티명.
   *
   * - 미지정 시: 부모 entityForm의 'id' 사용
   * - 지정 시: 부모 entityForm에서 해당 프로퍼티 값 사용
   */
  valueProperty?: string;

  /**
   * 서브콜렉션 내부에서 사용할 추가 속성.
   *
   * 예: 서브콜렉션 내 ManyToOneField의 필터에 최상위 엔티티 값이 필요할 때
   * (Syllabus - SyllabusPrivileged 관계에서 admission 필터가 syllabus.id일 때 등)
   */
  attributes?: Record<string, any>;

  subCollectionEntityForm?: {
    manyToOneFilter?: Record<string, ManyToOneFilter[]>;
  };
}
