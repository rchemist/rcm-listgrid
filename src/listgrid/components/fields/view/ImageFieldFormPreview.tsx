'use client';

import React, { useCallback, useEffect, useState } from 'react';

export interface ImageFieldFormPreviewProps {
  /** 표시할 이미지 URL (외부 절대 URL 또는 자체 asset URL). */
  imageUrl: string;
  /** 한 변 크기 (가로 = 세로). number 는 px, string 은 CSS 길이값으로 적용. */
  previewSize?: number | string | undefined;
  /** 로드 실패 시 대체 이미지 URL. */
  fallbackUrl?: string | undefined;
  /** 미리보기 하단에 함께 노출할 요소 (예: 업로드 입력). */
  children?: React.ReactNode;
}

/**
 * Form-view 용 이미지 미리보기.
 * 기본 8rem 정사각형 썸네일을 렌더링하고, 클릭 시 모달로 원본을 확대 표시한다
 * (배경 클릭 또는 ESC 로 닫힘).
 */
export function ImageFieldFormPreview({
  imageUrl,
  previewSize,
  fallbackUrl,
  children,
}: ImageFieldFormPreviewProps) {
  const [zoomed, setZoomed] = useState(false);

  const close = useCallback(() => setZoomed(false), []);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoomed, close]);

  const sizeStyle: React.CSSProperties = previewSize
    ? {
        width: typeof previewSize === 'number' ? `${previewSize}px` : previewSize,
        height: typeof previewSize === 'number' ? `${previewSize}px` : previewSize,
      }
    : {};

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackUrl) {
      event.currentTarget.src = fallbackUrl;
    }
  };

  return (
    <div className="rcm-image-field-form">
      <button
        type="button"
        className="rcm-image-field-form-preview-trigger"
        onClick={() => setZoomed(true)}
        aria-label="이미지 확대 보기"
      >
        <img
          className="rcm-image-field-form-preview"
          src={imageUrl}
          alt="preview"
          style={sizeStyle}
          onError={handleError}
        />
      </button>
      {children ? <div className="rcm-image-field-form-actions">{children}</div> : null}
      {zoomed && (
        <div
          className="rcm-image-field-zoom-backdrop"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 확대 보기"
        >
          <img
            className="rcm-image-field-zoom-image"
            src={imageUrl}
            alt="enlarged"
            onClick={(e) => e.stopPropagation()}
            onError={handleError}
          />
        </div>
      )}
    </div>
  );
}
