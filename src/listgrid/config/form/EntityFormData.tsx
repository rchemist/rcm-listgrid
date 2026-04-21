import { isBlank, isEmpty, isTrue } from '../../utils';
import { EntityFormBase } from './EntityFormBase';
import { EntityFormValidation } from './EntityFormValidation';
import {
  CopyEntityFormExplicitFieldType,
  CopyEntityFormToInnerFieldsProps,
} from '../../config/EntityFormTypes';
import {
  DEFAULT_FIELD_GROUP_INFO,
  DEFAULT_TAB_INFO,
  FieldGroupInfo,
  TabInfo,
} from '../../config/Config';
import { EntityField } from '../../config/EntityField';
import { EntityFieldGroup } from '../../config/EntityFieldGroup';
import { EntityTab } from '../../config/EntityTab';

export abstract class EntityFormData<T extends object = any> extends EntityFormValidation<T> {
  constructor(name: string, url: string) {
    super(name, url);
  }

  resetValue(fieldName: string, loadOnChanges: boolean = true): this {
    const field = this.getField(fieldName);
    if (field) {
      field.resetValue(this.getRenderType());
      if (loadOnChanges) {
        this.executeOnChanges(fieldName);
      }
    }
    return this;
  }

  abstract executeOnChanges(fieldName: string): Promise<void>;

  /**
   * 필드값을 변경한다.
   * @param fieldName
   * @param value
   * @returns
   */
  setValue<K extends keyof T & string>(fieldName: K, value: T[K]): this;
  setValue(fieldName: string, value: any): this;
  setValue(fieldName: string, value: any): this {
    const field = this.getField(fieldName);
    if (field) {
      this.fields.set(field.getName(), field.withValue(value));
    }

    return this;
  }

  setValues(cloned: EntityFormBase<T>): this {
    // fields 의 value 를 복사해 붙인다.
    this.fields.forEach((field, key) => {
      const clonedField = cloned.getField(key);
      if (clonedField) {
        field.value = clonedField.value;
      }
    });

    return this;
  }

  /**
   * 단순히 필드값을 변경하는 setValue 와는 다르게 필드값이 변경되면 onChanges 에 등록된 함수를 실행한다.
   * @param fieldName
   * @param value
   * @returns
   */
  changeValue<K extends keyof T & string>(fieldName: K, value: T[K]): this;
  changeValue(fieldName: string, value: any): this;
  changeValue(fieldName: string, value: any): this {
    const field = this.getField(fieldName);
    if (field) {
      this.fields.set(field.getName(), field.withValue(value));
      this.executeOnChanges(fieldName);
    }
    return this;
  }

  clearOnChanges(): this {
    this.onChanges = [];
    return this;
  }

  clearOnFetchData(): this {
    this.onFetchData = [];
    return this;
  }

  clearOnInitialize(): this {
    this.onInitialize = [];
    return this;
  }

  clearOnPostFetchListData(): this {
    this.onFetchListData = [];
    return this;
  }

  isDirty(): boolean {
    // 모든 필드 요소를 순회하며 dirty 여부를 확인한다.
    for (const field of this.fields.values()) {
      if (!isTrue(field.hidden) && field.isDirty()) {
        return true;
      }
    }
    return false;
  }

  isDirtyField(name: string): boolean {
    const field = this.getField(name);
    return field ? field.isDirty() : false;
  }

