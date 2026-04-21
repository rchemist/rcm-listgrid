'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { RadioChip } from '../../ui';
import { SelectOption } from '../../form/Type';
import { FieldValue } from '../../config/Config';
import { EntityForm } from '../../config/EntityForm';
import { useModalManagerStore } from '../../store';
import { StatusChangeReasonModal } from './StatusChangeReasonModal';
import { showAlert, showConfirm, showSuccess } from '../../message';
import { ValidateResult } from '../../validations/Validation';
import { useLoadingStore } from '../../loading';
import { useRouter } from '../../router';
import { getExternalApiDataWithError, parse } from '../../utils';
import type { ImmediateChangeProps } from './SelectField';

interface StatusReason {
  message: string;
  fieldName: string;
  required?: boolean;
}

interface StatusChangeReason {
  targets?: string[];
  config: StatusReason;
}

interface StatusChangeValidation {
  validate: (entityForm: EntityForm, value: FieldValue) => Promise<ValidateResult>;
  message?: string;
  success?: (entityForm: EntityForm) => Promise<void>;
  fail?: (entityForm: EntityForm) => Promise<void>;
}

interface SelectFieldRendererProps {
  name: string;
  value: FieldValue;
  fetchedValue?: FieldValue | undefined; // 서버에서 가져온 원본 값
  options: SelectOption[];
  onChange: (value: FieldValue) => void;
  entityForm: EntityForm;
  reason?: StatusChangeReason[] | undefined;
  validateStatusChange?: StatusChangeValidation | undefined;
  immediateChangeProps?: ImmediateChangeProps | undefined;
  disabled?: boolean | undefined;
}

