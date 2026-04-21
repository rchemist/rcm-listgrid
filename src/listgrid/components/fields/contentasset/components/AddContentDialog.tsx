'use client';

import React, { useCallback, useState } from 'react';
import { TextInput } from '../../../../ui';
import { Textarea } from '../../../../ui';
import { useModalManagerStore } from '../../../../store';

interface AddContentDialogProps {
  onAdd: (title: string, content?: string) => void;
  existingTitles: string[];
}

/**
 * AddContentDialog
 * ContentAsset 항목 추가를 위한 다이얼로그 컴포넌트
 */
export const AddContentDialog: React.FC<AddContentDialogProps> = ({ onAdd, existingTitles }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');

  const { closeTopModal } = useModalManagerStore();

  // 제목 유효성 검사
  const validateTitle = useCallback(
    (value: string): string => {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        return '제목은 필수 입력 항목입니다.';
      }

      // 중복 검사 (대소문자 구분 없이)
      const titleLower = trimmedValue.toLowerCase();
      const isDuplicate = existingTitles.some((existing) => existing.toLowerCase() === titleLower);

      if (isDuplicate) {
        return '동일한 제목이 이미 존재합니다.';
      }

      return '';
    },
    [existingTitles],
  );

  // 제목 변경 핸들러
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      // 타이핑 중에는 에러 메시지 제거
      if (titleError) {
        setTitleError('');
      }
    },
    [titleError],
  );

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
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd],
  );

  return (
    <div className="rcm-ca-dialog">
      <div>
        <label className="rcm-label">
          제목{' '}
          <span className="rcm-text" data-color="error">
            *
          </span>
        </label>
        <div onBlur={handleTitleBlur} onKeyPress={handleKeyPress}>
          <TextInput
            name="title"
            value={title}
            onChange={handleTitleChange}
            placeHolder="제목을 입력하세요"
            className={titleError ? 'rcm-ca-input-error' : ''}
          />
        </div>
        {titleError && (
          <p className="rcm-text" data-color="error" data-size="sm">
            {titleError}
          </p>
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
          name="content"
          value={content}
          onChange={setContent}
          placeHolder="부가 설명을 입력하세요"
          rows={3}
        />
      </div>

      <div className="rcm-ca-dialog-footer">
        <button type="button" onClick={handleCancel} className="rcm-button" data-variant="outline">
          취소
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!title.trim()}
          className="rcm-button"
          data-variant="primary"
        >
          추가
        </button>
      </div>
    </div>
  );
};
