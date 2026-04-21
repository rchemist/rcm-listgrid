'use client';

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from '../../../router';
import { isTrue } from '../../../utils/BooleanUtil';
import { ModalOptions, useModalManagerStore } from '../../../store';
import { useSession } from '../../../auth';
import { useLoadingStore } from '../../../loading';
// Dynamic import for getEntityFormButtons to reduce bundle size
import { showSuccess } from '../../../message';
import { subStringBeforeLast } from '../../../utils/StringUtil';
import { EntityForm } from '../../../config/EntityForm';
import { EntityTab } from '../../../config/EntityTab';
import { RenderType } from '../../../config/Config';
import { Session } from '../../../auth/types';
import { ViewEntityFormProps } from '../types/ViewEntityForm.types';
import { useEntityFormInitializer } from './useEntityFormInitializer';
import { useEntityFormSave } from './useEntityFormSave';
import { useEntityFormTitle } from './useEntityFormTitle';
import { useEntityFormAutoSave } from './useEntityFormAutoSave';

/**
 * useEntityFormLogic 훅
 * - ViewEntityForm의 모든 상태/핸들러/로직을 관리하는 커스텀 훅
 * - 렌더링에 필요한 모든 값/함수만 반환
 *
 * @param props ViewEntityFormProps
 */
