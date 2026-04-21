'use client';

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useCardSubCollectionData } from '../hooks/useCardSubCollectionData';
import { EntityForm } from '../../../config/EntityForm';
import {
  CardSubCollectionFetchOptions,
  CardSubCollectionRelation,
} from '../../../config/CardSubCollectionField';
import { TableConfig } from '../../../config/TableSubCollectionField';
import { Session } from '../../../auth/types';
import { SearchForm } from '../../../form/SearchForm';
import { Tooltip } from '../../../ui';
import { ListableFormField } from '../../fields/abstract';
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
        .map((name) => fields.find((f) => f.getName() === name))
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

  const { data, loading, error, refresh } = useCardSubCollectionData(fetchUrl, {
    mappedBy: relation.mappedBy,
    ...(relation.filterBy !== undefined ? { filterBy: relation.filterBy } : {}),
    ...(fetchOptions?.useSearchForm !== undefined
      ? { useSearchForm: fetchOptions.useSearchForm }
      : {}),
    ...(initialSearchForm !== undefined ? { searchForm: initialSearchForm } : {}),
  });

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
  const getCellDisplay = useCallback(
    (item: any, col: ColumnDef): string => {
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
    },
    [getFieldValue],
  );

  // Search filtering
  const searchValue = useCallback((value: any, query: string): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.toLowerCase().includes(query);
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const prop of ['name', 'title', 'label']) {
        if (
          value[prop] &&
          typeof value[prop] === 'string' &&
          value[prop].toLowerCase().includes(query)
        ) {
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
      quickSearchFields.some((field) => searchValue(getFieldValue(item, field.getName()), query)),
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedData = useMemo(() => {
    if (!isPaginationEnabled) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, isPaginationEnabled]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const showRowNumbers = tableConfig?.showRowNumbers !== false;

  // Loading state
  if (loading) {
    return (
      <div className="rcm-subcollection-skeleton">
        <div className="rcm-subcollection-skeleton-toolbar">
          <div className="rcm-subcollection-skeleton-search" />
          <div className="rcm-subcollection-skeleton-actions">
            <div className="rcm-subcollection-skeleton-pill" />
          </div>
        </div>
        <div className="rcm-subcollection-skeleton-table">
          <div className="rcm-subcollection-skeleton-thead" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rcm-subcollection-skeleton-tr" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rcm-subcollection-error">
        <div className="rcm-subcollection-error-icon">
          <IconAlertCircle size={24} />
        </div>
        <div className="rcm-subcollection-error-body">
          <h4 className="rcm-subcollection-error-title">
            데이터를 불러오는 중 오류가 발생했습니다
          </h4>
          <p className="rcm-subcollection-error-message">{error.message}</p>
          <button type="button" onClick={() => refresh()} className="rcm-subcollection-error-retry">
            <IconRefresh size={16} />
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rcm-subcollection">
      {/* Header Bar */}
      <div className="rcm-subcollection-toolbar">
        {/* Search */}
        {isQuickSearchEnabled && (
          <div className="rcm-subcollection-search">
            <span
              className={
                isSearchFocused
                  ? 'rcm-subcollection-search-icon rcm-subcollection-search-icon-focused'
                  : 'rcm-subcollection-search-icon'
              }
            >
              <IconSearch size={18} stroke={2} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={searchPlaceholder}
              className="rcm-subcollection-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="rcm-subcollection-search-clear"
                aria-label="검색어 지우기"
              >
                <IconX size={16} />
              </button>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="rcm-subcollection-actions">
          <div className="rcm-subcollection-count">
            {searchQuery ? (
              <>
                <span className="rcm-subcollection-count-accent">{filteredData.length}</span>
                <span className="rcm-subcollection-count-sep">/</span>
                <span>{data.length}</span>
              </>
            ) : (
              <span>{data.length}개</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => refresh()}
            className="rcm-subcollection-icon-btn"
            title="새로고침"
          >
            <IconRefresh size={16} stroke={2} />
          </button>

          {tooltip && (
            <Tooltip label={tooltip} color="gray" withArrow={true} position="top-end">
              <div className="rcm-subcollection-icon-btn rcm-subcollection-icon-btn-help">
                <IconHelp size={16} stroke={2} />
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Table Content */}
      {filteredData.length === 0 ? (
        <div className="rcm-subcollection-empty">
          {searchQuery ? (
            <>
              <div className="rcm-subcollection-empty-icon">
                <IconSearch size={32} />
              </div>
              <p className="rcm-subcollection-empty-title">
                &apos;{searchQuery}&apos;에 대한 검색 결과가 없습니다
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="rcm-subcollection-empty-action"
              >
                검색 초기화
              </button>
            </>
          ) : (
            <>
              <div className="rcm-subcollection-empty-icon">
                <IconTable size={32} />
              </div>
              <p className="rcm-subcollection-empty-title">표시할 항목이 없습니다</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="rcm-subcollection-table-wrapper">
            <table className="rcm-subcollection-table">
              <thead>
                <tr>
                  {showRowNumbers && <th className="rcm-subcollection-th-no">No</th>}
                  {columns.map((col) => (
                    <th key={col.name}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => {
                  const rowNumber = isPaginationEnabled
                    ? (currentPage - 1) * pageSize + index + 1
                    : index + 1;
                  return (
                    <tr key={item.id || index}>
                      {showRowNumbers && <td className="rcm-subcollection-td-no">{rowNumber}</td>}
                      {columns.map((col) => (
                        <td key={col.name}>{getCellDisplay(item, col)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {isPaginationEnabled && totalPages > 1 && (
            <div className="rcm-subcollection-pagination">
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="rcm-subcollection-page-btn"
                title="첫 페이지"
              >
                <IconChevronsLeft size={16} stroke={2} />
              </button>
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rcm-subcollection-page-btn"
                title="이전 페이지"
              >
                <IconChevronLeft size={16} stroke={2} />
              </button>
              <div className="rcm-subcollection-page-info">
                <span className="rcm-subcollection-page-info-current">{currentPage}</span>
                <span className="rcm-subcollection-count-sep">/</span>
                <span>{totalPages}</span>
              </div>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rcm-subcollection-page-btn"
                title="다음 페이지"
              >
                <IconChevronRight size={16} stroke={2} />
              </button>
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rcm-subcollection-page-btn"
                title="마지막 페이지"
              >
                <IconChevronsRight size={16} stroke={2} />
              </button>
              <div className="rcm-subcollection-page-size-badge">{pageSize}개씩</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TableSubCollectionView;
