import { QueryConditionType } from '../../../form/SearchForm';
import { FormField } from '../abstract';
import { EntityForm } from '../../../config/EntityForm';
import { parse, stringify } from '../../../utils/jsonUtils';

export interface RuleFieldValue {
  id: number;
  name: string;
  queryConditionType: QueryConditionType;
  values?: any[];
  subConditions?: Map<'AND' | 'OR', RuleFieldValue[]>;
}

export type RuleFieldType = 'add' | 'remove';

export class RuleConditionValue {
  id: number;
  condition: 'AND' | 'OR';
  targetEntityPrefix: string;
  values: RuleFieldValue[];

  constructor(id: number, condition: 'AND' | 'OR', targetEntityPrefix: string) {
    this.id = id;
    this.condition = condition;
    this.values = [];
    this.targetEntityPrefix = targetEntityPrefix;
  }

  public static create(data: unknown): RuleConditionValue {
    if (typeof data === 'string') {
      const result = parse<RuleConditionValue>(data);

      const value = new RuleConditionValue(result.id, result.condition, result.targetEntityPrefix);

      if (result.values) {
        value.addValues(...result.values);
      }

      return value;
    } else {
      return RuleConditionValue.create(stringify(data));
    }
  }

  addValues(...values: RuleFieldValue[]) {
    values.forEach((newValue) => {
      const existingValueIndex = this.values.findIndex(
        (v) => v.id === newValue.id && v.name === newValue.name,
      );

      if (existingValueIndex !== -1) {
        // 기존에 동일한 id와 name이 있는 경우, 해당 값을 업데이트
        this.values[existingValueIndex] = {
          ...this.values[existingValueIndex],
          ...newValue,
        };
      } else {
        // 동일한 id와 name이 없는 경우, 새로운 값을 추가
        this.values.push(newValue);
      }
    });
  }

  withValues(values: RuleFieldValue[]): this {
    this.values = values ?? []; // undefined인 경우 빈 배열로 설정
    return this;
  }

  isEmpty() {
    return !this.values || this.values.length === 0;
  }
}

export type ResultByCount = (count: number) => void;
export type ResultByRuleCondition = (result: Map<number, RuleConditionValue>) => void;

export interface RuleBasedFieldProps {
  value?: Map<number, RuleConditionValue> | undefined;
  onRefresh?: (() => void) | undefined;
  setNotifications?: ((notifications: string[]) => void) | undefined;
  parentId?: string | undefined;
  fieldName?: string | undefined;
}

/**
 * Rule 이 항상 동일한 엔티티를 대상으로 적용되지는 않는다.
 * 예를 들어 주문 상품 오퍼라면
 * 상품에 대한 Rule 이 있을 수도 있고
 * 주문에 대한 Rule 이 있을 수도 있다.
 * 또 Category 에 대한 Rule 이 있을 수도 있다.
 * 따라서 여러 엔티티폼을 전달할 수 있어야 한다.
 * 또 각 엔티티폼에 대해 prefix 와 name 을 지정해 어떤 필드의 값인지 구분할 수 있어야 한다.
 * 엔티티폼을 통째로 넘기거나 필요한 필드를 지정해 넘길 수 있다.
 */
export type RuleFieldEntityForm = {
  prefix: string; // field 앞에 붙일 prefix. 만약 대상 entityForm 이 단 하나라면 이 값을 무시해도 된다.
  label: string; // view 에서 필드 앞에 붙일 라벨명
  entityForm?: EntityForm;
  fields?: FormField<any>[];
};

export function getConfiguredFields(targetEntityForm: RuleFieldEntityForm): FormField<any>[] {
  const fields: FormField<any>[] = [];

  if (targetEntityForm.fields !== undefined && targetEntityForm.fields.length > 0) {
    fields.push(...targetEntityForm.fields);
  } else {
    // 둘 중 하나는 반드시 있어야 한다.
    for (const field of targetEntityForm.entityForm!.getListFields()) {
      if (field.isFilterable() && !isIgnoreField(field)) {
        fields.push(field);
      }
    }
  }

  return fields;
}

/**
 * 엔티티폼에서 Rule 필드를 자동으로 추출할 때 무조건 제거해야 할 대상 필드를 지정한다.
 * 여러 조건이 있을 수 있으니 함수로 따로 뺀다.
 * @param field
 */
export function isIgnoreField(field: FormField<any>) {
  if (field.name === 'active' && field.type === 'boolean') {
    // active 조건을 rule 로 지정하는 것은 말이 안 된다.
    return true;
  }

  return false;
}
