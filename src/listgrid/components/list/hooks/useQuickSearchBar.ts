'use client';
import { getTranslation } from '../../../utils/i18n';
import { useCallback, useEffect, useState } from 'react';
import { QuickSearchBarProps } from '../QuickSearchBar';
import { getLocalStorageItem, setLocalStorageItem } from '../../../misc';
import { QuickSearchProps } from '../../../config/ListGrid';
import { ListableFormField } from '../../fields/abstract';
import { QueryConditionType, SearchForm } from '../../../form/SearchForm';

// NOT 계열 조건인지 확인하는 유틸리티 함수
const isNotCondition = (queryConditionType?: QueryConditionType): boolean => {
  if (!queryConditionType) return false;

  return (
    queryConditionType.startsWith('NOT_') ||
    queryConditionType === 'NOT_EQUAL' ||
    queryConditionType === 'NOT_LIKE' ||
    queryConditionType === 'NOT_START_WITH' ||
    queryConditionType === 'NOT_END_WITH' ||
    queryConditionType === 'NOT_BETWEEN' ||
    queryConditionType === 'NOT_LESS_THAN' ||
    queryConditionType === 'NOT_LESS_THAN_EQUAL' ||
    queryConditionType === 'NOT_GREATER' ||
    queryConditionType === 'NOT_GREATER_THAN_EQUAL'
  );
};

export const PAGE_SIZE_STORAGE_KEY = 'listgrid_global_page_size';
export const DEFAULT_PAGE_SIZE = 20;

export const getGlobalPageSize = (): number => {
  const stored = getLocalStorageItem(PAGE_SIZE_STORAGE_KEY);
  if (stored) {
    const size = parseInt(stored, 10);
    if (!isNaN(size) && size > 0) {
      return size;
    }
  }
  return DEFAULT_PAGE_SIZE;
};

export const setGlobalPageSize = (size: number): void => {
  setLocalStorageItem(PAGE_SIZE_STORAGE_KEY, size.toString());
};

export function getFilteredAndSearchEnabled(
  listFields: ListableFormField<any>[],
  searchForm: SearchForm,
): {
  filtered: boolean;
  searchEnabled: boolean;
} {
  let filtered = false;
  let searchEnabled = false;

  for (const field of listFields) {
    if (searchEnabled && filtered) {
      break;
    }
    if (field.isFilterable()) {
      searchEnabled = true;
      if (!filtered) {
        const fieldName = field.type === 'manyToOne' ? field.getName() + '.id' : field.getName();
        const filterResults = searchForm.getFilter(fieldName);

        // 필터가 존재하지만 NOT 조건이 아닌 경우만 filtered로 판단
        filtered =
          filterResults.length > 0 &&
          filterResults.some((result) =>
            result.filters.some((filterItem) => !isNotCondition(filterItem.queryConditionType)),
          );
      }
    }
  }
  return { filtered, searchEnabled };
}

export function getQuickSearchLabel(
  quickSearchProperty: QuickSearchProps | undefined,
  t: (key: string) => string,
): string {
  if (quickSearchProperty?.label) {
    const mainLabel =
      typeof quickSearchProperty.label === 'string'
        ? t(quickSearchProperty.label)
        : String(quickSearchProperty.label);

    // Combine with orFieldLabels if available
    if (quickSearchProperty.orFieldLabels && quickSearchProperty.orFieldLabels.length > 0) {
      const otherLabels = quickSearchProperty.orFieldLabels.map((label) =>
        typeof label === 'string' ? t(label) : String(label),
      );
      const allLabels = [mainLabel, ...otherLabels];
      return `${allLabels.join(', ')}...`;
    }

    return `${mainLabel}...`;
  }
  return '';
}

export const useQuickSearchBar = (props: QuickSearchBarProps) => {
  const { quickSearchValue, searchForm, onChangeSearchForm, listFields, quickSearchProperty } =
    props;
  const { t } = getTranslation();
  const [search, setSearch] = useState<string>(quickSearchValue ?? '');

  useEffect(() => {
    setSearch(quickSearchValue ?? '');
  }, [quickSearchValue]);

  useEffect(() => {
    const globalPageSize = getGlobalPageSize();
    if (searchForm.getPageSize() !== globalPageSize) {
      onChangeSearchForm(searchForm.clone().withPage(0).withPageSize(globalPageSize));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageSizeChange = useCallback(
    (value: string) => {
      const newPageSize = Number(value);
      setGlobalPageSize(newPageSize);
      if (searchForm) {
        const newSearchForm = searchForm.clone().withPage(0).withPageSize(newPageSize);
        onChangeSearchForm(newSearchForm);
      }
    },
    [searchForm, onChangeSearchForm],
  );

  const quickSearchEnabled = quickSearchProperty !== undefined;
  const { filtered, searchEnabled } = getFilteredAndSearchEnabled(listFields, searchForm);
  const quickSearchLabel = getQuickSearchLabel(quickSearchProperty, t);

  return {
    search,
    setSearch,
    quickSearchEnabled,
    quickSearchLabel,
    handlePageSizeChange,
    filtered,
    searchEnabled,
  };
};
