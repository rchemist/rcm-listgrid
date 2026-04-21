'use client';

import { EntityField } from '../../config/EntityField';
import React, { useEffect, useMemo, useState } from 'react';
import { FormField, FULL_WIDTH_FIELD_TYPES } from '../fields/abstract';
import { FieldRenderer } from './FieldRenderer';
import { EntityFieldGroup } from '../../config/EntityFieldGroup';
import { SubCollectionField } from '../../config/SubCollectionField';
import { isEmpty } from '../../utils';
import { SubCollectionRenderer } from './SubCollectionRenderer';
import { EntityFormManageable } from './types/ViewEntityForm.types';
import { getTranslation } from '../../utils/i18n';
import { isBlank } from '../../utils/StringUtil';
import { ViewHelpIcon } from './ui/ViewHelpIcon';
import { Session } from '../../auth/types';
import { useEntityFormTheme } from './context/EntityFormThemeContext';

/**
 * 필드와 서브콜렉션을 통합한 렌더링 아이템 타입
 */
type RenderableItem =
  | { type: 'field'; item: FormField<any>; order: number }
  | { type: 'subCollection'; item: SubCollectionField; order: number };

/**
 * ViewFieldGroup component
 * - Renders a group of fields and sub-collections for a given tab/group in EntityForm.
 * - Handles collapsible panels, help text, and readonly/sub-collection logic.
 *
 * ViewFieldGroup 컴포넌트
 * - EntityForm의 탭/그룹별 필드 및 서브콜렉션을 렌더링합니다.
 * - 접기/펼치기, 도움말, 읽기전용/서브콜렉션 로직을 처리합니다.
 *
 * @param props {ViewFieldGroupProps} - 탭/그룹/EntityForm 정보 등
 * @returns {JSX.Element|null} - 렌더링 결과 또는 null
 */
interface ViewFieldGroupProps extends EntityFormManageable {
  groupId: string; // 필드 그룹 id
  tabId: string; // 탭 id
  readonly: boolean; // 읽기 전용 여부
  subCollectionEntity?: boolean; // 서브콜렉션 여부
  session?: Session; // 세션 정보
  createStepFields?: string[]; // 생성 단계 필드명 배열
  resetEntityForm?: (delay?: number, preserveState?: boolean) => Promise<void>; // EntityForm 리셋 함수
  /** MappedBy field name for hiding parent reference fields in SubCollection */
  hideMappedByFields?: string;
}

/**
 * Determine grid col-span class based on field layout type.
 * Uses library-owned `rcm-col-span-full` (defined in base.css) instead of
 * Tailwind's `col-span-full` — the host's Tailwind content scanner does not
 * include @rchemist/listgrid sources in node_modules, so Tailwind utilities
 * placed inside library JSX never get generated.
 */
function getFieldColSpanClass(field: FormField<any>): string {
  if (field.layout === 'full') return 'rcm-col-span-full';
  if (field.layout === 'half') return '';
  // auto: FULL_WIDTH_FIELD_TYPES get full width
  if (FULL_WIDTH_FIELD_TYPES.includes(field.type)) return 'rcm-col-span-full';
  return '';
}

