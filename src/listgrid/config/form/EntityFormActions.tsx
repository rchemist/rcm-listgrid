import { EntityFormData } from './EntityFormData';
import {
  AbstractManyToOneField,
  FormField,
  IListConfig,
  ListableFormField,
  OptionalField,
} from '../../components/fields/abstract';
import {
  StatusCreatedAtFieldPreset,
  StatusCreatedAndUpdatedAtFieldPreset,
  ActiveField,
} from '../../components/fields/Preset';
import {
  DEFAULT_TAB_INFO,
  DEFAULT_FIELD_GROUP_INFO,
  STATUS_TAB_INFO,
  CreateStep,
} from '../../config/Config';
import { EntityField } from '../../config/EntityField';
import {
  AddFieldItemProps,
  AlertMessage,
  DataTransferConfigProps,
} from '../../config/EntityFormTypes';
import { EntityTab } from '../../config/EntityTab';
import { SubCollectionField } from '../../config/SubCollectionField';
import { isTrue } from '../../utils/BooleanUtil';
import { StringField } from '../../components/fields/StringField';
import { EntityForm } from '../../config/EntityForm';
import { DataTransferConfig, DataTransferRule, DataField } from '../../transfer/Type';
import { isEmpty } from '../../utils/CompareUtil';

export abstract class EntityFormActions<T extends object = any> extends EntityFormData<T> {
  constructor(name: string, url: string) {
    super(name, url);
  }

  getListableFieldOrder(field: ListableFormField<any>): number {
    const listConfig = field.listConfig;
    if (listConfig?.order !== undefined) {
      return listConfig.order;
    }

    let order = field.order ?? 0;
    const tab = this.getTab(field.getTabId());

    if (tab) {
      order = tab.order * 1000000 + order;
      const fieldGroup = this.getFieldGroup(tab.id, field.getFieldGroupId());
      if (fieldGroup) {
        order = fieldGroup.order * 10000 + order;
      }
    }
    return order;
  }

  /**
   * Alert 메시지를 제거합니다.
   * @param includePersistent persistent 메시지도 제거할지 여부 (true면 persistent 메시지도 제거)
   * @returns EntityForm 인스턴스
   */
  clearAlertMessages(includePersistent: boolean = false): this {
    if (includePersistent) {
      // persistent 메시지도 포함하여 모두 제거
      this.alertMessages = [];
    } else {
      // persistent가 true인 메시지만 남기고 제거
      this.alertMessages = this.alertMessages.filter((msg) => msg.persistent === true);
    }
    return this;
  }

  /**
   * Alert 메시지를 추가합니다.
   * @param messages 추가할 Alert 메시지 배열
   * @returns EntityForm 인스턴스
   */
  withAlertMessages(messages: AlertMessage[]): this {
    // 기존 메시지 중 같은 key가 없는 것만 유지
    const existingKeys = new Set(messages.map((m) => m.key));
    const filteredExisting = this.alertMessages.filter((m) => !existingKeys.has(m.key));

    // 새 메시지와 합치기
    this.alertMessages = [...filteredExisting, ...messages];
    return this;
  }

  /**
   * 특정 키의 Alert 메시지를 제거합니다.
   * @param key 제거할 메시지의 키
   * @returns EntityForm 인스턴스
   */
  removeAlertMessage(key: string): this {
    this.alertMessages = this.alertMessages.filter((msg) => msg.key !== key);
    return this;
  }

  withExcludeListFields(...excludeListFields: string[]): this {
    if (this.excludeListFields) {
      // 중복 제거 후 추가
      const fieldsSet = new Set<string>([...this.excludeListFields, ...excludeListFields]);
      this.excludeListFields = [...fieldsSet];
    }
    return this;
  }

  /**
   * 현재 Alert 메시지들을 반환합니다.
   * @returns Alert 메시지 배열
   */
  getAlertMessages(): AlertMessage[] {
    return [...this.alertMessages];
  }

  /**
   * 모든 메시지를 제거합니다. (현재는 Alert 메시지만 지원)
   * @param includePersistent persistent 메시지도 제거할지 여부 (true면 persistent 메시지도 제거)
   * @returns EntityForm 인스턴스
   */
  clearAllMessages(includePersistent: boolean = false): this {
    // Alert 메시지 제거
    this.clearAlertMessages(includePersistent);

    // TODO: Toast, SweetAlert 메시지 지원 추가 필요

    return this;
  }

