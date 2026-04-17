/*
 *  Copyright (c) "2025". RChemist by RCHEMIST
 *  Licensed under the RCM EULA by RCHEMIST
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License under controlled by RCHEMIST
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React from "react";
import {ContentAsset, ContentAssetError} from "../types";
import {FileUploadInput} from "../../../../ui";
import {TextInput} from "../../../../ui";
import {Textarea} from "../../../../ui";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import {Tooltip} from "../../../../ui";

interface ContentAssetItemUIProps {
  items: ContentAsset[];
  loading: boolean;
  errors: ContentAssetError[];
  titleErrors: {[key: number]: string};
  readonly: boolean;
  canAddMore: boolean;
  isEmpty: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  onUpdateAsset: (index: number, field: keyof ContentAsset, value: any) => void;
  onTitleBlur: (index: number, value: string) => void;
  onTitleChange: (index: number, value: string) => void;
  onContentChange: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
  onFileUpload: (index: number, file: File, onProgress?: (progress: number) => void) => Promise<void>;
  onUploadProgress: (index: number) => (progress: number) => void;
  fieldErrors?: string[];
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
  fieldErrors
}) => {
  // 로딩 중일 때
  if (loading) {
    return <div className="p-4 text-gray-500">로딩 중...</div>;
  }

  // 아이템이 없을 때
  if (isEmpty) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">등록된 컨텐츠가 없습니다.</p>
          {!readonly && canAddMore && (
            <button
              type="button"
              onClick={onAddItem}
              className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              <IconPlus size={16}/>
              <span className="text-sm font-medium">컨텐츠 추가</span>
            </button>
          )}
        </div>
        
        {/* 필드 에러 표시 */}
        {fieldErrors && fieldErrors.length > 0 && (
          <div className="mt-2">
            {fieldErrors.map((error, index) => (
              <p key={index} className="text-red-500 text-sm">{error}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 컨텐츠 목록 */}
      {items.map((item, index) => {
        // 해당 항목의 에러 찾기
        const itemErrors = errors.filter(err => err.index === index);
        const hasError = itemErrors.length > 0 || titleErrors[index];
        
        return (
          <div 
            key={index} 
            className={`border rounded-lg p-4 space-y-3 transition-all ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:shadow-md'
            }`}
          >
            {/* 헤더 영역 - 제목과 삭제 버튼 */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <div onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
                  const target = e.target as HTMLInputElement;
                  if (target.tagName === 'INPUT') {
                    onTitleBlur(index, target.value);
                  }
                }}>
                  <TextInput
                    name={`title_${index}`}
                    value={item.title}
                    onChange={(val) => onTitleChange(index, val)}
                    placeHolder="제목을 입력하세요"
                    readonly={readonly}
                    className={titleErrors[index] ? "border-red-500" : ""}
                  />
                </div>
                {titleErrors[index] && (
                  <p className="mt-1 text-xs text-red-500">{titleErrors[index]}</p>
                )}
              </div>
              
              {/* 삭제 버튼 */}
              {!readonly && (
                <div className="pt-6">
                  <Tooltip label="삭제">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <IconTrash size={20} />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* 설명 영역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 <span className="text-gray-400 text-xs">(선택사항)</span>
              </label>
              <Textarea
                name={`content_${index}`}
                value={item.content || ''}
                onChange={(val) => onContentChange(index, val)}
                placeHolder="부가 설명을 입력하세요"
                readonly={readonly}
                rows={3}
              />
            </div>

            {/* 파일 업로드 영역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                파일 <span className="text-red-500">*</span>
              </label>
              <FileUploadInput
                name={`asset_${index}`}
                value={item.assetUrl || ''}
                onChange={(val: any) => onUpdateAsset(index, 'assetUrl', val)}
                readonly={readonly}
                viewSimple={false}
                config={{
                  maxCount: 1,
                  maxSize: maxFileSize ? maxFileSize / (1024 * 1024) : 10, // bytes to MB
                  extensions: acceptedFileTypes 
                    ? acceptedFileTypes.map(type => type.replace('*', '').replace('.', ''))
                    : ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx']
                }}
              />
              {/* 항목별 에러 표시 */}
              {itemErrors.filter(err => err.field === 'assetUrl').map((err, errIndex) => (
                <p key={errIndex} className="mt-1 text-xs text-red-500">{err.message}</p>
              ))}
            </div>
          </div>
        );
      })}

      {/* 추가 버튼 */}
      {!readonly && canAddMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
          >
            <IconPlus size={16}/>
            <span className="text-sm font-medium">컨텐츠 추가</span>
          </button>
        </div>
      )}

      {/* 필드 에러 표시 */}
      {fieldErrors && fieldErrors.length > 0 && (
        <div className="mt-2">
          {fieldErrors.map((error, index) => (
            <p key={index} className="text-red-500 text-sm">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};