export const SelectFieldRenderer: React.FC<SelectFieldRendererProps> = ({
  name,
  value,
  fetchedValue,
  options,
  onChange,
  entityForm,
  reason,
  validateStatusChange,
  immediateChangeProps,
  disabled,
}) => {
  const [selectedValue, setSelectedValue] = useState<FieldValue>(value);
  const [isChanging, setIsChanging] = useState(false);
  const openModal = useModalManagerStore((state) => state.openModal);
  const closeModal = useModalManagerStore((state) => state.closeModal);
  const { setOpenBaseLoading } = useLoadingStore();
  const router = useRouter();

  // 서버에서 가져온 원본 값 (저장된 값)
  // fetchedValue가 없으면 현재 value를 원본으로 사용 (신규 생성 시)
  const originalValue = fetchedValue ?? value;

  // 서버에 저장된 원본 상태의 옵션 찾기 (readonly 체크 및 targets 필터링용)
  // readonly는 "현재 서버에 저장된 상태"가 readonly일 때만 적용되어야 함
  const originalOption = useMemo(() => {
    return options.find((opt) => opt.value === originalValue);
  }, [options, originalValue]);

  // readonly 여부 (disabled prop 또는 원본 상태가 readonly인 경우)
  const isReadonly = disabled || originalOption?.readonly;

  // 선택 가능한 옵션 필터링 (원본 상태 기준으로 이동 가능한 상태들)
  // readonly 상태면 현재 값만 표시
  const availableOptions = useMemo(() => {
    // readonly면 현재 선택된 값만 보여줌
    if (isReadonly) {
      return options.filter((opt) => opt.value === selectedValue);
    }
    if (!originalOption?.targets) {
      return options;
    }
    return options.filter(
      (opt) => opt.value === originalValue || originalOption.targets?.includes(opt.value as string),
    );
  }, [options, originalValue, originalOption, isReadonly, selectedValue]);

  // 변경 버튼 활성화 여부 (원본 값과 비교)
  const isChangeDisabled = useMemo(() => {
    if (disabled || isChanging) return true;
    // 원본 상태가 readonly면 비활성화 (서버에 저장된 상태 기준)
    if (originalOption?.readonly) return true;
    if (selectedValue === originalValue) return true;
    return false;
  }, [disabled, isChanging, originalOption, selectedValue, originalValue]);

  // 해당 상태 변경에 적용할 reason 설정 찾기
  const getReasonConfigForStatusChange = useCallback(
    (targetStatus: FieldValue): StatusReason | null => {
      if (!reason || reason.length === 0) return null;

      // targets가 명시된 설정 찾기
      const specificConfig = reason.find(
        (r) => r.targets && r.targets.includes(String(targetStatus)),
      );

      if (specificConfig) return specificConfig.config;

      // targets가 없는 기본 설정 찾기
      const defaultConfig = reason.find((r) => !r.targets);

      return defaultConfig ? defaultConfig.config : null;
    },
    [reason],
  );

  // 상태 변경 처리 - EntityForm을 거치지 않고 직접 API 호출
  const handleStatusChange = useCallback(
    async (changeReason?: string) => {
      if (isChangeDisabled) return;

      // id가 없으면 상태 변경 불가
      if (!entityForm.id) {
        showAlert({
          title: '상태 변경 실패',
          message: '저장되지 않은 항목의 상태는 변경할 수 없습니다.',
          topLayer: true,
        });
        return;
      }

      setOpenBaseLoading(true);
      setIsChanging(true);

      try {
        // 검증 로직 실행
        if (validateStatusChange) {
          const validationResult = await validateStatusChange.validate(entityForm, selectedValue);
          if (validationResult.error) {
            showAlert({
              title: '상태 변경 실패',
              message:
                validateStatusChange.message ||
                String(validationResult.error) ||
                '상태를 변경할 수 없습니다.',
              topLayer: true,
            });
            if (validateStatusChange.fail) {
              await validateStatusChange.fail(entityForm);
            }
            setOpenBaseLoading(false);
            setIsChanging(false);
            return;
          }
        }

        // 현재 상태 변경에 적용할 reason 설정 가져오기
        const reasonConfig = getReasonConfigForStatusChange(selectedValue);

        // 직접 API 호출을 위한 데이터 구성
        const modifiedFields: string[] = [name];
        const formData: Record<string, any> = {
          id: String(entityForm.id),
          modifiedFields: modifiedFields,
          [name]: selectedValue,
        };

        // requiredFields: EntityForm 표준 검증 경로로 추가 필드 검증/수집
        if (immediateChangeProps?.requiredFields) {
          // hidden이 아닌 필드만 검증 대상 (hidden 필드는 현재 상태에서 사용자에게 보이지 않으므로 검증 불필요)
          const visibleFields: string[] = [];
          for (const fieldName of immediateChangeProps.requiredFields) {
            const field = entityForm.getField(fieldName);
            if (field && !(await field.isHidden({ entityForm }))) {
              visibleFields.push(fieldName);
            }
          }

          // 1단계: EntityForm.validate()로 표시된 필드 검증 (required, pattern, custom validator 등 모두 적용)
          if (visibleFields.length > 0) {
            const fieldErrors = await entityForm.validate({
              fieldNames: visibleFields,
            });
            if (fieldErrors.length > 0) {
              const messages = fieldErrors.flatMap((e) => e.errors).filter(Boolean);
              setOpenBaseLoading(false);
              setIsChanging(false);
              showAlert({
                title: '입력 오류',
                message: messages.join('\n') || '입력 값이 올바르지 않습니다.',
                topLayer: true,
              });
              return;
            }
          }

          // 2단계: 검증 통과 후 값 수집 (getSubmitFormData와 동일한 방식 — isDirty 기준)
          for (const fieldName of immediateChangeProps.requiredFields) {
            const field = entityForm.getField(fieldName);
            if (field && field.isDirty()) {
              const value = await field.getSaveValue(entityForm, 'update');
              formData[fieldName] = value;
              if (!modifiedFields.includes(fieldName)) {
                modifiedFields.push(fieldName);
              }
            }
          }
        }

        // 변경 사유가 있으면 추가
        if (reasonConfig && changeReason) {
          formData[reasonConfig.fieldName] = changeReason;
          if (!modifiedFields.includes(reasonConfig.fieldName)) {
            modifiedFields.push(reasonConfig.fieldName);
          }
        }

        // onSubmit 전처리 콜백
        if (immediateChangeProps?.onSubmit) {
          const result = await immediateChangeProps.onSubmit(entityForm, {
            targetValue: selectedValue,
            formData,
          });
          if (result === false) {
            setOpenBaseLoading(false);
            setIsChanging(false);
            return;
          }
          if (result && typeof result === 'object') {
            Object.entries(result).forEach(([key, val]) => {
              formData[key] = val;
              if (!modifiedFields.includes(key)) {
                modifiedFields.push(key);
              }
            });
          }
        }

        // 직접 PUT 요청
        const targetUrl = `${entityForm.getUrl()}/${entityForm.id}`;
        const response = await getExternalApiDataWithError({
          url: targetUrl,
          method: 'PUT',
          formData: formData,
        });

        setOpenBaseLoading(false);

        if (response.error || !response.data) {
          // EntityForm.save 와 동일한 에러 처리 로직
          let errorMessage = '상태를 변경할 수 없습니다.';

          try {
            let errorObject: any;

            // entityError가 있으면 구조화된 정보 사용
            if (response.entityError) {
              if (
                typeof response.entityError.error === 'object' &&
                response.entityError.error !== null
              ) {
                errorObject = response.entityError.error;
              } else if (typeof response.entityError.error === 'string') {
                errorObject = { message: response.entityError.error };
              } else {
                errorObject = response.entityError;
              }
            } else if (typeof response.error === 'string') {
              // response.error가 문자열인 경우 JSON 파싱 시도
              try {
                const parsed = parse<{ error?: unknown } & Record<string, unknown>>(response.error);
                errorObject = parsed.error ?? parsed;
              } catch (parseError) {
                // JSON이 아닌 단순 문자열인 경우
                errorMessage = response.error;
              }
            }

            if (errorObject) {
              // fieldError가 있는 경우 첫 번째 에러 메시지 사용
              if (errorObject.fieldError) {
                if (errorObject.fieldError instanceof Map && errorObject.fieldError.size > 0) {
                  const firstEntry = errorObject.fieldError.entries().next().value;
                  if (firstEntry && firstEntry[1] && firstEntry[1].length > 0) {
                    errorMessage = firstEntry[1][0];
                  }
                } else if (typeof errorObject.fieldError === 'object') {
                  const entries = Object.entries(errorObject.fieldError);
                  if (entries.length > 0) {
                    const firstErrors = entries[0]![1] as string[];
                    if (firstErrors && firstErrors.length > 0) {
                      errorMessage = firstErrors[0]!;
                    }
                  }
                }
              } else if (errorObject.message) {
                // fieldError가 없으면 message 사용
                errorMessage = errorObject.message;
              }
            }

            // entityError에서 메시지 추출 실패 시 response.error 문자열 사용
            if (
              errorMessage === '상태를 변경할 수 없습니다.' &&
              typeof response.error === 'string' &&
              response.error
            ) {
              errorMessage = response.error;
            }
          } catch (e) {
            console.error('Error processing exception:', response.error, e);
          }

          showAlert({
            title: '상태 변경 실패',
            message: errorMessage,
            topLayer: true,
          });
          if (validateStatusChange?.fail) {
            await validateStatusChange.fail(entityForm);
          }
        } else {
          // 성공 처리
          showSuccess({
            title: '상태 변경 완료',
            message: '상태가 성공적으로 변경되었습니다.',
            topLayer: true,
          });

          // 부모 컴포넌트에 변경 알림
          onChange(selectedValue);

          // 성공 콜백 실행
          if (validateStatusChange?.success) {
            await validateStatusChange.success(entityForm);
          }

          // 페이지 리로드
          window.location.reload();
        }
      } catch (error) {
        console.error('Status change error:', error);
        setOpenBaseLoading(false);
        showAlert({
          title: '상태 변경 오류',
          message: '상태 변경 중 오류가 발생했습니다.',
        });
      } finally {
        setIsChanging(false);
      }
    },
    [
      isChangeDisabled,
      selectedValue,
      name,
      entityForm,
      onChange,
      getReasonConfigForStatusChange,
      validateStatusChange,
      immediateChangeProps,
      setOpenBaseLoading,
      router,
    ],
  );

  // 상태 라벨 가져오기
  const getStatusLabel = useCallback(
    (statusValue: FieldValue): string => {
      const option = options.find((opt) => opt.value === statusValue);
      return option?.label ?? String(statusValue ?? '');
    },
    [options],
  );

  // 변경 버튼 클릭 처리 - 항상 컨펌 모달 표시
  const handleChangeClick = useCallback(() => {
    const reasonConfig = getReasonConfigForStatusChange(selectedValue);
    const currentLabel = getStatusLabel(originalValue);
    const newLabel = getStatusLabel(selectedValue);

    if (reasonConfig) {
      // 변경 사유 입력 모달 열기
      const modalId = openModal({
        title: '상태 변경',
        content: (
          <StatusChangeReasonModal
            currentStatus={originalValue}
            newStatus={selectedValue}
            options={options}
            reason={reasonConfig}
            onConfirm={(changeReason) => {
              closeModal(modalId);
              handleStatusChange(changeReason);
            }}
            onCancel={() => {
              closeModal(modalId);
            }}
          />
        ),
        size: 'md',
      });
    } else {
      // 단순 컨펌 모달 열기
      showConfirm({
        title: `상태를 [${currentLabel}]에서 [${newLabel}](으)로 변경하시겠습니까?`,
        message:
          `<p style="color: #e53e3e; font-size:11pt; margin-bottom: 8px;">※ 주의: 상태만 변경되며, 다른 변경 사항은 저장되지 않습니다.</p>` +
          `<p style="color: #666; font-size:11pt">다른 변경 사항도 함께 저장하려면 상단의 <strong>[저장]</strong> 버튼을 이용해 주세요.</p>`,
        isHtml: true,
        icon: 'warning',
        confirmButtonText: '변경',
        cancelButtonText: '취소',
        topLayer: true,
        onConfirm: () => {
          handleStatusChange();
        },
      });
    }
  }, [
    getReasonConfigForStatusChange,
    getStatusLabel,
    selectedValue,
    originalValue,
    options,
    handleStatusChange,
    openModal,
    closeModal,
  ]);

  // RadioChip 값 변경 처리
  // 상위 EntityForm에 전파하여 isDirty 체크 가능하게 함
  // 변경 버튼은 originalValue와 비교하므로 onChange 호출해도 버튼 활성화 유지됨
  const handleSelectChange = useCallback(
    (newValue: FieldValue) => {
      setSelectedValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  // 값이 변경되었는지 여부 (원본 값과 비교)
  const hasChanged = selectedValue !== originalValue;

  return (
    <div className="rcm-select-renderer-wrap">
      <RadioChip
        name={name}
        value={selectedValue}
        options={availableOptions}
        onChange={handleSelectChange}
        readonly={isReadonly}
      />
      {hasChanged && (
        <button
          type="button"
          className={`
            inline-flex items-center justify-center space-x-1
            h-9 min-w-[80px] px-3
            rounded-md
            text-sm font-semibold
            border
            whitespace-nowrap shrink-0
            transition-all duration-150 ease-in-out
            ${
              isChangeDisabled
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-primary text-white border-primary hover:bg-primary/90 shadow-sm cursor-pointer'
            }
          `}
          onClick={handleChangeClick}
          disabled={isChangeDisabled}
        >
          {isChanging ? (
            <svg
              className="animate-spin w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          <span>변경</span>
        </button>
      )}
    </div>
  );
};
