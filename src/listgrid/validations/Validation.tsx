import { EntityForm } from '../config/EntityForm';
import { FieldValue } from '../config/Config';

const DEFAULT_ERROR_MESSAGE = 'form.save.error.invalid';

export interface Validation {
  // Validation 의 ID.
  // 하나의 필드에 중복된 ID 의 Validation 이 여러개 있으면 하나만 등록되기 때문에 반드시 유니크한 값으로 설정해야 함
  id: string;

  // 기본 에러 메시지. 별도로 설정하지 않으면 DEFAULT_ERROR_MESSAGE 가 출력된다.
  message?: string;

  /**
   * 실제 검증 로직
   * @param entityForm - 현재의 엔티티폼 상태
   * @param value - 현재 필드의 필드값. FieldValue 타입인 경우 value.currentValue 가 현재 값
   * @param message - 상위 폼에서 넘어 온 기본 오류 메시지
   */
  validate(
    entityForm: EntityForm,
    value: FieldValue | undefined,
    message?: string,
  ): Promise<ValidateResult>;

  /**
   * 에러 메시지 반환
   */
  getErrorMessage(): string;
}

export class ValidateResult {
  error: boolean;
  message: string;

  constructor(error: boolean, message: string) {
    this.error = error;
    this.message = message;
  }

  static fail(message: string): ValidateResult {
    return new ValidateResult(true, message);
  }

  static success(): ValidateResult {
    return new ValidateResult(false, '');
  }

  hasError(): boolean {
    return this.error;
  }

  withMessage(message: string) {
    this.message = message;
    return this;
  }
}

export abstract class ValidationItem implements Validation {
  protected constructor(id: string, message?: string) {
    this.id = `${id}`;
    if (message !== undefined) {
      this.message = message;
    }
  }

  id: string;

  message?: string;

  /**
   * 검증 로직
   * @param entityForm
   * @param value
   * @param message
   */
  abstract validate(
    entityForm: EntityForm,
    value: FieldValue,
    message?: string,
  ): Promise<ValidateResult>;

  getErrorMessage(): string {
    return this.message ?? DEFAULT_ERROR_MESSAGE;
  }

  /**
   * 현재 필드값을 string 으로 반환하는 편의성 메소드
   * @param entityForm
   * @param value
   */
  getValueAsString(entityForm: EntityForm, value: FieldValue): string {
    const currentValue = value?.current;
    if (currentValue !== undefined) {
      if (currentValue === null) {
        return '';
      }
      return String(currentValue);
    }

    return entityForm.getRenderType() === 'update' ? value?.fetched : value?.default;
  }

  /**
   * 현재 필드값을 number 로 반환하는 편의성 메소드
   * @param entityForm
   * @param value
   */
  getValueAsNumber(entityForm: EntityForm, value: FieldValue): number {
    return Number(
      (value?.current ?? entityForm.getRenderType() === 'update') ? value?.fetched : value?.default,
    );
  }

  /**
   * 현재 필드값을 boolean 로 반환하는 편의성 메소드.
   * @param entityForm
   * @param value
   */
  getValueAsBoolean(entityForm: EntityForm, value: FieldValue): boolean {
    return Boolean(
      (value?.current ?? entityForm.getRenderType() === 'update') ? value?.fetched : value?.default,
    );
  }

  /**
   * ValidateResult 를 반환하는 편의성 메소드.
   * @param error
   * @param message
   */
  returnValidateResult(error: boolean, message?: string): ValidateResult {
    return error
      ? ValidateResult.fail(message ?? this.getErrorMessage())
      : ValidateResult.success();
  }
}
