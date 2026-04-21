'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AbstractManyToOneField } from '../abstract';
import { CustomFieldRendererProps } from '../../form/types/ViewEntityFormTheme.types';
import { ManyToOneConfig } from '../../../config/Config';
import { SearchForm } from '../../../form/SearchForm';
import { isBlank } from '../../../utils/StringUtil';
import { getManyToOneEntityValue } from '../ManyToOneField';
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { ViewListGrid } from '../../list/ViewListGrid';
import { ListGrid } from '../../../config/ListGrid';
import { useModalManagerStore } from '../../../store';
import { PageResult } from '../../../form/Type';

/**
 * 카드 아이템의 스타일/렌더링 설정
 */
export interface CardItemConfig {
  /** 카드 컨테이너 className */
  containerClassName?: string;
  /** 선택된 카드 컨테이너 className */
  selectedContainerClassName?: string;
  /** 카드 타이틀 className */
  titleClassName?: string;
  /** 카드 라벨(뱃지) className */
  labelClassName?: string;
  /** 카드 설명 className */
  descriptionClassName?: string;
  /** 선택 아이콘 className */
  checkIconClassName?: string;
  /** 카드 아이템 렌더링 함수 (완전 커스텀) */
  renderCard?: (item: any, isSelected: boolean, onSelect: () => void) => React.ReactNode;
  /** 카드 타이틀 필드 이름 또는 함수 */
  titleField?: string | ((item: any) => string);
  /** 카드 라벨(뱃지) 필드 이름 또는 함수 */
  labelField?: string | ((item: any) => string);
  /** 카드 설명 필드 이름 또는 함수 */
  descriptionField?: string | ((item: any) => string);
  /** 카드 이미지 필드 이름 또는 함수 */
  imageField?: string | ((item: any) => string | undefined);
  /** 카드 하단 액션 영역 렌더링 함수 */
  renderAction?: (item: any) => React.ReactNode;
}

/**
 * CardManyToOneView Props
 */
export interface CardManyToOneViewProps extends CustomFieldRendererProps {
  /** 카드 그리드 컬럼 수 (기본: 3) */
  columns?: number;
  /** 모바일(sm) 화면에서의 컬럼 수 (기본: columns와 동일) */
  mobileColumns?: number;
  /** 카드 그리드 className */
  gridClassName?: string;
  /** 카드 아이템 설정 */
  cardConfig?: CardItemConfig;
  /** 선택 가능한 아이템 목록 (직접 제공하는 경우) */
  items?: any[];
  /** 아이템 목록 로드 함수 (커스텀 로드 로직) */
  loadItems?: () => Promise<any[]>;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 검색 버튼 표시 여부 */
  showSearchButton?: boolean;
  /** 선택되지 않은 상태에서 전체 목록 표시 여부 (기본: true) */
  showAllWhenEmpty?: boolean;
  /** 페이지당 카드 수 (기본: 6). 이 숫자를 초과하면 페이징+검색 UI 표시 */
  pageSize?: number;
  /** 검색 우선 모드: true면 검색 전까지 카드 목록 숨김 (서버 검색) */
  searchFirst?: boolean;
  /** 검색 입력란 플레이스홀더 */
  searchPlaceholder?: string;
  /** 검색 필드 지정 (기본: ['name']) */
  searchFields?: string[];
}

/**
 * CardManyToOneView
 *
 * ManyToOne 필드를 카드 형태로 표시하는 커스텀 렌더러입니다.
 * - readonly 모드: 선택된 카드만 표시
 * - 편집 모드: 선택된 카드 + 변경 버튼으로 다른 옵션 선택 가능
 *
 * @example
 * ```tsx
 * <EntityFormThemeProvider
 *   fieldRenderers={{
 *     syllabus: CardManyToOneView,
 *     selection: (props) => (
 *       <CardManyToOneView
 *         {...props}
 *         columns={3}
 *         cardConfig={{
 *           titleField: 'name',
 *           labelField: (item) => item.term?.name,
 *           descriptionField: (item) => `${item.year}년도 ${item.semester}학기`,
 *         }}
 *       />
 *     ),
 *   }}
 * >
 *   {children}
 * </EntityFormThemeProvider>
 * ```
 */