  withListConfig(fieldName: string, config: IListConfig): this {
    const field = this.getField(fieldName);
    if (field !== undefined && field instanceof ListableFormField) {
      field.withListConfig(config);
    }
    return this;
  }

  withCreatedAtField(): this {
    return this.addFields(StatusCreatedAtFieldPreset);
  }

  withCreatedAndUpdatedAtFields(): this {
    return this.addFields(StatusCreatedAndUpdatedAtFieldPreset);
  }

  addFields(props: AddFieldItemProps): this {
    if (props.items.length === 0) {
      return this;
    }

    const tab = props.tab ?? DEFAULT_TAB_INFO;
    const fieldGroup = props.fieldGroup ?? DEFAULT_FIELD_GROUP_INFO;
    const overwrite = props.overwrite ?? false; // 기본값은 false (중복 필드 추가 방지)

    let entityTab: EntityTab;

    if (this.hasTab(tab.id)) {
      entityTab = this.getTab(tab.id)!;
    } else {
      // create entityTab
      entityTab = new EntityTab(tab);
      this.tabs.set(tab.id, entityTab);
    }

    for (const field of props.items) {
      // 중복 체크: overwrite가 false이고 이미 필드가 존재하면 건너뛴다
      if (!overwrite) {
        if (field instanceof FormField && this.fields.has(field.name)) {
          continue; // 이미 존재하는 필드는 추가하지 않음
        } else if (field instanceof SubCollectionField && this.collections.has(field.name)) {
          continue; // 이미 존재하는 컬렉션은 추가하지 않음
        }
      }

      entityTab.addField(fieldGroup, field);

      const target = field.withTabId(tab.id).withFieldGroupId(fieldGroup.id).clone();

      if (target instanceof FormField) {
        // field 의 tabInfo, fieldGroupInfo 를 설정한다.
        this.fields.set(field.name, target as EntityField);
      } else if (field instanceof SubCollectionField) {
        this.collections.set(field.name, target);
      }
    }

    return this;
  }

  removeField(fieldName: string) {
    this.fields.delete(fieldName);
  }

  /**
   * Field 와 Collection 모두 EntityItem 을 인수로 받기 때문에 둘 간의 차이는 없다.
   * @param props
   */
  addCollections(props: AddFieldItemProps): this {
    return this.addFields(props);
  }

  useListFields(...fieldNames: string[]): this {
    if (fieldNames.length === 0) {
      return this;
    }

    for (const fieldName of fieldNames) {
      const field = this.getField(fieldName);
      if (field && field instanceof ListableFormField) {
        field.useListField();
      }
    }

    return this;
  }

  /**
   * ListGrid 를 그릴 때 getListField() 를 호출하면 자동으로 리스트 필드를 만든다.
   */
  getListFields(): ListableFormField<any>[] {
    const listFields: ListableFormField<any>[] = [];
    const excludeFields = this.excludeListFields ?? [];

    let temp: ListableFormField<any> | undefined = undefined;

    Array.from(this.fields.values()).forEach((field: EntityField) => {
      // exclude 로 저징된 필드가 아닌 경우에만 ListGridField 로 지정한다.
      if (field instanceof ListableFormField && !excludeFields.includes(field.getName())) {
        if (field.isSupportList()) {
          listFields.push(field as ListableFormField<any>);
        }
        // 설정된 리스트 필드가 하나도 없는 경우를 대비해 첫번째 리스트 필드에 대해 따로 저장해 둔다.
        if (temp === undefined) {
          temp = field as ListableFormField<any>;
        }
      }
    });

    if (listFields.length === 0) {
      // 하나도 없는 경우에는 에러
      if (temp === undefined) {
        throw new Error('There is no list field');
      }
      listFields.push(temp);
    }

    // sort by listFields[0].getListConfig()?.order
    listFields.sort((a, b) => {
      const aOrder = this.getListableFieldOrder(a);
      const bOrder = this.getListableFieldOrder(b);
      return aOrder - bOrder;
    });

    return listFields;
  }

