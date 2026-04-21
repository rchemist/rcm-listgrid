'use client';

import { useCallback, useEffect, useState } from 'react';
import { ContentAsset, ContentAssetError, validateContentAssets } from '../types';
import { EntityForm } from '../../../../config/EntityForm';

interface UseContentAssetProps {
  value: ContentAsset[] | undefined;
  onChange: (value: ContentAsset[]) => void;
  onError?: ((message: string) => void) | undefined;
  clearError?: (() => void) | undefined;
  entityForm: EntityForm;
  maxItems?: number | undefined;
  readonly?: boolean | undefined;
}

/**
 * ContentAsset 상태 관리 훅
 * 범용적인 파일 업로드 및 관리를 위한 상태 관리
 */
export const useContentAsset = ({
  value: initialValue,
  onChange,
  onError,
  clearError,
  entityForm,
  maxItems,
  readonly = false,
}: UseContentAssetProps) => {
  // 초기값 설정 - 빈 배열로 시작
  const [assets, setAssets] = useState<ContentAsset[]>(() => {
    return initialValue || [];
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ContentAssetError[]>([]);
  const [titleErrors, setTitleErrors] = useState<{ [key: number]: string }>({});

  // props.value 변경 시 상태 업데이트
  useEffect(() => {
    if (initialValue && JSON.stringify(initialValue) !== JSON.stringify(assets)) {
      setAssets(initialValue);
    }
  }, [initialValue]); // assets는 의존성에서 제거 (무한 루프 방지)

  // 자산 추가
  const handleAddAsset = useCallback(() => {
    // 최대 항목 수 체크
    if (maxItems && assets.length >= maxItems) {
      if (onError) {
        onError(`최대 ${maxItems}개까지만 추가할 수 있습니다.`);
      }
      return;
    }

    const newAsset: ContentAsset = {
      title: '',
      content: '',
      assetUrl: '',
    };

    const newAssets = [...assets, newAsset];
    setAssets(newAssets);
    onChange(newAssets);

    if (clearError) {
      clearError();
    }
  }, [assets, maxItems, onChange, onError, clearError]);

  // 자산 삭제
  const handleRemoveAsset = useCallback(
    (index: number) => {
      const newAssets = assets.filter((_, i) => i !== index);
      setAssets(newAssets);
      onChange(newAssets);

      // titleErrors 재정렬
      const newTitleErrors: { [key: number]: string } = {};
      Object.keys(titleErrors).forEach((key) => {
        const oldIndex = parseInt(key);
        const err = titleErrors[oldIndex];
        if (err === undefined) return;
        if (oldIndex < index) {
          newTitleErrors[oldIndex] = err;
        } else if (oldIndex > index) {
          newTitleErrors[oldIndex - 1] = err;
        }
      });
      setTitleErrors(newTitleErrors);

      // 유효성 재검사
      const validation = validateContentAssets(newAssets);
      setErrors(validation.errors);

      if (clearError) {
        clearError();
      }
    },
    [assets, titleErrors, onChange, clearError],
  );

  // 자산 업데이트
  const handleUpdateAsset = useCallback(
    (index: number, field: keyof ContentAsset, value: any) => {
      const newAssets = [...assets];
      newAssets[index] = {
        ...newAssets[index]!,
        [field]: value,
      };

      setAssets(newAssets);
      onChange(newAssets);

      // title 변경 시 중복 검사는 handleTitleBlur에서 처리
      if (field !== 'title') {
        // 유효성 검사
        const validation = validateContentAssets(newAssets);
        setErrors(validation.errors);

        if (validation.errors.length > 0 && onError) {
          const firstError = validation.errors[0]!;
          onError(firstError.message);
        } else if (clearError) {
          clearError();
        }
      }
    },
    [assets, onChange, onError, clearError],
  );

  // 제목 필드 blur 시 중복 검증
  const handleTitleBlur = useCallback(
    (index: number, value: string) => {
      const trimmedValue = value.trim();

      // 빈 값 체크
      if (!trimmedValue) {
        setTitleErrors((prev) => ({
          ...prev,
          [index]: '제목을 입력해주세요.',
        }));
        return;
      }

      // 중복 체크 - 자기 자신을 제외한 다른 모든 제목과 비교
      const otherTitles = assets.filter((_, i) => i !== index).map((asset) => asset.title.trim());

      // 대소문자 구분 없이 비교
      const titleLower = trimmedValue.toLowerCase();
      const isDuplicate = otherTitles.some((title) => title.toLowerCase() === titleLower);

      if (isDuplicate) {
        setTitleErrors((prev) => ({
          ...prev,
          [index]: '동일한 제목이 이미 존재합니다.',
        }));
      } else {
        // 검증 통과 - 에러 제거
        setTitleErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    },
    [assets],
  );

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback(
    async (
      index: number,
      file: File,
      onUploadProgress?: (progress: number) => void,
    ): Promise<void> => {
      setLoading(true);

      try {
        // TODO: 실제 파일 업로드 로직 구현
        // 현재는 임시로 로컬 URL 생성
        const fileUrl = URL.createObjectURL(file);

        // 진행률 시뮬레이션 (실제 구현시 제거)
        if (onUploadProgress) {
          for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            onUploadProgress(i);
          }
        }

        handleUpdateAsset(index, 'assetUrl', fileUrl);

        if (clearError) {
          clearError();
        }
      } catch (error) {
        if (onError) {
          onError('파일 업로드 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    },
    [handleUpdateAsset, onError, clearError],
  );

  // 전체 유효성 검사
  const validateAll = useCallback((): boolean => {
    const validation = validateContentAssets(assets);
    setErrors(validation.errors);

    // 제목 에러도 함께 체크
    const hasTitleErrors = Object.keys(titleErrors).length > 0;

    if (!validation.isValid || hasTitleErrors) {
      if (onError) {
        if (validation.errors.length > 0) {
          onError(validation.errors[0]!.message);
        } else if (hasTitleErrors) {
          const firstErrorIndex = Object.keys(titleErrors)[0]!;
          onError(titleErrors[parseInt(firstErrorIndex)]!);
        }
      }
      return false;
    }

    return true;
  }, [assets, titleErrors, onError]);

  return {
    assets,
    loading,
    errors,
    titleErrors,
    setTitleErrors,
    handleAddAsset,
    handleRemoveAsset,
    handleUpdateAsset,
    handleTitleBlur,
    handleFileUpload,
    validateAll,
    canAddMore: !maxItems || assets.length < maxItems,
    isEmpty: assets.length === 0,
    isReadonly: readonly,
  };
};
