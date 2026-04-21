import { FieldGroupInfo, TabInfo } from '../config/Config';
import { isTrue } from '../utils/BooleanUtil';
import { EntityFieldGroup } from '../config/EntityFieldGroup';
import { EntityItem } from '../config/EntityItem';

export class EntityTab {
  id: string;
  label: string;
  order: number;
  hidden?: boolean | undefined;
  description?: string | React.ReactNode;
  fieldGroups: EntityFieldGroup[] = [];
  requiredPermissions?: string[] | undefined;

  constructor(config?: TabInfo) {
    this.id = config?.id ?? 'default';
    this.order = config?.order ?? 100;
    this.label = config?.label ?? '기본 정보';
    this.hidden = isTrue(config?.hidden);
    this.description = config?.description;
    this.requiredPermissions = config?.requiredPermissions;
  }

  /**
   * 이 탭을 보기 위해 필요한 권한을 설정합니다.
   * 사용자가 지정된 권한 중 하나라도 가지고 있으면 탭이 표시됩니다.
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
   * 사용자가 이 탭을 볼 수 있는 권한이 있는지 확인합니다.
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

  clone(): EntityTab {
    const cloned = new EntityTab();
    cloned.id = this.id;
    cloned.label = this.label;
    cloned.order = this.order;
    cloned.hidden = this.hidden;
    cloned.description = this.description;
    cloned.requiredPermissions = this.requiredPermissions
      ? [...this.requiredPermissions]
      : undefined;

    const fieldGroups: EntityFieldGroup[] = [];
    this.fieldGroups.forEach((fieldGroup) => {
      fieldGroups.push(fieldGroup.clone());
    });
    cloned.fieldGroups = fieldGroups;

    return cloned;
  }

  addField(fieldGroup: FieldGroupInfo, field: EntityItem) {
    let entityFieldGroup = this.fieldGroups.find((group) => group.id === fieldGroup.id);

    if (!entityFieldGroup) {
      entityFieldGroup = new EntityFieldGroup(fieldGroup);
      this.fieldGroups.push(entityFieldGroup);
      this.fieldGroups.sort((a, b) => a.order - b.order);
    }

    // 이미 존재하는지 확인 후 없으면 추가
    if (!entityFieldGroup.fields.some((fld) => fld.name === field.name)) {
      entityFieldGroup.fields.push({ name: field.getName(), order: field.getOrder() });
    }
  }
}
