'use client';

import { useEffect, useRef, useState } from 'react';
import { FilterButton } from './FilterButton';
import { FilterDropdown, FilterDropdownPlacement, FilterDropdownSize } from './FilterDropdown';
import { FilterView } from './FilterView';
import { QueryConditionType, SearchForm } from '../../../form/SearchForm';
import { EntityForm } from '../../../config/EntityForm';
import { AbstractManyToOneField, ListableFormField, OptionalField } from '../../fields/abstract';
import { isBlank } from '../../../utils/StringUtil';
import { useHeaderFilterStore } from './headerFilterStore';
import { isTrue } from '../../../utils/BooleanUtil';

interface HeaderFieldFilterProps {
  field: ListableFormField<any>;
  gridId: string;
  searchForm: SearchForm;
  entityForm: EntityForm;
  onChangeSearchForm: (searchForm: SearchForm, resetPage?: boolean) => void;
  /** QuickSearch 활성 시 해당 필드의 헤더 필터를 비활성화 */
  disabled?: boolean;
}

export const HeaderFieldFilter = ({
  field,
  gridId,
  searchForm,
  entityForm,
  onChangeSearchForm,
  disabled = false,
}: HeaderFieldFilterProps) => {
  const fieldName = field.getName();
  const filterId = `${gridId}::${fieldName}`;

  // zustand store 사용
  const { openFilter, closeFilter, isFilterOpen } = useHeaderFilterStore();
  const isOpen = isFilterOpen(filterId);

  const [hasFilter, setHasFilter] = useState(false);
  const [tempSearchForm, setTempSearchForm] = useState<SearchForm>();
  const [placement, setPlacement] = useState<FilterDropdownPlacement>('left');
  const buttonRef = useRef<HTMLDivElement>(null);

  // 필터 상태 확인
  useEffect(() => {
    const fieldName = field.getName();
    let filterValue = searchForm.getSearchValue(fieldName);

    // ManyToOneField인 경우 .id로 체크
    if (!filterValue && field instanceof AbstractManyToOneField) {
      filterValue = searchForm.getSearchValue(fieldName + '.id');
    }

    // 배열인 경우 length로 체크
    const hasValue = Array.isArray(filterValue)
      ? filterValue.length > 0
      : filterValue !== null && filterValue !== undefined && filterValue !== '';

    setHasFilter(hasValue);
  }, [searchForm, field]);

  // 필터 위치 결정 (화면 중앙 기준)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const screenCenter = window.innerWidth / 2;

      // 버튼이 화면 오른쪽 절반에 있으면 드롭다운을 왼쪽으로
      if (rect.left > screenCenter) {
        setPlacement('right');
      } else {
        setPlacement('left');
      }
    }
  }, [isOpen]);

  // 드롭다운이 열릴 때 tempSearchForm 초기화
  useEffect(() => {
    if (isOpen) {
      setTempSearchForm(searchForm.clone());
    }
  }, [isOpen, searchForm]);

  const handleFilterChange = (name: string, value: any, op: QueryConditionType = 'EQUAL') => {
    setTempSearchForm((prevForm) => {
      const newSearchForm = prevForm?.clone() ?? SearchForm.create();
      const targetField = entityForm.getField(name);

      // ManyToOneField 처리
      if (targetField instanceof AbstractManyToOneField) {
        const isMultiFilter = isTrue(targetField.listConfig?.multiFilter);

        if (isMultiFilter) {
          // multiFilter가 활성화된 경우: 배열 값을 그대로 사용, IN operator
          const idFieldName = targetField.config.field?.id ?? 'id';
          name = name + '.' + idFieldName;
          // value는 이미 ID 배열이므로 그대로 사용
          if (Array.isArray(value) && value.length > 0) {
            // 배열의 길이가 1이면 EQUAL, 그 이상이면 IN
            op = value.length === 1 ? 'EQUAL' : 'IN';
            value = value.length === 1 ? value[0] : value;
          }
        } else {
          // 기존 단일 선택 로직
          if (targetField.config.field?.id) {
            name = name + '.' + targetField.config.field.id;
            if (value !== undefined && value[targetField.config.field.id] !== undefined) {
              value = value[targetField.config.field.id];
            }
          } else {
            name = name + '.id';
            if (value?.['id'] !== undefined) {
              value = value['id'];
            }
          }
        }
      }

      // OptionalField에서 다중 선택인 경우
      if (targetField instanceof OptionalField && (targetField.options?.length ?? 0) > 2) {
        op = 'IN';
      }

      // 필터 추가/수정/삭제
      const isEmpty = Array.isArray(value) ? value.length === 0 : isBlank(value);
      if (isEmpty && op !== 'NULL' && op !== 'NOT_NULL') {
        newSearchForm.removeFilter(name);
      } else {
        newSearchForm.handleAndFilter(name, value, op);
      }

      return newSearchForm;
    });
  };

  const handleApply = () => {
    if (tempSearchForm) {
      onChangeSearchForm(tempSearchForm, true);
    }
    closeFilter();
  };

  const handleClear = () => {
    const newSearchForm = searchForm.clone();

    // 기본 필드명으로 제거
    newSearchForm.removeFilter(fieldName);

    // ManyToOneField인 경우 .id도 제거
    if (field instanceof AbstractManyToOneField) {
      newSearchForm.removeFilter(fieldName + '.id');
      if (field.config.field?.id) {
        newSearchForm.removeFilter(fieldName + '.' + field.config.field.id);
      }
    }

    onChangeSearchForm(newSearchForm, true);
    closeFilter();
  };

  // 필터링 불가능한 필드 또는 비활성화된 필드는 렌더링하지 않음
  // (QuickSearch 활성 시 해당 필드의 헤더 필터는 비활성화됨)
  if (!field.isFilterable() || disabled) {
    return null;
  }

  // 필드 타입에 따라 드롭다운 크기 결정
  const getDropdownSize = (): FilterDropdownSize => {
    const fieldType = field.type;

    // 큰 크기: Date, Datetime (빠른 선택 버튼들이 많음)
    if (fieldType === 'date' || fieldType === 'datetime') {
      return 'lg';
    }

    // ManyToOne + multiFilter인 경우 큰 크기 (칩들이 많이 표시됨)
    if (field instanceof AbstractManyToOneField && isTrue(field.listConfig?.multiFilter)) {
      return 'lg';
    }

    // 중간 크기: ManyToOne, Select, Number 등
    if (
      fieldType === 'manyToOne' ||
      field instanceof AbstractManyToOneField ||
      fieldType === 'number'
    ) {
      return 'md';
    }

    // 작은 크기: String, Email, Boolean 등 기본
    return 'sm';
  };

  return (
    <div ref={buttonRef} className="relative inline-block">
      <FilterButton
        isActive={hasFilter}
        onClick={() => {
          if (isOpen) {
            closeFilter();
          } else {
            openFilter(filterId);
          }
        }}
      />

      {isOpen &&
        tempSearchForm &&
        (() => {
          // ManyToOneField인 경우 .id로 값을 가져옴 (AdvancedSearchForm과 동일)
          const searchFieldName =
            field instanceof AbstractManyToOneField ? field.getName() + '.id' : field.getName();
          const fieldValue = tempSearchForm.getSearchValue(searchFieldName);
          const filterField = field.clone(false).withValue(fieldValue);

          return (
            <FilterDropdown
              isOpen={isOpen}
              onClose={closeFilter}
              onClear={handleClear}
              onApply={handleApply}
              size={getDropdownSize()}
              placement={placement}
              anchorRef={buttonRef}
            >
              <FilterView
                entityForm={entityForm}
                field={filterField}
                value={fieldValue}
                onChange={handleFilterChange}
              />
            </FilterDropdown>
          );
        })()}
    </div>
  );
};
