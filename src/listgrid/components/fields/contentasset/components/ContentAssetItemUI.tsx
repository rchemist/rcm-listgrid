import React from 'react';
import { ContentAsset, ContentAssetError } from '../types';
import { FileUploadInput } from '../../../../ui';
import { TextInput } from '../../../../ui';
import { Textarea } from '../../../../ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Tooltip } from '../../../../ui';

interface ContentAssetItemUIProps {
  items: ContentAsset[];
  loading: boolean;
  errors: ContentAssetError[];
  titleErrors: { [key: number]: string };
  readonly: boolean;
  canAddMore: boolean;
  isEmpty: boolean;
  acceptedFileTypes?: string[] | undefined;
  maxFileSize?: number | undefined;
  onUpdateAsset: (index: number, field: keyof ContentAsset, value: any) => void;
  onTitleBlur: (index: number, value: string) => void;
  onTitleChange: (index: number, value: string) => void;
  onContentChange: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
  onFileUpload: (
    index: number,
    file: File,
    onProgress?: (progress: number) => void,
  ) => Promise<void>;
  onUploadProgress: (index: number) => (progress: number) => void;
  fieldErrors?: string[] | undefined;
}

/**
 * ContentAssetItemUI
 * ContentAsset 항목들의 UI 렌더링 컴포넌트
 */
export const ContentAssetItemUI: React.FC<ContentAssetItemUIProps> = ({
  items,
  loading,
  errors,
  titleErrors,
  readonly,
  canAddMore,
  isEmpty,
  acceptedFileTypes,
  maxFileSize,
  onUpdateAsset,
  onTitleBlur,
  onTitleChange,
  onContentChange,
  onRemoveItem,
  onAddItem,
  onFileUpload,
  onUploadProgress,
  fieldErrors,
}) => {
  // 로딩 중일 때
  if (loading) {
    return (
      <div className="rcm-ca-loading">
        <span className="rcm-text" data-tone="muted">
          로딩 중...
        </span>
      </div>
    );
  }

  // 아이템이 없을 때
  if (isEmpty) {
    return (
      <div className="rcm-ca-wrap">
        <div className="rcm-ca-empty">
          <p className="rcm-text" data-tone="muted">
            등록된 컨텐츠가 없습니다.
          </p>
          {!readonly && canAddMore && (
            <button type="button" onClick={onAddItem} className="rcm-ca-add-btn">
              <IconPlus size={16} />
              <span>컨텐츠 추가</span>
            </button>
          )}
        </div>

        {fieldErrors && fieldErrors.length > 0 && (
          <div className="rcm-ca-errors">
            {fieldErrors.map((error, index) => (
              <p key={index} className="rcm-text" data-color="error" data-size="sm">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rcm-ca-wrap">
      {items.map((item, index) => {
        const itemErrors = errors.filter((err) => err.index === index);
        const hasError = itemErrors.length > 0 || titleErrors[index];

        return (
          <div key={index} className={`rcm-ca-item ${hasError ? 'rcm-ca-item-error' : ''}`}>
            <div className="rcm-ca-item-header">
              <div className="rcm-ca-item-title-col">
                <label className="rcm-label">
                  제목{' '}
                  <span className="rcm-text" data-color="error">
                    *
                  </span>
                </label>
                <div
                  onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
                    const target = e.target as HTMLInputElement;
                    if (target.tagName === 'INPUT') {
                      onTitleBlur(index, target.value);
                    }
                  }}
                >
                  <TextInput
                    name={`title_${index}`}
                    value={item.title}
                    onChange={(val: string) => onTitleChange(index, val)}
                    placeHolder="제목을 입력하세요"
                    readonly={readonly}
                    className={titleErrors[index] ? 'rcm-ca-input-error' : ''}
                  />
                </div>
                {titleErrors[index] && (
                  <p className="rcm-text" data-color="error" data-size="sm">
                    {titleErrors[index]}
                  </p>
                )}
              </div>

              {!readonly && (
                <div className="rcm-ca-item-remove-wrap">
                  <Tooltip label="삭제">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="rcm-icon-btn"
                      data-size="md"
                      data-color="error"
                    >
                      <IconTrash className="rcm-icon" data-size="lg" />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>

            <div>
              <label className="rcm-label">
                설명{' '}
                <span className="rcm-text" data-tone="muted" data-size="xs">
                  (선택사항)
                </span>
              </label>
              <Textarea
                name={`content_${index}`}
                value={item.content || ''}
                onChange={(val: string) => onContentChange(index, val)}
                placeHolder="부가 설명을 입력하세요"
                readonly={readonly}
                rows={3}
              />
            </div>

            <div>
              <label className="rcm-label">
                파일{' '}
                <span className="rcm-text" data-color="error">
                  *
                </span>
              </label>
              <FileUploadInput
                name={`asset_${index}`}
                value={item.assetUrl || ''}
                onChange={(val: any) => onUpdateAsset(index, 'assetUrl', val)}
                readonly={readonly}
                viewSimple={false}
                config={{
                  maxCount: 1,
                  maxSize: maxFileSize ? maxFileSize / (1024 * 1024) : 10,
                  extensions: acceptedFileTypes
                    ? acceptedFileTypes.map((type) => type.replace('*', '').replace('.', ''))
                    : ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
                }}
              />
              {itemErrors
                .filter((err) => err.field === 'assetUrl')
                .map((err, errIndex) => (
                  <p key={errIndex} className="rcm-text" data-color="error" data-size="sm">
                    {err.message}
                  </p>
                ))}
            </div>
          </div>
        );
      })}

      {!readonly && canAddMore && (
        <div className="rcm-ca-add-btn-row">
          <button type="button" onClick={onAddItem} className="rcm-ca-add-btn">
            <IconPlus size={16} />
            <span>컨텐츠 추가</span>
          </button>
        </div>
      )}

      {fieldErrors && fieldErrors.length > 0 && (
        <div className="rcm-ca-errors">
          {fieldErrors.map((error, index) => (
            <p key={index} className="rcm-text" data-color="error" data-size="sm">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
