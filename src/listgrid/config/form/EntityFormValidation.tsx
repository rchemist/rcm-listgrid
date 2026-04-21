import { EntityFormBase } from '../../config/form/EntityFormBase';
import { FieldError } from '../../config/EntityFormTypes';
import { isEmpty } from '../../utils';
import { mergeFieldErrors } from '../../config/EntityFormMethod';
import { ManageEntityForm } from '../../config/Config';

export abstract class EntityFormValidation<T extends object = any> extends EntityFormBase<T> {
  constructor(name: string, url: string) {
    super(name, url);
  }

  getFieldValidationState(
    fieldName: string,
  ): { validated: boolean; message?: string; color?: string } | undefined {
    return this.fieldValidationStates.get(fieldName);
  }

  setFieldValidationState(
    fieldName: string,
    state: { validated: boolean; message?: string; color?: string },
  ): void {
    this.fieldValidationStates.set(fieldName, state);
  }

  clearFieldValidationState(fieldName: string): void {
    this.fieldValidationStates.delete(fieldName);
  }

  withRequired(name: string, required: boolean): this {
    const field = this.getField(name);
    if (field) {
      this.fields.set(name, field.withRequired(required));
    }
    return this;
  }

  withErrors(errors: FieldError[]): this {
    this.errors = errors;
    return this;
  }

  getErrorMap(): Map<string, FieldError[]> {
    const errorMap = new Map<string, FieldError[]>();

    if (!isEmpty(this.errors)) {
      for (const error of this.errors!) {
        const fieldName = error.name;

        // 이 필드가 속한 Tab 을 확인한다.
        const field = this.getField(fieldName);
        const tabId = field?.getTabId();

        if (tabId) {
          const tab = this.getTab(tabId);

          if (tab) {
            const key = tab.label;
            const fieldErrors = errorMap.get(key);
            if (fieldErrors) {
              let duplicated = false;
              for (const err of fieldErrors) {
                if (err.name === error.name) {
                  duplicated = true;
                  for (const message of err.errors) {
                    if (!error.errors.includes(message)) {
                      error.errors.push(message);
                    }
                  }
                  err.errors = error.errors;
                  break;
                }
              }

              if (!duplicated) {
                // tabId를 error 객체에 추가
                error.tabId = tabId;
                fieldErrors.push(error);
              }
            } else {
              // tabId를 error 객체에 추가
              error.tabId = tabId;
              errorMap.set(key, [error]);
            }
          }
        }
      }
    }

    return errorMap;
  }

  mergeError(name: string, errors: FieldError[]) {
    if (this.errors === undefined) {
      this.errors = errors;
    } else {
      if (errors !== undefined && errors.length > 0) {
        const newErrors: FieldError[] = [];
        for (const error of this.errors) {
          if (error.name !== name) {
            newErrors.push(error);
          } else {
            // 기존과 같은 이름을 가진 error 가 존재했다면 병합하고 끝낸다.
            this.errors = mergeFieldErrors(this.errors, errors);
            return;
          }
        }
        newErrors.push(...errors);
        this.errors = newErrors;
      } else {
        const newErrors: FieldError[] = [];
        for (const error of this.errors) {
          if (error.name !== name) {
            newErrors.push(error);
          }
        }
        this.errors = newErrors;
      }
    }
  }

  withManageEntityForm(manageEntityForm: ManageEntityForm): this {
    this.manageEntityForm = manageEntityForm;
    return this;
  }

  withCreatable(creatable: boolean = true): this {
    this.manageEntityForm.create = creatable;
    return this;
  }

  withUpdatable(updatable: boolean = true): this {
    this.manageEntityForm.update = updatable;
    return this;
  }

  withDeletable(deletable: boolean = true): this {
    this.manageEntityForm.delete = deletable;
    return this;
  }

  isCreatable(): boolean {
    return this.manageEntityForm.create;
  }

  isUpdatable(): boolean {
    return this.manageEntityForm.update;
  }

  isDeletable(): boolean {
    return this.manageEntityForm.delete;
  }
}