  getFilterableFields(): ListableFormField<any>[] {
    const filterFields: ListableFormField<any>[] = [];

    let temp: ListableFormField<any> | undefined = undefined;

    let manyToOneAdded = false;

    Array.from(this.fields.values()).forEach((field: EntityField) => {
      // exclude 로 저징된 필드가 아닌 경우에만 ListGridField 로 지정한다.
      if (field instanceof ListableFormField) {
        if (field.isFilterable()) {
          filterFields.push(field as ListableFormField<any>);

          // 이 필드의 type 이 manyToOne 인 경우에는 그 필드의 EntityForm 설정을 찾아서 name 필드가 있다면 검색 필터에 추가로 지정해 준다.
          if (
            field instanceof AbstractManyToOneField &&
            !('includeUser' in field && isTrue((field as any).includeUser))
          ) {
            const entityForm = field.getEntityForm();
            if (entityForm && entityForm.hasField('name')) {
              const originNameField = entityForm.getField('name');
              if (
                originNameField instanceof ListableFormField &&
                isTrue(originNameField.getListConfig()?.filterable)
              ) {
                const nameField = new StringField(field.name + '.name', field.order + 1)
                  .withLabel(field.getLabel() + ' 이름')
                  .withViewHidden()
                  .withListConfig({
                    order: field.listConfig?.order ? field.listConfig.order + 1 : field.order + 1,
                    support: false,
                    filterable: true,
                    sortable: false,
                    quickSearch: true,
                    op: 'LIKE',
                  });
                filterFields.push(nameField);
                manyToOneAdded = true;
              }
            }
          }

          // UserField with includeUser=true 체크
          if (
            field instanceof AbstractManyToOneField &&
            'includeUser' in field &&
            isTrue((field as any).includeUser)
          ) {
            const entityForm = field.getEntityForm();
            if (entityForm && entityForm.hasField('user.name')) {
              const nameField = new StringField(field.name + '.user.name', field.order + 1)
                .withLabel(field.getLabel() + ' 이름')
                .withViewHidden()
                .withListConfig({
                  order: field.listConfig?.order ? field.listConfig.order + 1 : 0,
                  support: false,
                  filterable: true,
                  sortable: false,
                  quickSearch: true,
                  op: 'LIKE',
                });
              filterFields.push(nameField);
              manyToOneAdded = true;
            }
          }
        }
        // 설정된 리스트 필드가 하나도 없는 경우를 대비해 첫번째 리스트 필드에 대해 따로 저장해 둔다.
        if (temp === undefined) {
          temp = field as ListableFormField<any>;
        }
      }
    });

    if (filterFields.length === 0) {
      // 하나도 없는 경우에는 에러
      if (temp === undefined) {
        throw new Error('There is no list field');
      }
      filterFields.push(temp);
    }

    // manyToOneAdded 라면 filterFields 중에 중복된 값이 있는지 확인한다.
    if (manyToOneAdded) {
      const filteredFields: ListableFormField<any>[] = [];
      for (const field of filterFields) {
        if (!filteredFields.some((f) => f.getName() === field.getName())) {
          filteredFields.push(field);
        }
      }
      filterFields.splice(0, filterFields.length, ...filteredFields);
    }

    // sort by listFields[0].getListConfig()?.order
    filterFields.sort((a, b) => {
      const aOrder = this.getListableFieldOrder(a);
      const bOrder = this.getListableFieldOrder(b);
      return aOrder - bOrder;
    });

    return filterFields;
  }

  getViewOrder(tabId: string, fieldGroupId: string, fieldOrder: number): number {
    const tab = this.getTab(tabId);

    if (tab) {
      const fieldGroup = tab.fieldGroups.find((group) => group.id === fieldGroupId);

      if (fieldGroup) {
        return tab.order * 10000 + fieldGroup.order * 1000 + fieldOrder;
      }
    }

    return fieldOrder;
  }

  withDataTransferConfig(props: DataTransferConfigProps): this {
    const config = new DataTransferConfig(props, this.getUrl());

    if (!config.export) {
      config.withExportUrl(this.getUrl());
    }

    if (!config.exportFileName) {
      config.withExportFileName(this.title?.title ?? this.name);
    }

    if (props.fieldNames && props.fieldNames.length > 0) {
      const dataFields = this.getDataFields(props.fieldNames);
      if (dataFields.length > 0) {
        config.setDataFields(dataFields);
      }
    } else {
      // 모든 필드가 export 또는 import 대상이 되어야 한다.
      // 하지만 이 메소드가 field 가 생성되기 전 호출될 수도 있으므로 여기에서 필드를 조회해서는 안 된다.
      // export.fields 가 셋팅이 안 된 경우 EntityForm 에서 따로 정보를 가져와야 한다.
    }

    this.dataTransferConfig = config;

    return this;
  }

