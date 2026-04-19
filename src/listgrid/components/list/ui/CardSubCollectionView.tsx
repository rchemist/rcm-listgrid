'use client';

import React, { useMemo, useState, useCallback, ReactNode, useEffect } from 'react';
import { useCardSubCollectionData } from '../hooks/useCardSubCollectionData';
import { CardItem } from './CardItem';
import { CardSubCollectionModal } from './CardSubCollectionModal';
import { EntityForm } from '../../../config/EntityForm';
import {
  CardSubCollectionRelation,
  CardConfig,
  CardSubCollectionFetchOptions,
} from '../../../config/CardSubCollectionField';
import { Session } from '../../../auth/types';
import { SearchForm } from '../../../form/SearchForm';
import { Tooltip } from '../../../ui';
import {
  IconHelp,
  IconSearch,
  IconX,
  IconPlus,
  IconRefresh,
  IconLayoutGrid,
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';

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

  // Get quickSearch fields from entity form (excluding mappedBy fields)
  const quickSearchFields = useMemo(() => {
    const fields = Array.from(entityForm.fields.values());
    const mappedBy = relation.mappedBy;

    return fields.filter((field: any) => {
      if (field.listConfig?.support !== true) return false;
      if (field.listConfig?.quickSearch !== true) return false;
      if (isMappedByField(field.name, mappedBy)) return false;
      return true;
    });
  }, [entityForm, relation.mappedBy, isMappedByField]);

  const searchPlaceholder = useMemo(() => {
    if (quickSearchFields.length === 0) {
      return '검색';
    }

    const labels = quickSearchFields.slice(0, 3).map((field) => {
      const label = field.getLabel();
      return typeof label === 'string' ? label : field.getName();
    });

    return `${labels.join(', ')} 검색`;
  }, [quickSearchFields]);

  const isQuickSearchEnabled = quickSearchFields.length > 0;

  // Get the actual fetch URL
  const fetchUrl = useMemo(() => {
    if (typeof fetchUrlProp === 'function') {
      return fetchUrlProp(parentEntityForm);
    }
    return fetchUrlProp;
  }, [fetchUrlProp, parentEntityForm]);

  // Fetch data using the hook
  const { data, loading, error, refresh } = useCardSubCollectionData(fetchUrl, {
    mappedBy: relation.mappedBy,
    ...(relation.filterBy !== undefined ? { filterBy: relation.filterBy } : {}),
    ...(fetchOptions?.useSearchForm !== undefined
      ? { useSearchForm: fetchOptions.useSearchForm }
      : {}),
    ...(initialSearchForm !== undefined ? { searchForm: initialSearchForm } : {}),
  });

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

  const searchValue = useCallback((value: any, query: string): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') {
      return value.toLowerCase().includes(query);
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
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

  const filteredData = useMemo(() => {
    if (!isQuickSearchEnabled || !searchQuery.trim()) {
      return data;
    }
    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      return quickSearchFields.some((field) => {
        const fieldName = field.getName();
        const value = getFieldValue(item, fieldName);
        return searchValue(value, query);
      });
    });
  }, [data, searchQuery, quickSearchFields, isQuickSearchEnabled, getFieldValue, searchValue]);

  const pageSize = cardConfig?.pageSize;
  const isPaginationEnabled = pageSize && pageSize > 0;

  const totalPages = useMemo(() => {
    if (!isPaginationEnabled) return 1;
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData.length, pageSize, isPaginationEnabled]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedData = useMemo(() => {
    if (!isPaginationEnabled) return filteredData;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, isPaginationEnabled]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const goToFirstPage = useCallback(() => goToPage(1), [goToPage]);
  const goToLastPage = useCallback(() => goToPage(totalPages), [goToPage, totalPages]);
  const goToPrevPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);
  const goToNextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);

  // Parse columns configuration
  const cardColumns = useMemo(() => {
    const columnsConfig = cardConfig?.columns;
    if (typeof columnsConfig === 'object' && columnsConfig !== null) {
      return columnsConfig.card;
    }
    return 2;
  }, [cardConfig?.columns]);

  // rcm-subcollection-card-grid + optional variant for sm+ breakpoint.
  const gridClassName = useMemo(() => {
    const variant =
      cardColumns >= 1 && cardColumns <= 4
        ? ` rcm-subcollection-card-grid-${cardColumns}`
        : ' rcm-subcollection-card-grid-2';
    return `rcm-subcollection-card-grid${variant}`;
  }, [cardColumns]);

  const handleCardClick = useCallback(
    (item: any) => {
      if (viewDetail || !readonly) {
        setSelectedItemId(item.id);
        setModalMode(readonly ? 'view' : 'view');
        setIsModalOpen(true);
      }
    },
    [viewDetail, readonly],
  );

  const handleEdit = useCallback(
    (item: any) => {
      if (onItemEdit) {
        onItemEdit(item);
      } else {
        setSelectedItemId(item.id);
        setModalMode('edit');
        setIsModalOpen(true);
      }
    },
    [onItemEdit],
  );

  const handleDelete = useCallback(
    async (item: any) => {
      if (onItemDelete) {
        onItemDelete(item);
      } else {
        setSelectedItemId(item.id);
        setModalMode('edit');
        setIsModalOpen(true);
      }
    },
    [onItemDelete],
  );

  const handleAdd = useCallback(() => {
    if (onItemAdd) {
      onItemAdd();
    } else {
      setSelectedItemId(null);
      setModalMode('create');
      setIsModalOpen(true);
    }
  }, [onItemAdd]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemId(null);
    setModalMode(null);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    refresh();
    handleModalClose();
  }, [refresh, handleModalClose]);

  const handleDeleteSuccess = useCallback(() => {
    refresh();
    handleModalClose();
  }, [refresh, handleModalClose]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="rcm-subcollection-skeleton">
        <div className="rcm-subcollection-skeleton-toolbar">
          <div className="rcm-subcollection-skeleton-search" />
          <div className="rcm-subcollection-skeleton-actions">
            <div className="rcm-subcollection-skeleton-pill" />
            <div className="rcm-subcollection-skeleton-pill" />
          </div>
        </div>
        <div className={gridClassName}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rcm-subcollection-skeleton-card">
              <div className="rcm-subcollection-skeleton-card-header">
                <div className="rcm-subcollection-skeleton-value" />
              </div>
              <div className="rcm-subcollection-skeleton-card-body">
                <div className="rcm-subcollection-skeleton-card-row">
                  <div className="rcm-subcollection-skeleton-card-field">
                    <div className="rcm-subcollection-skeleton-label" />
                    <div className="rcm-subcollection-skeleton-value" />
                  </div>
                  <div className="rcm-subcollection-skeleton-card-field">
                    <div className="rcm-subcollection-skeleton-label" />
                    <div className="rcm-subcollection-skeleton-value" />
                  </div>
                </div>
                <div className="rcm-subcollection-skeleton-card-row">
                  <div className="rcm-subcollection-skeleton-card-field">
                    <div className="rcm-subcollection-skeleton-label" />
                    <div className="rcm-subcollection-skeleton-value" />
                  </div>
                  <div className="rcm-subcollection-skeleton-card-field">
                    <div className="rcm-subcollection-skeleton-label" />
                    <div className="rcm-subcollection-skeleton-value" />
                  </div>
                </div>
              </div>
            </div>
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
        {/* Search Input */}
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

          {!readonly && (
            <button type="button" onClick={handleAdd} className="rcm-subcollection-add-btn">
              <IconPlus size={16} stroke={2.5} />
              <span className="rcm-subcollection-add-btn-label">추가</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
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
              <p className="rcm-subcollection-empty-hint">다른 키워드로 검색해 보세요</p>
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
                <IconLayoutGrid size={32} />
              </div>
              <p className="rcm-subcollection-empty-title">표시할 항목이 없습니다</p>
              {!readonly && (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="rcm-subcollection-empty-action"
                >
                  <IconPlus size={16} />첫 번째 항목 추가
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className={gridClassName}>
            {paginatedData.map((item) => (
              <CardItem
                key={item.id}
                item={item}
                entityForm={entityForm}
                parentEntityForm={parentEntityForm}
                parentId={parentId}
                {...(cardConfig !== undefined ? { cardConfig } : {})}
                relation={relation}
                readonly={readonly}
                {...(session !== undefined ? { session } : {})}
                {...(viewDetail ? { onClick: () => handleCardClick(item) } : {})}
                {...(!readonly ? { onEdit: () => handleEdit(item) } : {})}
                {...(!readonly ? { onDelete: () => handleDelete(item) } : {})}
              />
            ))}
          </div>

          {/* Pagination UI */}
          {isPaginationEnabled && totalPages > 1 && (
            <div className="rcm-subcollection-pagination">
              <button
                type="button"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="rcm-subcollection-page-btn"
                title="첫 페이지"
              >
                <IconChevronsLeft size={16} stroke={2} />
              </button>
              <button
                type="button"
                onClick={goToPrevPage}
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
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="rcm-subcollection-page-btn"
                title="다음 페이지"
              >
                <IconChevronRight size={16} stroke={2} />
              </button>
              <button
                type="button"
                onClick={goToLastPage}
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
