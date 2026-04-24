'use client';

'use client';
import { Pagination } from '../../ui';
import React, { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { EntireChecker } from './ui/EntireChecker';
import { LoadingOverlay } from '../../ui';
import { HeaderField } from './ui/HeaderField';
import { AdvancedSearchFormV2 as AdvancedSearchForm } from './AdvancedSearchFormV2';
import { isTrue } from '../../utils/BooleanUtil';
import { ListGridHeader } from './ListGridHeader';
import { SubCollectionButtons } from './SubCollectionButtons';
import { QuickSearchBar } from './QuickSearchBar';
import { RowItem } from './RowItem';
import { ViewListGridProps } from './types/ViewListGrid.types';
import { useListGridLogic } from './hooks/useListGridLogic';
import { ListableFormField } from '../fields/abstract';
import { ShowNotifications } from '../helper/ShowNotifications';
import { Stack } from '../../ui';
import { SubCollectionViewModal } from './ui/SubCollectionViewModal';
import { useSession } from '../../auth';
import { getPermission } from '../../config/RuntimeConfig';
import { perfLog } from './utils/performanceLogger';
import {
  getListGridThemeByVariant,
  ListGridThemeProvider,
  useListGridTheme,
} from './context/ListGridThemeContext';
import type { ListGridThemeVariant, ViewListGridClassNames } from './types/ViewListGridTheme.types';
import { EntityFormScopeProvider, useEntityFormScope } from './context/EntityFormScopeContext';
import { useSubCollectionExpansion } from './hooks/useSubCollectionExpansion';
import { ViewListGridSkeleton } from './ui/ViewListGridSkeleton';
import { filterMappedByFields } from './utils/mappedByFieldFilter';
import { SyncTopScrollbar } from './ui/SyncTopScrollbar';

/**
 * Pagination container component that properly handles containerRef for responsive sizing
 */
interface PaginationContainerProps {
  themeClasses: ViewListGridClassNames;
  totalPage: number;
  page: number;
  changePage: (page: number) => void;
  isPopup: boolean;
}

const PaginationContainer: React.FC<PaginationContainerProps> = ({
  themeClasses,
  totalPage,
  page,
  changePage,
  isPopup,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={themeClasses.pagination?.container ?? 'rcm-listgrid-pagination'}
    >
      <Pagination
        total={totalPage}
        value={page + 1}
        onChange={(p: number) => changePage(p - 1)}
        responsiveSiblings
        withControls={false}
        withQuickJump={!isPopup}
        withJumpInput={!isPopup}
        containerRef={containerRef}
      />
    </div>
  );
};

export const ViewListGrid = (props: ViewListGridProps) => {
  const gridId = useId();
  const {
    manyToOne,
    listFields,
    advancedSearchFields,
    quickSearchProperty,
    enableHandleData,
    isSubCollection,
    isMainEntity,
    router,
    path,
    entityForm,
    showAdvancedSearch,
    setShowAdvancedSearch,
    searchForm,
    search,
    totalPage,
    totalCount,
    errors,
    notifications,
    viewFields,
    setViewFields,
    checkedItems,
    setCheckedItems,
    dataTransferConfig,
    managedId,
    setManagedId,
    title,
    managePriority,
    setManagePriority,
    rows,
    loading,
    showMessages,
    fetchData,
    deleteItems,
    onSelect,
    performQuickSearch,
    changePage,
    onChangeSearchForm,
    sortRowsPriority,
    setOpenBaseLoading,
    getCleanSearchForm,
  } = useListGridLogic(props);

  // SubCollection inline expansion support
  const parentScope = useEntityFormScope();
  const currentDepth = isSubCollection ? parentScope.depth + 1 : 0;
  const maxInlineDepth = parentScope.maxInlineDepth;
  const shouldUseInlineMode = isSubCollection && currentDepth <= maxInlineDepth;

  // Expansion state management for inline mode
  const { expandedItems, isExpanded, toggleExpansion, collapseItem, canExpand } =
    useSubCollectionExpansion({
      maxExpandedItems: parentScope.maxExpandedItems,
      expansionMode: parentScope.expansionMode,
    });

  // Performance debugging
  const renderStartTime = useRef<number>(performance.now());
  const mountTime = useRef<number>(0);
  const dataLoadStartTime = useRef<number>(0);

  // Ref for table container (for sync scrollbar)
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Track component mount time
  useEffect(() => {
    mountTime.current = performance.now();
    const mountDuration = mountTime.current - renderStartTime.current;
    perfLog.mounted(mountDuration, {
      entityUrl: entityForm?.getUrl?.(),
      isSubCollection,
    });

    return () => {
      perfLog.unmounted({ entityUrl: entityForm?.getUrl?.() });
    };
  }, []);

  // Track loading state changes (React state timing)
  useEffect(() => {
    if (loading) {
      dataLoadStartTime.current = performance.now();
      perfLog.loadingStarted({ entityUrl: entityForm?.getUrl?.() });
    } else if (dataLoadStartTime.current > 0) {
      const loadDuration = performance.now() - dataLoadStartTime.current;
      perfLog.loadingCompleted(loadDuration, {
        entityUrl: entityForm?.getUrl?.(),
        rowCount: rows.length,
        totalCount,
      });
    }
  }, [loading]);

  // Track rows rendering
  useEffect(() => {
    if (rows.length > 0) {
      const renderDuration = performance.now() - renderStartTime.current;
      perfLog.rowsRendered({
        entityUrl: entityForm?.getUrl?.(),
        rowCount: rows.length,
        totalCount,
        timeSinceMount: `${renderDuration.toFixed(2)}ms`,
      });
    }
  }, [rows]);

  const handleNotifications = useCallback(
    (messages: string[]) => {
      showMessages(false, messages);
    },
    [showMessages],
  );

  const handleErrors = useCallback(
    (messages: string[]) => {
      showMessages(true, messages);
    },
    [showMessages],
  );

  // Hook은 조건문 전에 호출되어야 함
  const sessionFromHook = useSession();
  const session = props.session ?? entityForm.getSession() ?? sessionFromHook;

  // "새 창 열기" 버튼 표시 권한.
  // 라이브러리 자체는 role 을 모르며, RuntimeConfig.permissions.canOpenInNewWindow 에
  // 주입된 predicate 가 판정한다. 호스트가 설정하지 않으면 항상 true.
  //
  // TODO: ListGrid 단위 override (withOpenInNewWindowPermission) 를 추가할 수도 있지만,
  // 현재는 전역 predicate 만 사용한다 — 필요 시 listGrid prop 으로 확장.
  const isAdmin = React.useMemo(() => {
    return getPermission('canOpenInNewWindow')(session ?? undefined);
  }, [session]);

  // QuickSearch 필드명 Set 생성 (헤더 필터 비활성화용)
  // Note: 이 hook은 early return 이전에 있어야 hooks 순서가 일정함
  const quickSearchFieldNames = React.useMemo(() => {
    if (!quickSearchProperty) return new Set<string>();

    const names = new Set<string>();
    names.add(quickSearchProperty.name);

    if (quickSearchProperty.orFields) {
      quickSearchProperty.orFields.forEach((fieldName: string) => names.add(fieldName));
    }

    return names;
  }, [quickSearchProperty]);

  // 목록에 표시되는 필드명 Set (통합검색창 기본 선택용)
  const listFieldNames = React.useMemo((): Set<string> => {
    return new Set<string>(listFields.map((f: ListableFormField<any>) => f.getName()));
  }, [listFields]);

  // SubCollection에서 mappedBy 관련 필드 자동 숨김 처리
  // Filter out mappedBy related fields in SubCollection (parent reference fields)
  const mappedBy = props.options?.subCollection?.mappedBy;
  const filteredListFields = useMemo(() => {
    if (!isSubCollection || !mappedBy) {
      return listFields;
    }
    return filterMappedByFields(listFields, { mappedBy });
  }, [listFields, isSubCollection, mappedBy]);

  // 새창 열기 기능: 기본값 true, subCollection에서는 명시적으로 true 하지 않으면 false
  const openInNewWindowEnabled = isSubCollection
    ? isTrue(props.options?.openInNewWindow?.enabled, false)
    : isTrue(props.options?.openInNewWindow?.enabled, true);
  const openInNewWindow = openInNewWindowEnabled
    ? { ...props.options?.openInNewWindow, enabled: true }
    : undefined;

  // 새창에서 전송된 메시지 수신 (삭제/저장 완료 시 목록 새로고침)
  useEffect(() => {
    if (!openInNewWindowEnabled) return;

    const handleMessage = (event: MessageEvent) => {
      // 동일 origin에서 온 메시지만 처리
      if (event.origin !== window.location.origin) return;

      const { type } = event.data || {};

      if (type === 'ENTITY_DELETED' || type === 'ENTITY_SAVED') {
        // 삭제 또는 저장 시 목록 새로고침
        fetchData();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [openInNewWindowEnabled, fetchData]);

  // 테마 variant 자동 결정 (early return 전에 모든 테마 관련 hook 호출 필요)
  const themeVariant = useMemo((): ListGridThemeVariant => {
    if (props.options?.popup) return 'popup';
    if (isSubCollection) return 'subCollection';
    if (isMainEntity) return 'main';
    return 'default';
  }, [props.options?.popup, isSubCollection, isMainEntity]);

  // 테마 훅 사용 (Context가 있으면 Context 값 사용, 없으면 variant 기반 기본값)
  const contextTheme = useListGridTheme();
  const { classNames: themeClasses, cn } = useMemo(() => {
    // Context의 variant가 default가 아니면 Context 테마 사용
    if (contextTheme.variant !== 'default') {
      return contextTheme;
    }
    // Context가 없거나 default면 자동 결정된 variant 테마 사용
    const variantTheme = getListGridThemeByVariant(themeVariant);
    return {
      classNames: variantTheme,
      cn: contextTheme.cn,
    };
  }, [contextTheme, themeVariant]);

  // 패널 클래스 결정 (early return 전에 호출)
  const panelClassName = useMemo(() => {
    const baseClass = themeClasses.panel?.container ?? '';
    if (isMainEntity) {
      return cn(baseClass, themeClasses.panel?.mainEntity);
    }
    if (isSubCollection) {
      return cn(baseClass, themeClasses.panel?.subCollection);
    }
    return cn(baseClass, themeClasses.panel?.default);
  }, [themeClasses, isMainEntity, isSubCollection, cn]);

  if (searchForm === undefined) {
    return (
      <div className={themeClasses.loading?.container ?? 'relative'}>
        <LoadingOverlay visible={true} />
        <ViewListGridSkeleton
          pageSize={10}
          fields={listFields}
          isSubCollection={isSubCollection}
          showCheckbox={!props.options?.readonly}
          isPopup={!!props.options?.popup}
        />
      </div>
    );
  }

  const emptyList = rows.length === 0;

  // 선택 옵션 통합
  const selectionOptions = props.options?.selection;

  // 삭제 버튼 표시 로직
  const deleteButtonConfig = selectionOptions?.deleteButton;
  const showDeleteButton = deleteButtonConfig === false ? false : deleteButtonConfig?.show;
  const activeTrashIcon =
    !(
      loading ||
      checkedItems.length === 0 ||
      manyToOne !== undefined ||
      deleteButtonConfig === false
    ) &&
    (showDeleteButton === undefined
      ? true
      : typeof showDeleteButton === 'function'
        ? showDeleteButton(checkedItems)
        : showDeleteButton);

  // 체크박스 표시 로직
  const showCheckbox = selectionOptions?.enabled;

  // selection이 있지만 실제 사용할 기능이 없는 경우 체크
  const hasSelectionFeatures = !!(
    selectionOptions &&
    // actions가 있거나
    ((selectionOptions.actions && selectionOptions.actions.length > 0) ||
      // deleteButton이 명시적으로 false가 아니거나 (undefined인 경우 기본 삭제 버튼 표시)
      selectionOptions.deleteButton !== false ||
      // 선택 변경 콜백이 있거나
      !!selectionOptions.onSelectionChange ||
      // 기타 선택 관련 기능이 있는 경우
      !!selectionOptions.selectableFilter ||
      !!selectionOptions.validateSelection)
  );

  // 체크박스 컬럼은 항상 표시 (번호 표시를 위해) - readonly 여부와 상관없이
  const enableCheckItem: boolean = !emptyList;

  // 실제 체크박스 input 표시 여부
  const showCheckboxInput: boolean =
    enableCheckItem &&
    (showCheckbox === undefined
      ? // enabled가 undefined인 경우
        selectionOptions
        ? // selection 설정이 있으면 기능 여부 확인
          hasSelectionFeatures
        : // selection 설정이 없으면 readonly가 아닐 때만 true
          !props.options?.readonly
      : typeof showCheckbox === 'function'
        ? showCheckbox(entityForm)
        : showCheckbox);
  const draggable = props.options?.onDrag !== undefined;
  const showSearchBar = isTrue(props.options?.filterable, true);
  const supportPriority: boolean =
    (props.options?.onDragPriority?.support ?? false) && rows.length > 1;
  const readonly = isTrue(props.options?.readonly);

  const page = searchForm?.getPage() ?? 0;

  return (
    <EntityFormScopeProvider
      depth={currentDepth}
      maxInlineDepth={maxInlineDepth}
      maxExpandedItems={parentScope.maxExpandedItems}
      expansionMode={parentScope.expansionMode}
      parentEntityForm={entityForm}
    >
      <ListGridThemeProvider variant={themeVariant}>
        <ListGridHeader
          hideTitle={isSubCollection}
          cacheable={isTrue(props.options?.cacheable, true)}
          entityForm={entityForm}
          {...(dataTransferConfig !== undefined ? { dataTransferConfig } : {})}
          {...(session !== undefined ? { session } : {})}
          {...(checkedItems !== undefined ? { checkedItems } : {})}
          {...(props.options?.headerButtons !== undefined
            ? { buttons: props.options.headerButtons }
            : {})}
          isSubCollection={isSubCollection}
          {...(props.options?.createOrUpdate?.addNew !== undefined
            ? { addNew: props.options.createOrUpdate.addNew }
            : {})}
          setErrors={handleErrors}
          supportPriority={supportPriority}
          setManagePriority={() => {
            setManagePriority(!managePriority);
          }}
          setNotifications={handleNotifications}
          enableHandleData={enableHandleData}
          router={router}
          path={path}
          readonly={readonly}
          activeTrashIcon={activeTrashIcon}
          searchForm={searchForm!}
          deleteItems={deleteItems}
          {...(selectionOptions !== undefined ? { selectionOptions } : {})}
          {...(rows !== undefined ? { rows } : {})}
          refresh={fetchData}
          title={title}
        ></ListGridHeader>
        <div className={panelClassName}>
          {props.options?.topContent && props.parentId && (
            <div className="rcm-listgrid-top-content">
              {props.options.topContent(props.parentId, searchForm)}
            </div>
          )}
          {isSubCollection && (
            <SubCollectionButtons
              activeTrashIcon={activeTrashIcon}
              searchForm={searchForm!}
              totalCount={totalCount}
              onChangeSearchForm={() => {
                // no-op: previously declared an async arrow without invoking it
              }}
              parentId={props.parentId!}
              {...(checkedItems !== undefined ? { checkedItems } : {})}
              {...(rows !== undefined ? { rows } : {})}
              supportPriority={supportPriority}
              setManagePriority={() => {
                setManagePriority(!managePriority);
              }}
              add={
                props.options?.subCollection?.add !== undefined
                  ? isTrue(props.options?.subCollection?.add, !isTrue(props.options.readonly))
                  : enableHandleData
              }
              delete={isTrue(props.options?.subCollection?.delete, true)}
              {...(props.options?.subCollection?.buttons !== undefined
                ? { buttons: props.options.subCollection.buttons }
                : {})}
              {...(props.options?.subCollection?.name !== undefined
                ? { collectionName: props.options.subCollection.name }
                : {})}
              {...(props.options?.subCollection?.mappedBy !== undefined
                ? { mappedBy: props.options.subCollection.mappedBy }
                : {})}
              {...(props.options?.subCollection?.mappedValue !== undefined
                ? { mappedValue: props.options.subCollection.mappedValue }
                : {})}
              {...(props.options?.createOrUpdate !== undefined
                ? { createOrUpdate: props.options.createOrUpdate }
                : {})}
              setErrors={handleErrors}
              setNotifications={handleNotifications}
              onRefresh={() => {
                fetchData();
              }}
              deleteItems={deleteItems}
              entityForm={entityForm}
            />
          )}
          {showSearchBar && (
            <AdvancedSearchForm
              fields={advancedSearchFields}
              entityForm={entityForm}
              listFieldNames={listFieldNames}
              searchForm={searchForm!}
              show={showAdvancedSearch}
              subCollection={isSubCollection}
              popup={!!props.options?.popup}
              onClose={() => {
                setShowAdvancedSearch(false);
              }}
              onSubmit={(searchForm) => {
                (async () => {
                  await onChangeSearchForm(entityForm, searchForm.clone(), false, true);
                })();
              }}
              onReset={() => {
                (async () => {
                  const cleanSearchForm = await getCleanSearchForm();
                  await onChangeSearchForm(entityForm, cleanSearchForm, true);
                })();
              }}
              quickSearchProperty={quickSearchProperty!}
            />
          )}
          <Stack gap={0}>
            {showSearchBar && (
              <QuickSearchBar
                loading={loading}
                searchForm={searchForm!}
                onChangeSearchForm={(newSearchForm) => {
                  (async () => {
                    await onChangeSearchForm(entityForm, newSearchForm);
                  })();
                }}
                onQuickSearch={(search) => {
                  performQuickSearch(search);
                }}
                hidePageSize={isTrue(props.options?.hidePageSize, false)}
                subCollection={isSubCollection}
                quickSearchValue={search}
                listFields={listFields}
                {...(quickSearchProperty !== undefined ? { quickSearchProperty } : {})}
                enableHandleData={enableHandleData}
                showAdvancedSearch={showAdvancedSearch}
                onOpenAdvancedSearch={() => {
                  setShowAdvancedSearch(true);
                }}
                viewFields={viewFields ?? []}
                {...(setViewFields !== undefined ? { setViewFields } : {})}
                entityUrl={entityForm.getUrl()}
                {...(props.options?.subCollection?.name !== undefined
                  ? { subCollectionName: props.options.subCollection.name }
                  : {})}
                {...(props.options?.hideAdvancedSearch !== undefined
                  ? { hideAdvancedSearch: props.options.hideAdvancedSearch }
                  : {})}
              />
            )}

            {loading && (
              <div className="relative">
                <LoadingOverlay visible={loading} />
                <ViewListGridSkeleton
                  pageSize={searchForm?.getPageSize() ?? 10}
                  fields={listFields}
                  isSubCollection={isSubCollection}
                  showCheckbox={showCheckboxInput}
                  isPopup={!!props.options?.popup}
                />
              </div>
            )}
            <ShowNotifications messages={errors} error={true} showClose={true} timeout={10000} />
            <ShowNotifications messages={notifications} timeout={10000} />
            {!loading && (
              <div
                className={
                  props.options?.popup
                    ? (themeClasses.popup?.container ??
                      'max-h-[70vh] flex flex-col overflow-y-auto p-0')
                    : (themeClasses.table?.contentWrapper ?? 'overflow-y-auto p-0')
                }
              >
                <div className={themeClasses.table?.container ?? 'rcm-scroll-y'}>
                  <SyncTopScrollbar targetRef={tableContainerRef} />
                  <div
                    ref={tableContainerRef}
                    className={
                      themeClasses.table?.responsiveWrapper ?? 'rcm-skeleton-table-wrapper'
                    }
                  >
                    <table className={themeClasses.table?.table ?? 'table-hover w-full'}>
                      <thead
                        className={
                          themeClasses.table?.thead ??
                          'border-t border-b border-white-light dark:border-[#17263c]'
                        }
                      >
                        <tr>
                          {managePriority && (
                            <th>
                              <div>&nbsp;</div>
                            </th>
                          )}
                          {/*// priority 조절 핸들바의 th 를 마련한다.*/}
                          {enableCheckItem && (
                            <th>
                              <EntireChecker
                                total={rows.length}
                                subCollection={isSubCollection}
                                listIds={rows.map((item: { id: string }) => item.id)}
                                checkedItems={checkedItems}
                                setCheckedItems={(itemIds: string[]) => setCheckedItems(itemIds)}
                                {...(selectionOptions !== undefined ? { selectionOptions } : {})}
                                rows={rows}
                                showCheckboxInput={showCheckboxInput}
                              />
                            </th>
                          )}
                          {isTrue(openInNewWindow?.enabled) && isAdmin && !onSelect && (
                            <th
                              className={
                                themeClasses.headerCell?.openNewWindowCell ??
                                'w-2 whitespace-nowrap hidden md:table-cell'
                              }
                            ></th>
                          )}
                          {onSelect && (
                            <th
                              className={
                                themeClasses.headerCell?.selectCell ?? 'w-2 whitespace-nowrap'
                              }
                            ></th>
                          )}
                          <HeaderField
                            fields={filteredListFields}
                            gridId={gridId}
                            draggable={draggable}
                            sortable={isTrue(props.options?.sortable, true)}
                            viewFields={viewFields ?? []}
                            searchForm={searchForm!}
                            entityForm={entityForm}
                            quickSearchFieldNames={quickSearchFieldNames}
                            quickSearchValue={search}
                            onChangeSearchForm={(searchForm, resetPage) => {
                              (async () => {
                                await onChangeSearchForm(entityForm, searchForm, false, resetPage);
                              })();
                            }}
                          />
                        </tr>
                      </thead>
                      {/*<tbody className={''}>*/}
                      <RowItem
                        {...{
                          list: rows,
                          managePriority: managePriority,
                          sortRowsPriority: sortRowsPriority,
                          isSubCollection: isSubCollection,
                          viewMode: props.viewMode ?? 'page',
                          ...(props.options?.useAccordion !== undefined
                            ? { useAccordion: props.options.useAccordion }
                            : {}),
                          startNumber: props.options?.hidePagination
                            ? rows.length
                            : (totalCount ?? 0) - searchForm!.getPage() * searchForm!.getPageSize(),
                          viewFields: viewFields ?? [],
                          checkedItems,
                          setCheckedItems,
                          ...(onSelect
                            ? {
                                onSelect: (item: any, setId: any) => {
                                  onSelect?.(item, setId ?? setManagedId);
                                },
                              }
                            : {}),
                          enableCheckItem,
                          onRefresh: fetchData,
                          router,
                          path,
                          ...(props.options?.onDrag !== undefined
                            ? { onDrag: props.options.onDrag }
                            : {}),
                          fields: filteredListFields,
                          entityForm,
                          ...(session !== undefined ? { session } : {}),
                          isAdmin: isAdmin,
                          ...(props.options?.messages !== undefined
                            ? { messages: props.options.messages }
                            : {}),
                          ...(selectionOptions !== undefined ? { selectionOptions } : {}),
                          showCheckboxInput: showCheckboxInput,
                          ...(openInNewWindow !== undefined ? { openInNewWindow } : {}),
                          // Inline expansion props for SubCollection
                          ...(shouldUseInlineMode
                            ? {
                                inlineExpansion: {
                                  expandedItems,
                                  isExpanded,
                                  toggleExpansion,
                                  collapseItem,
                                  canExpand,
                                  setManagedId,
                                },
                              }
                            : {}),
                          // SubCollection mappedBy for auto-hiding parent reference fields
                          ...(props.options?.subCollection?.mappedBy !== undefined
                            ? { mappedBy: props.options.subCollection.mappedBy }
                            : {}),
                          // 인라인/상세 뷰에서 수정 불가 여부
                          inlineViewReadonly:
                            isTrue(props.options?.readonly) ||
                            !isTrue(props.options?.subCollection?.modifyOnView, true),
                        }}
                        key={searchForm!.getCacheKey()}
                      />
                      {/*</tbody>*/}
                    </table>
                  </div>
                </div>
                {!emptyList && !isTrue(props.options?.hidePagination, false) && (
                  <PaginationContainer
                    themeClasses={themeClasses}
                    totalPage={totalPage}
                    page={page}
                    changePage={changePage}
                    isPopup={!!props.options?.popup}
                  />
                )}
              </div>
            )}
          </Stack>
        </div>
        {/* Modal for deep nesting (depth > maxInlineDepth) or non-SubCollection */}
        {managedId && !shouldUseInlineMode && (
          <SubCollectionViewModal
            entityForm={entityForm}
            managedId={managedId}
            props={props}
            setManagedId={setManagedId}
            fetchData={fetchData}
            setOpenBaseLoading={setOpenBaseLoading}
            {...(props.options?.subCollection?.mappedBy !== undefined
              ? { mappedBy: props.options.subCollection.mappedBy }
              : {})}
          />
        )}
      </ListGridThemeProvider>
    </EntityFormScopeProvider>
  );
};
