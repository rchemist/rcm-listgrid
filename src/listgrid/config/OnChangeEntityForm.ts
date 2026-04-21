import { ModifyEntityFormFunc } from '../config/Config';
import { EntityForm } from '../config/EntityForm';
import { OptionalField } from '../components/fields/abstract';
import { EntityField } from '../config/EntityField';
import { Validation } from '../validations/Validation';
import { SelectOption } from '../form/Type';

// intentional: `value` is a field value — heterogeneous by FieldType (string/number/bool/...)
export type ConditionalProps = { value: any; result: Map<string, boolean> };
export type ConditionalSelectOptionProps = {
  value: any;
  result: Map<string, SelectOption[]>;
  defaultValue?: any;
};
export type OptionalValidation =
  | false
  | { type?: 'append' | 'overwrite'; validations?: Validation[] };
export type ConditionalValidations = {
  value: ConditionalValidationValue;
  result: Map<string, OptionalValidation>;
};
export type ConditionalValidationValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | ((value: any) => boolean);
export class ConditionalValidation implements ConditionalValidations {
  value: ConditionalValidationValue;
  result: Map<string, OptionalValidation> = new Map<string, OptionalValidation>();

  constructor(value: ConditionalValidationValue) {
    this.value = value;
  }

  static create(value: ConditionalValidationValue) {
    return new ConditionalValidation(value);
  }

  addValidation(
    fieldName: string,
    type: 'append' | 'overwrite',
    ...validations: Validation[]
  ): this {
    this.result.set(fieldName, { type, validations });
    return this;
  }
}

export class ConditionalSelectOption implements ConditionalSelectOptionProps {
  value: any;
  result: Map<string, SelectOption[]> = new Map<string, SelectOption[]>();
  defaultValue: any;

  constructor(value: any) {
    this.value = value;
  }

  static create(value: any) {
    return new ConditionalSelectOption(value);
  }

  withDefaultValue(defaultValue?: any): this {
    this.defaultValue = defaultValue;
    return this;
  }

  addSelectOption(fieldName: string, ...options: SelectOption[]): this {
    this.result.set(fieldName, options);
    return this;
  }
}

export class OnChangeEntityForm {
  static changeHidden(
    name: string,
    options: ConditionalProps | ConditionalProps[],
  ): ModifyEntityFormFunc {
    return onChangeSetFieldHidden(name, options);
  }

  static changeRequired(
    name: string,
    options: ConditionalProps | ConditionalProps[],
  ): ModifyEntityFormFunc {
    return onChangeSetFieldRequired(name, options);
  }

  static changeSelectOptions(
    name: string,
    options: ConditionalSelectOptionProps | ConditionalSelectOptionProps[],
  ): ModifyEntityFormFunc {
    return onChangeSetSelectOptions(name, options);
  }

  static derivedValidations(
    name: string,
    options: ConditionalValidations | ConditionalValidations[],
  ): ModifyEntityFormFunc {
    return onChangeDerivedValidations(name, options);
  }
}

function onChangeDerivedValidations(
  name: string,
  options: ConditionalValidations | ConditionalValidations[],
): ModifyEntityFormFunc {
  return (entityForm: EntityForm) => {
    const field = entityForm.getField(name);

    if (field) {
      const value = field.getCurrentValue(entityForm.getRenderType());
      if (Array.isArray(options)) {
        for (const option of options) {
          setDerivedValidations(option, value);
        }
      } else {
        setDerivedValidations(options, value, true);
      }
    }
    return Promise.resolve(entityForm);

    function setDerivedValidations(
      option: ConditionalValidations,
      value: any,
      autoRemove: boolean = false,
    ) {
      function isMatched(option: ConditionalValidations, value: any) {
        if (typeof option.value === 'function') {
          return option.value(value);
        }

        return option.value === value;
      }

      if (isMatched(option, value)) {
        option.result.forEach((value, key) => {
          const f = entityForm.getField(key);

          if (f) {
            // false 로 지정하면 validations 을 제거하라는 뜻이다.
            if (value === false) {
              f.withValidations();
            } else {
              if (value.type === 'overwrite') {
                const validations = value.validations ? [...value.validations] : [];
                f.withValidations(...validations);
              } else {
                const validations: Validation[] = f.validations ? [...f.validations] : [];

                if (value.validations) {
                  for (const v of value.validations) {
                    let duplicated = false;

                    for (const validation of [...validations]) {
                      if (validation.id === v.id) {
                        duplicated = true;
                      }
                    }

                    if (!duplicated) {
                      validations.push(v);
                    }
                  }
                }

                f.withValidations(...validations);
              }
            }
          }
        });
      } else {
        if (autoRemove) {
          option.result.forEach((value: OptionalValidation, key: string) => {
            const f = entityForm.getField(key);

            if (f && f.validations) {
              const validations = [...f.validations];
              if (typeof value === 'boolean') {
                f.withValidations();
              } else {
                if (value.validations) {
                  for (const validation of validations) {
                    for (const v of value.validations) {
                      if (validation.id === v.id) {
                        validations.splice(validations.indexOf(validation), 1);
                      }
                    }
                  }
                  f.withValidations(...validations);
                }
              }
            }
          });
        }
      }
    }
  };
}

