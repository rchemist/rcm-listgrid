'use client';

import React, { useMemo, useState, useCallback, ReactNode, useEffect } from 'react';
import { useCardSubCollectionData } from '../hooks/useCardSubCollectionData';
import { CardItem } from './CardItem';
import { CardSubCollectionModal } from './CardSubCollectionModal';
import { EntityForm } from '../../../config/EntityForm';
import { CardSubCollectionRelation, CardConfig, CardSubCollectionFetchOptions, ColumnsConfig } from '../../../config/CardSubCollectionField';
import { Session } from '@gjcu/ui/auth/types';
import { SearchForm } from '@gjcu/ui/form/SearchForm';
import { Tooltip } from '@gjcu/ui/elements/tooltip/Tooltip';
import { IconHelp, IconSearch, IconX, IconPlus, IconRefresh, IconLayoutGrid, IconAlertCircle, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';

export interface CardSubCollectionViewProps {
  /** Parent entity form */
  parentEntityForm: EntityForm;
  /** Parent entity ID */
  parentId: string;
  /** Entity form for the collection items */
  entityForm: EntityForm;
  /** Fetch URL (string or function) */
  fetchUrl: string | ((parentForm: EntityForm) => string);
  /** Card subcollection configuration */
  cardConfig?: CardConfig;
  /** Relation configuration */
  relation: CardSubCollectionRelation;
  /** Readonly mode */
  readonly?: boolean;
  /** User session */
  session?: Session;
  /** Called when item is edited (optional external handler) */
  onItemEdit?: (item: any) => void;
  /** Called when item is deleted (optional external handler) */
  onItemDelete?: (item: any) => void;
  /** Called when item is added (optional external handler) */
  onItemAdd?: () => void;
  /** Fetch options for SearchForm-based fetching */
  fetchOptions?: CardSubCollectionFetchOptions;
  /** Initial SearchForm for SearchForm-based fetching */
  initialSearchForm?: SearchForm;
  /** Whether to show view detail modal on card click */
  viewDetail?: boolean;
  /** Tooltip content to display next to the section */
  tooltip?: ReactNode;
}

type ModalMode = 'view' | 'edit' | 'create' | null;

/**
 * CardSubCollectionView
 * Displays a collection of items in a professional card grid format
 * Features: Client-side search, responsive grid, CRUD operations
 */
export const CardSubCollectionView: React.FC<CardSubCollectionViewProps> = ({
  parentEntityForm,
  parentId,
  entityForm,
  fetchUrl: fetchUrlProp,
  cardConfig,
  relation,
  readonly = false,
  session,
  onItemEdit,
  onItemDelete,
  onItemAdd,
  fetchOptions,
  initialSearchForm,
  viewDetail = false,
  tooltip,
}) => {
  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Helper: Check if a field name matches mappedBy patterns (should be excluded)
  const isMappedByField = useCallback((fieldName: string, mappedBy: string): boolean => {
    // 1. Exact match
    if (fieldName === mappedBy) return true;

    // 2. Base field without Id/.id suffix
    let baseField = mappedBy;
    if (mappedBy.endsWith('Id')) {
      baseField = mappedBy.slice(0, -2);
    } else if (mappedBy.endsWith('.id')) {
      baseField = mappedBy.slice(0, -3);
    }

    // 3. Exact base field match
    if (fieldName === baseField) return true;

    // 4. Nested pattern match (e.g., "student.name" when mappedBy is "studentId")
    if (fieldName.startsWith(baseField + '.')) return true;

    return false;
  }, []);

  // Get quickSearch fields from entity form (excluding mappedBy fields)
  // Logic matches ViewListGrid: first get list fields (support: true), then filter by quickSearch
  const quickSearchFields = useMemo(() => {
    const fields = Array.from(entityForm.fields.values());
    const mappedBy = relation.mappedBy;

    return fields.filter((field: any) => {
      // Must be a list field (shown in list view) - matches getListFields() behavior
      if (field.listConfig?.support !== true) return false;
      // Must have quickSearch explicitly enabled
      if (field.listConfig?.quickSearch !== true) return false;
      // Exclude mappedBy related fields (parent reference fields shouldn't be searched)
      if (isMappedByField(field.name, mappedBy)) return false;
      return true;
    });
  }, [entityForm, relation.mappedBy, isMappedByField]);

  // Generate search placeholder from quickSearch fields
  const searchPlaceholder = useMemo(() => {
    if (quickSearchFields.length === 0) {
      return '검색';
    }

    const labels = quickSearchFields
      .slice(0, 3)
      .map((field) => {
        const label = field.getLabel();
        return typeof label === 'string' ? label : field.getName();
      });

    return `${labels.join(', ')} 검색`;
  }, [quickSearchFields]);

  // Check if quick search is enabled (at least one quickSearch field exists)
  const isQuickSearchEnabled = quickSearchFields.length > 0;

  // Get the actual fetch URL
  const fetchUrl = useMemo(() => {
    if (typeof fetchUrlProp === 'function') {
      return fetchUrlProp(parentEntityForm);
    }
    return fetchUrlProp;
  }, [fetchUrlProp, parentEntityForm]);

  // Fetch data using the hook
  const { data, loading, error, refresh } = useCardSubCollectionData(
    fetchUrl,
    {
      mappedBy: relation.mappedBy,
      filterBy: relation.filterBy,
      useSearchForm: fetchOptions?.useSearchForm,
      searchForm: initialSearchForm,
    }
  );

  // Get field value from item, supporting nested paths (e.g., 'course.name')
  const getFieldValue = useCallback((item: any, fieldName: string): any => {
    if (!fieldName.includes('.')) {
      return item[fieldName];
    }

    // Handle nested path
    const keys = fieldName.split('.');
    let value = item;
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    return value;
  }, []);

  // Search a single value (string comparison)
  const searchValue = useCallback((value: any, query: string): boolean => {
    if (value === null || value === undefined) return false;

    // String match
    if (typeof value === 'string') {
      return value.toLowerCase().includes(query);
    }

    // For ManyToOne fields, check common display properties
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Check common display properties: name, title, label
      const displayProps = ['name', 'title', 'label'];
      for (const prop of displayProps) {
        if (value[prop] && typeof value[prop] === 'string') {
          if (value[prop].toLowerCase().includes(query)) {
            return true;
          }
        }
      }
    }

    return false;
  }, []);

  // Client-side search filtering - ONLY searches quickSearch fields
  const filteredData = useMemo(() => {
    // If no quickSearch fields defined or no search query, return all data
    if (!isQuickSearchEnabled || !searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      // Search only through quickSearch fields
      return quickSearchFields.some((field) => {
        const fieldName = field.getName();
        const value = getFieldValue(item, fieldName);
        return searchValue(value, query);
      });
    });
  }, [data, searchQuery, quickSearchFields, isQuickSearchEnabled, getFieldValue, searchValue]);

  // Client-side pagination configuration
  const pageSize = cardConfig?.pageSize;
  const isPaginationEnabled = pageSize && pageSize > 0;

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!isPaginationEnabled) return 1;
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData.length, pageSize, isPaginationEnabled]);

  // Reset page when search results change and current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!isPaginationEnabled) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, isPaginationEnabled]);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToFirstPage = useCallback(() => goToPage(1), [goToPage]);
  const goToLastPage = useCallback(() => goToPage(totalPages), [goToPage, totalPages]);
  const goToPrevPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);
  const goToNextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);

  // Parse columns configuration
  // - If number: field columns only, card grid auto-calculated (default: 2)
  // - If object { card, field }: explicit values for both
  const cardColumns = useMemo(() => {
    const columnsConfig = cardConfig?.columns;

    if (typeof columnsConfig === 'object' && columnsConfig !== null) {
      return columnsConfig.card;
    }

    // Default: auto-calculate card columns (default to 2)
    return 2;
  }, [cardConfig?.columns]);

  // Generate responsive grid class names for CARD grid
  // Mobile: always 1 column
  // Desktop (sm+): use cardColumns
  const gridClassName = useMemo(() => {
    const baseClass = 'grid gap-4 grid-cols-1'; // Mobile: always 1 column

    // Desktop breakpoint: use cardColumns
    const desktopClass = cardColumns === 1 ? 'sm:grid-cols-1' :
                         cardColumns === 2 ? 'sm:grid-cols-2' :
                         cardColumns === 3 ? 'sm:grid-cols-3' :
                         cardColumns === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-2';

    return `${baseClass} ${desktopClass}`.trim();
  }, [cardColumns]);

  // Handle card click for view detail
  const handleCardClick = useCallback((item: any) => {
    if (viewDetail || !readonly) {
      setSelectedItemId(item.id);
      setModalMode(readonly ? 'view' : 'view');
      setIsModalOpen(true);
    }
  }, [viewDetail, readonly]);

  // Handle edit button click
  const handleEdit = useCallback((item: any) => {
    if (onItemEdit) {
      onItemEdit(item);
    } else {
      setSelectedItemId(item.id);
      setModalMode('edit');
      setIsModalOpen(true);
    }
  }, [onItemEdit]);

  // Handle delete button click
  const handleDelete = useCallback(async (item: any) => {
    if (onItemDelete) {
      onItemDelete(item);
    } else {
      // Open modal in view mode with delete capability
      setSelectedItemId(item.id);
      setModalMode('edit');
      setIsModalOpen(true);
    }
  }, [onItemDelete]);

  // Handle add button click
  const handleAdd = useCallback(() => {
    if (onItemAdd) {
      onItemAdd();
    } else {
      setSelectedItemId(null);
      setModalMode('create');
      setIsModalOpen(true);
    }
  }, [onItemAdd]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemId(null);
    setModalMode(null);
  }, []);

  // Handle save success
  const handleSaveSuccess = useCallback(() => {
    refresh();
    handleModalClose();
  }, [refresh, handleModalClose]);

  // Handle delete success
  const handleDeleteSuccess = useCallback(() => {
    refresh();
    handleModalClose();
  }, [refresh, handleModalClose]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-5">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="h-11 w-72 animate-pulse rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
        {/* Cards Skeleton */}
        <div className={gridClassName}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="
                h-52 rounded-xl
                bg-gradient-to-br from-white via-white to-gray-50/80
                border border-gray-100
                shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/80
                dark:border-gray-700/60
                overflow-hidden
              "
            >
              <div className="h-14 bg-gradient-to-br from-gray-50/80 to-transparent dark:from-gray-800/50 p-4">
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200/80 dark:bg-gray-700" />
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="h-3 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200/80 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200/80 dark:bg-gray-700" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200/80 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-10 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200/80 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="
        relative overflow-hidden
        rounded-xl border border-red-200/80 bg-gradient-to-br from-red-50 to-red-50/50
        p-6
        dark:border-red-900/50 dark:from-red-950/50 dark:to-red-900/20
      ">
        <div className="flex items-start gap-4">
          <div className="
            flex items-center justify-center w-12 h-12 rounded-xl
            bg-gradient-to-br from-red-100 to-red-50
            dark:from-red-900/50 dark:to-red-800/30
          ">
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
              className="
                mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg
                text-sm font-medium
                bg-white text-red-700 border border-red-200
                hover:bg-red-50 hover:border-red-300
                transition-colors duration-150
                dark:bg-red-950/50 dark:text-red-300 dark:border-red-800
                dark:hover:bg-red-900/50 dark:hover:border-red-700
              "
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
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input - Only show when quickSearch fields exist */}
        {isQuickSearchEnabled && (
          <div className="relative flex-1 max-w-md group">
            <div className={`
              pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5
              transition-colors duration-150
              ${isSearchFocused ? 'text-primary' : 'text-gray-400'}
            `}>
              <IconSearch className="h-[18px] w-[18px]" stroke={2} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={searchPlaceholder}
              className="
                block w-full rounded-xl
                border border-gray-200 bg-white
                py-2.5 pl-10 pr-10
                text-sm text-gray-900 placeholder-gray-400
                shadow-sm
                transition-all duration-200
                focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10
                focus:shadow-[0_0_0_4px_rgba(var(--color-primary-rgb),0.1)]
                dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100 dark:placeholder-gray-500
                dark:focus:border-primary dark:focus:ring-primary/20
              "
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="
                  absolute inset-y-0 right-0 flex items-center pr-3
                  text-gray-400 hover:text-gray-600 transition-colors
                  dark:hover:text-gray-300
                "
              >
                <IconX className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Item Count Badge */}
          <div className="
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-gray-100/80 text-gray-600
            text-sm font-medium
            dark:bg-gray-800 dark:text-gray-400
          ">
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

          {/* Refresh Button */}
          <button
            onClick={() => refresh()}
            className="
              flex items-center justify-center w-9 h-9 rounded-lg
              text-gray-500 bg-gray-100/80
              hover:bg-gray-200/80 hover:text-gray-700
              transition-all duration-150
              dark:bg-gray-800 dark:text-gray-400
              dark:hover:bg-gray-700 dark:hover:text-gray-300
            "
            title="새로고침"
          >
            <IconRefresh className="h-4 w-4" stroke={2} />
          </button>

          {/* Tooltip */}
          {tooltip && (
            <Tooltip
              label={tooltip}
              color="gray"
              withArrow={true}
              position="top-end"
            >
              <div className="
                flex items-center justify-center w-9 h-9 rounded-lg
                cursor-help text-gray-400 bg-gray-100/80
                hover:bg-gray-200/80 hover:text-gray-600
                transition-all duration-150
                dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-300
              ">
                <IconHelp className="h-4 w-4" stroke={2} />
              </div>
            </Tooltip>
          )}

          {/* Add Button */}
          {!readonly && (
            <button
              onClick={handleAdd}
              className="
                inline-flex items-center gap-1.5 rounded-lg
                bg-gradient-to-r from-primary to-primary/90
                px-4 py-2
                text-sm font-medium text-white
                shadow-sm shadow-primary/20
                transition-all duration-200
                hover:from-primary/95 hover:to-primary/85
                hover:shadow-md hover:shadow-primary/25
                focus:outline-none focus:ring-4 focus:ring-primary/20
                active:scale-[0.98]
              "
            >
              <IconPlus className="h-4 w-4" stroke={2.5} />
              <span className="hidden sm:inline">추가</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredData.length === 0 ? (
        <div className="
          flex flex-col items-center justify-center
          rounded-xl border-2 border-dashed border-gray-200
          bg-gradient-to-br from-gray-50/50 to-transparent
          py-16
          dark:border-gray-700 dark:from-gray-800/30
        ">
          {searchQuery ? (
            <>
              <div className="
                flex items-center justify-center w-16 h-16 rounded-2xl
                bg-gray-100 dark:bg-gray-800
                mb-4
              ">
                <IconSearch className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                &apos;{searchQuery}&apos;에 대한 검색 결과가 없습니다
              </p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                다른 키워드로 검색해 보세요
              </p>
              <button
                onClick={clearSearch}
                className="
                  mt-4 px-4 py-2 rounded-lg
                  text-sm font-medium text-primary
                  bg-primary/5 hover:bg-primary/10
                  transition-colors duration-150
                "
              >
                검색 초기화
              </button>
            </>
          ) : (
            <>
              <div className="
                flex items-center justify-center w-16 h-16 rounded-2xl
                bg-gray-100 dark:bg-gray-800
                mb-4
              ">
                <IconLayoutGrid className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                표시할 항목이 없습니다
              </p>
              {!readonly && (
                <button
                  onClick={handleAdd}
                  className="
                    mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg
                    text-sm font-medium text-primary
                    bg-primary/5 hover:bg-primary/10
                    transition-colors duration-150
                  "
                >
                  <IconPlus className="h-4 w-4" />
                  첫 번째 항목 추가
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className={`${gridClassName} w-full`}>
            {paginatedData.map((item) => (
              <CardItem
                key={item.id}
                item={item}
                entityForm={entityForm}
                parentEntityForm={parentEntityForm}
                parentId={parentId}
                cardConfig={cardConfig}
                relation={relation}
                readonly={readonly}
                session={session}
                onClick={viewDetail ? () => handleCardClick(item) : undefined}
                onEdit={!readonly ? () => handleEdit(item) : undefined}
                onDelete={!readonly ? () => handleDelete(item) : undefined}
              />
            ))}
          </div>

          {/* Pagination UI */}
          {isPaginationEnabled && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              {/* First Page */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="
                  flex items-center justify-center w-8 h-8 rounded-lg
                  text-gray-500 bg-white border border-gray-200
                  hover:bg-gray-50 hover:text-gray-700
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500
                  transition-all duration-150
                  dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400
                  dark:hover:bg-gray-700 dark:hover:text-gray-300
                  dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-400
                "
                title="첫 페이지"
              >
                <IconChevronsLeft className="h-4 w-4" stroke={2} />
              </button>

              {/* Previous Page */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="
                  flex items-center justify-center w-8 h-8 rounded-lg
                  text-gray-500 bg-white border border-gray-200
                  hover:bg-gray-50 hover:text-gray-700
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500
                  transition-all duration-150
                  dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400
                  dark:hover:bg-gray-700 dark:hover:text-gray-300
                  dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-400
                "
                title="이전 페이지"
              >
                <IconChevronLeft className="h-4 w-4" stroke={2} />
              </button>

              {/* Page Info */}
              <div className="
                flex items-center gap-1.5 px-3 py-1.5
                text-sm font-medium text-gray-600 dark:text-gray-400
              ">
                <span className="text-primary font-semibold">{currentPage}</span>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span>{totalPages}</span>
              </div>

              {/* Next Page */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="
                  flex items-center justify-center w-8 h-8 rounded-lg
                  text-gray-500 bg-white border border-gray-200
                  hover:bg-gray-50 hover:text-gray-700
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500
                  transition-all duration-150
                  dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400
                  dark:hover:bg-gray-700 dark:hover:text-gray-300
                  dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-400
                "
                title="다음 페이지"
              >
                <IconChevronRight className="h-4 w-4" stroke={2} />
              </button>

              {/* Last Page */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="
                  flex items-center justify-center w-8 h-8 rounded-lg
                  text-gray-500 bg-white border border-gray-200
                  hover:bg-gray-50 hover:text-gray-700
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500
                  transition-all duration-150
                  dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400
                  dark:hover:bg-gray-700 dark:hover:text-gray-300
                  dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-400
                "
                title="마지막 페이지"
              >
                <IconChevronsRight className="h-4 w-4" stroke={2} />
              </button>

              {/* Items per page indicator */}
              <div className="
                ml-2 px-2 py-1 rounded-md
                text-xs text-gray-400 bg-gray-50
                dark:text-gray-500 dark:bg-gray-800/50
              ">
                {pageSize}개씩
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal for view/edit/create */}
      <CardSubCollectionModal
        isOpen={isModalOpen}
        entityForm={entityForm}
        parentEntityForm={parentEntityForm}
        itemId={selectedItemId}
        relation={relation}
        mode={modalMode}
        onClose={handleModalClose}
        onSave={handleSaveSuccess}
        onDelete={handleDeleteSuccess}
        readonly={readonly || modalMode === 'view'}
        allowDelete={!readonly && modalMode === 'edit'}
      />
    </div>
  );
};

export default CardSubCollectionView;
