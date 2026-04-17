'use client';

import React, {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import {useCardSubCollectionData} from '../hooks/useCardSubCollectionData';
import {EntityForm} from '../../../config/EntityForm';
import {
  CardSubCollectionFetchOptions,
  CardSubCollectionRelation
} from '../../../config/CardSubCollectionField';
import {TableConfig} from '../../../config/TableSubCollectionField';
import {Session} from '../../../auth/types';
import {SearchForm} from '@gjcu/ui/form/SearchForm';
import {Tooltip} from '@gjcu/ui/elements/tooltip/Tooltip';
import {ListableFormField} from '../../fields/abstract';
import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconHelp,
  IconRefresh,
  IconSearch,
  IconTable,
  IconX,
} from '@tabler/icons-react';

export interface TableSubCollectionViewProps {
  parentEntityForm: EntityForm;
  parentId: string;
  entityForm: EntityForm;
  fetchUrl: string | ((parentForm: EntityForm) => string);
  tableConfig?: TableConfig;
  relation: CardSubCollectionRelation;
  readonly?: boolean;
  session?: Session;
  fetchOptions?: CardSubCollectionFetchOptions;
  initialSearchForm?: SearchForm;
  tooltip?: ReactNode;
}

interface ColumnDef {
  name: string;
  label: string;
  options?: { label: string; value: string }[];
}

/**
 * TableSubCollectionView
 * Displays a collection of items in a table format
 */