function onChangeSetSelectOptions(
  name: string,
  options: ConditionalSelectOptionProps | ConditionalSelectOptionProps[],
): ModifyEntityFormFunc {
  function changeOptions<T>({
    key,
    field,
    value,
    entityForm,
    defaultValue,
  }: {
    key: string;
    field: EntityField;
    value: SelectOption[];
    entityForm: EntityForm;
    defaultValue?: any;
  }): boolean {
    if (key === field.getName()) {
      if (field instanceof OptionalField) {
        return field.changeOptions(value);
      }
    } else {
      const other = entityForm.getField(key);
      if (other instanceof OptionalField) {
        return other.changeOptions(value, defaultValue);
      }
    }
    return false;
  }

  function revertOptions<T>(key: string, field: EntityField, entityForm: EntityForm): boolean {
    if (key === field.getName()) {
      if (field instanceof OptionalField) {
        return field.revertOptions(entityForm.getRenderType());
      }
    } else {
      const other = entityForm.getField(key);
      if (other instanceof OptionalField) {
        return other.revertOptions(entityForm.getRenderType());
      }
    }
    return false;
  }

  return (entityForm: EntityForm) => {
    const field = entityForm.getField(name);
    let changed = false;
    if (field) {
      const value = field.getCurrentValue(entityForm.getRenderType());
      if (Array.isArray(options)) {
        for (const option of options) {
          if (option.value === value) {
            option.result.forEach((value, key) => {
              if (changeOptions({ key, field, value, entityForm })) {
                changed = true;
              }
            });
          } else {
            option.result.forEach((_value, key) => {
              if (revertOptions(key, field, entityForm)) {
                changed = true;
              }
            });
          }
        }
      } else {
        if (options.value === value) {
          options.result.forEach((value, key) => {
            if (changeOptions({ key, field, value, entityForm })) {
              changed = true;
            }
          });
        } else {
          options.result.forEach((_value, key) => {
            if (revertOptions(key, field, entityForm)) {
              changed = true;
            }
          });
        }
      }
    }

    if (changed) {
      entityForm.withShouldReload(changed);
    }

    return Promise.resolve(entityForm);
  };
}

function onChangeSetFieldRequired(
  name: string,
  options: ConditionalProps | ConditionalProps[],
): ModifyEntityFormFunc {
  return (entityForm: EntityForm) => {
    const field = entityForm.getField(name);
    if (field) {
      const value = field.getCurrentValue(entityForm.getRenderType());

      if (Array.isArray(options)) {
        for (const prop of options) {
          if (prop.value === value) {
            prop.result.forEach((value, key) => {
              entityForm.getField(key)?.withRequired(value);
            });
          }
        }
      } else {
        // option 이 단수라면 value 가 equals 일 때와 그렇지 않을 때를 각각 적용한다.
        const required = value === options.value;

        options.result.forEach((v, k) => {
          const requiredValue = required ? v : !v;
          if (k === field.getName()) {
            field.withRequired(requiredValue);
          } else {
            entityForm.getField(k)?.withRequired(requiredValue);
          }
        });
      }
    }
    return Promise.resolve(entityForm);
  };
}

function onChangeSetFieldHidden(
  name: string,
  options: ConditionalProps | ConditionalProps[],
): ModifyEntityFormFunc {
  return (entityForm: EntityForm) => {
    const field = entityForm.getField(name);
    if (field) {
      const value = field.getCurrentValue(entityForm.getRenderType());

      if (Array.isArray(options)) {
        for (const prop of options) {
          if (prop.value === value) {
            prop.result.forEach((value, key) => {
              entityForm.getField(key)?.withHidden(value);
            });
          }
        }
      } else {
        // option 이 단수라면 value 가 equals 일 때와 그렇지 않을 때를 각각 적용한다.
        const hidden = value === options.value;

        options.result.forEach((v, k) => {
          const hiddenValue = hidden ? v : !v;
          if (k === field.getName()) {
            field.withHidden(hiddenValue);
          } else {
            entityForm.getField(k)?.withHidden(hiddenValue);
          }
        });
      }
    }
    return Promise.resolve(entityForm);
  };
}
