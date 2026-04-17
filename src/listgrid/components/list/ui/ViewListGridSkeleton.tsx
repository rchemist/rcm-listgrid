/**
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

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

  // 필드가 없으면 기본 컬럼 수 사용
  const columnCount = fields.length > 0 ? fields.length : 5;

  // 표시할 행 수 결정 (최소 3개, 최대 pageSize)
  const rowCount = Math.max(3, Math.min(pageSize, 20));

  return (
    <div className="animate-pulse">
      {/* 검색 바 스켈레톤 */}
      {!isSubCollection && (
        <div className="flex items-center justify-between mb-4 gap-4">
          {/* 검색 입력 */}
          <div className="flex-1 max-w-md">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          {/* 페이지 사이즈 선택 */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        </div>
      )}

      {/* SubCollection 버튼 영역 스켈레톤 */}
      {isSubCollection && (
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-5 w-8 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-primary/30 rounded" />
          </div>
        </div>
      )}

      {/* 테이블 스켈레톤 */}
      <div className={isPopup
        ? themeClasses.popup?.container ?? 'max-h-[70vh] flex flex-col overflow-hidden'
        : ''
      }>
        <div className={themeClasses.table?.container ?? "overflow-auto"}>
          <div className={themeClasses.table?.responsiveWrapper ?? "table-responsive w-full"}>
            <table className={themeClasses.table?.table ?? "table-hover w-full"}>
              {/* 테이블 헤더 스켈레톤 */}
              <thead className={themeClasses.table?.thead ?? 'border-t border-b border-white-light dark:border-[#17263c]'}>
                <tr>
                  {/* 체크박스 컬럼 */}
                  {showCheckbox && (
                    <th className="w-[50px] p-2">
                      <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded" />
                    </th>
                  )}
                  {/* 데이터 컬럼 헤더 */}
                  {fields.length > 0 ? (
                    fields.map((field, index) => (
                      <th key={field.getName()} className="p-2 text-left">
                        <div
                          className="h-4 bg-gray-300 dark:bg-gray-600 rounded"
                          style={{ width: getColumnWidth(field, index) }}
                        />
                      </th>
                    ))
                  ) : (
                    // 필드 정보 없으면 기본 컬럼 생성
                    Array.from({ length: columnCount }).map((_, index) => (
                      <th key={index} className="p-2 text-left">
                        <div
                          className="h-4 bg-gray-300 dark:bg-gray-600 rounded"
                          style={{ width: `${60 + (index % 3) * 20}px` }}
                        />
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              {/* 테이블 바디 스켈레톤 */}
              <tbody>
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-white-light dark:border-[#17263c]"
                  >
                    {/* 체크박스 컬럼 */}
                    {showCheckbox && (
                      <td className="w-[50px] p-2">
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                    )}
                    {/* 데이터 셀 */}
                    {fields.length > 0 ? (
                      fields.map((field, colIndex) => (
                        <td key={field.getName()} className="p-2">
                          <SkeletonCell
                            field={field}
                            rowIndex={rowIndex}
                            colIndex={colIndex}
                          />
                        </td>
                      ))
                    ) : (
                      // 필드 정보 없으면 기본 셀 생성
                      Array.from({ length: columnCount }).map((_, colIndex) => (
                        <td key={colIndex} className="p-2">
                          <div
                            className="h-5 bg-gray-100 dark:bg-gray-800 rounded"
                            style={{
                              width: `${40 + ((rowIndex + colIndex) % 4) * 20}%`,
                              maxWidth: '200px'
                            }}
                          />
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 페이지네이션 스켈레톤 (팝업 모드 아닐 때) */}
      {!isPopup && !isSubCollection && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`h-8 w-8 rounded ${
                  index === 2
                    ? 'bg-primary/30'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
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

  // 필드 클래스명으로 타입 추론
  if (fieldClassName.includes('date')) {
    return '100px';
  }
  if (fieldClassName.includes('boolean') || fieldClassName.includes('checkbox')) {
    return '60px';
  }
  if (fieldClassName.includes('number') || fieldClassName.includes('integer') || fieldClassName.includes('decimal')) {
    return '80px';
  }
  if (fieldClassName.includes('email')) {
    return '140px';
  }
  if (fieldClassName.includes('url')) {
    return '160px';
  }

  // 첫 번째 컬럼은 보통 ID나 제목이므로 더 넓게
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
  // constructor.name을 사용하여 필드 클래스 타입 감지
  const fieldClassName = field.constructor.name.toLowerCase();

  // 필드 클래스명에 따른 스켈레톤 스타일
  if (fieldClassName.includes('boolean') || fieldClassName.includes('checkbox')) {
    return (
      <div className="flex justify-center">
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (fieldClassName.includes('image') || fieldClassName.includes('thumbnail')) {
    return (
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
    );
  }

  if (fieldClassName.includes('datetime')) {
    return (
      <div className="h-5 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
    );
  }

  if (fieldClassName.includes('date')) {
    return (
      <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
    );
  }

  if (fieldClassName.includes('number') || fieldClassName.includes('integer') ||
      fieldClassName.includes('decimal') || fieldClassName.includes('currency')) {
    return (
      <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded ml-auto" />
    );
  }

  if (fieldClassName.includes('tag') || fieldClassName.includes('badge')) {
    return (
      <div className="flex gap-1">
        <div className="h-5 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
      </div>
    );
  }

  if (fieldClassName.includes('enum') || fieldClassName.includes('select')) {
    return (
      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
    );
  }

  // 일반 텍스트 - 행/열에 따라 다른 너비로 자연스러운 효과
  const widthPercent = 40 + ((rowIndex + colIndex) % 4) * 15;
  return (
    <div
      className="h-5 bg-gray-100 dark:bg-gray-800 rounded"
      style={{
        width: `${widthPercent}%`,
        maxWidth: colIndex === 0 ? '180px' : '140px',
        minWidth: '40px'
      }}
    />
  );
};

export default ViewListGridSkeleton;
