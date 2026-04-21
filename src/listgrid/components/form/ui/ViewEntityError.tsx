'use client';

import { FieldError } from '../../../config/EntityFormTypes';
import { EntityForm } from '../../../config/EntityForm';
import { isEmpty } from '../../../utils';
import React, { ReactNode, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconInfoTriangle } from '@tabler/icons-react';
import { getTranslation } from '../../../utils/i18n';

interface ViewEntityErrorProps {
  errors?: Map<string, FieldError[]>;
  onTabChange?: (tabIndex: number) => void;
  tabs?: Array<{ id: string; label: string }>;
  entityForm?: EntityForm;
}

export const ViewEntityError = (props: ViewEntityErrorProps) => {
  const { t } = getTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (props.errors === undefined || isEmpty(props.errors) || props.errors.size === 0) return null;

  const totalErrorCount = Array.from(props.errors.values()).reduce(
    (sum, errors) => sum + errors.length,
    0,
  );

  // 탭 이름으로 탭 인덱스를 찾는 함수
  const findTabIndexByLabel = (tabLabel: string): number => {
    if (!props.tabs) return -1;
    return props.tabs.findIndex((tab) => tab.label === tabLabel);
  };

  // 에러 클릭 시 해당 탭으로 이동하는 함수
  const handleErrorClick = (tabLabel: string) => {
    const tabIndex = findTabIndexByLabel(tabLabel);
    if (tabIndex !== -1 && props.onTabChange) {
      props.onTabChange(tabIndex);
    }
  };

  // 필드 링크 클릭 시 탭 전환 및 스크롤 처리
  const handleFieldClick = (error: FieldError, tabLabel: string) => {
    // 해당 필드가 속한 탭 찾기
    const fieldTabId = error.tabId;
    let targetTabIndex = -1;

    if (props.tabs && fieldTabId) {
      // 탭 ID로 탭 인덱스 찾기
      targetTabIndex = props.tabs.findIndex((tab) => tab.id === fieldTabId);
    }

    // 탭 전환이 필요한 경우
    if (targetTabIndex !== -1 && props.onTabChange) {
      props.onTabChange(targetTabIndex);

      // 탭 전환 후 필드로 스크롤하기 위해 약간의 지연 후 스크롤
      setTimeout(() => {
        const fieldElement = document.querySelector(`[data-field-name="${error.name}"]`);
        if (fieldElement) {
          fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // 필드에 포커스 효과 추가
          fieldElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
          setTimeout(() => {
            fieldElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
          }, 2000);
        }
      }, 100);
    } else {
      // 현재 탭의 필드인 경우 바로 스크롤
      const fieldElement = document.querySelector(`[data-field-name="${error.name}"]`);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 필드에 포커스 효과 추가
        fieldElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
        setTimeout(() => {
          fieldElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
        }, 2000);
      }
    }
  };

  const errorView: ReactNode[] = [];

  try {
    props.errors.forEach((value, key) => {
      const tabError: ReactNode[] = [];

      value.forEach((error, index) => {
        const label = error.label ?? '저장 오류';
        const errorMessageView: ReactNode[] = [];

        if (
          error.errors === undefined ||
          error.errors.length === 0 ||
          !Array.isArray(error.errors)
        ) {
          errorMessageView.push(
            <div key={`error-message-${index}-undefined`}>{t('form.save.error.invalid')}</div>,
          );
        } else {
          error.errors.forEach((message, i) => {
            errorMessageView.push(<div key={`error-message-${index}-${i}`}>{t(message)}</div>);
          });
        }

        tabError.push(
          <div key={`errorDetail${index}`} className={''}>
            <button
              type="button"
              onClick={() => handleFieldClick(error, key)}
              className={
                'flex space-x-2 items-center cursor-pointer hover:underline text-left w-full'
              }
            >
              <IconInfoTriangle className={'h-4 w-4'}></IconInfoTriangle>
              <span>{label}:</span>
              <span>{errorMessageView}</span>
            </button>
          </div>,
        );
      });

      errorView.push(
        <div
          className={'text-danger bg-danger-light dark:bg-danger-dark-light p-4 mb-2'}
          key={`error_${key}`}
        >
          <div
            className={'py-2 font-bold text-[16px] cursor-pointer hover:underline'}
            onClick={() => handleErrorClick(key)}
          >
            {t(key)}
          </div>
          <div className={'space-y-1 text-[15px]'}>{tabError}</div>
        </div>,
      );
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <div className={'mt-4 w-full'}>
      {/* 필드 에러 헤더 */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex w-full items-center justify-between p-3 bg-danger text-white ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'} hover:bg-danger/90 transition-colors`}
      >
        <div className={'flex items-center space-x-2'}>
          <IconInfoTriangle className={'ml-2 h-5 w-5'} />
          <span className={'font-semibold'}>
            {t(`form.save.error.invalid.${isExpanded ? 'expanded' : 'collapsed'}`)}
          </span>
          <span className={'text-sm bg-white/20 px-2 py-1 rounded-full'}>
            {totalErrorCount}개 오류
          </span>
        </div>
        {isExpanded ? (
          <IconChevronUp className={'h-5 w-5'} />
        ) : (
          <IconChevronDown className={'h-5 w-5'} />
        )}
      </button>

      {/* 에러 내용 */}
      {isExpanded && <div className={'space-y-2'}>{errorView}</div>}
    </div>
  );
};
