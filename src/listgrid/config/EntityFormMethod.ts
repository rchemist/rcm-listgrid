import { IEntityError } from '../api';
import { isTrue } from '../utils/BooleanUtil';
import { FieldError } from './EntityFormTypes';
import { parse } from '../utils/jsonUtils';
import { EntityForm } from './EntityForm';

export function entityErrorToString(entityError: IEntityError): string {
  if (entityError.error) {
    if (isTrue(entityError.error.error)) {
      if (entityError.error.fieldError) {
        const entries =
          entityError.error.fieldError instanceof Map
            ? Array.from(entityError.error.fieldError.entries())
            : Object.entries(entityError.error.fieldError);
        return entries
          .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
          .join(', ');
      }
      if (entityError.error.message) {
        return entityError.error.message;
      }
    }
  }

  return 'failed to parse error';
}

export function mergeFieldErrors(origin: FieldError[], errors: FieldError[]): FieldError[] {
  const mergedMap: Map<string, FieldError> = new Map();

  // 먼저 origin 배열의 필드 오류들을 Map에 추가
  for (const error of origin) {
    mergedMap.set(error.name, { ...error });
  }

  // errors 배열을 순회하며 병합
  for (const error of errors) {
    if (mergedMap.has(error.name)) {
      // 기존 오류가 있을 경우 errors 배열을 병합
      const existingError = mergedMap.get(error.name)!;
      mergedMap.set(error.name, {
        ...existingError,
        errors: Array.from(new Set([...existingError.errors, ...error.errors])), // 중복 제거
        tabId: existingError.tabId || error.tabId, // tabId가 없으면 새로 할당
      });
    } else {
      // 기존 오류가 없으면 새로 추가
      mergedMap.set(error.name, { ...error });
    }
  }

  // Map을 배열로 변환하여 반환
  return Array.from(mergedMap.values());
}

interface ApiErrorResponse {
  error?: string | { message?: string; fieldError?: unknown } | unknown;
  entityError?: { error?: string | { message?: string; fieldError?: unknown } };
}

/**
 * API 응답 에러를 처리하고 필드 에러와 글로벌 에러를 추출합니다.
 * EntityForm의 save 메소드에서 사용하는 에러 처리 로직을 재사용 가능하도록 추출한 함수입니다.
 *
 * @param response - API 응답 객체 (error, entityError 포함 가능)
 * @param form - 필드 라벨을 가져오기 위한 EntityForm (optional)
 * @returns 처리된 에러 정보
 */
export function processApiError(
  response: ApiErrorResponse,
  form?: EntityForm,
): {
  fieldErrors: FieldError[];
  globalError?: string | undefined;
  hasError: boolean;
} {
  const fieldErrors: FieldError[] = [];
  let globalError: string | undefined;
  let jsonError = false;

  if (response.error) {
    try {
      // intentional: errorObject has heterogeneous shape depending on backend error variant
      let errorObject: any;

      // entityError가 있으면 구조화된 정보 사용
      if (response.entityError) {
        // entityError.error가 객체인지 문자열인지 확인
        if (typeof response.entityError.error === 'object' && response.entityError.error !== null) {
          errorObject = response.entityError.error;
        } else if (typeof response.entityError.error === 'string') {
          // 문자열인 경우 message로 설정
          errorObject = { message: response.entityError.error };
        } else {
          // entityError 전체를 사용
          errorObject = response.entityError;
        }
        jsonError = true;
      } else if (typeof response.error === 'string') {
        // response.error가 문자열인 경우 JSON 파싱 시도
        try {
          const parsed = parse<{ error?: unknown } & Record<string, unknown>>(response.error);
          errorObject = parsed.error ?? parsed;
          jsonError = true;
        } catch (parseError) {
          // JSON이 아닌 단순 문자열인 경우
          globalError = response.error;
          jsonError = false;
        }
      } else {
        // response.error가 객체인 경우
        errorObject = response.error;
      }

      if (errorObject) {
        // 필드 에러 처리
        if (errorObject.fieldError) {
          // Map인 경우와 일반 객체인 경우 모두 처리
          if (errorObject.fieldError instanceof Map) {
            errorObject.fieldError.forEach((fieldError: string[], fieldName: string) => {
              const label = form?.getLabel(fieldName) ?? '저장 오류';
              fieldErrors.push({ name: fieldName, label: label, errors: fieldError });
            });
          } else if (typeof errorObject.fieldError === 'object') {
            Object.entries(errorObject.fieldError).forEach(([fieldName, fieldError]) => {
              const label = form?.getLabel(fieldName) ?? '저장 오류';
              fieldErrors.push({ name: fieldName, label: label, errors: fieldError as string[] });
            });
          }
        }

        // 글로벌 에러 메시지 처리
        if (!globalError && errorObject.message) {
          globalError = errorObject.message;
          jsonError = true;
        }
      }
    } catch (e) {
      // 에러가 json 타입이 아니라면 실제 시스템 에러다.
      console.error('Error processing exception:', response.error, e);
    }
  }

  // 에러 메시지 결정
  let errorMessage: string | undefined;
  let hasError: boolean;

  if (fieldErrors.length > 0) {
    // 필드 에러가 있으면 일반 에러 메시지는 표시하지 않지만, 에러 상태임은 표시
    errorMessage = undefined;
    hasError = true;
  } else {
    // 필드 에러가 없을 때만 일반 에러 메시지 표시
    errorMessage =
      (!jsonError
        ? typeof response.error === 'string'
          ? response.error
          : undefined
        : globalError
          ? globalError
          : undefined) ?? '저장 중 오류가 발생했습니다.';
    hasError = true;
  }

  return {
    fieldErrors,
    globalError: errorMessage,
    hasError,
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