  copyEntityFormToInnerFields({ prefix, entityForm, ...props }: CopyEntityFormToInnerFieldsProps) {
    const fields = entityForm.getFields();

    if (isEmpty(fields)) {
      return;
    }

    const excludeFields = props.excludeFields ?? [];
    const explicitFields = props.explicitFields ?? [];

    let tab: TabInfo = props.tab ?? DEFAULT_TAB_INFO;

    if (props.tab) {
      if (!this.hasTab(props.tab.id)) {
        tab = props.tab;
        this.tabs.set(props.tab.id, new EntityTab(tab));
      }
    }

    let fieldGroup: FieldGroupInfo = props.fieldGroup ?? DEFAULT_FIELD_GROUP_INFO;
    let entityFieldGroup: EntityFieldGroup;

    if (this.tabs.get(tab.id)?.fieldGroups.find((group) => group.id === fieldGroup.id)) {
      entityFieldGroup = this.tabs
        .get(tab.id)!
        .fieldGroups.find((group) => group.id === fieldGroup.id)!;
    } else {
      entityFieldGroup = new EntityFieldGroup(fieldGroup);
      this.tabs.get(tab.id)?.fieldGroups.push(entityFieldGroup);
    }

    for (const field of fields) {
      if (excludeFields.includes(field.getName())) {
        continue;
      }

      let includeField = isEmpty(explicitFields);
      let explicitFieldInfo: CopyEntityFormExplicitFieldType | undefined = undefined;

      if (!includeField) {
        for (const explicitField of explicitFields) {
          if (typeof explicitField === 'string') {
            if (explicitField === field.getName()) {
              includeField = true;
              break;
            }
          } else {
            if (explicitField.name === field.getName()) {
              includeField = true;
              explicitFieldInfo = explicitField;
              break;
            }
          }
        }
      }

      if (includeField) {
        let newName = `${explicitFieldInfo?.name ?? field.getName()}`;
        if (!isBlank(prefix)) {
          newName = `${prefix}.${newName}`;
        }
        const newField = field.clone(true) as EntityField;

        if (explicitFieldInfo?.order) {
          newField.withOrder(explicitFieldInfo.order);
        }

        if (explicitFieldInfo?.label) {
          newField.withLabel(explicitFieldInfo.label);
        }

        if (explicitFieldInfo?.helpText) {
          newField.withHelpText(explicitFieldInfo.helpText);
        }

        if (explicitFieldInfo?.hidden) {
          newField.withHidden(explicitFieldInfo.hidden);
        }

        if (explicitFieldInfo?.readonly) {
          newField.withReadOnly(explicitFieldInfo.readonly);
        }

        if (explicitFieldInfo?.required) {
          newField.withRequired(explicitFieldInfo.required);
        }

        newField.name = newName;
        newField.withTabId(explicitFieldInfo?.tab?.id ?? tab.id);
        newField.withFieldGroupId(explicitFieldInfo?.fieldGroup?.id ?? fieldGroup.id);

        // 탭 정보가 필드 단위로 변경된 경우
        if (explicitFieldInfo?.tab || explicitFieldInfo?.fieldGroup) {
          let newTab: TabInfo | undefined = tab;
          if (tab.id !== newField.getTabId()) {
            if (this.tabs.has(newField.getTabId())) {
              newTab = this.tabs.get(newField.getTabId())!;
            }
            // 기존 탭이 없는 경우에는 추가해야 한다.
            if (!newTab) {
              newTab = explicitFieldInfo!.tab!;
              this.tabs.set(newTab.id, new EntityTab(newTab));
            }
          }

          // 필드 그룹 정보가 필드 단위로 변경된 경우
          let newFieldGroup: EntityFieldGroup;
          if (
            this.tabs
              .get(newTab.id)
              ?.fieldGroups.find((group) => group.id === newField.getFieldGroupId())
          ) {
            newFieldGroup = this.tabs
              .get(newTab.id)!
              .fieldGroups.find((group) => group.id === newField.getFieldGroupId())!;
          } else {
            newFieldGroup = new EntityFieldGroup(explicitFieldInfo?.fieldGroup ?? fieldGroup);
            this.tabs.get(newTab.id)?.fieldGroups.push(newFieldGroup);
          }
          newFieldGroup.fields.push(newField);
        } else {
          entityFieldGroup.fields.push(newField);
        }

        this.fields.set(newName, newField);
      }
    }
  }
}
