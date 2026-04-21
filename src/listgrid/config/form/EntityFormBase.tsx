import { defaultString, isBlank, isEmpty, isTrue } from '../../utils';
import { Session } from '../../auth';
import { ResponseData } from '../../api';
import { ReactNode } from 'react';
import { FormField, ListableFormField, OptionalField } from '../../components/fields/abstract';
import { PostFetchListData } from '../../components/list/types/ViewListGrid.types';
import { ClientExtensionConfig, ExtensionPoint } from '../../extensions/EntityFormExtension.types';
import { DataTransferConfig } from '../../transfer/Type';
import {
  CreateStep,
  EntityFormActionResult,
  FieldGroupConfig,
  HelpTextType,
  MANAGE_ENTITY_ALL,
  ManageEntityForm,
  ModifyEntityFormFunc,
  ModifyFetchedEntityFormFunc,
  OnInitializeFunc,
  RenderType,
  TooltipType,
} from '../../config/Config';
import { EntityField } from '../../config/EntityField';
import { EntityForm } from '../../config/EntityForm';
import { EntityFormButtonType } from '../../config/EntityFormButton';
import { AlertMessage, FieldError } from '../../config/EntityFormTypes';
import { EntityTab } from '../../config/EntityTab';
import { SubCollectionField } from '../../config/SubCollectionField';
import { EntityFieldGroup } from '../../config/EntityFieldGroup';
import { SelectOption } from '../../form/Type';

