import { SpanValue } from '../common/type';
import { FieldGroupInfo, FieldGroupConfig } from '../config/Config';

export class EntityFieldGroup {
  id: string;
  label: string;
  order: number;
  span?:
    | {
        base?: SpanValue;
        xs?: SpanValue;
        sm?: SpanValue;
        md?: SpanValue;
        lg?: SpanValue;
        xl?: SpanValue;
      }
    | undefined;
  fields: FieldGroupItem[] = [];
  description?: string | undefined;
  config?: FieldGroupConfig | undefined;
  requiredPermissions?: string[] | undefined;

  constructor(config?: FieldGroupInfo) {
    this.id = config?.id ?? 'default';
    this.order = config?.order ?? 100;
    this.label = config?.label ?? '기본 정보';
    this.description = config?.description;
    this.config = config?.config;
    this.requiredPermissions = config?.requiredPermissions;
  }

  static create(id: string, label: string, order: number): EntityFieldGroup {
    return new EntityFieldGroup({ id, label, order });
  }

  /**
   * 이 필드그룹을 보기 위해 필요한 권한을 설정합니다.
   * 사용자가 지정된 권한 중 하나라도 가지고 있으면 필드그룹이 표시됩니다.
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
   * 사용자가 이 필드그룹을 볼 수 있는 권한이 있는지 확인합니다.
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

  clone(): EntityFieldGroup {
    const cloned = new EntityFieldGroup({
      id: this.id,
      label: this.label,
      order: this.order,
      description: this.description,
      config: this.config,
    });
    cloned.fields = [...this.fields];
    cloned.span = this.span;
    cloned.requiredPermissions = this.requiredPermissions
      ? [...this.requiredPermissions]
      : undefined;
    return cloned;
  }
}

export interface FieldGroupItem {
  name: string;
  order: number;
}
