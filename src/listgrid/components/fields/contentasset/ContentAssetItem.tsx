'use client';

import React, { useCallback } from 'react';
import { InputRendererProps } from '../../../config/Config';
import { EntityForm } from '../../../config/EntityForm';
import { Session } from '../../../auth/types';
import { useContentAsset } from './hooks/useContentAsset';
import { ContentAssetItemUI } from './components/ContentAssetItemUI';
import { AddContentDialog } from './components/AddContentDialog';
import { useModalManagerStore } from '../../../store';

interface ContentAssetItemProps extends InputRendererProps {
  entityForm: EntityForm;
  session?: Session;
  maxItems?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

/**
 * ContentAssetItem
 * ContentAssetField의 메인 렌더링 컴포넌트
 */
export const ContentAssetItem: React.FC<ContentAssetItemProps> = (props) => {
  const {
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
    canAddMore,
    isEmpty,
    isReadonly,
  } = useContentAsset({
    value: props.value,
    onChange: props.onChange,
    onError: props.onError,
    clearError: props.clearError,
    entityForm: props.entityForm,
    maxItems: props.maxItems,
    readonly: props.readonly,
  });

  // GlobalModalManager 사용
  const { openModal } = useModalManagerStore();

  // readonly 상태 확인
  const readonly = isReadonly || props.readonly;

  // 항목 추가 - 다이얼로그 열기
  const handleAddItem = useCallback(() => {
    openModal({
      title: '컨텐츠 추가',
      size: 'sm',
      content: (
        <AddContentDialog
          onAdd={(title: string, content?: string) => {
            // 새 항목 추가
            handleAddAsset();
            // 추가된 항목의 인덱스는 현재 길이
            const newIndex = assets.length;
            // 제목과 내용 설정
            handleUpdateAsset(newIndex, 'title', title);
            if (content) {
              handleUpdateAsset(newIndex, 'content', content);
            }
          }}
          existingTitles={assets.map((asset) => asset.title)}
        />
      ),
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  }, [openModal, handleAddAsset, handleUpdateAsset, assets]);

  // Title 변경 핸들러
  const handleTitleChange = useCallback(
    (index: number, value: string) => {
      handleUpdateAsset(index, 'title', value);
      // 타이핑 중에는 에러 제거
      if (titleErrors[index]) {
        setTitleErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    },
    [handleUpdateAsset, titleErrors, setTitleErrors],
  );

  // Content 변경 핸들러
  const handleContentChange = useCallback(
    (index: number, value: string) => {
      handleUpdateAsset(index, 'content', value);
    },
    [handleUpdateAsset],
  );

  // 파일 업로드 진행률 핸들러
  const handleUploadProgress = useCallback(
    (_index: number) => (_progress: number) => {
      // TODO: 진행률 UI 업데이트
    },
    [],
  );

  return (
    <ContentAssetItemUI
      items={assets}
      loading={loading}
      errors={errors}
      titleErrors={titleErrors}
      readonly={readonly || false}
      canAddMore={canAddMore}
      isEmpty={isEmpty}
      acceptedFileTypes={props.acceptedFileTypes}
      maxFileSize={props.maxFileSize}
      onUpdateAsset={handleUpdateAsset}
      onTitleBlur={handleTitleBlur}
      onTitleChange={handleTitleChange}
      onContentChange={handleContentChange}
      onRemoveItem={handleRemoveAsset}
      onAddItem={handleAddItem}
      onFileUpload={handleFileUpload}
      onUploadProgress={handleUploadProgress}
      fieldErrors={props.errors}
    />
  );
};