export abstract class EntityFormBase<T extends object = any> {
  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
    this.version = new Date().getTime().toString();
    // 깊은 복사로 할당하여 원본이 변경되지 않도록 함
    this.manageEntityForm = {
      ...MANAGE_ENTITY_ALL,
    };
  }

  version: string;
  revisionEntityName?: string | undefined; // revision 정보를 처리하기 위해 필요한 엔티티 이름 - page 에서 EntityForm 을 생성할 때 이 값을 넣어 주면 된다.
  parentId?: string | undefined; // ManyToOne 이나 SubCollection 등에서 부모 엔티티의 id 를 저장하기 위해 사용한다.
  id?: string | undefined;
  name: string;
  title?:
    | {
        title?: string;
        field?: string;
        view?: (entityForm: EntityForm<T>) => Promise<ReactNode>;
      }
    | undefined;
  // Entity 데이터를 fetch 하는 backend api 의 url
  url: string;
  // 이 값이 존재하면 ManyToOne 매핑에서 해당 URL 로 조회 기능을 제공할 수 있다.
  menuUrl?: string | undefined;
  readonly?: boolean | undefined;

  session?: Session | undefined;

  createStep?: CreateStep[] | undefined;
  manageEntityForm: ManageEntityForm;

  // 필드가 표시될 탭 구성
  tabs: Map<string, EntityTab> = new Map<string, EntityTab>();
  // 필드
  fields: Map<string, EntityField> = new Map<string, EntityField>();
  // 서브콜렉션
  collections: Map<string, SubCollectionField> = new Map<string, SubCollectionField>();

  // 에러 여부
  errors?: FieldError[] | undefined;
  // 화면 새로고침 여부
  // onChanges 와 같은 함수가 실행되어 reload 를 해야 한다면 이 값을 true 로 변경한다. 기본적으로는 undefined 이며, reload 가 끝난 후에는 다시 undefined 로 변경한다.
  shouldReload?: boolean | undefined;

  // setFetchedValues()가 호출되어 데이터가 이미 로드되었는지 여부
  // true이면 initialize()에서 중복 fetch를 건너뛴다.
  dataPreloaded?: boolean | undefined;

  // setFetchedValues()에서 받은 원본 엔티티 객체를 저장한다.
  // 등록된 필드가 아닌 엔티티의 임의 속성에 접근할 때 사용한다.
  fetchedEntity?: T | undefined;

  // Alert 메시지 관리
  alertMessages: AlertMessage[] = [];

  // CheckButtonValidation 필드의 검증 상태 저장
  fieldValidationStates: Map<string, { validated: boolean; message?: string; color?: string }> =
    new Map();

  appendAdvancedSearchFields?: ListableFormField<any>[] | undefined;

  // Extension 관련 속성 - Client only
  clientExtensions: Map<ExtensionPoint, ClientExtensionConfig[]> = new Map();

  // 리스트 필드 제외 목록
  excludeListFields?: string[] | undefined;

  // sessionRequired: boolean = false;
  // 반드시 세션이 필요한 경우 true 로 설정한다.
  sessionRequired?: boolean | undefined;

  cacheKeyFunc?: ((entityForm: EntityForm<T>) => string) | undefined;

  // 필드값이 변경될 때 마다 실행되는 확장 포인트
  // 예를 들어 X 필드의 값이 특정값일 때 Y 필드의 상태를 조정한다거나 할 수 있다.
  onChanges?: ModifyEntityFormFunc<T>[] | undefined;

  // EntityForm 데이터를 fetch 한 후 EntityForm 을 변조하기 위한 확장 포인트
  // 예를 들어 커스텀필드 기능을 제공할 때 원래 entity 를 fetch 한 후, 해당 entity 와 연결된 커스텀필드의 정보를 다시 fetch 하는 로직을 추가할 수 있다.
  onFetchData?: ModifyFetchedEntityFormFunc<T>[] | undefined;

  // 최초 EntityForm 이 활성화 될 때 EntityForm 을 변조하기 위한 확장 포인트
  // initialize 는 fetch 후에 실행된다.
  // 예를 들어 커스텀필드 기능을 제공하려고 하면, initialize 확장을 통해 해당 엔티티의 커스텀필드 configuration 정보를 확인하고 entityForm 에 필드를 추가한다.
  onInitialize?: OnInitializeFunc<T>[] | undefined;

  onFetchListData?: PostFetchListData[] | undefined;

  // save 로직 override 를 위한 확장 포인트
  onSave?: ((entityForm: EntityForm<T>) => Promise<EntityFormActionResult>) | undefined;

  // save 로직이 완료되고 난 후 확장 포인트, ViewEntityForm 에도 postSave 가 있는데, 그 값과는 관계가 없다.
  // 왜 이게 두개냐면, react 의 state, hook 과 같은 이벤트를 entityForm 내부에서는 사용할 수가 없기 때문이다.
  // 따라서 화면을 제어하거나 react hook 을 이용하려면 ViewEntityForm 의 postSave 를 이용해야 한다.
  postSave?: ((result: EntityFormActionResult) => Promise<void>) | undefined;

  // delete 로직이 완료되고 난 후 확장 포인트, idList 가 undefined 가 아닌 경우 목록에서 복수로 삭제했다는 뜻이다. 이때는 idList 를 가지고 뭔가를 해야 한다.
  // postSave 와 마찬가지로 화면 제어를 하기 위한 postDelete 는 ViewEntityForm 에서 설정해야 한다.
  postDelete?: ((entityForm: EntityForm<T>, idList?: any[]) => Promise<void>) | undefined;

  /*
   * create form 을 만들어 서버로 전송하기 전에 데이터를 변경할 수 있는 기능을 제공한다.
   * data['필드명'] 으로 접근해 필드의 값을 변경할 수 있다.
   */
  overrideSubmitData?:
    | ((
        entityForm: EntityForm<T>,
        data: any,
      ) => Promise<{
        data: any;
        modifiedFields?: string[];
        removePrevious?: boolean;
        error?: boolean;
        errors?: FieldError[];
      }>)
    | undefined;

  /**
   * Data 를 fetch 할 때 로직을 오버라이드 한다.
   * overrideFetchData 가 정의되어 있으면 메소드 fetchData 의 최상단에서 오버라이드 된다.
   */
  overrideFetchData?:
    | ((url: string, entityForm: EntityForm<T>) => Promise<ResponseData>)
    | undefined;

  /**
   * data upload / download 설정
   */
  dataTransferConfig?: DataTransferConfig | undefined;

  /**
   * 삭제는 안 되고 active 값만 변경되는 경우
   * 삭제 모달의 메시지가 변경된다.
   */
  neverDelete?: boolean | undefined;

  /**
   * EntityForm 상태에 따른 동적 버튼 추가
   * EntityFormButton 또는 EntityFormReactNodeButton 타입을 반환
   */
  buttons?: ((entityForm: EntityForm<T>) => Promise<EntityFormButtonType[]>)[] | undefined;

  /**
   * ViewEntityForm 할 때 사용할 수 있다.
   * 엔티티폼을 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
   * 이 정보는 저장 용도로는 사용되지 않는다.
   */
  attributes?: Map<string, unknown> | undefined;

  /**
   * ViewEntityForm에서 헤더 버튼과 Alert 영역 사이에 표시될 커스텀 영역
   * sticky 포지셔닝으로 스크롤 시 상단에 고정됨
   */
  headerArea?: ((entityForm: EntityForm<T>) => Promise<ReactNode>) | undefined;

  async reload(): Promise<void> {
    this.initialize({});
  }

  abstract initialize(props: {
    session?: Session;
    list?: boolean;
  }): Promise<EntityFormActionResult>;

  abstract clone(includeValue?: boolean): EntityFormBase<T>;

  withMenuUrl(menuUrl?: string): this {
    this.menuUrl = menuUrl;
    return this;
  }

  withUrl(url: string): this {
    this.url = url;
    return this;
  }

  withTitle(
    title?:
      | string
      | {
          title?: string;
          field?: string;
          view?: (entityForm: EntityForm<T>) => Promise<ReactNode>;
        },
  ): this {
    if (typeof title === 'string') {
      this.title = {
        title: title,
      };
    } else {
      this.title = title;
    }
    return this;
  }

  withParentId(parentId?: string): this {
    this.parentId = parentId;
    return this;
  }

  withId(id?: string): this {
    this.id = id;
    return this;
  }

  getId(): string | undefined {
    return this.id;
  }

  getRenderType(): RenderType {
    return this.getId() ? 'update' : 'create';
  }

  /**
   * ID 와 URL 이 모두 존재해야만 FETCH 가 가능하다.
   */
  isAbleFetch() {
    return !isBlank(this.url) && !isBlank(this.id);
  }

  getUrl(): string {
    let url: string = this.url;
    // remove trailing slash
    if (url && url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }

  getFetchUrl() {
    if (this.isAbleFetch()) {
      return `${this.getUrl()}/${this.id}`;
    }
    throw new Error('EntityForm is not able to fetch entity');
  }

  isSessionRequired(): boolean {
    return isTrue(this.sessionRequired);
  }

  withPostSave(postSave: (result: EntityFormActionResult) => Promise<void>): this {
    this.postSave = postSave;
    return this;
  }

  withPostDelete(postDelete: (entityForm: EntityForm<T>, idList?: any[]) => Promise<void>): this {
    this.postDelete = postDelete;
    return this;
  }

  async getTitle(append?: string, appendPostfix?: boolean): Promise<string> {
    append = defaultString(append);
    const postFix = isTrue(appendPostfix) ? ' / ' + (await this.getTitlePostfix()) : '';
    return isBlank(append) ? `${postFix}` : `${append}${postFix}`;
  }

  private async getTitlePostfix(): Promise<string> {
    if (this.title) {
      if (this.title.title) {
        return this.title.title;
      } else if (this.title.field) {
        const field = this.getField(this.title.field);

        if (field) {
          return await field.getCurrentValue(this.getRenderType());
        }
      }
    }

    return (
      (await this.getField('name')?.getCurrentValue(this.getRenderType())) ?? this.id ?? '신규 입력'
    );
  }

  hasField(name: string): boolean {
    return this.fields.has(name);
  }

  getField<K extends keyof T & string>(name: K): EntityField | undefined;
  getField(name: string): EntityField | undefined;
  getField(name: string): EntityField | undefined {
    return this.fields.get(name);
  }

  getCollection(name: string): SubCollectionField | undefined {
    return this.collections.get(name);
  }

  async getValue<K extends keyof T & string>(name: K): Promise<T[K]>;
  async getValue(name: string): Promise<any>;
  async getValue(name: string): Promise<any> {
    return this.getField(name)?.getCurrentValue(this.getRenderType());
  }

  getFetchedEntity(): T | undefined {
    return this.fetchedEntity;
  }

  // intentional: values object is a generic entity payload (shape driven by registered fields)
  async getValues(): Promise<Partial<T> & Record<string, any>> {
    const values: Record<string, any> = {};
    for (const field of this.fields.values()) {
      values[field.getName()] = await field.getCurrentValue(this.getRenderType());
    }
    return values as Partial<T> & Record<string, any>;
  }

  hasTab(id: string): boolean {
    return this.tabs.has(id);
  }

  getTab(tabId: string): EntityTab | undefined {
    return this.tabs.get(tabId);
  }

  async getViewableTabs(
    includeHide?: boolean,
    createStepFields?: string[],
    session?: Session,
  ): Promise<EntityTab[]> {
    const tabs: EntityTab[] = [];

    // 권한 체크를 위해 session에서 userPermissions를 가져온다.
    const userPermissions =
      session?.roles ??
      session?.authentication?.roles ??
      this.session?.roles ??
      this.session?.authentication?.roles;

    for (const tab of this.tabs.values()) {
      const append: boolean = isTrue(includeHide) || !isTrue(tab.hidden);

      if (append) {
        // 탭에 requiredPermissions가 설정되어 있고, 사용자에게 권한이 없으면 숨김
        if (!tab.isPermitted(userPermissions)) {
          continue;
        }

        const fieldGroups = await this.getViewableFieldGroups({
          tabId: tab.id,
          session,
          createStepFields: createStepFields,
        });

        if (fieldGroups.length > 0) {
          tabs.push(tab);
        }
      }
    }

    // sort tab by tab.order
    tabs.sort((a, b) => a.order - b.order);
    return tabs;
  }

  /**
   * 모든 탭 목록을 반환합니다 (순서대로 정렬됨)
   */
  getTabs(): EntityTab[] {
    const tabs = Array.from(this.tabs.values());
    tabs.sort((a, b) => a.order - b.order);
    return tabs;
  }

  /**
   * 지정한 탭들을 제거합니다
   * @param tabsToRemove 제거할 탭 배열 또는 탭 ID 배열
   */
  removeTabs(tabsToRemove: (EntityTab | string)[]): this {
    for (const tab of tabsToRemove) {
      const tabId = typeof tab === 'string' ? tab : tab.id;
      this.tabs.delete(tabId);
    }
    return this;
  }

  /**
   * 지정한 탭을 제거합니다
   * @param tab 제거할 탭 또는 탭 ID
   */
  removeTab(tab: EntityTab | string): this {
    const tabId = typeof tab === 'string' ? tab : tab.id;
    this.tabs.delete(tabId);
    return this;
  }

  getFieldGroup(tabId: string, fieldGroupId: string): EntityFieldGroup | undefined {
    const tab = this.getTab(tabId);
    if (tab) {
      return tab.fieldGroups.find((fieldGroup) => fieldGroup.id === fieldGroupId);
    }
    return undefined;
  }

  async getViewableFieldGroups(props: {
    tabId: string;
    session?: Session | undefined;
    createStepFields?: string[] | undefined;
  }): Promise<string[]> {
    const tabId = props.tabId;
    const session = props.session;
    const createStepFields = props.createStepFields ?? [];
    const tab = this.getTab(tabId);

    if (tab) {
      const viewableFieldGroups: string[] = [];

      for (const fieldGroup of tab.fieldGroups) {
        if (
          await this.isViewableFieldGroup({
            tabId,
            fieldGroupId: fieldGroup.id,
            session,
            createStepFields,
          })
        ) {
          viewableFieldGroups.push(fieldGroup.id);
        }
      }

      return Promise.resolve(viewableFieldGroups);
    }

    return Promise.resolve([]);
  }

  async isViewableFieldGroup(props: {
    tabId: string;
    fieldGroupId: string;
    session?: Session | undefined;
    createStepFields?: string[] | undefined;
  }): Promise<boolean> {
    const tabId = props.tabId;
    const fieldGroupId = props.fieldGroupId;
    const session = props.session;

    const tab = this.getTab(tabId);

    const renderType = this.getRenderType();

    // 권한 체크를 위해 session에서 userPermissions를 가져온다.
    const userPermissions = session?.roles ?? session?.authentication?.roles;

    let viewable = false;

    if (tab) {
      const fieldGroup = tab.fieldGroups.find((group) => group.id === fieldGroupId);

      if (fieldGroup && this instanceof EntityForm) {
        // 필드그룹에 requiredPermissions가 설정되어 있고, 사용자에게 권한이 없으면 숨김
        if (!fieldGroup.isPermitted(userPermissions)) {
          return Promise.resolve(false);
        }

        for (const field of fieldGroup.fields) {
          if (!isEmpty(props.createStepFields) && !props.createStepFields!.includes(field.name)) {
            continue;
          }

          const entityField = this.fields.get(field.name);
          if (entityField) {
            // 권한이 없는 필드는 건너뛴다.
            if (!entityField.isPermitted(userPermissions)) {
              continue;
            }

            const hidden = await entityField.isHidden({
              entityForm: this,
              renderType: this.getRenderType(),
              session: session,
            });

            if (!hidden) {
              viewable = true;
              break;
            }
          }

          // SubCollection 은 update 시점에만 설정할 수 있다.
          if (!viewable && renderType === 'update') {
            const collection = this.collections.get(field.name);
            if (collection !== undefined) {
              const hidden = await collection.isHidden({
                entityForm: this,
                renderType: this.getRenderType(),
                session: session,
              });

              if (!hidden) {
                viewable = true;
                break;
              }
            }
          }
        }

        return Promise.resolve(viewable);
      }
    }

    return Promise.resolve(viewable);
  }

  async getVisibleFields(
    tabId: string,
    fieldGroupId: string,
    session?: Session,
    createStepFields?: string[],
  ): Promise<{
    fieldGroup?: EntityFieldGroup;
    fields?: EntityField[];
  }> {
    const fieldGroup = this.getFieldGroup(tabId, fieldGroupId);

    if (fieldGroup && fieldGroup.fields.length > 0) {
      const fields: EntityField[] = [];

      // 권한 체크를 위해 session에서 userPermissions를 가져온다.
      const userPermissions = session?.roles ?? session?.authentication?.roles;

      for (const f of fieldGroup.fields) {
        const field = this.getField(f.name);

        if (field && field instanceof FormField) {
          if (this instanceof EntityForm) {
            // 권한이 없는 필드는 표시하지 않는다.
            if (!field.isPermitted(userPermissions)) {
              continue;
            }

            const hidden = await field.isHidden({
              entityForm: this,
              renderType: this.getRenderType(),
              session: session,
            });

            if (
              !hidden &&
              (isEmpty(createStepFields) || createStepFields?.includes(field.getName()))
            ) {
              fields.push(field as EntityField);
            }
          }
        }
      }

      // fields 의 order 순으로 정렬한다.
      fields.sort((a: EntityField, b: EntityField) => a.order - b.order);

      return { fieldGroup: fieldGroup, fields: fields };
    }
    return {};
  }

  async getVisibleCollections(
    tabId: string,
    fieldGroupId: string,
    session?: Session,
  ): Promise<{
    fieldGroup?: EntityFieldGroup;
    collections?: SubCollectionField[];
  }> {
    const fieldGroup = this.getFieldGroup(tabId, fieldGroupId);

    if (fieldGroup && fieldGroup.fields.length > 0) {
      const collections: SubCollectionField[] = [];

      for (const f of fieldGroup.fields) {
        const field = this.getCollection(f.name);

        if (field) {
          if (this instanceof EntityForm) {
            const hidden = await field.isHidden({
              entityForm: this,
              renderType: this.getRenderType(),
              session: session,
            });

            if (!hidden) {
              collections.push(field);
            }
          }
        }
      }

      collections.sort((a: SubCollectionField, b: SubCollectionField) => a.order - b.order);

      return { fieldGroup: fieldGroup, collections: collections };
    }

    return {};
  }

  getSession(): Session | undefined {
    return this.session;
  }

  withSession(session: Session): this {
    this.session = session;
    return this;
  }

  withShouldReload(shouldReload?: boolean): this {
    this.shouldReload = shouldReload;
    return this;
  }

  withFieldGroupConfig(tabId: string, fieldGroupId: string, config: FieldGroupConfig): this {
    const tab = this.getTab(tabId);
    if (tab) {
      const fieldGroup = tab.fieldGroups.find((group) => group.id === fieldGroupId);
      if (fieldGroup) {
        fieldGroup.config = { ...fieldGroup.config, ...config };
      }
    }
    return this;
  }

  getLabel(name: string): ReactNode {
    const field = this.getField(name);

    if (field) {
      return field.getLabel();
    }

    return '';
  }

  getHelpText(name: string, session?: Session): Promise<ReactNode> {
    const field = this.getField(name);

    if (field && this instanceof EntityForm) {
      return field.getHelpText({ entityForm: this, session });
    }

    return Promise.resolve('');
  }

  withHelpText(name: string, helpText: HelpTextType): this {
    const field = this.getField(name);
    if (field) {
      this.fields.set(name, field.withHelpText(helpText));
    }
    return this;
  }

  withTooltip(name: string, tooltip: TooltipType): this {
    const field = this.getField(name);
    if (field) {
      this.fields.set(name, field.withTooltip(tooltip));
    }
    return this;
  }

  withReadonly(name: string, readonly: boolean): this {
    const field = this.getField(name);
    if (field) {
      this.fields.set(name, field.withReadOnly(readonly));
    }
    return this;
  }

  withOptions(name: string, options: SelectOption[]): this {
    const field = this.getField(name);
    if (field instanceof OptionalField) {
      this.fields.set(name, field.withOptions(options) as EntityField);
    } else {
      console.error(name, ' field is not optional field.');
    }

    return this;
  }

  /**
   * 특정 tab 의 하위의 모든 fields 를 하나의 [] 로 리턴, 필드그룹의 표시 순서를 고려해 field 의 order 를 변경하며 clone 을 통해 원래 필드에 영향을 주지 않는다.
   * @param tabId
   */
  getTabFields(tabId: string): EntityField[] {
    const tab = this.getTab(tabId);

    if (tab) {
      const fields: EntityField[] = [];

      for (const fieldGroup of tab.fieldGroups) {
        for (const f of fieldGroup.fields) {
          const field = this.getField(f.name)?.clone(true);

          if (field) {
            const newOrder = f.order * 1000 + field.order;
            fields.push(field.withOrder(newOrder));
          }
        }
      }

      if (fields.length > 0) {
        // sort by order
        fields.sort((a, b) => a.order - b.order);
      }

      return fields;
    }
    return [];
  }

  withRevisionEntityName(revisionEntityName: string): this {
    this.revisionEntityName = revisionEntityName;
    return this;
  }

  getRevisionEntityName(): string {
    // 저장/조회 시 동일한 값을 사용하도록 fallback 적용
    return this.revisionEntityName || this.menuUrl || this.name;
  }

  withButtons(buttons: (entityForm: EntityForm<T>) => Promise<EntityFormButtonType[]>): this {
    this.buttons = [...(this.buttons ?? []), buttons];
    return this;
  }

  withOnChanges(...onChanges: ModifyEntityFormFunc<T>[]): this {
    this.onChanges = [...(this.onChanges ?? []), ...onChanges];
    return this;
  }

  withOnFetchData(...onLoad: ModifyFetchedEntityFormFunc<T>[]): this {
    this.onFetchData = [...(this.onFetchData ?? []), ...onLoad];
    return this;
  }

  withOnInitialize(...onInitialize: OnInitializeFunc<T>[]): this {
    this.onInitialize = [...(this.onInitialize ?? []), ...onInitialize];
    return this;
  }

  withOnPostFetchListData(...postFetchListData: PostFetchListData[]): this {
    this.onFetchListData = [...(this.onFetchListData ?? []), ...postFetchListData];
    return this;
  }

  withOnSave(onSave?: (entityForm: EntityForm<T>) => Promise<EntityFormActionResult>): this {
    this.onSave = onSave;
    return this;
  }

  withAttributes(attributes?: Map<string, unknown>): this {
    this.attributes = attributes;
    return this;
  }

  withHeaderArea(headerArea: (entityForm: EntityForm<T>) => Promise<ReactNode>): this {
    this.headerArea = headerArea;
    return this;
  }

  getAttributes(): Map<string, unknown> {
    // 새 Map 을 생성해 내보낸다.
    return this.attributes ? new Map(this.attributes) : new Map<string, unknown>();
  }

  putAttribute(key: string, value: unknown): this {
    if (this.attributes === undefined) {
      this.attributes = new Map<string, unknown>();
    }
    this.attributes.set(key, value);
    return this;
  }

  removeAttribute(key: string): this {
    if (this.attributes) {
      this.attributes.delete(key);
    }
    return this;
  }

  hasAttribute(key: string): boolean {
    return this.attributes ? this.attributes.has(key) : false;
  }

  addAttributeToField(fieldName: string, key: string, value: unknown) {
    const field = this.getField(fieldName);
    if (field) {
      const attributes: Map<string, unknown> = field.attributes ?? new Map<string, unknown>();
      attributes.set(key, value);
      field.attributes = attributes;
      this.fields.set(field.name, field);
    }
  }

  removeAttributeToField(fieldName: string, key: string) {
    const field = this.getField(fieldName);
    if (field) {
      const attributes: Map<string, unknown> = field.attributes ?? new Map<string, unknown>();
      attributes.delete(key);
      field.attributes = attributes;
      this.fields.set(field.name, field);
    }
  }

  getFieldAttributes(fieldName: string): Map<string, unknown> | undefined {
    const field = this.getField(fieldName);
    return field?.attributes;
  }

  setReadOnly(readonly: boolean = true) {
    this.readonly = readonly;
    this.fields.forEach((value) => {
      value.withReadOnly(readonly);
    });
    this.collections.forEach((value) => {
      value.withReadOnly(readonly);
    });
  }

  setRevisionEntityNameIfBlank(path: string) {
    if (isBlank(this.revisionEntityName)) {
      this.revisionEntityName = path;
    }
  }
}