export function useEntityFormLogic(props: ViewEntityFormProps) {
  // 상태 선언
  const [entityForm, setEntityForm] = useState<EntityForm>();
  const entityFormRef = useRef<EntityForm>(entityForm);
  useEffect(() => {
    entityFormRef.current = entityForm;
  }, [entityForm]);
  const [tabIndex, setTabIndex] = useState<string>();
  const [cacheKey, setCacheKey] = useState<string>();
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [title, setTitle] = useState<ReactNode>('');
  const [renderType, setRenderType] = useState<RenderType>();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showStepper, setShowStepper] = useState<boolean>(true);
  const [tabs, setTabs] = useState<EntityTab[]>([]);
  const [buttons, setButtons] = useState<React.ReactNode[]>([]);
  const [headerAreaContent, setHeaderAreaContent] = useState<ReactNode>(null);

  const { setOpenBaseLoading } = useLoadingStore();
  const router = useRouter();
  const pathname = usePathname();
  const isSubCollectionEntity = isTrue(props.subCollection);
  const isInlineMode = isTrue(props.inlineMode);
  const readonly = isTrue(props.readonly);
  const popupMode = isTrue(props.popupMode);

  // useSession 훅은 항상 최상단에서 호출
  const sessionFromHook = useSession();

  // session을 찾는 순서: 1. entityForm.session 2. props.session 3. useSession()
  let session: Session | null = null;

  // 1. entityForm 안에 있는 session 확인
  if (entityForm?.session) {
    session = entityForm.session;
  }
  // 2. props.session으로 넘어온 session 확인
  else if (props.session) {
    session = props.session;
  }
  // 3. sessionFromHook에서 넘어온 session 확인
  else if (sessionFromHook) {
    session = sessionFromHook;
  }

  if (!session) {
    // throw new Error("Session is required for ViewEntityForm");
  }

  // session이 검출되면 entityForm에 session 설정
  if (entityForm && !entityForm.session && session) {
    entityForm.withSession(session);
  }

  // title 계산 훅 (title 반환형)
  const getEntityFormTitle = useEntityFormTitle({
    entityForm: entityForm ?? props.entityForm,
    ...(props.title !== undefined ? { customTitle: props.title } : {}),
  });

  // title 갱신 함수 - useCallback으로 메모이제이션
  const updateTitle = useCallback(
    async (form?: EntityForm) => {
      const newTitle = await getEntityFormTitle(form);
      setTitle(newTitle);

      // 팝업 모드일 때 브라우저 창 타이틀도 업데이트
      if (popupMode && newTitle) {
        if (typeof newTitle === 'string') {
          document.title = newTitle;
        } else if (typeof newTitle === 'number') {
          document.title = String(newTitle);
        }
        // ReactNode인 경우는 브라우저 타이틀에 적용하지 않음
      }
    },
    [getEntityFormTitle, popupMode],
  );

  // postSave/postDelete 분리 (타입 보장) - useCallback으로 메모이제이션
  // clearAutoSave는 아래에서 정의되므로, 여기서는 ref로 접근
  const clearAutoSaveRef = useRef<() => void>(() => {});

  const postSave = useCallback(
    async (entityForm: EntityForm): Promise<EntityForm> => {
      // 저장 성공 시 autoSave 데이터 삭제
      clearAutoSaveRef.current();

      if (props.postSave) {
        const result = await props.postSave(entityForm);
        if (isSubCollectionEntity) {
          await showSuccess({
            message: '데이터가 저장되었습니다.',
            topLayer: true,
          });

          setTimeout(() => {
            if (props.buttonLinks?.onSave) {
              props.buttonLinks?.onSave?.success?.({ entityForm: result });
            }
          }, 100);
        }
        await updateTitle(result);
        return result;
      }
      if (!isSubCollectionEntity) {
        if (renderType === 'create') {
          const url = subStringBeforeLast(pathname!, '/add') + '/' + entityForm.id;
          await showSuccess({
            message: '데이터가 저장되었습니다.',
            topLayer: true,
          });

          setTimeout(() => {
            router.push(url);
          }, 100);
        } else {
          setCacheKey(`${new Date().getTime()}`);
          setNotifications(['데이터가 저장되었습니다.']);
          setEntityForm(entityForm);
          await updateTitle(entityForm);
        }
      } else {
        await showSuccess({
          message: '데이터가 저장되었습니다.',
          topLayer: true,
        });

        setTimeout(() => {
          if (props.buttonLinks?.onSave) {
            props.buttonLinks?.onSave?.success?.({ entityForm: entityForm });
          }
        }, 100);
      }
      await updateTitle(entityForm);
      return entityForm;
    },
    [
      props.postSave,
      props.buttonLinks,
      isSubCollectionEntity,
      renderType,
      pathname,
      router,
      updateTitle,
    ],
  );

  const postDelete = useCallback(
    async (entityForm: EntityForm): Promise<void> => {
      if (props.postDelete) {
        await props.postDelete(entityForm);
      }
    },
    [props.postDelete],
  );

  // 커스텀 훅: EntityForm 초기화
  const initializeEntityForm = useEntityFormInitializer({
    entityForm: props.entityForm,
    isSubCollectionEntity,
    pathname: pathname!,
    ...(session ? { session } : {}),
    ...(props.buttonLinks !== undefined ? { buttonLinks: props.buttonLinks } : {}),
    ...(props.onInitialize !== undefined ? { onInitialize: props.onInitialize } : {}),
    setTabs,
    setTabIndex,
    setEntityForm,
    setTitleText: updateTitle,
    setLoadingError,
  });

  // 커스텀 훅: 저장 로직 (postDelete는 전달하지 않음)
  const { onClickSaveButton } = useEntityFormSave({
    entityForm: entityForm!,
    isSubCollectionEntity,
    renderType,
    pathname: pathname!,
    router,
    ...(props.buttonLinks !== undefined ? { buttonLinks: props.buttonLinks } : {}),
    postSave: postSave,
    setEntityForm,
    setNotifications,
    setTitleText: updateTitle,
    setCacheKey,
    setErrors,
    setOpenBaseLoading,
    ...(session ? { session } : {}),
  });

  // 최초 마운트 시 EntityForm 초기화
  useEffect(() => {
    if (!initialized && typeof window !== 'undefined' && props.entityForm) {
      setRenderType(props.entityForm.id !== undefined ? 'update' : 'create');
      initializeEntityForm();
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // entityForm이 변경될 때마다 session 설정
  useEffect(() => {
    if (entityForm && session && !entityForm.session) {
      entityForm.withSession(session);
    }
  }, [entityForm, session]);

  // AutoSave 훅 초기화
  const {
    triggerSave: triggerAutoSave,
    clearAutoSave,
    saveNow: saveAutoSaveNow,
  } = useEntityFormAutoSave({
    ...(entityForm !== undefined ? { entityForm } : {}),
    enabled: props.autoSave ?? false,
    ...(props.autoSaveKey !== undefined ? { autoSaveKey: props.autoSaveKey } : {}),
  });

  // clearAutoSaveRef 업데이트 (postSave에서 사용)
  useEffect(() => {
    clearAutoSaveRef.current = clearAutoSave;
  }, [clearAutoSave]);

  // entityForm 값이 변경될 때 자동 저장 트리거
  useEffect(() => {
    if (entityForm && initialized && props.autoSave) {
      triggerAutoSave();
    }
  }, [entityForm, initialized, props.autoSave, triggerAutoSave]);

  // EntityForm.shouldReload 감지 시 갱신
  useEffect(() => {
    if (isTrue(entityForm?.shouldReload)) {
      const newCacheKey = `${new Date().getTime()}`;
      setCacheKey(newCacheKey);
      const cloned = entityForm!.clone(true).withShouldReload();
      setEntityForm(cloned);
      updateTitle(entityForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityForm?.shouldReload]);

  // onLoad 콜백 처리 - 컴포넌트가 완전히 렌더링된 후 호출
  useEffect(() => {
    if (entityForm && initialized && !loadingError && props.onLoad) {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 호출
      const timer = setTimeout(async () => {
        try {
          await props.onLoad!(entityForm);
        } catch (error) {
          console.error('Error in onLoad callback:', error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [entityForm, initialized, loadingError, props.onLoad]);

  // CreateStep 관련 - useMemo로 메모이제이션
  const useCreateStep = useMemo(
    () =>
      renderType === 'create' &&
      entityForm?.getCreateStep() !== undefined &&
      entityForm?.getCreateStep()!.length > 0,
    [renderType, entityForm],
  );

  const maxStep = useMemo(() => (entityForm?.getCreateStep()?.length ?? 1) - 1, [entityForm]);

  const createStepFields = useMemo(() => {
    const fields: string[] = [];
    if (useCreateStep && entityForm) {
      fields.push(...entityForm.getCreateStep()![currentStep]!.fields);
    }
    return fields;
  }, [useCreateStep, entityForm, currentStep]);

  // CreateStep 변경 시 탭 인덱스를 자동으로 첫 번째 보이는 탭으로 이동
  useEffect(() => {
    if (!useCreateStep || !entityForm) return;

    (async () => {
      const step = entityForm.getCreateStep()?.[currentStep];
      if (!step) return;

      const allTabs = await entityForm.getViewableTabs(false);
      let firstVisibleTabId = '';
      for (const tab of allTabs) {
        const viewableFieldGroups = await entityForm.getViewableFieldGroups({
          tabId: tab.id,
          createStepFields: step.fields,
        });
        if (viewableFieldGroups.length > 0) {
          firstVisibleTabId = tab.id;
          break;
        }
      }

      if (firstVisibleTabId) {
        const tabIndex = allTabs.findIndex((tab) => tab.id === firstVisibleTabId);
        setTabIndex(firstVisibleTabId);
        setSelectedTabIndex(tabIndex);
      }

      setTabs(allTabs);
    })();
  }, [currentStep, useCreateStep, entityForm]);

  // openBaseLoading 함수를 useCallback으로 메모이제이션
  const openBaseLoadingCallback = useCallback(
    (open: boolean) => {
      setOpenBaseLoading(open);
    },
    [setOpenBaseLoading],
  );

  // 모달 관련 함수들
  const { openModal, closeModal, closeTopModal, findModal, updateModalData } =
    useModalManagerStore();

  const showModal = useCallback(
    (options: ModalOptions) => {
      return openModal(options);
    },
    [openModal],
  );

  const handleCloseModal = useCallback(
    async (id: string) => {
      await closeModal(id);
    },
    [closeModal],
  );

  const getModalData = useCallback(
    (id: string) => {
      const modal = findModal(id);
      return modal?.data;
    },
    [findModal],
  );

  const handleUpdateModalData = useCallback(
    (id: string, data: Partial<ModalOptions>) => {
      updateModalData(id, data);
    },
    [updateModalData],
  );

  // 버튼 영역 비동기 업데이트 - Dynamic import for better performance
  useEffect(() => {
    // entityForm이 없거나 hideAllButtons가 true이면 빈 배열로 설정
    if (!entityForm || props.hideAllButtons) {
      setButtons([]);
      return;
    }

    const updateButtons = async () => {
      try {
        // Dynamic import to reduce initial bundle size
        const { getEntityFormButtons } = await import('../ui/ViewEntityFormButtons');

        const newButtons = await getEntityFormButtons({
          readonly: readonly,
          entityForm: entityForm,
          postSave: postSave,
          postDelete: postDelete,
          ...(props.buttonLinks !== undefined ? { buttonLinks: props.buttonLinks } : {}),
          ...(props.buttons !== undefined ? { buttons: props.buttons } : {}),
          ...(props.excludeButtons !== undefined ? { excludeButtons: props.excludeButtons } : {}),
          subCollection: isSubCollectionEntity,
          setEntityForm: setEntityForm,
          setErrors: setErrors,
          setNotifications: setNotifications,
          router,
          pathname,
          openBaseLoading: openBaseLoadingCallback,
          useCreateStep: useCreateStep,
          currentStep: currentStep,
          maxStep: maxStep,
          createStepFields: createStepFields,
          // 모달 관련 함수들 추가
          showModal: showModal,
          closeModal: handleCloseModal,
          closeTopModal: closeTopModal,
          getModalData: getModalData,
          updateModalData: handleUpdateModalData,
          // 새창(팝업) 모드
          popupMode: popupMode,
        });
        setButtons(newButtons);
      } catch (error) {
        console.error('Error updating buttons:', error);
        setButtons([]);
      }
    };

    updateButtons();
  }, [
    // 실제로 런타임에 변할 수 있는 핵심 의존성만 포함
    entityForm,
    currentStep, // createStep에서 단계가 변경될 때
    initialized, // 초기화 완료 시 버튼 재생성
    cacheKey, // 캐시 키가 변경될 때 버튼 재생성
    renderType, // 렌더 타입 변경 시
  ]);

  // headerArea 비동기 렌더링
  useEffect(() => {
    if (!entityForm || !entityForm.headerArea) {
      setHeaderAreaContent(null);
      return;
    }

    const updateHeaderArea = async () => {
      try {
        const content = await entityForm.headerArea!(entityForm);
        setHeaderAreaContent(content);
      } catch (error) {
        console.error('Error rendering headerArea:', error);
        setHeaderAreaContent(null);
      }
    };

    updateHeaderArea();
  }, [entityForm, cacheKey]);

  const changeCurrentStep = (stepNumber: number) => {
    (async () => {
      const ef = entityFormRef.current;
      const step = ef?.getCreateStep()?.[stepNumber];
      if (step && ef) {
        // 모든 탭을 유지하되, ViewTab에서 display:none으로 숨김 처리
        const allTabs = await ef.getViewableTabs(false);

        // 현재 단계에서 첫 번째로 표시 가능한 탭을 찾아서 이동
        let firstVisibleTabId = '';
        for (const tab of allTabs) {
          const viewableFieldGroups = await ef.getViewableFieldGroups({
            tabId: tab.id,
            createStepFields: step.fields,
          });
          if (viewableFieldGroups.length > 0) {
            firstVisibleTabId = tab.id;
            break;
          }
        }

        if (firstVisibleTabId) {
          const tabIndex = allTabs.findIndex((tab) => tab.id === firstVisibleTabId);
          setTabIndex(firstVisibleTabId);
          setSelectedTabIndex(tabIndex);
        }

        setTabs(allTabs);
      }

      // 상태 업데이트
      setCurrentStep(stepNumber);
      setCacheKey(`${new Date().getTime()}`);
    })();
  };

  // EntityForm을 리셋하고 초기화 상태로 되돌리는 함수
  const resetEntityForm = useCallback(
    async (delay?: number, preserveState: boolean = true) => {
      // 현재 상태 보존
      const currentTabId = preserveState ? tabIndex : undefined;
      const currentSelectedIndex = preserveState ? selectedTabIndex : 0;
      const currentScroll = preserveState ? window.scrollY : 0;

      // 지연 시간이 있으면 대기
      if (delay && delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // BaseLoading 표시
      setOpenBaseLoading(true);

      try {
        // 로딩이 표시될 시간을 주기 위한 짧은 대기
        await new Promise((resolve) => setTimeout(resolve, 50));

        // EntityForm 재초기화 - 이미 생성된 initializeEntityForm 함수 사용
        if (props.entityForm) {
          await initializeEntityForm({ preserveTabIndex: preserveState });

          // 상태 복원
          if (preserveState) {
            // 스크롤 위치 복원
            setTimeout(() => {
              window.scrollTo({
                top: currentScroll,
                behavior: 'instant',
              });
            }, 50);
          }

          setCacheKey(`${new Date().getTime()}`);
        }
      } catch (error) {
        console.error('Error resetting EntityForm:', error);
        setLoadingError(true);
      } finally {
        // 로딩 종료
        setOpenBaseLoading(false);
      }
    },
    [
      tabIndex,
      selectedTabIndex,
      props.entityForm,
      initializeEntityForm,
      setOpenBaseLoading,
      setTabIndex,
      setSelectedTabIndex,
      setCacheKey,
      setLoadingError,
    ],
  );

  return {
    entityForm,
    setEntityForm,
    tabIndex,
    setTabIndex,
    cacheKey,
    setCacheKey,
    loadingError,
    initialized,
    errors,
    setErrors,
    notifications,
    setNotifications,
    title,
    setTitle,
    renderType,
    setRenderType,
    selectedTabIndex,
    setSelectedTabIndex,
    currentStep,
    setCurrentStep: changeCurrentStep,
    showStepper,
    setShowStepper,
    tabs,
    setTabs,
    isSubCollectionEntity,
    isInlineMode,
    readonly,
    popupMode,
    session,
    useCreateStep,
    maxStep,
    createStepFields,
    buttons,
    headerAreaContent,
    postSave,
    postDelete,
    updateTitle,
    onClickSaveButton,
    // 모달 관련 함수들
    showModal,
    closeModal: handleCloseModal,
    closeTopModal,
    getModalData,
    updateModalData: handleUpdateModalData,
    resetEntityForm,
    // AutoSave 관련 함수들
    triggerAutoSave,
    clearAutoSave,
    saveAutoSaveNow,
  };
}
