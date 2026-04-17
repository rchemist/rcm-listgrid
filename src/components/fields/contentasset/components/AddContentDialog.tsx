'use client';

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

import React, {useCallback, useState} from "react";
import {TextInput} from "@gjcu/ui/form/TextInput";
import {Textarea} from "@gjcu/ui/form/Textarea";
import {useModalManagerStore} from '../../../../../store';

interface AddContentDialogProps {
  onAdd: (title: string, content?: string) => void;
  existingTitles: string[];
}

/**
 * AddContentDialog
 * ContentAsset 항목 추가를 위한 다이얼로그 컴포넌트
 */
export const AddContentDialog: React.FC<AddContentDialogProps> = ({
  onAdd,
  existingTitles
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState("");
  
  const { closeTopModal } = useModalManagerStore();

  // 제목 유효성 검사
  const validateTitle = useCallback((value: string): string => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return "제목은 필수 입력 항목입니다.";
    }
    
    // 중복 검사 (대소문자 구분 없이)
    const titleLower = trimmedValue.toLowerCase();
    const isDuplicate = existingTitles.some(
      existing => existing.toLowerCase() === titleLower
    );
    
    if (isDuplicate) {
      return "동일한 제목이 이미 존재합니다.";
    }
    
    return "";
  }, [existingTitles]);

  // 제목 변경 핸들러
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    // 타이핑 중에는 에러 메시지 제거
    if (titleError) {
      setTitleError("");
    }
  }, [titleError]);

  // 제목 블러 핸들러
  const handleTitleBlur = useCallback(() => {
    const error = validateTitle(title);
    setTitleError(error);
  }, [title, validateTitle]);

  // 추가 버튼 핸들러
  const handleAdd = useCallback(() => {
    // 제목 유효성 검사
    const error = validateTitle(title);
    if (error) {
      setTitleError(error);
      return;
    }
    
    // 콜백 호출
    onAdd(title.trim(), content.trim() || undefined);
    
    // 모달 닫기
    closeTopModal();
  }, [title, content, validateTitle, onAdd, closeTopModal]);

  // 취소 버튼 핸들러
  const handleCancel = useCallback(() => {
    closeTopModal();
  }, [closeTopModal]);

  // Enter 키 핸들러
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  }, [handleAdd]);

  return (
    <div className="space-y-4">
      {/* 제목 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <div onBlur={handleTitleBlur} onKeyPress={handleKeyPress}>
          <TextInput
            name="title"
            value={title}
            onChange={handleTitleChange}
            placeHolder="제목을 입력하세요"
            className={titleError ? "border-red-500" : ""}
          />
        </div>
        {titleError && (
          <p className="mt-1 text-xs text-red-500">{titleError}</p>
        )}
      </div>

      {/* 설명 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명 <span className="text-gray-400 text-xs">(선택사항)</span>
        </label>
        <Textarea
          name="content"
          value={content}
          onChange={setContent}
          placeHolder="부가 설명을 입력하세요"
          rows={3}
        />
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!title.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          추가
        </button>
      </div>
    </div>
  );
};