  private getDataFields(
    fieldNames: string[],
    dataTransferRules?: Map<string, DataTransferRule>,
  ): DataField[] {
    const dataFields: DataField[] = [];

    fieldNames.forEach((fieldName) => {
      const field = this.getField(fieldName);

      if (field) {
        const dataField = DataField.create({
          name: field.name,
          label:
            field.label !== undefined && typeof field.label === 'string' ? field.label : field.name,
          type: field.type,
          dataTransferRule: dataTransferRules?.get(field.name),
        });

        if (field instanceof OptionalField) {
          dataField.withOptions(field.options ?? []);
        }

        dataFields.push(dataField);
      }
    });

    return dataFields;
  }

  async getExportableFields(): Promise<DataField[] | undefined> {
    if (this.dataTransferConfig !== undefined) {
      if (this.dataTransferConfig.isSupportExport()) {
        // export 를 지원하는 경우에만 필드를 리턴할 수 있다.
        if (isEmpty(this.dataTransferConfig.export?.fields)) {
          return await this.getDataFieldsFromFields();
        } else {
          return this.dataTransferConfig.export?.fields;
        }
      }
    }

    return undefined;
  }

  async getImportableFields(): Promise<DataField[] | undefined> {
    if (this.dataTransferConfig !== undefined) {
      if (this.dataTransferConfig.isSupportImport()) {
        // export 를 지원하는 경우에만 필드를 리턴할 수 있다.
        if (isEmpty(this.dataTransferConfig.export?.fields)) {
          return await this.getDataFieldsFromFields();
        } else {
          return this.dataTransferConfig.import?.fields;
        }
      }
    }

    return undefined;
  }

  private async getDataFieldsFromFields() {
    if (!(this instanceof EntityForm)) {
      throw new Error(
        'EntityFormActions.getDataFieldsFromFields() can only be called on EntityForm',
      );
    }
    const dataFields: DataField[] = [];
    const fields = [...this.fields.values()];
    // sort fields by field.order
    fields.sort((a, b) => a.order - b.order); // sort by order

    for (const field of fields) {
      const required = await field.isRequired({ entityForm: this });

      const dataField = DataField.create({
        name: field.getName(),
        label:
          field.label !== undefined && typeof field.label === 'string'
            ? field.label
            : field.getName(),
        type: field.type,
        options: field instanceof OptionalField ? (field.options ?? []) : undefined,
        required: required,
      });
      dataFields.push(dataField);
    }

    // sort dataFields
    return dataFields;
  }

  async getDataTransferConfig(): Promise<DataTransferConfig | undefined> {
    if (this.dataTransferConfig) {
      const defaultFields = await this.getDataFieldsFromFields();

      this.dataTransferConfig.validateDataFields(defaultFields);

      return this.dataTransferConfig;
    }

    return undefined;
  }

  withFilterable(fieldName: string, filterable: boolean = true): this {
    const field = this.getField(fieldName);
    if (field !== undefined && field instanceof ListableFormField) {
      field.withFilterable(filterable);
    }
    return this;
  }

  withNeverDelete(neverDelete: boolean = true): this {
    this.neverDelete = neverDelete;

    if (neverDelete) {
      this.removeField('active');

      this.addFields({
        tab: STATUS_TAB_INFO,
        items: [ActiveField().withModifyOnly()],
      });

      this.withOnInitialize(async (entityForm: EntityForm) => {
        if (entityForm.getRenderType() === 'update') {
          const active = await entityForm.getValue('active');
          if (isTrue(active, true)) {
            entityForm.withHidden('active', true);
          }
        }
        return entityForm;
      });
    }

    return this;
  }

  withStatusCreatedAndUpdatedAtField(): this {
    this.addFields(StatusCreatedAndUpdatedAtFieldPreset);
    return this;
  }

  withStatusCreatedAtField(): this {
    this.addFields(StatusCreatedAtFieldPreset);
    return this;
  }

  getCreateStep(): CreateStep[] | undefined {
    if (this.createStep) {
      const steps: CreateStep[] = [];
      for (const step of this.createStep) {
        if (!isTrue(step.hidden)) {
          steps.push(step);
        }
      }
      return steps;
    } else {
      return undefined;
    }
  }

  setCreateStep(createStep?: CreateStep[]) {
    if (createStep) {
      createStep.sort((a, b) => a.order - b.order);
    }
    this.createStep = createStep;
  }

  withCreateStep(createStep?: CreateStep[]): this {
    this.setCreateStep(createStep);
    return this;
  }
}
