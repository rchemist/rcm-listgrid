'use client';

import { EntityForm } from '../../../config/EntityForm';
import type { EntityField } from '../../../config/EntityField';
import { useEntityFormTheme } from '../context/EntityFormThemeContext';

interface ViewEntityFormSkeletonProps {
  entityForm?: EntityForm;
  /** 인라인 모드 여부 */
  inlineMode?: boolean;
  /** SubCollection 모드 여부 */
  subCollectionEntity?: boolean;
}

// Inline sizing for skeleton blocks — keeps the CSS surface small while the
// component decides per-placeholder shape. Library-provided `rcm-skeleton` /
// `rcm-skeleton-accent` / `rcm-skeleton-danger` classes own the pulse and
// color; host CSS overrides either by redefining those classes or by re-
// targeting `.rcm-skeleton` via an unlayered selector.
const size = (height: string | number, width?: string | number) => ({
  height: typeof height === 'number' ? `${height}px` : height,
  ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
});

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
    .filter((tab) => !tab.hidden)
    .sort((a, b) => a.order - b.order);

  const showTabs = tabs.length > 1;

  return (
    <div className={cn('rcm-pulse', classNames.root)}>
      {/* 헤더 스켈레톤 (인라인 모드가 아닐 때) */}
      {!inlineMode && (
        <div className="rcm-skeleton-row">
          <div className="rcm-skeleton" style={size(28, 192)} />
        </div>
      )}

      {/* 패널 컨테이너 */}
      <div
        className={cn(
          inlineMode ? 'rcm-panel rcm-panel-compact' : 'rcm-skeleton-panel',
          inlineMode ? '' : classNames.panel?.container,
        )}
      >
        <div
          className={cn(
            inlineMode ? '' : 'rcm-skeleton-inner',
            inlineMode ? '' : classNames.panel?.inner,
          )}
        >
          {/* 탭 + 버튼 영역 스켈레톤 (인라인 모드) */}
          {inlineMode && (
            <div
              className={
                showTabs
                  ? 'rcm-row-between rcm-skeleton-tab-bar'
                  : 'rcm-row-between rcm-skeleton-row'
              }
            >
              <div className="rcm-row rcm-flex-1">
                {showTabs &&
                  tabs.map((tab, index) => (
                    <div
                      key={tab.id}
                      className={index === 0 ? 'rcm-skeleton rcm-skeleton-accent' : 'rcm-skeleton'}
                      style={size(32, index === 0 ? 80 : 64)}
                    />
                  ))}
              </div>
              <div className="rcm-row">
                <div className="rcm-skeleton rcm-skeleton-accent" style={size(28, 56)} />
                <div className="rcm-skeleton rcm-skeleton-danger" style={size(28, 56)} />
              </div>
            </div>
          )}

          {/* 일반 모드 탭 스켈레톤 */}
          {!inlineMode && showTabs && (
            <div className="rcm-row rcm-skeleton-tab-bar">
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  className={
                    index === 0
                      ? 'rcm-skeleton rcm-skeleton-accent rcm-skeleton-tab-active'
                      : 'rcm-skeleton'
                  }
                  style={size(40, index === 0 ? 96 : 80)}
                />
              ))}
            </div>
          )}

          {/* 필드그룹 스켈레톤 */}
          {tabs.length > 0 && (
            <FieldGroupsSkeleton
              fieldGroups={tabs[0]!.fieldGroups}
              entityForm={entityForm}
              subCollectionEntity={subCollectionEntity}
            />
          )}

          {/* 버튼 영역 스켈레톤 (일반 모드 헤더) */}
          {!inlineMode && (
            <div className="rcm-action-bar-end">
              <div className="rcm-skeleton rcm-skeleton-accent" style={size(40, 80)} />
              <div className="rcm-skeleton" style={size(40, 80)} />
              <div className="rcm-skeleton rcm-skeleton-danger" style={size(40, 80)} />
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
  fieldGroups: {
    id: string;
    label: string;
    order?: number;
    fields: { name: string; order: number }[];
  }[];
  entityForm: EntityForm;
  subCollectionEntity?: boolean;
}

const FieldGroupsSkeleton = ({
  fieldGroups,
  entityForm,
  subCollectionEntity,
}: FieldGroupsSkeletonProps) => {
  const sortedGroups = [...fieldGroups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="rcm-stack">
      {sortedGroups.map((group) => {
        const containerClass = subCollectionEntity
          ? 'rcm-panel rcm-panel-muted rcm-panel-compact'
          : 'rcm-panel';

        return (
          <div key={group.id} className={containerClass}>
            {/* 필드그룹 라벨 */}
            <div className="rcm-skeleton-row">
              <div className="rcm-skeleton" style={size(20, 96)} />
            </div>

            {/* 필드 스켈레톤 */}
            <div className="rcm-stack">
              {[...group.fields]
                .sort((a, b) => a.order - b.order)
                .map((fieldItem) => {
                  const field = entityForm.fields.get(fieldItem.name);
                  return (
                    <FieldSkeleton
                      key={fieldItem.name}
                      fieldName={fieldItem.name}
                      {...(field !== undefined ? { field } : {})}
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
  field?: EntityField;
}

const FieldSkeleton = ({ fieldName: _fieldName, field }: FieldSkeletonProps) => {
  const getFieldHeight = (): number => {
    if (!field) return 40;

    // Subclass-specific config access (e.g. CustomOptionField.config.fieldType);
    // EntityField base has no `config`, so we probe via a narrow structural cast.
    const fieldType = (field as { config?: { fieldType?: string } }).config?.fieldType;
    switch (fieldType) {
      case 'HTML':
      case 'RICH_TEXT':
        return 128;
      case 'TEXT_AREA':
        return 96;
      case 'CHECKBOX':
      case 'RADIO':
        return 24;
      default:
        return 40;
    }
  };

  return (
    <div className="rcm-field-root">
      <div className="rcm-skeleton" style={size(16, 80)} />
      <div className="rcm-skeleton" style={size(getFieldHeight())} />
    </div>
  );
};

/**
 * 기본 스켈레톤 (EntityForm 정보 없을 때)
 */
const DefaultSkeleton = ({ inlineMode }: { inlineMode: boolean }) => {
  return (
    <div className="rcm-pulse">
      {!inlineMode && (
        <div className="rcm-skeleton-row">
          <div className="rcm-skeleton" style={size(28, 192)} />
        </div>
      )}

      <div className={inlineMode ? 'rcm-panel' : ''}>
        {/* 탭 스켈레톤 */}
        <div className="rcm-row rcm-skeleton-tab-bar">
          <div className="rcm-skeleton" style={size(32, 80)} />
          <div className="rcm-skeleton" style={size(32, 64)} />
        </div>

        {/* 필드 스켈레톤 */}
        <div className="rcm-stack">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rcm-field-root">
              <div className="rcm-skeleton" style={size(16, 80)} />
              <div className="rcm-skeleton" style={size(40)} />
            </div>
          ))}
        </div>

        {/* 버튼 스켈레톤 */}
        {!inlineMode && (
          <div className="rcm-action-bar-end">
            <div className="rcm-skeleton" style={size(40, 80)} />
            <div className="rcm-skeleton" style={size(40, 80)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEntityFormSkeleton;
