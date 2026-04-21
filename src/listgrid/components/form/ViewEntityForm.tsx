'use client';
import React, { ReactNode } from 'react';
import { ViewEntityFormProps } from './types/ViewEntityForm.types';
// Static imports for core components
import { ViewEntityFormTitle } from './ui/ViewEntityFormTitle';
import { ViewEntityFormButtons } from './ui/ViewEntityFormButtons';
import { ViewEntityFormSkeleton } from './ui/ViewEntityFormSkeleton';
import { Tab } from '@headlessui/react';
// Dynamic imports to reduce bundle size
import { dynamic } from '../../utils/lazy';
import { useEntityFormLogic } from './hooks/useEntityFormLogic';
import { clearAllToasts } from '../../message';
// Theme system
import { useEntityFormTheme } from './context/EntityFormThemeContext';

// Lazy load heavy components
const ViewEntityFormErrors = dynamic(
  () => import('./ui/ViewEntityFormErrors').then((mod) => ({ default: mod.ViewEntityFormErrors })),
  {
    loading: () => <div className="rcm-skeleton-placeholder-xs"></div>,
  },
);

const ViewEntityFormAlerts = dynamic(
  () => import('./ui/ViewEntityFormAlerts').then((mod) => ({ default: mod.ViewEntityFormAlerts })),
  {
    loading: () => <div className="rcm-skeleton-placeholder-xs"></div>,
  },
);

const ViewTab = dynamic(() => import('./ViewTab').then((mod) => ({ default: mod.ViewTab })), {
  loading: () => <div className="rcm-skeleton-placeholder-tab"></div>,
});

const ViewTabPanel = dynamic(
  () => import('./ViewTabPanel').then((mod) => ({ default: mod.ViewTabPanel })),
  {
    loading: () => <div className="rcm-skeleton-placeholder-panel"></div>,
  },
);

const SafePerfectScrollbar: React.ComponentType<any> = dynamic(
  () => import('../../ui').then((mod) => ({ default: mod.SafePerfectScrollbar as any })),
  {
    ssr: false,
    loading: () => <div className="rcm-skeleton-placeholder-fill"></div>,
  },
);

const CreateStepView = dynamic(
  () => import('./ui/CreateStepView').then((mod) => ({ default: mod.CreateStepView })),
  {
    loading: () => <div className="rcm-skeleton-placeholder-md"></div>,
  },
);

const CreateStepButtons = dynamic(
  () => import('./ui/CreateStepButtons').then((mod) => ({ default: mod.CreateStepButtons })),
  {
    loading: () => <div className="rcm-skeleton-placeholder-lg"></div>,
  },
);

/**
 * ViewEntityForm component (render-only structure)
 * - All state/handlers/logic are managed by the useEntityFormLogic hook.
 * - This component is responsible only for rendering structure.
 *
 * ViewEntityForm 컴포넌트 (최소 렌더링 구조)
 * - 모든 상태/핸들러/로직은 useEntityFormLogic 훅에서 관리
 * - 이 컴포넌트는 렌더링 구조만 담당
 *
 * @param props {ViewEntityFormProps} - EntityForm 렌더링에 필요한 모든 속성
 * @returns {JSX.Element|null} - 렌더링 결과 또는 로딩 상태
 */