export const CardManyToOneView: React.FC<CardManyToOneViewProps> = ({
  field,
  entityForm,
  value,
  onChange,
  readonly,
  session,
  columns = 3,
  mobileColumns,
  gridClassName,
  cardConfig,
  items: providedItems,
  loadItems,
  emptyMessage = '선택 가능한 항목이 없습니다.',
  showSearchButton = true,
  showAllWhenEmpty = true,
  pageSize = 6,
  searchFirst = false,
  searchPlaceholder,
  searchFields = ['name'],
}) => {
  const { openModal, closeModal } = useModalManagerStore();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(!searchFirst); // searchFirst면 초기 로딩 상태 false
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isChanging, setIsChanging] = useState(false); // 변경 모드 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // searchFirst 모드에서 검색 실행 여부
  const [isSearching, setIsSearching] = useState(false); // 검색 중 상태

  // ManyToOne config 가져오기 - field.getName()을 의존성으로 사용해서 안정성 확보
  const fieldName = field.getName();
  const config = useMemo<ManyToOneConfig | undefined>(() => {
    if (field instanceof AbstractManyToOneField) {
      return (field as AbstractManyToOneField<any>).config;
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldName]); // field 객체 대신 fieldName 사용

  // value의 ID를 추출하는 헬퍼 함수
  const getValueId = useCallback((val: any): string | undefined => {
    if (!val) return undefined;
    if (typeof val === 'string') return val;
    return val.id;
  }, []);

  // 현재 value의 ID (메모이제이션)
  const currentValueId = useMemo(() => getValueId(value), [value, getValueId]);

  // 아이템 목록 로드 - currentValueId가 변경될 때만 실행
  const entityFormRef = useRef(entityForm);
  entityFormRef.current = entityForm; // 항상 최신 entityForm 참조 유지

  // 이전 값들을 추적하기 위한 ref
  const prevDepsRef = useRef({
    providedItems,
    loadItems,
    config,
    currentValueId,
  });

  useEffect(() => {
    // searchFirst 모드에서는 초기 로드 건너뜀
    if (searchFirst) {
      return;
    }

    // 어떤 dependency가 변경되었는지 로그
    const prevDeps = prevDepsRef.current;
    const changes: string[] = [];
    if (prevDeps.providedItems !== providedItems) changes.push('providedItems');
    if (prevDeps.loadItems !== loadItems) changes.push('loadItems');
    if (prevDeps.config !== config) changes.push('config');
    if (prevDeps.currentValueId !== currentValueId)
      changes.push(`currentValueId: ${prevDeps.currentValueId} -> ${currentValueId}`);

    // 현재 값 저장
    prevDepsRef.current = { providedItems, loadItems, config, currentValueId };

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        if (providedItems) {
          setItems(providedItems);
        } else if (loadItems) {
          const loadedItems = await loadItems();
          if (!cancelled) setItems(loadedItems);
        } else if (config?.entityForm) {
          // 기본: entityForm에서 목록 조회
          const searchForm = SearchForm.create();
          if (config.filter) {
            for (const filterItem of config.filter) {
              if (filterItem) {
                // 최신 entityForm 사용
                searchForm.withFilter('AND', ...(await filterItem(entityFormRef.current)));
              }
            }
          }
          if (config.entityForm.neverDelete) {
            searchForm.handleAndFilter('active', 'true');
          }
          searchForm.withPage(0).withPageSize(100);

          const url = config.entityForm.getUrl();
          const result = await PageResult.fetchListData(url, searchForm);
          if (!cancelled) {
            setItems(result?.list ?? []);
          }
        }
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providedItems, loadItems, config, currentValueId, fieldName, searchFirst]);

  // 현재 선택된 값 설정
  useEffect(() => {
    (async () => {
      if (value && config) {
        const entity = await getManyToOneEntityValue(field.getName(), value, config);
        setSelectedItem(entity);
      } else {
        setSelectedItem(null);
      }
    })();
  }, [value, config, field]);

  // 아이템 선택 핸들러
  const handleSelect = useCallback(
    (item: any) => {
      if (readonly) return;
      setSelectedItem(item);
      setIsChanging(false); // 선택 후 변경 모드 종료
      onChange(item, true);
    },
    [readonly, onChange],
  );

  // 선택 해제 핸들러
  const handleClear = useCallback(() => {
    if (readonly) return;
    setSelectedItem(null);
    onChange(undefined, true);
  }, [readonly, onChange]);

  // 변경 모드 토글
  const handleToggleChange = useCallback(() => {
    setIsChanging((prev) => !prev);
  }, []);

  // 검색 모달 핸들러
  const handleSearchModal = useCallback(() => {
    if (!config) return;

    const modalId = `card-manytoone-search-${field.getName()}`;
    const searchForm = SearchForm.create();

    openModal({
      modalId,
      title: `${field.getLabel()} 검색`,
      size: '5xl',
      content: (
        <div className="rcm-modal-content-scroll">
          <ViewListGrid
            listGrid={new ListGrid(config.entityForm).withSearchForm(searchForm)}
            options={{
              popup: true,
              ...(config.filterable !== undefined ? { filterable: config.filterable } : {}),
              readonly: true,
              selection: { enabled: false },
              manyToOne: {
                onSelect: (item) => {
                  handleSelect(item);
                  closeModal(modalId);
                },
              },
            }}
          />
        </div>
      ),
    });
  }, [config, field, openModal, closeModal, handleSelect]);

  // 타이틀 가져오기
  const getTitle = useCallback(
    (item: any): string => {
      if (cardConfig?.titleField) {
        if (typeof cardConfig.titleField === 'function') {
          return cardConfig.titleField(item);
        }
        return item[cardConfig.titleField] ?? '';
      }
      if (config?.field?.name) {
        if (typeof config.field.name === 'function') {
          return config.field.name(item);
        }
        return item[config.field.name] ?? '';
      }
      return item.name ?? item.title ?? '';
    },
    [cardConfig, config],
  );

  // 페이징/검색 필요 여부
  const needsPagination = items.length > pageSize;

  // 검색어로 필터링된 아이템
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const title = getTitle(item).toLowerCase();
      return title.includes(query);
    });
  }, [items, searchQuery, getTitle]);

  // 전체 페이지 수
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  // 현재 페이지의 아이템들
  const paginatedItems = useMemo(() => {
    if (!needsPagination) return items;
    const start = currentPage * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize, needsPagination, items]);

  // 검색어 변경 시 첫 페이지로
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  }, []);

  // 서버 검색 실행 (searchFirst 모드용)
  const handleServerSearch = useCallback(
    async (query: string) => {
      if (!config?.entityForm || isBlank(query.trim())) {
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const searchForm = SearchForm.create();

        // 기존 필터 적용
        if (config.filter) {
          for (const filterItem of config.filter) {
            if (filterItem) {
              searchForm.withFilter('AND', ...(await filterItem(entityFormRef.current)));
            }
          }
        }

        // 검색어 필터 추가 (OR 조건으로 searchFields에 대해 검색)
        const searchFilters = searchFields.map((fieldName) => ({
          name: fieldName,
          value: `%${query.trim()}%`,
          queryConditionType: 'LIKE' as const,
        }));
        if (searchFilters.length === 1) {
          searchForm.withFilter('AND', searchFilters[0]!);
        } else {
          // 여러 필드에 대해 OR 검색
          searchForm.withFilter('OR', ...searchFilters);
        }

        if (config.entityForm.neverDelete) {
          searchForm.handleAndFilter('active', 'true');
        }
        searchForm.withPage(0).withPageSize(pageSize * 3); // 검색 시 더 많이 가져옴

        const url = config.entityForm.getUrl();
        const result = await PageResult.fetchListData(url, searchForm);

        setItems(result?.list ?? []);
        setCurrentPage(0);
      } catch (e) {
        console.error('Server search failed:', e);
        setItems([]);
      } finally {
        setIsSearching(false);
      }
    },
    [config, searchFields, pageSize, fieldName],
  );

  // Enter 키 핸들러 (searchFirst 모드용)
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchFirst) {
        e.preventDefault();
        handleServerSearch(searchQuery);
      }
    },
    [searchFirst, searchQuery, handleServerSearch],
  );

  // 페이지 변경
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 라벨(뱃지) 가져오기
  const getLabel = useCallback(
    (item: any): string => {
      if (cardConfig?.labelField) {
        if (typeof cardConfig.labelField === 'function') {
          return cardConfig.labelField(item);
        }
        return item[cardConfig.labelField] ?? '';
      }
      return '';
    },
    [cardConfig],
  );

  // 설명 가져오기
  const getDescription = useCallback(
    (item: any): string => {
      if (cardConfig?.descriptionField) {
        if (typeof cardConfig.descriptionField === 'function') {
          return cardConfig.descriptionField(item);
        }
        return item[cardConfig.descriptionField] ?? '';
      } else if (cardConfig?.descriptionField === '') {
        return '';
      }
      return item.description ?? '';
    },
    [cardConfig],
  );

  // 이미지 가져오기
  const getImage = useCallback(
    (item: any): string | undefined => {
      if (cardConfig?.imageField) {
        if (typeof cardConfig.imageField === 'function') {
          return cardConfig.imageField(item);
        }
        return item[cardConfig.imageField];
      }
      return item.image ?? item.thumbnail ?? item.imageUrl;
    },
    [cardConfig],
  );

  // 아이템 선택 여부 확인
  const isItemSelected = useCallback(
    (item: any): boolean => {
      if (!selectedItem) return false;
      return selectedItem.id === item.id;
    },
    [selectedItem],
  );

  // 선택된 카드 렌더링 (readonly 모드 또는 선택 완료 상태)
  const renderSelectedCard = useCallback(
    (item: any) => {
      const image = getImage(item);
      const label = getLabel(item);
      const description = getDescription(item);

      return (
        <div
          key={item.id}
          className={cardConfig?.selectedContainerClassName ?? 'rcm-card-m2o rcm-card-m2o-selected'}
        >
          {/* 선택 체크 아이콘 */}
          <span
            className={cardConfig?.checkIconClassName ?? 'rcm-card-m2o-check rcm-icon-frame'}
            data-shape="circle"
            data-color="success"
          >
            <IconCheck size={14} />
          </span>

          {/* 이미지 영역 */}
          {image && (
            <div className="rcm-card-m2o-image-wrap">
              <img src={image} alt={getTitle(item)} className="rcm-card-m2o-image" />
            </div>
          )}

          {/* 라벨(뱃지) */}
          {!isBlank(label) && (
            <span className={cardConfig?.labelClassName ?? 'rcm-badge'} data-color="primary">
              {label}
            </span>
          )}

          {/* 타이틀 */}
          <h4 className={cardConfig?.titleClassName ?? 'rcm-text'} data-weight="semibold">
            {getTitle(item)}
          </h4>

          {/* 설명 */}
          {!isBlank(description) && (
            <p
              className={cardConfig?.descriptionClassName ?? 'rcm-card-m2o-description rcm-text'}
              data-tone="muted"
              data-size="sm"
            >
              {description}
            </p>
          )}

          {/* 액션 영역 */}
          {cardConfig?.renderAction && (
            <div className="rcm-card-m2o-action">{cardConfig.renderAction(item)}</div>
          )}
        </div>
      );
    },
    [cardConfig, getTitle, getLabel, getDescription, getImage],
  );

  // 선택 가능한 카드 렌더링 (편집 모드)
  const renderSelectableCard = useCallback(
    (item: any, selected: boolean, onSelect: () => void) => {
      const image = getImage(item);
      const label = getLabel(item);
      const description = getDescription(item);

      return (
        <div
          key={item.id}
          onClick={onSelect}
          className={`rcm-card-m2o rcm-card-m2o-clickable ${
            selected
              ? (cardConfig?.selectedContainerClassName ?? 'rcm-card-m2o-selected')
              : (cardConfig?.containerClassName ?? 'rcm-card-m2o-default')
          }`}
        >
          {/* 선택 체크 아이콘 */}
          {selected && (
            <span
              className={cardConfig?.checkIconClassName ?? 'rcm-card-m2o-check rcm-icon-frame'}
              data-shape="circle"
              data-color="success"
            >
              <IconCheck size={14} />
            </span>
          )}

          {/* 이미지 영역 */}
          {image && (
            <div className="rcm-card-m2o-image-wrap">
              <img src={image} alt={getTitle(item)} className="rcm-card-m2o-image" />
            </div>
          )}

          {/* 라벨(뱃지) */}
          {!isBlank(label) && (
            <span className={cardConfig?.labelClassName ?? 'rcm-badge'} data-color="neutral">
              {label}
            </span>
          )}

          {/* 타이틀 */}
          <h4
            className={cardConfig?.titleClassName ?? 'rcm-card-m2o-title-sm rcm-text'}
            data-weight="semibold"
          >
            {getTitle(item)}
          </h4>

          {/* 설명 */}
          {!isBlank(description) && (
            <p
              className={
                cardConfig?.descriptionClassName ??
                'rcm-card-m2o-description rcm-card-m2o-description-clamp rcm-text'
              }
              data-tone="muted"
              data-size="sm"
            >
              {description}
            </p>
          )}

          {/* 액션 영역 */}
          {cardConfig?.renderAction && (
            <div className="rcm-card-m2o-action">{cardConfig.renderAction(item)}</div>
          )}
        </div>
      );
    },
    [cardConfig, getTitle, getLabel, getDescription, getImage],
  );

  if (loading) {
    return (
      <div className="rcm-card-m2o-loading">
        <div className="rcm-card-m2o-spinner" />
      </div>
    );
  }

  // readonly 모드: 선택된 카드만 표시
  if (readonly) {
    if (!selectedItem) {
      return <div className="rcm-card-m2o-empty-readonly">선택된 항목이 없습니다.</div>;
    }
    return (
      <div className="rcm-card-m2o-wrapper">
        {cardConfig?.renderCard
          ? cardConfig.renderCard(selectedItem, true, () => {})
          : renderSelectedCard(selectedItem)}
      </div>
    );
  }

  // 편집 모드: 선택된 카드가 있고 변경 모드가 아닌 경우
  if (selectedItem && !isChanging) {
    return (
      <div className="rcm-card-m2o-wrapper rcm-card-m2o-stack">
        {/* 선택된 카드 */}
        {cardConfig?.renderCard
          ? cardConfig.renderCard(selectedItem, true, () => {})
          : renderSelectedCard(selectedItem)}

        {/* 액션 버튼 */}
        <div className="rcm-card-m2o-actions">
          <button
            type="button"
            onClick={handleToggleChange}
            className="rcm-button"
            data-variant="outline"
            data-size="sm"
          >
            <IconEdit size={16} />
            변경
          </button>
          <button type="button" onClick={handleClear} className="rcm-button" data-size="sm">
            <IconX size={16} />
            선택 해제
          </button>
        </div>
      </div>
    );
  }

  // 편집 모드: 변경 중이거나 선택된 카드가 없는 경우
  return (
    <div className="rcm-card-m2o-wrapper">
      {/* 변경 모드 헤더 */}
      {isChanging && selectedItem && (
        <div className="rcm-card-m2o-change-header">
          <h4 className="rcm-text" data-weight="semibold">
            다른 항목을 선택해주세요
          </h4>
          <button
            type="button"
            onClick={handleToggleChange}
            className="rcm-button"
            data-variant="ghost"
            data-size="sm"
          >
            취소
          </button>
        </div>
      )}

      {/* searchFirst 모드: 검색 폼 항상 표시 */}
      {searchFirst && (
        <div className="rcm-card-m2o-search-section">
          <div className="rcm-card-m2o-search-row">
            <div className="rcm-card-m2o-search-input-wrap">
              <IconSearch
                size={18}
                className="rcm-card-m2o-search-icon rcm-icon"
                data-size="sm"
                data-tone="muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder ?? '검색어를 입력하세요...'}
                className="rcm-card-m2o-search-input rcm-input"
                data-size="sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setItems([]);
                    setHasSearched(false);
                    setCurrentPage(0);
                  }}
                  className="rcm-card-m2o-search-clear rcm-icon-btn"
                  data-size="sm"
                >
                  <IconX size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleServerSearch(searchQuery)}
              disabled={isSearching || isBlank(searchQuery.trim())}
              className="rcm-button"
              data-variant="primary"
              data-size="sm"
            >
              {isSearching ? (
                <div className="rcm-card-m2o-spinner rcm-card-m2o-spinner-inverse" />
              ) : (
                <IconSearch size={16} />
              )}
              검색
            </button>
          </div>
          {(hasSearched || isSearching) && (
            <span className="rcm-card-m2o-search-status rcm-text" data-size="xs" data-tone="muted">
              {isSearching ? '검색 중...' : `검색 결과: ${items.length}건`}
            </span>
          )}
        </div>
      )}

      {/* 기존 검색 UI (아이템이 pageSize 초과할 때만, searchFirst 아닐 때) */}
      {!searchFirst && needsPagination && (
        <div className="rcm-card-m2o-search-section">
          <div className="rcm-card-m2o-search-input-wrap">
            <IconSearch
              size={18}
              className="rcm-card-m2o-search-icon rcm-icon"
              data-size="sm"
              data-tone="muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="이름으로 검색..."
              className="rcm-card-m2o-search-input rcm-input"
              data-size="sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(0);
                }}
                className="rcm-card-m2o-search-clear rcm-icon-btn"
                data-size="sm"
              >
                <IconX size={16} />
              </button>
            )}
          </div>
          <span className="rcm-card-m2o-search-status rcm-text" data-size="xs" data-tone="muted">
            총 {filteredItems.length}개 {searchQuery && `(검색결과)`}
          </span>
        </div>
      )}

      {/* 카드 그리드 */}
      {/* searchFirst 모드: 검색 전에는 안내 메시지 표시 */}
      {searchFirst && !hasSearched ? (
        <div className="rcm-card-m2o-search-empty">
          <IconSearch
            size={32}
            className="rcm-card-m2o-search-empty-icon rcm-icon"
            data-size="lg"
            data-tone="disabled"
          />
          <p className="rcm-text" data-tone="muted">
            검색어를 입력하고 검색 버튼을 클릭하세요
          </p>
        </div>
      ) : paginatedItems.length > 0 ? (
        <div
          id={`card-grid-${field.getName()}`}
          className={gridClassName ?? 'rcm-card-m2o-grid'}
          style={
            !gridClassName
              ? {
                  gridTemplateColumns: `repeat(${mobileColumns ?? columns}, minmax(0, 1fr))`,
                }
              : undefined
          }
        >
          {/* 데스크톱 반응형을 위한 미디어 쿼리 스타일 */}
          {!gridClassName && mobileColumns !== undefined && mobileColumns !== columns && (
            <style>{`
              @media (min-width: 1024px) {
                #card-grid-${field.getName()} {
                  grid-template-columns: repeat(${columns}, minmax(0, 1fr)) !important;
                }
              }
            `}</style>
          )}
          {paginatedItems.map((item) => {
            const selected = isItemSelected(item);
            if (cardConfig?.renderCard) {
              return cardConfig.renderCard(item, selected, () => handleSelect(item));
            }
            return renderSelectableCard(item, selected, () => handleSelect(item));
          })}
        </div>
      ) : (
        <div className="rcm-card-m2o-no-results">
          <p>
            {searchFirst && hasSearched
              ? '검색 결과가 없습니다.'
              : searchQuery
                ? '검색 결과가 없습니다.'
                : emptyMessage}
          </p>
        </div>
      )}

      {/* 페이지네이션 UI (전체 페이지가 1 초과할 때만) */}
      {needsPagination && totalPages > 1 && (
        <div className="rcm-card-m2o-pagination">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="rcm-icon-btn"
            data-size="sm"
          >
            <IconChevronLeft size={18} />
          </button>
          <div className="rcm-card-m2o-page-numbers">
            {Array.from({ length: totalPages }, (_, i) => {
              const isActive = currentPage === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePageChange(i)}
                  className="rcm-button"
                  data-variant={isActive ? 'primary' : 'ghost'}
                  data-size="sm"
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="rcm-icon-btn"
            data-size="sm"
          >
            <IconChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CardManyToOneView;
