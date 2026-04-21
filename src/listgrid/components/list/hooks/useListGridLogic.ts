'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, usePathname, useRouter } from '../../../router';
import {
  getSessionStorageObject,
  isEmpty,
  isEqualCollection,
  setSessionStorageItem,
} from '../../../misc';
import { SearchForm } from '../../../form/SearchForm';
import { EntityForm } from '../../../config/EntityForm';
import { DataTransferConfig } from '../../../transfer/Type';
import {
  ClientExtensionContext,
  ExtensionPoint,
} from '../../../extensions/EntityFormExtension.types';
import { hash } from '../../../utils/simpleCrypt';
import { useSession } from '../../../auth';
import { isTrue } from '../../../utils/BooleanUtil';
import { getListFieldsFromCache } from '../../../config/ListGridViewFieldCache';
import { getGlobalPageSize } from './useQuickSearchBar';
import { isBlank } from '../../../utils/StringUtil';
import { showConfirm } from '../../../message';
import { useLoadingStore } from '../../../loading';
import { searchFormHashKey, ViewListGridProps } from '../types/ViewListGrid.types';
import { parse, stringify } from '../../../utils/jsonUtils';
import { EntityFormActionResult } from '../../../config/Config';
import { CustomOptionField, prefetchCustomOptions } from '../../fields/CustomOptionField';
import { prefetchSelectFieldOptions, SelectField } from '../../fields/SelectField';
import { useListGridUrlState } from './useListGridUrlState';
import { getQuickSearchFromSearchForm } from './searchFormUrlSync';
import { perfLog } from '../utils/performanceLogger';

// Type declaration to avoid exposing Next.js internal types
type Params = Record<string, string | string[]>;