export const ViewEntityForm = (props: ViewEntityFormProps) => {
  // useEntityFormLogic 훅에서 모든 상태/핸들러/로직을 일괄 관리
  // All state/handlers/logic are managed by the useEntityFormLogic hook
  const {
    entityForm,
    tabIndex,
    setTabIndex,
    cacheKey,
    loadingError,
    initialized,
    errors,
    notifications,
    title,
    selectedTabIndex,
    setSelectedTabIndex,
    currentStep,
    setCurrentStep,
    showStepper,
    setShowStepper,
    tabs,
    isSubCollectionEntity,
    isInlineMode,
    readonly,
    session,
    useCreateStep,
    maxStep,
    createStepFields,
    buttons,
    headerAreaContent,
    setEntityForm,
    onClickSaveButton,
    resetEntityForm,
  } = useEntityFormLogic(props);

  // 테마 시스템에서 클래스 가져오기
  const { classNames, cn, createStepButtonPosition } = useEntityFormTheme();

  // 로딩/에러/초기화 미완료/필수 데이터 미존재 시 로딩 UI만 표시
  // Show loading UI if loading, error, not initialized, or required data is missing
  const loading = loadingError || !initialized || !entityForm || !tabs || tabs.length === 0;

  if (loading) {
    return (
      <ViewEntityFormSkeleton
        {...(entityForm !== undefined ? { entityForm } : {})}
        inlineMode={isInlineMode}
        subCollectionEntity={isSubCollectionEntity}
      />
    );
  }

  // 버튼 위치 결정 (기본값: header)
  // 인라인 모드에서는 탭 영역 옆에 버튼 배치
  const buttonPosition = props.buttonPosition ?? 'header';
  const showButtonsInHeader = buttonPosition === 'header' && !isInlineMode;
  const showButtonsInTabRow = isInlineMode;

  return (
    <div
      id={`view-entity-form-${entityForm.name}${isSubCollectionEntity ? '-sub' : ''}`}
      className={classNames.root}
    >
      {/* Sticky header group: title + buttons + custom header area */}
      <div className="rcm-form-sticky-header">
        {/* Header 영역: 제목 + 버튼 그룹 */}
        {/* Header area: Title + Button group */}
        <div className={cn('rcm-form-header', classNames.header?.container)}>
          {/* 제목 영역 */}
          <div className={cn('rcm-form-header-title', classNames.header?.titleWrapper)}>
            <ViewEntityFormTitle
              title={title}
              {...(props.hideTitle !== undefined ? { hideTitle: props.hideTitle } : {})}
            />
          </div>
          {/* 버튼 영역 (header 위치일 때만) */}
          {showButtonsInHeader && (
            <div className={cn('rcm-form-header-buttons', classNames.header?.buttonWrapper)}>
              <ViewEntityFormButtons buttons={buttons} />
            </div>
          )}
        </div>
        {/* Custom Header Area */}
        {headerAreaContent && (
          <div className={cn('rcm-form-header-area', classNames.headerArea?.container)}>
            {headerAreaContent}
          </div>
        )}
      </div>
      {/* CreateStep 단계별 UI: CreateStepView */}
      {/* CreateStep step UI: CreateStepView */}
      {/*
        CreateStepView
        - 신규 생성 단계별 입력 UI
        - useCreateStep이 true일 때만 렌더링
        - 모든 상태/핸들러는 useEntityFormLogic에서 전달
      */}
      {useCreateStep && entityForm && (
        <CreateStepView
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          maxStep={maxStep}
          entityForm={entityForm}
          setEntityForm={setEntityForm}
          onClickSaveButton={onClickSaveButton}
          showStepper={showStepper}
          setShowStepper={setShowStepper}
          session={session ?? undefined}
          buttonPosition={createStepButtonPosition ?? 'top'}
        />
      )}
      {/* 필드(Tab/Panel) 영역: ViewEntityFormFields */}
      {/* Field(Tab/Panel) area: ViewEntityFormFields */}
      <SafePerfectScrollbar
        className={cn('rcm-form-scroll-container', classNames.panel?.scrollContainer)}
      >
        <div className={cn('rcm-form-layout-wrapper', classNames.panel?.layoutWrapper)}>
          <div
            className={cn(
              isInlineMode ? 'rcm-form-panel rcm-form-panel-inline' : 'rcm-form-panel',
              classNames.panel?.container,
            )}
          >
            <div className={cn('rcm-form-panel-inner', classNames.panel?.inner)}>
              {/* Alert 메시지 영역: ViewEntityFormAlerts */}
              {/* Alert message area: ViewEntityFormAlerts */}
              {/*
                ViewEntityFormAlerts
                - EntityForm의 Alert 메시지 표시
                - withOnChanges에서 추가된 메시지들을 표시
              */}
              <ViewEntityFormAlerts
                alertMessages={entityForm.getAlertMessages()}
                onRemove={(key: string) => {
                  const updatedForm = entityForm.clone().removeAlertMessage(key);
                  setEntityForm(updatedForm);
                }}
                onTabChange={(tabId: string) => {
                  // tab id로 tab index 찾기
                  const index = tabs.findIndex((tab) => tab.id === tabId);
                  if (index !== -1) {
                    setSelectedTabIndex(index);
                    setTabIndex(tabId);
                  }
                }}
                onFieldFocus={(fieldName: string) => {
                  // 필드가 있는 탭 찾기
                  const field = entityForm.getField(fieldName);
                  if (field) {
                    const fieldTabId = field.getTabId();
                    if (fieldTabId) {
                      const tabIdx = tabs.findIndex((tab) => tab.id === fieldTabId);
                      if (tabIdx !== -1) {
                        setSelectedTabIndex(tabIdx);
                        setTabIndex(fieldTabId);
                        // 필드로 스크롤 (약간의 지연 후)
                        setTimeout(() => {
                          const fieldElement = document.querySelector(
                            `[data-field-name="${fieldName}"]`,
                          );
                          if (fieldElement) {
                            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // 포커스 효과 추가 (선택사항)
                            fieldElement.classList.add('rcm-field-focus-ring');
                            setTimeout(() => {
                              fieldElement.classList.remove('rcm-field-focus-ring');
                            }, 2000);
                          }
                        }, 100);
                      }
                    }
                  }
                }}
              />
              {/* 에러/알림 영역: ViewEntityFormErrors */}
              {/* Error/notification area: ViewEntityFormErrors */}
              {/*
                ViewEntityFormErrors
                - 에러 메시지, 필드별 에러, 알림 메시지 표시
                - errors, entityErrorMap, notifications 전달
              */}
              <ViewEntityFormErrors
                errors={errors}
                entityErrorMap={entityForm.getErrorMap()}
                notifications={notifications}
                onTabChange={(tabIndex: number) => {
                  clearAllToasts();
                  setSelectedTabIndex(tabIndex);
                  if (tabs[tabIndex]) {
                    setTabIndex(tabs[tabIndex].id);
                  }
                }}
                tabs={tabs}
                entityForm={entityForm}
              />
              {/* 필드(Tab/Panel) 영역: 직접 렌더링 (백업 코드 방식) */}
              {/* Field(Tab/Panel) area: Direct rendering (backup code style) */}
              <Tab.Group
                selectedIndex={selectedTabIndex}
                onChange={(index) => {
                  clearAllToasts();
                  setSelectedTabIndex(index);
                }}
              >
                {/* 인라인 모드: 탭 + 버튼을 같은 줄에 배치 */}
                {showButtonsInTabRow && (
                  <div
                    className={`rcm-form-tab-row ${tabs.length > 1 ? 'rcm-form-tab-row-border' : ''}`}
                  >
                    <div className="rcm-form-tab-row-tabs">
                      {tabs.length > 1 && (
                        <Tab.List
                          className={cn(
                            'rcm-tab-list-inline',
                            useCreateStep ? 'rcm-hide' : undefined,
                          )}
                        >
                          {tabs.map((tab, index) => (
                            <ViewTab
                              id={tab.id}
                              key={`${index}_${cacheKey}_tab`}
                              label={tab.label}
                              tabIndex={tabIndex!}
                              description={tab.description}
                              entityForm={entityForm}
                              createStepFields={createStepFields}
                              setTabIndex={setTabIndex}
                            />
                          ))}
                        </Tab.List>
                      )}
                    </div>
                    <div className="rcm-form-tab-buttons">
                      <ViewEntityFormButtons buttons={buttons} />
                    </div>
                  </div>
                )}
                {/* 일반 모드: 기존 탭 레이아웃 (스테퍼 모드에서는 hidden 처리) */}
                {!showButtonsInTabRow && tabs.length > 1 && (
                  <SafePerfectScrollbar
                    className={cn(useCreateStep ? 'rcm-hide' : 'rcm-tab-scroll')}
                  >
                    <Tab.List className={cn('rcm-tab-list', classNames.tabs?.list)}>
                      {(function () {
                        const tabsView: ReactNode[] = [];
                        tabs.forEach((tab, index) => {
                          tabsView.push(
                            <ViewTab
                              id={tab.id}
                              key={`${index}_${cacheKey}_tab`}
                              label={tab.label}
                              tabIndex={tabIndex!}
                              description={tab.description}
                              entityForm={entityForm}
                              createStepFields={createStepFields}
                              setTabIndex={setTabIndex}
                            />,
                          );
                        });
                        return tabsView;
                      })()}
                    </Tab.List>
                  </SafePerfectScrollbar>
                )}

                <Tab.Panels>
                  {(function () {
                    const panels: ReactNode[] = [];
                    tabs.forEach((tab, index) => {
                      panels.push(
                        <ViewTabPanel
                          id={tab.id}
                          key={`${index}_${cacheKey}`}
                          tabIndex={tabIndex!}
                          readonly={readonly}
                          subCollectionEntity={isSubCollectionEntity}
                          session={session ?? undefined}
                          createStepFields={createStepFields}
                          entityForm={entityForm}
                          setEntityForm={setEntityForm}
                          resetEntityForm={resetEntityForm}
                          hideMappedByFields={props.hideMappedByFields}
                        />,
                      );
                    });
                    return panels;
                  })()}
                </Tab.Panels>
              </Tab.Group>
              {/* 하단 버튼 영역 (bottom 위치일 때만, 인라인 모드 제외) */}
              {/* Bottom button area (only when buttonPosition is 'bottom', excluding inline mode) */}
              {!showButtonsInTabRow && (
                <div className={cn('rcm-form-footer', classNames.footer?.container)}>
                  {useCreateStep && createStepButtonPosition === 'bottom' && entityForm && (
                    <CreateStepButtons
                      currentStep={currentStep}
                      maxStep={maxStep}
                      entityForm={entityForm}
                      setEntityForm={setEntityForm}
                      setCurrentStep={setCurrentStep}
                      onClickSaveButton={onClickSaveButton}
                      session={session ?? undefined}
                    />
                  )}
                  {!showButtonsInHeader &&
                    !(useCreateStep && createStepButtonPosition === 'bottom') && (
                      <ViewEntityFormButtons buttons={buttons} />
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SafePerfectScrollbar>
    </div>
  );
};
