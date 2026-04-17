'use client';

/*
 * Copyright (c) "2025". gjcu.ac.kr by GJCU
 * Licensed under the GJCU Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by GJCU
 */

import React, {memo, useCallback, useMemo, useState} from 'react';
import {ListableFormField} from '../../fields/abstract';
import {getTranslation} from '@gjcu/ui/utils/i18n';
import {IconCheck, IconSearch} from '@tabler/icons-react';

interface FieldSelectorProps {
  availableFields: ListableFormField<any>[];
  selectedFieldNames: Set<string>;
  onToggleField: (fieldName: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

/**
 * Field selector component for choosing which fields to display in advanced search
 */
const FieldSelectorInner = ({
  availableFields,
  selectedFieldNames,
  onToggleField,
  onSelectAll,
  onDeselectAll,
}: FieldSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = getTranslation();

  // Filter fields based on search query
  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableFields;
    }

    const query = searchQuery.toLowerCase();
    return availableFields.filter((field) => {
      const label = field.viewLabel(t);
      const name = field.getName();
      return (
        (typeof label === 'string' && label.toLowerCase().includes(query)) ||
        name.toLowerCase().includes(query)
      );
    });
  }, [availableFields, searchQuery, t]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // availableFields에 포함된 필드 중 선택된 것만 카운트
  // (통합검색 모드에서 quickSearch 필드가 제외될 때 정확한 숫자 표시)
  const selectedCount = availableFields.filter(field =>
    selectedFieldNames.has(field.getName())
  ).length;
  const totalCount = availableFields.length;

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            검색 필드 선택
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {selectedCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && selectedCount > 0 && (
            <span className="text-xs text-gray-500">
              {selectedCount}개 선택됨
            </span>
          )}
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={isExpanded ? '접기' : '펼치기'}
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Search and actions */}
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="필드 검색..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={onSelectAll}
              className="text-xs text-primary hover:text-primary-dark px-2 py-1 hover:bg-primary/5 rounded transition-colors"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
            >
              전체 해제
            </button>
          </div>

          {/* Field list */}
          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 p-2">
              {filteredFields.map((field) => {
                const fieldName = field.getName();
                const isSelected = selectedFieldNames.has(fieldName);

                return (
                  <button
                    key={fieldName}
                    type="button"
                    onClick={() => onToggleField(fieldName)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors text-left ${
                      isSelected
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <IconCheck className="w-3 h-3 text-white" />}
                    </span>
                    <span className="truncate">{field.viewLabel(t)}</span>
                  </button>
                );
              })}
            </div>

            {filteredFields.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FieldSelector = memo(FieldSelectorInner);

FieldSelector.displayName = 'FieldSelector';