export const useListGridLogic = (props: ViewListGridProps): any => {
  const { listGrid } = props;

  const manyToOne = props.options?.manyToOne;
  let session = useSession();
  if (props.session) {
    session = props.session;
  }

  const listFields = listGrid.getListFields();
  const objectFieldMap: Map<string, string[]> = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const field of listFields) {
      if (field.getName().includes('.')) {
        const objectNames = field.getName().split('.');
        const objectName = objectNames[0]!;
        const objectField = objectNames[1]!;
        const objectFields = map.get(objectName) ?? [];
        objectFields.push(objectField);
        map.set(objectName, objectFields);
      }
    }
    return map;
  }, [listFields]);

  const advancedSearchFields = listGrid.getAdvancedSearchFields();

  if (props.options?.fields && props.options.fields.length > 0) {
    const duplicatedFieldNames: string[] = [];
    listFields.forEach((field) => duplicatedFieldNames.push(field.getName()));

    props.options.fields.forEach((field) => {
      if (!duplicatedFieldNames.includes(field.getName())) {
        listFields.push(field);
      }
    });
  }

  const quickSearchProperty = listGrid.getQuickSearchProperty(true);
  const enableHandleData: boolean = manyToOne === undefined && !isTrue(props.options?.readonly);
  const isSubCollection: boolean = props.options?.subCollection !== undefined;
  const isPopup: boolean = !!props.options?.popup;
  const isMainEntity: boolean = manyToOne === undefined && !isSubCollection && !isPopup;

  // URL state synchronization hook
  const urlStateHook = useListGridUrlState({
    ...(props.options?.urlSync !== undefined ? { urlSync: props.options.urlSync } : {}),
    isMainEntity,
    ...(quickSearchProperty?.name !== undefined
      ? { quickSearchPropertyName: quickSearchProperty.name }
      : {}),
    ...(quickSearchProperty?.orFields !== undefined
      ? { orFields: quickSearchProperty.orFields }
      : {}),
  });

  // Track if URL was used for initial load (for proper sync behavior)
  const initializedFromUrlRef = useRef<boolean>(false);

  const router = useRouter();
  const path = usePathname() ?? '/';
  const params = useParams();

  const [entityForm, setEntityForm] = useState<EntityForm>(listGrid.getEntityForm());

  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [searchForm, setSearchForm] = useState<SearchForm>();

  // Next.js 15+ params는 Proxy 객체이므로 일반 객체로 복사하여 사용
  const paramsForHash = params ? { ...params } : {};
  // props.options에서 해시 키 생성에 필요한 primitive 값만 추출 (함수, Proxy 객체 제외)
  const optionsForHash = props.options
    ? {
        hideTitle: props.options.hideTitle,
        readonly: props.options.readonly,
        popup: props.options.popup,
        filterable: props.options.filterable,
        sortable: props.options.sortable,
        cacheable: props.options.cacheable,
        hidePageSize: props.options.hidePageSize,
        hidePagination: props.options.hidePagination,
        subCollectionName: props.options.subCollection?.name,
      }
    : {};
  const hashKey =
    'listgrid_' +
    hash(searchFormHashKey, entityForm.name, entityForm.id, path, paramsForHash, optionsForHash);

  const { setOpenBaseLoading } = useLoadingStore();

  const [initializedSearchForm, setInitializedSearchForm] = useState<SearchForm>();
  const [search, setSearch] = useState<string>('');
  const [totalPage, setTotalPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [errors, setErrors] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const [viewFields, setViewFields] = useState<string[]>();
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [dataTransferConfig, setDataTransferConfig] = useState<DataTransferConfig | undefined>(
    undefined,
  );

  const [managedId, setManagedId] = useState<any>();
  const [title, setTitle] = useState('');

  const [managePriority, setManagePriority] = useState<boolean>(false);

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const showMessages = useCallback((error: boolean, messages: string[]) => {
    if (error) {
      const refinedMessages: string[] = [];
      for (const message of messages) {
        if (message.includes('{"error":')) {
          const json = parse<{
            error: {
              message?: string;
              fieldError?: Record<string, string | undefined>;
            };
          }>(message);
          if (json.error.message) {
            refinedMessages.push(json.error.message);
          }
          if (json.error.fieldError) {
            for (const field in json.error.fieldError) {
              const fieldErr = json.error.fieldError[field];
              if (fieldErr) {
                refinedMessages.push(fieldErr);
              }
            }
          }
        } else {
          refinedMessages.push(message);
        }
      }
      setErrors(refinedMessages);
      setNotifications([]);
    } else {
      setNotifications(messages);
      setErrors([]);
    }
  }, []);

  const fetchData = useCallback(
    (form?: SearchForm) => {
      setLoading(true);

      (async () => {
        // CustomOptionField의 alias들을 수집하여 일괄 prefetch (N+1 문제 방지)
        const customOptionAliases = listFields
          .filter((field): field is CustomOptionField => field instanceof CustomOptionField)
          .map((field) => field.alias);

        if (customOptionAliases.length > 0) {
          await prefetchCustomOptions(customOptionAliases);
        }

        // SelectField의 loadOptions를 일괄 prefetch (N+1 문제 방지)
        const selectFieldsWithLoadOptions = listFields.filter(
          (field): field is SelectField =>
            field instanceof SelectField && field.loadOptions !== undefined,
        );

        if (selectFieldsWithLoadOptions.length > 0) {
          await prefetchSelectFieldOptions(selectFieldsWithLoadOptions, entityForm);
        }

        const listSearchForm = (form ?? searchForm)?.clone() ?? SearchForm.create();

        // EntityForm Extension 지원
        const hasClientExtensions =
          entityForm.hasClientExtensions &&
          entityForm.hasClientExtensions(
            ExtensionPoint.PRE_FETCH_LIST,
            ExtensionPoint.POST_FETCH_LIST,
          );
        let finalSearchForm = listSearchForm;

        // Client Pre Extension 실행
        if (hasClientExtensions) {
          const context: ClientExtensionContext = {
            entityForm,
            ...(session ? { session } : {}),
            ...(session?.getUser?.() != null ? { user: session.getUser!() } : {}),
          };

          finalSearchForm = await entityForm.executeClientExtensions(
            ExtensionPoint.PRE_FETCH_LIST,
            listSearchForm,
            context,
          );
        }

        // 서버 extension 처리를 위해 항상 EntityForm 정보 전달
        const apiStartTime = performance.now();
        perfLog.apiStarted({
          entityUrl: entityForm?.getUrl?.(),
          page: finalSearchForm.getPage(),
          pageSize: finalSearchForm.getPageSize(),
        });

        listGrid
          .fetchData(finalSearchForm, {
            entityFormName: entityForm.name,
            extensionPoint: ExtensionPoint.POST_FETCH_LIST,
          })
          .then(async (result) => {
            const apiDuration = performance.now() - apiStartTime;

            if (!isEmpty(result.errors)) {
              perfLog.apiError(apiDuration, {
                entityUrl: entityForm?.getUrl?.(),
                errors: result.errors!,
              });
              setSearchForm(finalSearchForm);
              showMessages(true, result.errors!);
            } else {
              let processedResult = result;

              // Client Post Extension 실행
              if (hasClientExtensions) {
                const context: ClientExtensionContext = {
                  entityForm,
                  ...(session ? { session } : {}),
                  ...(session?.getUser?.() != null ? { user: session.getUser!() } : {}),
                };

                processedResult = await entityForm.executeClientExtensions(
                  ExtensionPoint.POST_FETCH_LIST,
                  processedResult,
                  context,
                );
              }

              // 기존 onFetchListData Hook 지원 (하위 호환성)
              if (!isEmpty(result.list) && entityForm?.onFetchListData !== undefined) {
                for (const hook of entityForm.onFetchListData) {
                  processedResult = await hook(processedResult);
                }
              }

              if (props.options?.onFetched) {
                processedResult = await props.options?.onFetched(result);
              }

              let data: any[] = [];

              if (objectFieldMap.size > 0) {
                for (const item of processedResult.list) {
                  for (const field of listFields) {
                    const fieldName = field.getName();
                    if (fieldName.includes('.')) {
                      const parts = fieldName.split('.');
                      let value: any = item;
                      for (const part of parts) {
                        value = value?.[part];
                      }
                      item[fieldName] = value;
                    }
                  }
                  data.push(item);
                }
              } else {
                data = processedResult.list;
              }

              perfLog.apiCompleted(apiDuration, {
                entityUrl: entityForm?.getUrl?.(),
                rowCount: data.length,
                totalCount: processedResult.totalCount,
                page: processedResult.searchForm?.getPage(),
              });

              setRows(data);
              setTotalPage(processedResult.totalPage);
              setTotalCount(processedResult.totalCount);
              setCheckedItems([]);

              const newSearchForm = processedResult.searchForm;

              // Preserve sorts from original request
              // Server response may not properly return sorts (Java Map serialization issue)
              const originalSorts = finalSearchForm.getSorts();
              if (originalSorts.size > 0) {
                // Clear server's sorts and apply original sorts
                newSearchForm.clearSorts();
                originalSorts.forEach((direction, fieldName) => {
                  newSearchForm.withSort(fieldName, direction);
                });
              }

              // Preserve quickSearchFields from original request
              // Server response may not include quickSearchFields (client-side concept)
              const originalQuickSearchFields = finalSearchForm.getQuickSearchFields();
              if (originalQuickSearchFields.length > 0) {
                newSearchForm.handleQuickSearch(
                  finalSearchForm.getQuickSearchValue() ?? '',
                  originalQuickSearchFields,
                );
              }

              // Preserve pageSize from original request
              // Server response may not echo pageSize, causing it to fall back to default 20
              newSearchForm.withPageSize(finalSearchForm.getPageSize());

              setSearchForm(newSearchForm);

              // Sync to URL if enabled
              // Use finalSearchForm (what we requested) for URL sync to ensure
              // page reset is reflected in URL, not server response which may have old page
              if (urlStateHook.isEnabled) {
                urlStateHook.syncToUrl(finalSearchForm);
              } else if (isMainEntity) {
                // Only use sessionStorage when URL sync is disabled
                // (e.g., subCollections or explicitly disabled)
                setSessionStorageItem(hashKey, stringify(newSearchForm));
              }

              // Update search input from searchForm
              const quickSearchValue = getQuickSearchFromSearchForm(
                newSearchForm,
                quickSearchProperty?.name,
                quickSearchProperty?.orFields,
              );
              if (quickSearchValue) {
                setSearch(quickSearchValue);
              }
            }
            setLoading(false);
          });
      })();
    },
    [
      searchForm,
      listGrid,
      entityForm,
      props.options,
      objectFieldMap,
      isMainEntity,
      hashKey,
      showMessages,
      listFields,
      urlStateHook,
      quickSearchProperty?.name,
      quickSearchProperty?.orFields,
    ],
  );

  const setOptionsFilters = useCallback(
    async (entityForm: EntityForm, searchForm: SearchForm | undefined) => {
      searchForm = searchForm === undefined ? SearchForm.create() : searchForm;
      if (props.options?.filters) {
        const filters = await props.options.filters(entityForm);
        if (filters?.length > 0) {
          filters.forEach((value) => {
            const condition = value.condition ?? 'AND';
            const items = value.items;
            if (items.length > 0) {
              searchForm!.withFilter(condition, ...items);
              // Legacy mode only: Set search from AND filter when NOT in OR search mode
              // When orFields exist (OR search mode), AND filters should NOT populate QuickSearch
              if (condition === 'AND' && !quickSearchProperty?.orFields?.length) {
                for (const item of items) {
                  if (item.name === quickSearchProperty?.name && item.value) {
                    setSearch(item.value);
                    break;
                  }
                }
              }
            }
          });
        }
      }
      return searchForm;
    },
    [props.options, quickSearchProperty],
  );

  const onChangeSearchForm = useCallback(
    async (
      entityForm: EntityForm,
      searchForm: SearchForm,
      reset?: boolean,
      resetPage?: boolean,
    ) => {
      let newSearchForm = searchForm.clone();

      if (isTrue(reset)) {
        setSearch('');
        // newSearchForm.clearFilterAndSort();
        newSearchForm.withPage(0);
        newSearchForm = await setOptionsFilters(entityForm, newSearchForm);
      } else {
        // Use getQuickSearchFromSearchForm to properly handle OR vs AND filters
        // When orFields exist (OR search mode), only OR-based quickSearch should be returned
        const quickSearchValue = getQuickSearchFromSearchForm(
          newSearchForm,
          quickSearchProperty?.name,
          quickSearchProperty?.orFields,
        );
        setSearch(quickSearchValue);
        if (isTrue(resetPage)) {
          newSearchForm.withPage(0);
        }
      }
      fetchData(newSearchForm);
    },
    [fetchData, quickSearchProperty, setOptionsFilters],
  );

  const initializeSearchForm = useCallback(async (): Promise<SearchForm> => {
    // When URL sync is enabled, use URL as the source of truth
    if (urlStateHook.isEnabled) {
      if (urlStateHook.hasUrlParams) {
        initializedFromUrlRef.current = true;
        const originalSearchForm = listGrid.getSearchForm();
        let searchForm = urlStateHook.getInitialSearchForm(originalSearchForm);

        // Apply defaultPageSize from options or global pageSize if not set from URL
        if (searchForm.getPageSize() === 20) {
          const pageSize = props.options?.defaultPageSize ?? getGlobalPageSize();
          searchForm.withPageSize(pageSize);
        }

        // Always apply options filters (business rules)
        searchForm = await setOptionsFilters(entityForm, searchForm);

        // Set search input from URL
        const quickSearchValue = getQuickSearchFromSearchForm(
          searchForm,
          quickSearchProperty?.name,
          quickSearchProperty?.orFields,
        );
        if (quickSearchValue) {
          setSearch(quickSearchValue);
        }

        return searchForm;
      }

      // URL sync enabled but no params - start with default searchForm
      const originalSearchForm = listGrid.getSearchForm();
      let searchForm = originalSearchForm.clone();
      const pageSize = props.options?.defaultPageSize ?? getGlobalPageSize();
      searchForm.withPageSize(pageSize);
      searchForm = await setOptionsFilters(entityForm, searchForm);
      return searchForm;
    }

    // URL sync disabled - use sessionStorage for main entities
    let searchForm: SearchForm | undefined = isMainEntity
      ? await getSessionStorageObject(hashKey, (value: string) => SearchForm.deserialize(value))
      : undefined;

    if (searchForm === undefined) {
      const originalSearchForm = listGrid.getSearchForm();
      searchForm = originalSearchForm.clone();
      const pageSize = props.options?.defaultPageSize ?? getGlobalPageSize();
      searchForm.withPageSize(pageSize);
    }

    searchForm = await setOptionsFilters(entityForm, searchForm);

    return searchForm;
  }, [
    isMainEntity,
    hashKey,
    listGrid,
    setOptionsFilters,
    entityForm,
    urlStateHook,
    quickSearchProperty?.name,
  ]);

  const syncViewFieldsFromCache = useCallback(() => {
    const cached = getListFieldsFromCache(entityForm.getUrl(), props.options?.subCollection?.name);
    if (cached !== undefined && !isEmpty(cached)) {
      if (viewFields === undefined || !isEqualCollection(viewFields, cached)) {
        setViewFields(cached);
      }
    }
  }, [entityForm, props.options?.subCollection?.name, viewFields]);

  const initialize = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (isMainEntity) {
      entityForm.setRevisionEntityNameIfBlank(path);
    }

    await entityForm.initialize(session !== undefined ? { session } : {}).then((result) => {
      setEntityForm(result.entityForm);
    });

    const searchForm = await initializeSearchForm();
    setInitializedSearchForm(searchForm.clone());
    syncViewFieldsFromCache();
    setLoading(false);
    setDataTransferConfig(await entityForm.getDataTransferConfig());
    setTitle(props.title ?? (await entityForm.getTitle('목록', false)));
    await onChangeSearchForm(entityForm, searchForm);
  }, [
    isMainEntity,
    entityForm,
    path,
    session,
    initializeSearchForm,
    syncViewFieldsFromCache,
    props.title,
    onChangeSearchForm,
  ]);

  const deleteItems = useCallback(() => {
    const neverDelete = isTrue(entityForm.neverDelete);
    const message = `선택된 ${checkedItems.length}개의 항목을 ${
      neverDelete ? '사용 중지' : '삭제'
    }하시겠습니까?`;
    const text = neverDelete
      ? `<div className='text-sm'>사용 중지된 항목은 상세 정보에서<br/><u>상태 정보 > 사용 여부</u> 값을 변경해 되돌릴 수 있습니다.</div>`
      : '이 작업은 되돌릴 수 없습니다.';
    const confirmButtonText = neverDelete ? '사용 중지' : '삭제';
    const confirmMessage = neverDelete ? '사용 중지 처리 되었습니다' : '삭제가 완료되었습니다';

    if (checkedItems.length > 0) {
      (async () => {
        await showConfirm({
          title: message,
          message: text,
          isHtml: neverDelete,
          confirmButtonText: confirmButtonText,
          cancelButtonText: `취소`,
          onConfirm: async () => {
            setLoading(true);
            setOpenBaseLoading(true);

            const result: EntityFormActionResult =
              props.options?.delete?.onDelete !== undefined
                ? await props.options?.delete?.onDelete(entityForm, rows, checkedItems)
                : await entityForm.deleteAll(checkedItems);

            if (!isEmpty(result.errors)) {
              showMessages(true, result.errors!);
              setOpenBaseLoading(false);
              setLoading(false);
            } else {
              showMessages(false, [result.messages?.[0] ?? confirmMessage]);
              fetchData();
              setOpenBaseLoading(false);
              await props.options?.delete?.postDelete?.(entityForm, rows, [...checkedItems]);
            }
          },
        });
      })();
    }
  }, [
    entityForm,
    checkedItems,
    router,
    path,
    props.options,
    rows,
    showMessages,
    fetchData,
    setOpenBaseLoading,
  ]);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for URL state changes (browser back/forward navigation AND initial hydration)
  useEffect(() => {
    // Skip if URL sync is disabled or searchForm not ready
    if (!urlStateHook.isEnabled || !searchForm) return;

    // Check if URL has params
    if (urlStateHook.hasUrlParams) {
      const originalSearchForm = listGrid.getSearchForm();
      const urlSearchForm = urlStateHook.getInitialSearchForm(originalSearchForm);

      // Compare current page with URL page
      const currentPage = searchForm.getPage();
      const urlPage = urlSearchForm.getPage();

      // Case 1: Initial URL load (nuqs hydration completed after initial mount)
      // Case 2: Browser back/forward navigation
      if (currentPage !== urlPage || !initializedFromUrlRef.current) {
        initializedFromUrlRef.current = true;
        // URL changed or first time URL params detected, update state
        (async () => {
          const newSearchForm = await setOptionsFilters(entityForm, urlSearchForm);
          const quickSearchValue = getQuickSearchFromSearchForm(
            newSearchForm,
            quickSearchProperty?.name,
            quickSearchProperty?.orFields,
          );
          if (quickSearchValue) {
            setSearch(quickSearchValue);
          }
          fetchData(newSearchForm);
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlStateHook.urlState, urlStateHook.hasUrlParams]);

  const onSelect = (props.options?.onSelect ??
    props.options?.manyToOne?.onSelect ??
    (isSubCollection
      ? (item: any, _setManagedId?: (value: any) => void) => {
          if (_setManagedId) {
            _setManagedId(item.id);
          } else {
            setManagedId(item.id);
          }
        }
      : undefined)) as (
    item: any,
    setManagedId?: (value: any) => void,
    clearFilterAndSort?: () => void,
  ) => void;

  const performQuickSearch = (search: string) => {
    const newSearchForm: SearchForm = searchForm!.clone();
    const fieldName = quickSearchProperty!.name;
    const orFields = quickSearchProperty?.orFields;

    if (!isBlank(search)) {
      // If orFields exist, use multi-field OR search
      if (orFields && orFields.length > 0) {
        const allFields = [fieldName, ...orFields];
        newSearchForm.handleQuickSearch(search, allFields);
      } else {
        // Fallback to single field search for backward compatibility
        newSearchForm.handleAndFilter(fieldName, search, 'LIKE');
      }
    } else {
      // Clear quick search
      if (orFields && orFields.length > 0) {
        newSearchForm.handleQuickSearch('', []);
      }
      newSearchForm.removeFilter(quickSearchProperty!.name);
    }
    (async () => {
      await onChangeSearchForm(entityForm, newSearchForm, false, true);
    })();
  };

  const changePage = (page: number) => {
    (async () => {
      setRows([]);
      await onChangeSearchForm(entityForm, searchForm!.withPage(page));
    })();
  };

  const sortRowsPriority = async (changed: { id: string; priority?: number }[]) => {
    const newRows: any[] = [...changed];
    setRows(newRows);
  };

  /**
   * 진정한 초기 상태의 SearchForm을 반환
   * sessionStorage나 URL 파라미터의 영향 없이 ListGrid 설정의 원본 상태
   * Reset 시 이 함수를 사용해야 함
   */
  const getCleanSearchForm = useCallback(async (): Promise<SearchForm> => {
    const originalSearchForm = listGrid.getSearchForm();
    let searchForm = originalSearchForm.clone();
    const pageSize = props.options?.defaultPageSize ?? getGlobalPageSize();
    searchForm.withPageSize(pageSize);
    searchForm = await setOptionsFilters(entityForm, searchForm);
    return searchForm;
  }, [listGrid, entityForm, setOptionsFilters, props.options?.defaultPageSize]);

  return {
    listGrid,
    manyToOne,
    session,
    listFields,
    objectFieldMap,
    advancedSearchFields,
    quickSearchProperty,
    enableHandleData,
    isSubCollection,
    isMainEntity,
    router,
    path,
    params,
    entityForm,
    showAdvancedSearch,
    setShowAdvancedSearch,
    searchForm,
    setSearchForm,
    hashKey,
    initializedSearchForm,
    search,
    setSearch,
    totalPage,
    totalCount,
    errors,
    notifications,
    viewFields,
    setViewFields,
    checkedItems,
    setCheckedItems,
    dataTransferConfig,
    setDataTransferConfig,
    managedId,
    setManagedId,
    title,
    setTitle,
    managePriority,
    setManagePriority,
    rows,
    setRows,
    loading,
    setLoading,
    showMessages,
    fetchData,
    deleteItems,
    onSelect,
    performQuickSearch,
    changePage,
    sortRowsPriority,
    onChangeSearchForm,
    setOpenBaseLoading,
    getCleanSearchForm,
    // URL sync related
    urlSyncEnabled: urlStateHook.isEnabled,
    clearUrlParams: urlStateHook.clearUrlParams,
  };
};
