'use client';

import React from 'react';
import { ListableFormField } from '../../fields/abstract';
import { useListGridTheme } from '../context/ListGridThemeContext';

interface ViewListGridSkeletonProps {
  /** 표시할 스켈레톤 행 수 (pageSize 기반) */
  pageSize?: number;
  /** 컬럼 필드 정보 */
  fields?: ListableFormField<any>[];
  /** SubCollection 모드 여부 */
  isSubCollection?: boolean;
  /** 체크박스 컬럼 표시 여부 */
  showCheckbox?: boolean;
  /** 팝업 모드 여부 */
  isPopup?: boolean;
}

// Inline sizing for skeleton rects; library CSS owns pulse/color.
const size = (height: number, width?: number | string) => ({
  height: `${height}px`,
  ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
});

/**
 * ViewListGrid용 스켈레톤 컴포넌트
 *
 * pageSize와 컬럼 정보를 기반으로 실제 테이블 레이아웃과 동일한 스켈레톤을 생성합니다.
 */
export const ViewListGridSkeleton = ({
  pageSize = 10,
  fields = [],
  isSubCollection = false,
  showCheckbox = true,
  isPopup = false,
}: ViewListGridSkeletonProps) => {
  const { classNames: themeClasses } = useListGridTheme();

  const columnCount = fields.length > 0 ? fields.length : 5;
  const rowCount = Math.max(3, Math.min(pageSize, 20));

  return (
    <div className="rcm-pulse">
      {/* 검색 바 스켈레톤 */}
      {!isSubCollection && (
        <div className="rcm-row-between rcm-skeleton-row">
          <div className="rcm-skeleton-search-input">
            <div className="rcm-skeleton" style={size(40)} />
          </div>
          <div className="rcm-row">
            <div className="rcm-skeleton" style={size(40, 80)} />
          </div>
        </div>
      )}

      {/* SubCollection 버튼 영역 스켈레톤 */}
      {isSubCollection && (
        <div className="rcm-row-between rcm-skeleton-subcollection-bar">
          <div className="rcm-row">
            <div className="rcm-skeleton" style={size(20, 64)} />
            <div className="rcm-skeleton" style={size(20, 32)} />
          </div>
          <div className="rcm-row">
            <div className="rcm-skeleton rcm-skeleton-accent" style={size(32, 64)} />
          </div>
        </div>
      )}

      {/* 테이블 스켈레톤 */}
      <div
        className={isPopup ? (themeClasses.popup?.container ?? 'rcm-skeleton-popup-container') : ''}
      >
        <div className={themeClasses.table?.container ?? 'rcm-scroll-y'}>
          <div className={themeClasses.table?.responsiveWrapper ?? 'rcm-skeleton-table-wrapper'}>
            <table className={themeClasses.table?.table ?? 'rcm-table'}>
              <thead className={themeClasses.table?.thead ?? 'rcm-skeleton-thead'}>
                <tr>
                  {showCheckbox && (
                    <th className="rcm-skeleton-th-checkbox">
                      <div className="rcm-skeleton" style={size(16, 16)} />
                    </th>
                  )}
                  {fields.length > 0
                    ? fields.map((field, index) => (
                        <th key={field.getName()} className="rcm-skeleton-th">
                          <div
                            className="rcm-skeleton"
                            style={{ height: '16px', width: getColumnWidth(field, index) }}
                          />
                        </th>
                      ))
                    : Array.from({ length: columnCount }).map((_, index) => (
                        <th key={index} className="rcm-skeleton-th">
                          <div
                            className="rcm-skeleton"
                            style={{ height: '16px', width: `${60 + (index % 3) * 20}px` }}
                          />
                        </th>
                      ))}
                </tr>
              </thead>

              <tbody>
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="rcm-skeleton-tr">
                    {showCheckbox && (
                      <td className="rcm-skeleton-td-checkbox">
                        <div className="rcm-row rcm-gap-xs">
                          <div className="rcm-skeleton" style={size(16, 16)} />
                          <div className="rcm-skeleton" style={size(16, 24)} />
                        </div>
                      </td>
                    )}
                    {fields.length > 0
                      ? fields.map((field, colIndex) => (
                          <td key={field.getName()} className="rcm-skeleton-td">
                            <SkeletonCell field={field} rowIndex={rowIndex} colIndex={colIndex} />
                          </td>
                        ))
                      : Array.from({ length: columnCount }).map((_, colIndex) => (
                          <td key={colIndex} className="rcm-skeleton-td">
                            <div
                              className="rcm-skeleton"
                              style={{
                                height: '20px',
                                width: `${40 + ((rowIndex + colIndex) % 4) * 20}%`,
                                maxWidth: '200px',
                              }}
                            />
                          </td>
                        ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 페이지네이션 스켈레톤 (팝업 모드 아닐 때) */}
      {!isPopup && !isSubCollection && (
        <div className="rcm-skeleton-pagination">
          <div className="rcm-row rcm-gap-xs">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={index === 2 ? 'rcm-skeleton rcm-skeleton-accent' : 'rcm-skeleton'}
                style={size(32, 32)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 컬럼 너비 계산 (필드 타입 기반)
 * constructor.name을 사용하여 필드 클래스 타입 감지
 */
function getColumnWidth(field: ListableFormField<any>, index: number): string {
  const fieldClassName = field.constructor.name.toLowerCase();

  if (fieldClassName.includes('date')) return '100px';
  if (fieldClassName.includes('boolean') || fieldClassName.includes('checkbox')) return '60px';
  if (
    fieldClassName.includes('number') ||
    fieldClassName.includes('integer') ||
    fieldClassName.includes('decimal')
  )
    return '80px';
  if (fieldClassName.includes('email')) return '140px';
  if (fieldClassName.includes('url')) return '160px';

  return index === 0 ? '120px' : '80px';
}

/**
 * 개별 셀 스켈레톤 컴포넌트
 */
interface SkeletonCellProps {
  field: ListableFormField<any>;
  rowIndex: number;
  colIndex: number;
}

const SkeletonCell = ({ field, rowIndex, colIndex }: SkeletonCellProps) => {
  const fieldClassName = field.constructor.name.toLowerCase();

  if (fieldClassName.includes('boolean') || fieldClassName.includes('checkbox')) {
    return (
      <div className="rcm-row-center">
        <div className="rcm-skeleton" style={size(20, 20)} />
      </div>
    );
  }

  if (fieldClassName.includes('image') || fieldClassName.includes('thumbnail')) {
    return <div className="rcm-skeleton" style={size(40, 40)} />;
  }

  if (fieldClassName.includes('datetime')) {
    return <div className="rcm-skeleton" style={size(20, 112)} />;
  }

  if (fieldClassName.includes('date')) {
    return <div className="rcm-skeleton" style={size(20, 80)} />;
  }

  if (
    fieldClassName.includes('number') ||
    fieldClassName.includes('integer') ||
    fieldClassName.includes('decimal') ||
    fieldClassName.includes('currency')
  ) {
    return <div className="rcm-skeleton rcm-ml-auto" style={size(20, 64)} />;
  }

  if (fieldClassName.includes('tag') || fieldClassName.includes('badge')) {
    return (
      <div className="rcm-row rcm-gap-xs">
        <div className="rcm-skeleton rcm-radius-full rcm-bg-info-surface" style={size(20, 48)} />
      </div>
    );
  }

  if (fieldClassName.includes('enum') || fieldClassName.includes('select')) {
    return <div className="rcm-skeleton" style={size(24, 64)} />;
  }

  const widthPercent = 40 + ((rowIndex + colIndex) % 4) * 15;
  return (
    <div
      className="rcm-skeleton"
      style={{
        height: '20px',
        width: `${widthPercent}%`,
        maxWidth: colIndex === 0 ? '180px' : '140px',
        minWidth: '40px',
      }}
    />
  );
};

export default ViewListGridSkeleton;
