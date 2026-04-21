'use client';

import React, { memo } from 'react';
import { EntityForm } from '../../../config/EntityForm';
import { ViewEntityForm } from '../../form/ViewEntityForm';
import { EntityButtonLinkProps } from '../../../config/Config';

// Icons removed - collapse button moved to row

export interface SubCollectionInlineViewProps {
  entityForm: EntityForm;
  itemId: string;
  isExpanded: boolean;
  onCollapse: () => void;
  readonly?: boolean;
  onSave?: () => void;
  onDelete?: () => void;
  /** SubCollection mappedBy 필드 - ViewEntityForm에서 부모 참조 필드 자동 숨김 */
  mappedBy?: string;
}

/**
 * Inline view component for SubCollection expansion
 *
 * Renders ViewEntityForm in an elegant inline panel with:
 * - Smooth expand/collapse animation
 * - Refined panel styling with shadow and border
 * - Custom header with collapse button
 * - No "목록" button (replaced with close functionality)
 */
export const SubCollectionInlineView = memo(
  ({
    entityForm,
    itemId,
    isExpanded,
    onCollapse,
    readonly = false,
    onSave,
    onDelete,
    mappedBy,
  }: SubCollectionInlineViewProps) => {
    // buttonLinks에서 onClickList를 onCollapse로 대체
    const buttonLinks: EntityButtonLinkProps = {
      onClickList: async () => {
        onCollapse();
      },
      ...(onSave
        ? {
            onSave: {
              success: () => {
                onSave();
              },
            },
          }
        : {}),
      ...(onDelete
        ? {
            onDelete: {
              success: () => {
                onDelete();
                onCollapse();
              },
            },
          }
        : {}),
    };

    return (
      <div
        data-testid="subcollection-inline-view"
        className={`
          subcollection-inline-view
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {/* ViewEntityForm 컨텐츠 영역 - 시각적 구분을 위한 스타일 적용 */}
        <div
          className="
          ml-4
          border-l-4 border-primary/30
          bg-white/50 dark:bg-gray-900/50
          rounded-r-lg
          overflow-x-hidden
          max-w-full
        "
        >
          {/* 인라인 뷰 라벨 */}
          <div
            className="
            bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-light
            text-xs font-medium
            px-3 py-1.5
            border-b border-primary/10
          "
          >
            상세 정보
          </div>
          <div className="pl-4 pt-2">
            <ViewEntityForm
              entityForm={entityForm}
              readonly={readonly}
              excludeButtons={['list']}
              hideTitle={true}
              buttonLinks={buttonLinks}
              buttonPosition="header"
              subCollection={true}
              inlineMode={true}
              {...(mappedBy !== undefined ? { hideMappedByFields: mappedBy } : {})}
            />
          </div>
        </div>
      </div>
    );
  },
);

SubCollectionInlineView.displayName = 'SubCollectionInlineView';
