'use client';

import { useCallback } from 'react';
import { useRouter } from '../../../router';
import { EntityForm } from '../../../config/EntityForm';
import { EntityTab } from '../../../config/EntityTab';
import { isEmpty } from '../../../utils';
import { removeTrailingSeparator } from '../../../utils/StringUtil';
import { showAlert } from '../../../message';
import { Session } from '../../../auth/types';
import { EntityButtonLinkProps } from '../../../config/Config';
import { isTrue } from '../../../utils/BooleanUtil';

/**
 * Custom hook for initializing EntityForm state and tabs.
 * EntityForm 상태 및 탭 초기화를 위한 커스텀 훅
 * @param params - 초기화에 필요한 파라미터 객체
 */
export const useEntityFormInitializer = ({
  entityForm: initialEntityForm,
  isSubCollectionEntity,
  pathname,
  session,
  buttonLinks,
  onInitialize,
  setTabs,
  setTabIndex,
  setEntityForm,
  setTitleText,
  setLoadingError,
}: {
  entityForm: EntityForm;
  isSubCollectionEntity: boolean;
  pathname: string;
  session?: Session;
  buttonLinks?: EntityButtonLinkProps;
  onInitialize?: (entityForm: EntityForm) => Promise<EntityForm>;
  setTabs: (tabs: EntityTab[]) => void;
  setTabIndex: (tabId: string) => void;
  setEntityForm: (entityForm: EntityForm) => void;
  setTitleText: (entityForm: EntityForm) => void;
  setLoadingError: (error: boolean) => void;
}) => {
  const router = useRouter();

  /**
   * EntityForm을 초기화하고 탭/타이틀/상태를 세팅합니다.
   * @param options - 초기화 옵션 (preserveTabIndex: 탭 인덱스 보존 여부)
   * @returns Promise<void>
   */
  const initializeEntityForm = useCallback(
    async (options?: { preserveTabIndex?: boolean }) => {
      try {
        const actionResult = await initialEntityForm.initialize(
          session !== undefined ? { session } : {},
        );
        let entityForm = actionResult.entityForm;
        if (actionResult.errors && !isEmpty(actionResult.errors)) {
          const listUrl = removeTrailingSeparator(pathname ?? '', '/') || '/';
          setLoadingError(true);
          showAlert({
            message: `데이터 조회 중 오류가 발생 했습니다.\n${actionResult.errors[0]}`,
            title: '오류',
            icon: 'error',
            topLayer: true,
          });
          // 에러 메시지 표시 후 목록으로 이동
          setTimeout(async () => {
            if (buttonLinks?.onClickList) {
              await buttonLinks.onClickList();
            } else {
              router.push(listUrl);
            }
          }, 1000);
        } else {
          if (onInitialize) {
            entityForm = await onInitialize(entityForm);
          }
          let tabId = '';
          // main entity에만 revisionEntityName을 설정
          if (!isSubCollectionEntity) {
            if (typeof window !== 'undefined') {
              let revisionPath = '';
              if (entityForm?.id) {
                const id = entityForm.id;
                const idIndex = pathname.lastIndexOf(`/${id}`);
                if (idIndex !== -1) {
                  revisionPath = pathname.substring(0, idIndex);
                } else {
                  revisionPath = pathname;
                }
              } else {
                revisionPath = pathname;
              }
              entityForm?.setRevisionEntityNameIfBlank(revisionPath);
            }
          }

          // createStep 이 있다면 첫 단계에 대한 필드만 추출한다.
          const createStepFields: string[] = [];
          if (entityForm.getCreateStep()) {
            // entityForm.createStep 을 order 로 sort 한다.
            createStepFields.push(...entityForm.getCreateStep()![0]!.fields);
          }

          const tabs = await entityForm.getViewableTabs(false, createStepFields);
          setTabs(tabs);

          // preserveTabIndex 옵션이 true가 아닐 때만 탭 인덱스 초기화
          if (!options?.preserveTabIndex) {
            for (const tab of tabs) {
              if (!isTrue(tab.hidden)) {
                tabId = tab.id;
                break;
              }
            }
            setTabIndex(tabId);
          }
          setEntityForm(entityForm);
          setTitleText(entityForm);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in initializeEntityForm:', error);
      }
    },
    [
      initialEntityForm,
      isSubCollectionEntity,
      pathname,
      session,
      buttonLinks,
      onInitialize,
      setTabs,
      setTabIndex,
      setEntityForm,
      setTitleText,
      setLoadingError,
      router,
    ],
  );
  return initializeEntityForm;
};