export const ViewFieldGroup = ({
  entityForm,
  setEntityForm,
  readonly,
  subCollectionEntity,
  session,
  createStepFields,
  hideMappedByFields,
  ...props
}: ViewFieldGroupProps) => {
  const { classNames, cn } = useEntityFormTheme();

  // 현재 그룹의 필드, 서브콜렉션, 그룹 정보 상태
  // State for fields, sub-collections, and group info in this group
  const [fields, setFields] = useState<EntityField[]>();
  const [subCollections, setSubCollections] = useState<SubCollectionField[]>();
  const [fieldGroup, setFieldGroup] = useState<EntityFieldGroup>();
  const [open, setOpen] = useState(true); // 패널 열림/닫힘 상태
  const [collapsable, setCollapsable] = useState(true); // 접기/펼치기 가능 여부

  /**
   * Filter fields based on hideMappedByFields (mappedBy field name)
   * SubCollection에서 부모 참조 필드 자동 숨김 처리
   *
   * Filters out:
   * - Exact mappedBy field (e.g., "studentId", "enrollment.student.id")
   * - Base field without Id/.id suffix (e.g., "student" from "studentId", "enrollment.student" from "enrollment.student.id")
   * - Nested patterns (e.g., "student.name", "enrollment.student.name")
   *
   * 예시:
   * - mappedBy="studentId" → studentId, student, student.* 숨김
   * - mappedBy="enrollment.student.id" → enrollment.student.id, enrollment.student, enrollment.student.* 숨김
   */
  const filteredFields = useMemo(() => {
    if (!fields || !hideMappedByFields || hideMappedByFields.trim() === '') {
      return fields;
    }

    const mappedBy = hideMappedByFields.trim();

    // Generate patterns to exclude
    const patternsToExclude = new Set<string>();

    // 1. Exact mappedBy field (e.g., "studentId", "enrollment.student.id")
    patternsToExclude.add(mappedBy);

    // 2. Base field without Id/.id suffix
    let baseField = mappedBy;

    // Handle "studentId" format (camelCase Id suffix)
    if (mappedBy.endsWith('Id')) {
      baseField = mappedBy.slice(0, -2);
    }
    // Handle "enrollment.student.id" format (dot notation .id suffix)
    else if (mappedBy.endsWith('.id')) {
      baseField = mappedBy.slice(0, -3);
    }

    patternsToExclude.add(baseField);

    // 3. Nested pattern prefix (e.g., "student.", "enrollment.student.")
    const nestedPattern = `${baseField}.`;

    return fields.filter((field) => {
      if (!(field instanceof FormField)) {
        return true; // Keep non-FormField items
      }

      const fieldName = field.getName();

      // Exact match - exclude
      if (patternsToExclude.has(fieldName)) {
        return false;
      }

      // Nested pattern match - exclude (e.g., student.name, enrollment.student.name)
      if (fieldName.startsWith(nestedPattern)) {
        return false;
      }

      return true;
    });
  }, [fields, hideMappedByFields]);

  useEffect(() => {
    // 마운트 시 필드/서브콜렉션/그룹 정보 비동기 조회
    // On mount, fetch fields, sub-collections, and group info asynchronously
    (async () => {
      const fieldInfo: {
        fieldGroup?: EntityFieldGroup;
        fields?: EntityField[];
      } = await entityForm?.getVisibleFields(props.tabId, props.groupId, session, createStepFields);

      setFieldGroup(fieldInfo?.fieldGroup);
      setFields(fieldInfo?.fields ?? []);

      // fieldGroup의 config.open 값으로 초기 상태 설정
      // Set initial state based on fieldGroup's config.open value
      if (fieldInfo?.fieldGroup) {
        setOpen(fieldInfo.fieldGroup.config?.open ?? true);
      }

      const collectionInfo: {
        fieldGroup?: EntityFieldGroup;
        collections?: SubCollectionField[];
      } = await entityForm?.getVisibleCollections(props.tabId, props.groupId, session);
      setSubCollections(collectionInfo?.collections ?? []);

      let collapsable = false;

      // 두 개 이상의 fieldGroup이 있고, 현재 그룹이 hidden이 아니면 접기/펼치기 활성화
      // Enable collapsible if there are multiple fieldGroups and this group is not hidden
      const fieldGroups = entityForm.getTab(props.tabId)?.fieldGroups ?? [];
      if (fieldGroups.length > 1) {
        for (const fieldGroup of fieldGroups) {
          if (
            fieldGroup.id !== props.groupId &&
            (await entityForm.isViewableFieldGroup({
              tabId: props.tabId,
              fieldGroupId: fieldGroup.id,
              createStepFields,
            }))
          ) {
            collapsable = true;
            break;
          }
        }
      }
      setCollapsable(collapsable);
    })();
  }, []);

  // 필드 또는 서브콜렉션이 하나라도 있으면 표시 (필터링된 필드 기준)
  // Show if there is at least one field or sub-collection (using filtered fields)
  const showFields = !isEmpty(filteredFields);
  const showCollections = entityForm?.id !== undefined && !isEmpty(subCollections);

  // 그룹 정보가 없거나, 표시할 필드/서브콜렉션이 없으면 렌더링하지 않음
  // If no group info or nothing to show, do not render
  if (fieldGroup === undefined || !(showFields || showCollections)) return null;

  const { t } = getTranslation();
  const helpText = fieldGroup.description ? t(fieldGroup.description) : '';

  // SubCollection 인라인 모드: 컴팩트한 패널 박스 스타일
  // SubCollection inline mode: compact panel box style
  const containerClass = subCollectionEntity
    ? 'rcm-fieldgroup-subcollection'
    : cn('rcm-fieldgroup', classNames.fieldGroup?.container);

  return (
    <>
      <div className={containerClass}>
        <div
          className={cn(
            open ? 'rcm-fieldgroup-header' : '',
            subCollectionEntity ? '' : classNames.fieldGroup?.header,
          )}
        >
          <div className="rcm-row-between">
            <h5
              className={cn(
                'rcm-fieldgroup-title',
                subCollectionEntity ? '' : classNames.fieldGroup?.title,
              )}
            >
              {fieldGroup.label}
              <div
                className={cn(
                  'rcm-row rcm-gap-sm',
                  subCollectionEntity ? '' : classNames.fieldGroup?.actions,
                )}
              >
                {/* 도움말 아이콘: 그룹 설명이 있을 때만 표시 */}
                {/* Help icon: only show if group has description */}
                {!isBlank(helpText) && <ViewHelpIcon helpText={helpText} />}
                {/* 접기/펼치기 토글: collapsable일 때만 표시 */}
                {/* Collapse/expand toggle: only show if collapsable */}
                {collapsable && (
                  <span
                    className={cn(
                      'rcm-fieldgroup-collapse',
                      subCollectionEntity ? '' : classNames.fieldGroup?.collapseToggle,
                    )}
                    onClick={() => {
                      setOpen(!open);
                    }}
                  >
                    <div className={open ? '' : 'rcm-rotate-180'}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          stroke="#5B6B79"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeMiterlimit="10"
                          strokeWidth="1.5"
                          d="M19.92 15.05L13.4 8.53c-.77-.77-2.03-.77-2.8 0l-6.52 6.52"
                        ></path>
                      </svg>
                    </div>
                  </span>
                )}
              </div>
            </h5>
          </div>
        </div>
        {open && (
          <div
            className={cn(
              subCollectionEntity ? 'rcm-stack' : 'rcm-field-grid',
              subCollectionEntity ? undefined : classNames.fieldGroup?.content,
            )}
          >
            {/* 필드 렌더링: FormField만 FieldRenderer로 출력 (hideMappedByFields로 필터링됨) */}
            {/* Render fields: only FormField is rendered by FieldRenderer (filtered by hideMappedByFields) */}
            {filteredFields?.map((field, index) => {
              if (field instanceof FormField) {
                if (readonly) {
                  field.withReadOnly(true);
                }
                // If the previous field has lineBreak, force this field to start at column 1
                const prevField = index > 0 ? filteredFields?.[index - 1] : null;
                const forceNewRow = prevField instanceof FormField && prevField.lineBreak;
                const colSpanClass = getFieldColSpanClass(field);
                const className = forceNewRow ? `${colSpanClass} rcm-col-start-1-lg` : colSpanClass;
                return (
                  <div key={field.getName()} className={className}>
                    <FieldRenderer
                      field={field}
                      entityForm={entityForm}
                      {...(setEntityForm !== undefined ? { setEntityForm } : {})}
                      {...(subCollectionEntity !== undefined ? { subCollectionEntity } : {})}
                      {...(session !== undefined ? { session } : {})}
                      {...(props.resetEntityForm !== undefined
                        ? { resetEntityForm: props.resetEntityForm }
                        : {})}
                    />
                  </div>
                );
              } else {
                return null;
              }
            })}

            {/* 서브콜렉션 렌더링: subCollections가 있을 때만 출력 */}
            {/* Render sub-collections: only if subCollections exist */}
            {showCollections &&
              subCollections?.map((collection) => {
                if (readonly) {
                  collection.withReadOnly(true);
                }

                return (
                  <div
                    key={`subCollection_${collection.getName()}_${entityForm.id}`}
                    className="rcm-col-span-full"
                  >
                    <SubCollectionRenderer
                      entityForm={entityForm}
                      collection={collection}
                      {...(session !== undefined ? { session } : {})}
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
};
