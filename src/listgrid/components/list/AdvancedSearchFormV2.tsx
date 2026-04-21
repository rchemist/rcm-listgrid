'use client';

import { QueryConditionType, SearchForm } from '../../form/SearchForm';
import {
  AbstractManyToOneField,
  ListableFormField,
  MultipleOptionalField,
  OptionalField,
} from '../fields/abstract';
import { EntityForm } from '../../config/EntityForm';
import React, { Fragment, useCallback, useEffect, useMemo, useReducer } from 'react';
import { getTranslation } from '../../utils/i18n';
import { Transition } from '@headlessui/react';
import { isBlank } from '../../utils/StringUtil';
import { MemoizedFilterField } from './ui/MemoizedFilterField';
import { FieldSelector } from './ui/FieldSelector';
import {
  IconLayoutGrid,
  IconLayoutList,
  IconRefresh,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { QuickSearchProps } from '../../config/ListGrid';

// NOT condition check utility
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

// State management with useReducer for better performance
interface SearchFormState {
  tempSearchForm: SearchForm | null;
  selectedFields: Set<string>;
  isGridView: boolean;
  /** 통합검색 모드 사용 여부 (quickSearch 필드들을 단일 필드로 통합) */
  useQuickSearchMode: boolean;
  /** 통합검색 입력값 */
  quickSearchValue: string;
}

type SearchFormAction =
  | { type: 'SET_TEMP_FORM'; payload: SearchForm }
  | {
      type: 'SYNC_EXTERNAL_FORM';
      payload: {
        searchForm: SearchForm;
        quickSearchValue?: string;
        hasMultipleQuickSearchFields?: boolean;
        quickSearchFieldNames?: Set<string>;
      };
    }
  | { type: 'UPDATE_FILTER'; payload: { name: string; value: any; op: QueryConditionType } }
  | { type: 'TOGGLE_FIELD'; payload: string }
  | { type: 'SELECT_ALL_FIELDS'; payload: string[] }
  | { type: 'DESELECT_ALL_FIELDS' }
  | { type: 'RESET_FORM' }
  | { type: 'TOGGLE_VIEW' }
  | { type: 'TOGGLE_QUICK_SEARCH_MODE' }
  | { type: 'SET_QUICK_SEARCH_VALUE'; payload: string }
  | { type: 'INIT_SELECTED_FIELDS'; payload: { listFieldNames: Set<string> } };

function searchFormReducer(state: SearchFormState, action: SearchFormAction): SearchFormState {
  switch (action.type) {
    case 'SET_TEMP_FORM':
      return { ...state, tempSearchForm: action.payload };

    case 'SYNC_EXTERNAL_FORM': {
      const newForm = action.payload.searchForm.clone();
      const quickSearchValue = action.payload.quickSearchValue ?? '';
      const hasMultipleQuickSearchFields = action.payload.hasMultipleQuickSearchFields ?? false;
      const quickSearchFieldNames = action.payload.quickSearchFieldNames ?? new Set<string>();

      // 통합검색 모드 기본값 결정:
      // 1. quickSearchValue가 있으면 (OR 검색 활성) → true
      // 2. quickSearch 필드가 2개 이상이고, 해당 필드에 AND 필터가 없으면 → true
      // 3. 그 외 → false
      let useQuickSearchMode = false;

      // AND 필터가 있는 quickSearch 필드들을 찾아서 selectedFields에 추가할 준비
      const andFilters = newForm.getFilters().get('AND') ?? [];
      const quickSearchFieldsWithAndFilter: string[] = [];

      if (!isBlank(quickSearchValue)) {
        // OR 검색이 이미 활성화된 상태
        useQuickSearchMode = true;
      } else if (hasMultipleQuickSearchFields) {
        // quickSearch 필드가 2개 이상인 경우, AND 필터 존재 여부 확인
        andFilters.forEach((filter) => {
          // 직접 매칭
          if (quickSearchFieldNames.has(filter.name)) {
            quickSearchFieldsWithAndFilter.push(filter.name);
          }
          // ManyToOne 필드의 경우 .id 접미사 제거하여 확인
          [...quickSearchFieldNames].forEach((fieldName) => {
            if (filter.name === `${fieldName}.id`) {
              quickSearchFieldsWithAndFilter.push(fieldName);
            }
          });
        });

        // quickSearch 필드에 AND 필터가 없으면 통합검색 모드 활성화
        useQuickSearchMode = quickSearchFieldsWithAndFilter.length === 0;
      }

      // 통합검색 모드가 아니고 quickSearch 필드에 AND 필터가 있으면
      // 해당 필드들을 selectedFields에 추가
      let newSelectedFields = state.selectedFields;
      if (!useQuickSearchMode && quickSearchFieldsWithAndFilter.length > 0) {
        newSelectedFields = new Set(state.selectedFields);
        quickSearchFieldsWithAndFilter.forEach((fieldName) => {
          newSelectedFields.add(fieldName);
        });
      }

      return {
        ...state,
        tempSearchForm: newForm,
        selectedFields: newSelectedFields,
        quickSearchValue,
        useQuickSearchMode,
      };
    }

    case 'INIT_SELECTED_FIELDS': {
      // listFieldNames를 그대로 사용 - 목록에 표시되는 필드는 모두 검색 필드로 선택
      // (quickSearch 필드도 포함 - 개별 AND 필터로 사용 가능)
      const { listFieldNames } = action.payload;
      return {
        ...state,
        selectedFields: new Set(listFieldNames),
      };
    }

    case 'UPDATE_FILTER': {
      if (!state.tempSearchForm) return state;

      const newForm = state.tempSearchForm.clone();
      const { name, value, op } = action.payload;

      if (isNotCondition(op)) {
        return state;
      }

      if (isBlank(value) && op !== 'NULL' && op !== 'NOT_NULL') {
        newForm.removeFilter(name);
      } else {
        // 항상 AND 조건으로 필터 적용
        newForm.handleAndFilter(name, value, op);
      }

      return { ...state, tempSearchForm: newForm };
    }

    case 'TOGGLE_FIELD': {
      const newSelected = new Set(state.selectedFields);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return { ...state, selectedFields: newSelected };
    }

    case 'SELECT_ALL_FIELDS':
      return { ...state, selectedFields: new Set(action.payload) };

    case 'DESELECT_ALL_FIELDS':
      return { ...state, selectedFields: new Set() };

    case 'RESET_FORM':
      return {
        ...state,
        tempSearchForm: SearchForm.create(),
        quickSearchValue: '',
        useQuickSearchMode: false,
      };

    case 'TOGGLE_VIEW':
      return { ...state, isGridView: !state.isGridView };

    case 'TOGGLE_QUICK_SEARCH_MODE':
      return { ...state, useQuickSearchMode: !state.useQuickSearchMode };

    case 'SET_QUICK_SEARCH_VALUE':
      return { ...state, quickSearchValue: action.payload };

    default:
      return state;
  }
}

interface ViewAdvancedSearchProps {
  entityForm: EntityForm;
  fields: ListableFormField<any>[];
  listFieldNames?: Set<string>; // 목록에 표시되는 필드명 (기본 선택용)
  quickSearchProperty?: QuickSearchProps;
  searchForm: SearchForm;
  onSubmit: (searchForm: SearchForm) => void;
  onReset: () => void;
  onClose: () => void;
  show: boolean;
  subCollection?: boolean;
  popup?: boolean;
}

export const AdvancedSearchFormV2 = ({
  fields,
  entityForm,
  listFieldNames,
  quickSearchProperty,
  searchForm,
  show,
  onClose,
  subCollection = false,
  popup = false,
  ...props
}: ViewAdvancedSearchProps) => {
  // subCollection 또는 popup 모드에서는 컴팩트 스타일 적용
  const isCompactMode = subCollection || popup;
  const { t } = getTranslation();

  // QuickSearch 필드명 목록 추출
  const quickSearchFieldNames = useMemo(() => {
    if (!quickSearchProperty) return new Set<string>();

    const names = new Set<string>();
    names.add(quickSearchProperty.name);

    if (quickSearchProperty.orFields) {
      quickSearchProperty.orFields.forEach((name) => names.add(name));
    }

    return names;
  }, [quickSearchProperty]);

  // QuickSearch 필드 존재 여부
  const hasQuickSearchFields = quickSearchFieldNames.size > 0;

  // 통합검색이 의미 있는 경우: quickSearch 필드가 2개 이상일 때만
  // (원칙: 퀵서치 가능 필드가 하나 뿐이라면 통합 필드가 필요 없다)
  const hasMultipleQuickSearchFields = quickSearchFieldNames.size > 1;

  // Get filterable fields only (computed once)
  const filterableFields = useMemo(() => {
    return fields.filter((field) => field.isFilterable());
  }, [fields]);

  // QuickSearch가 아닌 일반 필드들
  const regularFields = useMemo(() => {
    return filterableFields.filter((field) => !quickSearchFieldNames.has(field.getName()));
  }, [filterableFields, quickSearchFieldNames]);

  // QuickSearch 필드들
  const quickSearchFields = useMemo(() => {
    return filterableFields.filter((field) => quickSearchFieldNames.has(field.getName()));
  }, [filterableFields, quickSearchFieldNames]);

  // Initialize selected fields based on listFieldNames (columns shown in list)
  // Include ALL listFieldNames (including quickSearch fields) for consistent display
  const initialSelectedFields = useMemo(() => {
    // listFieldNames가 있으면 그대로 사용 (quickSearch 필드도 포함)
    if (listFieldNames && listFieldNames.size > 0) {
      // listFieldNames를 그대로 사용 - 목록에 표시되는 필드는 모두 검색 필드로 선택
      return new Set(listFieldNames);
    }

    // fallback: filterableFields에서 처음 6개
    return new Set(filterableFields.slice(0, 6).map((f) => f.getName()));
  }, [listFieldNames, filterableFields]);

  // State management with useReducer
  const [state, dispatch] = useReducer(searchFormReducer, {
    tempSearchForm: null,
    selectedFields: initialSelectedFields,
    isGridView: true,
    useQuickSearchMode: false,
    quickSearchValue: '',
  });

  // listFieldNames가 있으면 selectedFields 초기화 (최초 1회)
  const initializedRef = React.useRef(false);
  useEffect(() => {
    if (listFieldNames && listFieldNames.size > 0 && !initializedRef.current) {
      initializedRef.current = true;
      dispatch({
        type: 'INIT_SELECTED_FIELDS',
        payload: { listFieldNames },
      });
    }
  }, [listFieldNames]);

  // Sync temp form with external searchForm
  useEffect(() => {
    const quickSearchValue = searchForm.getQuickSearchValue() ?? '';
    dispatch({
      type: 'SYNC_EXTERNAL_FORM',
      payload: {
        searchForm,
        quickSearchValue,
        hasMultipleQuickSearchFields,
        quickSearchFieldNames,
      },
    });
  }, [searchForm, hasMultipleQuickSearchFields, quickSearchFieldNames]);

  // Memoized handlers
  const handleFilterChange = useCallback(
    (name: string, value: any, op: QueryConditionType = 'EQUAL') => {
      const field = entityForm.getField(name);

      if (field instanceof AbstractManyToOneField) {
        if (field.config.field?.id) {
          name = name + '.' + field.config.field.id;
          if (value !== undefined && value[field.config.field.id] !== undefined) {
            value = value[field.config.field.id];
          }
        } else {
          name = name + '.id';
          if (value?.['id'] !== undefined) {
            value = value['id'];
          }
        }
      }

      if (field instanceof OptionalField && field.singleFilter) {
        op = 'EQUAL';
      } else if (field instanceof MultipleOptionalField) {
        op = 'IN';
      } else if (field instanceof OptionalField && (field.options?.length ?? 0) > 2) {
        op = 'IN';
      }

      dispatch({ type: 'UPDATE_FILTER', payload: { name, value, op } });
    },
    [entityForm],
  );

  const handleToggleField = useCallback((fieldName: string) => {
    dispatch({ type: 'TOGGLE_FIELD', payload: fieldName });
  }, []);

  const handleSelectAll = useCallback(() => {
    // QuickSearch 모드에서는 quickSearch 필드 제외
    const fieldsToSelect = state.useQuickSearchMode
      ? regularFields.map((f) => f.getName())
      : filterableFields.map((f) => f.getName());
    dispatch({ type: 'SELECT_ALL_FIELDS', payload: fieldsToSelect });
  }, [filterableFields, regularFields, state.useQuickSearchMode]);

  const handleDeselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL_FIELDS' });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
    props.onReset();
  }, [props]);

  const handleSubmit = useCallback(() => {
    if (state.tempSearchForm) {
      const newForm = state.tempSearchForm.clone();

      if (quickSearchProperty) {
        const allQuickSearchFields = [
          quickSearchProperty.name,
          ...(quickSearchProperty.orFields ?? []),
        ];

        // 통합검색 모드인 경우 quickSearch 필드들에 OR 조건으로 검색 적용
        if (state.useQuickSearchMode && !isBlank(state.quickSearchValue)) {
          newForm.handleQuickSearch(state.quickSearchValue, allQuickSearchFields);
        } else {
          // 통합검색 모드가 아니거나 값이 없으면 기존 quickSearch OR 필터 제거
          newForm.handleQuickSearch('', allQuickSearchFields);
        }
      }

      props.onSubmit(newForm);
    }
  }, [
    state.tempSearchForm,
    state.useQuickSearchMode,
    state.quickSearchValue,
    quickSearchProperty,
    props,
  ]);

  const handleToggleView = useCallback(() => {
    dispatch({ type: 'TOGGLE_VIEW' });
  }, []);

  const handleToggleQuickSearchMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_QUICK_SEARCH_MODE' });
  }, []);

  const handleQuickSearchValueChange = useCallback((value: string) => {
    dispatch({ type: 'SET_QUICK_SEARCH_VALUE', payload: value });
  }, []);

  // Get field value for display
  const getFieldValue = useCallback(
    (field: ListableFormField<any>) => {
      if (!state.tempSearchForm) return null;

      const fieldName =
        field instanceof AbstractManyToOneField ? field.getName() + '.id' : field.getName();

      // AND 조건에서 필터 조회
      const andFilters = state.tempSearchForm.getFilters().get('AND');
      const filterItem = andFilters?.find((item) => item.name === fieldName);

      // Don't show NOT condition values in UI
      if (isNotCondition(filterItem?.queryConditionType)) {
        return null;
      }

      if (filterItem) {
        return filterItem.values && filterItem.values.length > 0
          ? filterItem.values
          : filterItem.value;
      }

      return null;
    },
    [state.tempSearchForm],
  );

  // Fields to display (filtered by selection and mode)
  const displayFields = useMemo(() => {
    // 통합검색 모드에서는 quickSearch 필드 제외
    const availableFields = state.useQuickSearchMode ? regularFields : filterableFields;
    return availableFields.filter((field) => state.selectedFields.has(field.getName()));
  }, [filterableFields, regularFields, state.selectedFields, state.useQuickSearchMode]);

  // QuickSearch 라벨 생성
  const quickSearchLabel = useMemo(() => {
    if (!quickSearchProperty) return '';

    const labels: string[] = [];

    // 메인 필드 라벨
    if (typeof quickSearchProperty.label === 'string') {
      labels.push(t(quickSearchProperty.label));
    }

    // orFieldLabels가 있으면 추가
    if (quickSearchProperty.orFieldLabels) {
      quickSearchProperty.orFieldLabels.forEach((label) => {
        if (typeof label === 'string') {
          labels.push(t(label));
        }
      });
    }

    return labels.join(', ');
  }, [quickSearchProperty, t]);

  const hidden = !show || !searchForm || !state.tempSearchForm;

  return (
    <Transition appear show={!hidden} as={Fragment}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className={isCompactMode ? '' : 'rcm-adv-search-outer'}>
          <div className="rcm-adv-search-scroll">
            <div
              className={`rcm-adv-search-inner ${isCompactMode ? 'rcm-adv-search-inner-compact' : 'rcm-adv-search-inner-panel'}`}
            >
              {/* Header */}
              <div className="rcm-adv-search-header">
                <div className="rcm-adv-search-header-left">
                  <IconSearch className="rcm-adv-search-header-icon" />
                  <span className="rcm-text" data-size="md" data-weight="semibold">
                    통합 검색
                  </span>
                  <span className="rcm-adv-search-count">{displayFields.length}개 필드</span>
                </div>
                <div className="rcm-adv-search-header-right">
                  <button
                    type="button"
                    onClick={handleToggleView}
                    className="rcm-adv-search-view-toggle"
                    title={state.isGridView ? '리스트 뷰' : '그리드 뷰'}
                  >
                    {state.isGridView ? (
                      <IconLayoutList className="rcm-adv-search-view-icon" />
                    ) : (
                      <IconLayoutGrid className="rcm-adv-search-view-icon" />
                    )}
                  </button>
                </div>
              </div>

              {/* QuickSearch Mode Toggle (only if multiple quickSearch fields exist) */}
              {hasMultipleQuickSearchFields && (
                <div className="rcm-adv-search-qs-toggle">
                  <label className="rcm-adv-search-qs-label">
                    <input
                      type="checkbox"
                      checked={state.useQuickSearchMode}
                      onChange={handleToggleQuickSearchMode}
                      className="rcm-adv-search-qs-checkbox"
                    />
                    <span className="rcm-adv-search-qs-title">통합검색 사용</span>
                  </label>
                  <span className="rcm-adv-search-qs-hint">
                    {quickSearchLabel} 필드를 하나의 검색어로 검색합니다
                  </span>
                </div>
              )}

              {/* QuickSearch Input (when in quickSearch mode with multiple fields) */}
              {state.useQuickSearchMode && hasMultipleQuickSearchFields && (
                <div className="rcm-adv-search-qs-input-panel">
                  <label className="rcm-adv-search-qs-input-label">{quickSearchLabel} 검색</label>
                  <input
                    type="text"
                    value={state.quickSearchValue}
                    onChange={(e) => handleQuickSearchValueChange(e.target.value)}
                    placeholder={`${quickSearchLabel} 중 아무거나 입력...`}
                    className="rcm-input"
                  />
                  <p className="rcm-adv-search-qs-description">
                    입력한 검색어가 {quickSearchLabel} 중 하나라도 포함되면 검색됩니다 (OR 조건)
                  </p>
                </div>
              )}

              {/* Field Selector */}
              <FieldSelector
                availableFields={state.useQuickSearchMode ? regularFields : filterableFields}
                selectedFieldNames={state.selectedFields}
                onToggleField={handleToggleField}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />

              {/* Filter Fields - Grid Layout */}
              {displayFields.length > 0 ? (
                <div className={state.isGridView ? 'rcm-adv-search-grid' : 'rcm-adv-search-list'}>
                  {displayFields.map((field) => {
                    const fieldName =
                      field instanceof AbstractManyToOneField
                        ? field.getName() + '.id'
                        : field.getName();

                    return (
                      <MemoizedFilterField
                        key={fieldName}
                        entityForm={entityForm}
                        field={field.clone(false).withValue(getFieldValue(field))}
                        fieldName={field.getName()}
                        value={getFieldValue(field)}
                        onChange={handleFilterChange}
                        isCompact={state.isGridView}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rcm-adv-search-empty">
                  <p className="rcm-adv-search-empty-text">검색할 필드를 선택해주세요</p>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="rcm-adv-search-empty-action"
                  >
                    전체 필드 선택
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="rcm-adv-search-footer">
                <button
                  type="button"
                  className="rcm-button rcm-adv-search-btn"
                  data-variant="outline"
                  data-size="sm"
                  onClick={onClose}
                >
                  <IconX className="rcm-m2o-action-icon" />
                  닫기
                </button>
                <button
                  type="button"
                  className="rcm-button rcm-adv-search-btn"
                  data-variant="outline"
                  data-color="error"
                  data-size="sm"
                  onClick={handleReset}
                >
                  <IconRefresh className="rcm-m2o-action-icon" />
                  초기화
                </button>
                <button
                  type="button"
                  className="rcm-button rcm-adv-search-btn rcm-adv-search-btn-submit"
                  data-variant="primary"
                  data-size="sm"
                  onClick={handleSubmit}
                >
                  <IconSearch className="rcm-m2o-action-icon" />
                  검색
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition.Child>
    </Transition>
  );
};

// Re-export original for backward compatibility
export { AdvancedSearchForm } from './AdvancedSearchForm';
