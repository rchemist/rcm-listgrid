/**
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

'use client';

import { EntityForm } from '../../../config/EntityForm';
import { useEntityFormTheme } from '../context/EntityFormThemeContext';

interface ViewEntityFormSkeletonProps {
  entityForm?: EntityForm;
  /** 인라인 모드 여부 */
  inlineMode?: boolean;
  /** SubCollection 모드 여부 */
  subCollectionEntity?: boolean;
}

/**
 * EntityForm 구조 기반 스켈레톤 컴포넌트
 *
 * EntityForm의 Tab, FieldGroup, Field 메타데이터를 분석하여
 * 실제 레이아웃과 동일한 스켈레톤을 생성합니다.
 */
export const ViewEntityFormSkeleton = ({
  entityForm,
  inlineMode = false,
  subCollectionEntity = false,
}: ViewEntityFormSkeletonProps) => {
  const { classNames, cn } = useEntityFormTheme();

  // EntityForm이 없으면 기본 스켈레톤
  if (!entityForm) {
    return <DefaultSkeleton inlineMode={inlineMode} />;
  }

  // 탭 정보 추출
  const tabs = Array.from(entityForm.tabs.values())
    .filter(tab => !tab.hidden)
    .sort((a, b) => a.order - b.order);

  const showTabs = tabs.length > 1;

  return (
    <div className={cn("animate-pulse", classNames.root)}>
      {/* 헤더 스켈레톤 (인라인 모드가 아닐 때) */}
      {!inlineMode && (
        <div className="mb-4">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        </div>
      )}

      {/* 패널 컨테이너 */}
      <div className={cn(
        inlineMode
          ? "panel w-full rounded-lg px-3 py-2 bg-white dark:bg-dark"
          : "panel w-full rounded-xl px-0 pt-1",
        inlineMode ? undefined : classNames.panel?.container
      )}>
        <div className={cn(
          inlineMode
            ? "w-full"
            : "w-full pl-1.5 pr-1.5 md:pl-3 md:pr-3",
          inlineMode ? undefined : classNames.panel?.inner
        )}>
          {/* 탭 + 버튼 영역 스켈레톤 (인라인 모드) */}
          {inlineMode && (
            <div className={`flex items-center justify-between mb-2 ${showTabs ? 'border-b border-white-light dark:border-[#191e3a]' : ''}`}>
              <div className="flex-1 flex gap-2">
                {showTabs && tabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    className={`h-8 rounded ${index === 0 ? 'w-20 bg-primary/30' : 'w-16 bg-gray-200 dark:bg-gray-700'}`}
                  />
                ))}
              </div>
              <div className="flex-shrink-0 ml-2 flex gap-2">
                <div className="h-7 w-14 bg-primary/30 rounded" />
                <div className="h-7 w-14 bg-red-200 dark:bg-red-900/30 rounded" />
              </div>
            </div>
          )}

          {/* 일반 모드 탭 스켈레톤 */}
          {!inlineMode && showTabs && (
            <div className="mt-3 flex flex-row border-b border-white-light dark:border-[#191e3a] mb-4">
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  className={`h-10 rounded-t mr-1 px-4 ${index === 0 ? 'w-24 bg-primary/20 border-b-2 border-primary' : 'w-20 bg-gray-100 dark:bg-gray-800'}`}
                />
              ))}
            </div>
          )}

          {/* 필드그룹 스켈레톤 */}
          {tabs.length > 0 && (
            <FieldGroupsSkeleton
              fieldGroups={tabs[0].fieldGroups}
              entityForm={entityForm}
              subCollectionEntity={subCollectionEntity}
            />
          )}

          {/* 버튼 영역 스켈레톤 (일반 모드 헤더) */}
          {!inlineMode && (
            <div className="flex justify-end gap-2 mt-4">
              <div className="h-10 w-20 bg-primary/30 rounded" />
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 w-20 bg-red-200 dark:bg-red-900/30 rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 필드그룹 스켈레톤
 */
interface FieldGroupsSkeletonProps {
  fieldGroups: { id: string; label: string; fields: { name: string; order: number }[] }[];
  entityForm: EntityForm;
  subCollectionEntity?: boolean;
}

const FieldGroupsSkeleton = ({ fieldGroups, entityForm, subCollectionEntity }: FieldGroupsSkeletonProps) => {
  const sortedGroups = [...fieldGroups].sort((a, b) => (a as any).order - (b as any).order);

  return (
    <div className="space-y-4">
      {sortedGroups.map((group) => {
        const sortedFields = [...group.fields].sort((a, b) => a.order - b.order);

        // 컨테이너 클래스 (subCollectionEntity 모드에 따라 다름)
        const containerClass = subCollectionEntity
          ? 'relative mb-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50'
          : 'panel mb-3 md:mb-4 border md:border shadow-none md:shadow-md bg-white dark:bg-dark px-4';

        return (
          <div key={group.id} className={containerClass}>
            {/* 필드그룹 라벨 */}
            <div className="mb-3">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24" />
            </div>

            {/* 필드 스켈레톤 */}
            <div className="space-y-4">
              {sortedFields.map((fieldItem) => {
                const field = entityForm.fields.get(fieldItem.name);
                return (
                  <FieldSkeleton
                    key={fieldItem.name}
                    fieldName={fieldItem.name}
                    field={field}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 단일 필드 스켈레톤
 */
interface FieldSkeletonProps {
  fieldName: string;
  field?: any;
}

const FieldSkeleton = ({ fieldName, field }: FieldSkeletonProps) => {
  // 필드 타입에 따라 다른 스켈레톤 높이
  const getFieldHeight = () => {
    if (!field) return 'h-10';

    const fieldType = field.config?.fieldType;
    switch (fieldType) {
      case 'HTML':
      case 'RICH_TEXT':
        return 'h-32';
      case 'TEXT_AREA':
        return 'h-24';
      case 'CHECKBOX':
      case 'RADIO':
        return 'h-6';
      default:
        return 'h-10';
    }
  };

  return (
    <div className="space-y-1.5">
      {/* 라벨 스켈레톤 */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      {/* 입력 필드 스켈레톤 */}
      <div className={`${getFieldHeight()} bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700`} />
    </div>
  );
};

/**
 * 기본 스켈레톤 (EntityForm 정보 없을 때)
 */
const DefaultSkeleton = ({ inlineMode }: { inlineMode: boolean }) => {
  return (
    <div className="animate-pulse">
      {!inlineMode && (
        <div className="mb-4">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        </div>
      )}

      <div className={inlineMode ? "p-3 bg-white dark:bg-dark rounded-lg" : ""}>
        {/* 탭 스켈레톤 */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>

        {/* 필드 스켈레톤 */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>

        {/* 버튼 스켈레톤 */}
        {!inlineMode && (
          <div className="flex justify-end gap-2 mt-6">
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEntityFormSkeleton;