export const TableSubCollectionView: React.FC<TableSubCollectionViewProps> = ({
  parentEntityForm,
  parentId,
  entityForm,
  fetchUrl: fetchUrlProp,
  tableConfig,
  relation,
  readonly = false,
  session,
  fetchOptions,
  initialSearchForm,
  tooltip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Check if a field name matches mappedBy patterns
  const isMappedByField = useCallback((fieldName: string, mappedBy: string): boolean => {
    if (fieldName === mappedBy) return true;
    let baseField = mappedBy;
    if (mappedBy.endsWith('Id')) {
      baseField = mappedBy.slice(0, -2);
    } else if (mappedBy.endsWith('.id')) {
      baseField = mappedBy.slice(0, -3);
    }
    if (fieldName === baseField) return true;
    if (fieldName.startsWith(baseField + '.')) return true;
    return false;
  }, []);

  // Build column definitions from entityForm fields
  const columns = useMemo((): ColumnDef[] => {
    const fields = Array.from(entityForm.fields.values());
    const mappedBy = relation.mappedBy;
    const displayFields = tableConfig?.displayFields;
    const excludeFields = tableConfig?.excludeFields;

    let selectedFields: any[];

    if (displayFields && displayFields.length > 0) {
      // Use explicit displayFields order
      selectedFields = displayFields
        .map(name => fields.find(f => f.getName() === name))
        .filter(Boolean);
    } else {
      // Use list-enabled fields
      selectedFields = fields.filter((field: any) => {
        if (!(field instanceof ListableFormField)) return false;
        if (field.listConfig?.support !== true) return false;
        if (isMappedByField(field.getName(), mappedBy)) return false;
        if (excludeFields?.includes(field.getName())) return false;
        return true;
      });
    }

    return selectedFields.map((field: any) => {
      const label = field.getLabel();
      return {
        name: field.getName(),
        label: typeof label === 'string' ? label : field.getName(),
        options: field.options,
      };
    });
  }, [entityForm, relation.mappedBy, tableConfig, isMappedByField]);

  // quickSearch fields for search functionality
  const quickSearchFields = useMemo(() => {
    const fields = Array.from(entityForm.fields.values());
    const mappedBy = relation.mappedBy;
    return fields.filter((field: any) => {
      if (field.listConfig?.support !== true) return false;
      if (field.listConfig?.quickSearch !== true) return false;
      if (isMappedByField(field.getName(), mappedBy)) return false;
      return true;
    });
  }, [entityForm, relation.mappedBy, isMappedByField]);

  const searchPlaceholder = useMemo(() => {
    if (quickSearchFields.length === 0) return '검색';
    const labels = quickSearchFields.slice(0, 3).map((field) => {
      const label = field.getLabel();
      return typeof label === 'string' ? label : field.getName();
    });
    return `${labels.join(', ')} 검색`;
  }, [quickSearchFields]);

  const isQuickSearchEnabled = quickSearchFields.length > 0;

  const fetchUrl = useMemo(() => {
    if (typeof fetchUrlProp === 'function') {
      return fetchUrlProp(parentEntityForm);
    }
    return fetchUrlProp;
  }, [fetchUrlProp, parentEntityForm]);

  const { data, loading, error, refresh } = useCardSubCollectionData(
    fetchUrl,
    {
      mappedBy: relation.mappedBy,
      filterBy: relation.filterBy,
      useSearchForm: fetchOptions?.useSearchForm,
      searchForm: initialSearchForm,
    }
  );

  // Get nested field value from item
  const getFieldValue = useCallback((item: any, fieldName: string): any => {
    if (!fieldName.includes('.')) {
      return item[fieldName];
    }
    const keys = fieldName.split('.');
    let value = item;
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    return value;
  }, []);

  // Resolve display value for a cell
  const getCellDisplay = useCallback((item: any, col: ColumnDef): string => {
    const value = getFieldValue(item, col.name);
    if (value === null || value === undefined) return '';

    // Resolve select options
    if (col.options && Array.isArray(col.options)) {
      const rawValue = typeof value === 'object' ? value?.value : value;
      const option = col.options.find((opt: any) => opt.value === rawValue);
      if (option) return option.label;
    }

    // Boolean
    if (typeof value === 'boolean') {
      return value ? 'Y' : 'N';
    }

    // Object with name/title (ManyToOne)
    if (typeof value === 'object' && !Array.isArray(value)) {
      return value.name || value.title || value.label || JSON.stringify(value);
    }

    return String(value);
  }, [getFieldValue]);

  // Search filtering
  const searchValue = useCallback((value: any, query: string): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.toLowerCase().includes(query);
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const prop of ['name', 'title', 'label']) {
        if (value[prop] && typeof value[prop] === 'string' && value[prop].toLowerCase().includes(query)) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const filteredData = useMemo(() => {
    if (!isQuickSearchEnabled || !searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) =>
      quickSearchFields.some((field) => searchValue(getFieldValue(item, field.getName()), query))
    );
  }, [data, searchQuery, quickSearchFields, isQuickSearchEnabled, getFieldValue, searchValue]);

  // Pagination
  const pageSize = tableConfig?.pageSize;
  const isPaginationEnabled = pageSize && pageSize > 0;

  const totalPages = useMemo(() => {
    if (!isPaginationEnabled) return 1;
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData.length, pageSize, isPaginationEnabled]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (currentPage < 1 && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const paginatedData = useMemo(() => {
    if (!isPaginationEnabled) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, isPaginationEnabled]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const clearSearch = useCallback(() => { setSearchQuery(''); }, []);

  const showRowNumbers = tableConfig?.showRowNumbers !== false;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="h-9 w-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="h-10 bg-gray-50 dark:bg-gray-800 animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 border-t border-gray-100 dark:border-gray-800 animate-pulse bg-white dark:bg-gray-900" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-red-200/80 bg-gradient-to-br from-red-50 to-red-50/50 p-6 dark:border-red-900/50 dark:from-red-950/50 dark:to-red-900/20">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/50 dark:to-red-800/30">
            <IconAlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-red-800 dark:text-red-200">
              데이터를 불러오는 중 오류가 발생했습니다
            </h4>
            <p className="mt-1 text-sm text-red-600/90 dark:text-red-300/90 line-clamp-2">
              {error.message}
            </p>
            <button
              onClick={() => refresh()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-red-700 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors duration-150 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/50 dark:hover:border-red-700"
            >
              <IconRefresh className="h-4 w-4" />
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        {isQuickSearchEnabled && (
          <div className="relative flex-1 max-w-md group">
            <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors duration-150 ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`}>
              <IconSearch className="h-[18px] w-[18px]" stroke={2} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={searchPlaceholder}
              className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary/20"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors dark:hover:text-gray-300">
                <IconX className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100/80 text-gray-600 text-sm font-medium dark:bg-gray-800 dark:text-gray-400">
            {searchQuery ? (
              <>
                <span className="text-primary font-semibold">{filteredData.length}</span>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span>{data.length}</span>
              </>
            ) : (
              <span>{data.length}개</span>
            )}
          </div>

          <button
            onClick={() => refresh()}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 bg-gray-100/80 hover:bg-gray-200/80 hover:text-gray-700 transition-all duration-150 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="새로고침"
          >
            <IconRefresh className="h-4 w-4" stroke={2} />
          </button>

          {tooltip && (
            <Tooltip label={tooltip} color="gray" withArrow={true} position="top-end">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg cursor-help text-gray-400 bg-gray-100/80 hover:bg-gray-200/80 hover:text-gray-600 transition-all duration-150 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                <IconHelp className="h-4 w-4" stroke={2} />
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Table Content */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/50 to-transparent py-16 dark:border-gray-700 dark:from-gray-800/30">
          {searchQuery ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                <IconSearch className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                &apos;{searchQuery}&apos;에 대한 검색 결과가 없습니다
              </p>
              <button onClick={clearSearch} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors duration-150">
                검색 초기화
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                <IconTable className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                표시할 항목이 없습니다
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80">
                  {showRowNumbers && (
                    <th className="border-b border-gray-200 dark:border-gray-700 py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-12">
                      No
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.name}
                      className="border-b border-gray-200 dark:border-gray-700 py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedData.map((item, index) => {
                  const rowNumber = isPaginationEnabled
                    ? (currentPage - 1) * pageSize + index + 1
                    : index + 1;
                  return (
                    <tr
                      key={item.id || index}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {showRowNumbers && (
                        <td className="py-2.5 px-3 text-center text-gray-400 dark:text-gray-500 tabular-nums">
                          {rowNumber}
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.name}
                          className="py-2.5 px-3 text-center text-gray-700 dark:text-gray-300"
                        >
                          {getCellDisplay(item, col)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {isPaginationEnabled && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300" title="첫 페이지">
                <IconChevronsLeft className="h-4 w-4" stroke={2} />
              </button>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300" title="이전 페이지">
                <IconChevronLeft className="h-4 w-4" stroke={2} />
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="text-primary font-semibold">{currentPage}</span>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span>{totalPages}</span>
              </div>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300" title="다음 페이지">
                <IconChevronRight className="h-4 w-4" stroke={2} />
              </button>
              <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300" title="마지막 페이지">
                <IconChevronsRight className="h-4 w-4" stroke={2} />
              </button>
              <div className="ml-2 px-2 py-1 rounded-md text-xs text-gray-400 bg-gray-50 dark:text-gray-500 dark:bg-gray-800/50">
                {pageSize}개씩
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TableSubCollectionView;
