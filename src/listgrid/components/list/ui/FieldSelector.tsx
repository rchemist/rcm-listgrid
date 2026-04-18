'use client';

/*
 * Copyright (c) "2025". gjcu.ac.kr by GJCU
 * Licensed under the GJCU Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by GJCU
 */

import React, {memo, useCallback, useMemo, useState} from 'react';
import {ListableFormField} from '../../fields/abstract';
import {getTranslation} from '../../../utils/i18n';
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
    <div className="rcm-field-selector">
      {/* Header */}
      <div
        className="rcm-field-selector-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="rcm-field-selector-header-left">
          <span className="rcm-field-selector-title">검색 필드 선택</span>
          <span className="rcm-field-selector-count">
            {selectedCount}/{totalCount}
          </span>
        </div>
        <div className="rcm-field-selector-header-right">
          {!isExpanded && selectedCount > 0 && (
            <span className="rcm-field-selector-hint">
              {selectedCount}개 선택됨
            </span>
          )}
          <button
            type="button"
            className="rcm-field-selector-toggle"
            aria-label={isExpanded ? '접기' : '펼치기'}
          >
            <svg
              className={`rcm-field-selector-chevron ${isExpanded ? 'rcm-rotate-180' : ''}`}
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
        <div className="rcm-field-selector-body">
          {/* Search and actions */}
          <div className="rcm-field-selector-search-row">
            <div className="rcm-field-selector-search-input-wrap">
              <IconSearch className="rcm-field-selector-search-icon" />
              <input
                type="text"
                placeholder="필드 검색..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="rcm-field-selector-search-input"
              />
            </div>
            <button
              type="button"
              onClick={onSelectAll}
              className="rcm-field-selector-action rcm-field-selector-action-primary"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              className="rcm-field-selector-action rcm-field-selector-action-muted"
            >
              전체 해제
            </button>
          </div>

          {/* Field list */}
          <div className="rcm-field-selector-list">
            <div className="rcm-field-selector-grid">
              {filteredFields.map((field) => {
                const fieldName = field.getName();
                const isSelected = selectedFieldNames.has(fieldName);

                return (
                  <button
                    key={fieldName}
                    type="button"
                    onClick={() => onToggleField(fieldName)}
                    className={`rcm-field-selector-chip ${isSelected ? 'rcm-field-selector-chip-selected' : ''}`}
                  >
                    <span className={`rcm-field-selector-chip-check ${isSelected ? 'rcm-field-selector-chip-check-selected' : ''}`}>
                      {isSelected && <IconCheck className="rcm-field-selector-chip-check-icon" />}
                    </span>
                    <span className="rcm-truncate">{field.viewLabel(t)}</span>
                  </button>
                );
              })}
            </div>

            {filteredFields.length === 0 && (
              <div className="rcm-field-selector-empty">
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
