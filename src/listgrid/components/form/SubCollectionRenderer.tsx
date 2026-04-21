'use client';

import { SubCollectionField } from '../../config/SubCollectionField';
import React, { ReactNode, useEffect, useState } from 'react';
import { EntityForm } from '../../config/EntityForm';
import { LabelType } from '../../config/Config';
import { getTranslation } from '../../utils/i18n';
import { LoadingOverlay } from '../../ui';
import { ViewHelpText } from './ui/ViewHelpText';
import { isTrue } from '../../utils/BooleanUtil';
import { Session } from '../../auth/types';

/**
 * SubCollectionRenderer component
 * - Renders a sub-collection field in EntityForm, including label, help text, and loading state.
 * - Handles async rendering and label translation.
 *
 * SubCollectionRenderer 컴포넌트
 * - EntityForm의 서브콜렉션 필드를 렌더링합니다. (라벨, 도움말, 로딩 상태 포함)
 * - 비동기 렌더링 및 라벨 번역을 처리합니다.
 *
 * @param props {SubCollectionRendererProps} - 서브콜렉션, EntityForm, 세션 등
 * @returns {JSX.Element} - 렌더링 결과
 */
interface SubCollectionRendererProps {
  collection: SubCollectionField; // 렌더링할 서브콜렉션 필드
  entityForm: EntityForm; // EntityForm 인스턴스
  session?: Session; // 세션 정보
}

export const SubCollectionRenderer = ({
  collection,
  entityForm,
  session,
}: SubCollectionRendererProps) => {
  const { t } = getTranslation();

  // 서브콜렉션 렌더링, 마운트 상태, 도움말 상태
  // State for sub-collection view, mounted state, and help text
  const [view, setView] = useState<ReactNode>(null);
  const [mounted, setMounted] = useState(false);
  const [helpText, setHelpText] = useState<ReactNode>(null);

  useEffect(() => {
    if (!mounted) {
      (async () => {
        // 서브콜렉션 렌더링 및 도움말 비동기 조회
        // Async fetch for sub-collection view and help text
        const params = { entityForm, ...(session !== undefined ? { session } : {}) };
        setView(await collection.render(params));
        setHelpText(await collection.getHelpText(params));
        setMounted(true);
      })();
    }
  }, []);

  const label = collection.getLabel();
  const hideLabel = isTrue(collection.hideLabel);

  // 마운트 전에는 로딩 오버레이 표시
  // Show loading overlay before mount
  if (!mounted) {
    return (
      <div className={'relative'}>
        <LoadingOverlay visible={true} />
        <div className={'w-full h-[400px]'}></div>
      </div>
    );
  }

  return (
    <div>
      {/* 라벨 렌더링: 숨김 설정이 아니면 표시 */}
      {/* Render label: show unless hideLabel is true */}
      {!hideLabel && (
        <div>
          <label>{viewLabel(label)}</label>
        </div>
      )}
      {/* 서브콜렉션 뷰 렌더링 */}
      {/* Render sub-collection view */}
      <div>{view}</div>
      {/* 도움말 텍스트 렌더링 */}
      {/* Render help text */}
      <ViewHelpText helpText={helpText}></ViewHelpText>
    </div>
  );

  /**
   * viewLabel
   * - 라벨이 string이면 번역, 아니면 그대로 반환
   * - If label is string, translate; otherwise, return as is
   */
  function viewLabel(label: LabelType) {
    if (typeof label === 'string') {
      return t(label);
    }
    return label;
  }
};
