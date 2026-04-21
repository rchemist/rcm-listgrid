'use client';
import React, { Dispatch, SetStateAction } from 'react';
import { Tab } from '@headlessui/react';
import { SafePerfectScrollbar } from '../../../ui';
import { ViewTab } from '../ViewTab';
import { ViewTabPanel } from '../ViewTabPanel';
import { EntityTab } from '../../../config/EntityTab';
import { EntityForm } from '../../../config/EntityForm';
import { Session } from '../../../auth/types';

/**
 * ViewEntityFormFields 컴포넌트
 * - EntityForm의 필드(Tab/Panel) 영역만 렌더링합니다.
 * - Tab.Group, Tab.List, Tab.Panels 구조를 그대로 사용합니다.
 *
 * @param props.tabs - 탭 목록
 * @param props.tabIndex - 현재 탭 인덱스
 * @param props.setTabIndex - 탭 인덱스 setter
 * @param props.entityForm - EntityForm 인스턴스
 * @param props.setEntityForm - EntityForm 상태 setter (useState와 동일)
 * @param props.readonly - 읽기 전용 여부
 * @param props.subCollectionEntity - 서브 콜렉션 여부
 * @param props.session - 세션 정보
 * @param props.createStepFields - 생성 단계 필드명 배열
 * @param props.cacheKey - 캐시 키(리렌더링 트리거)
 * @param props.selectedTabIndex - 선택된 탭 인덱스(숫자)
 * @param props.setSelectedTabIndex - 선택 탭 setter
 */
interface ViewEntityFormFieldsProps {
  tabs: EntityTab[];
  tabIndex: string;
  setTabIndex: (tabIndex: string) => void;
  entityForm: EntityForm;
  setEntityForm: Dispatch<SetStateAction<EntityForm | undefined>>;
  readonly: boolean;
  subCollectionEntity: boolean;
  session: Session;
  createStepFields: string[];
  cacheKey: string;
  selectedTabIndex: number;
  setSelectedTabIndex: (idx: number) => void;
}

export const ViewEntityFormFields = React.memo(function ViewEntityFormFields({
  tabs,
  tabIndex,
  setTabIndex,
  entityForm,
  setEntityForm,
  readonly,
  subCollectionEntity,
  session,
  createStepFields,
  cacheKey,
  selectedTabIndex,
  setSelectedTabIndex,
}: ViewEntityFormFieldsProps): React.ReactNode {
  // 단순하게 원래 tabs를 그대로 사용하고, 개별 컴포넌트에서 표시 여부 결정
  React.useEffect(() => {
    if (tabs && tabs.length > 0) {
      const currentTabIndex = tabs.findIndex((tab) => tab.id === tabIndex);
      if (currentTabIndex !== -1 && currentTabIndex !== selectedTabIndex) {
        setSelectedTabIndex(currentTabIndex);
      }
    }
  }, [tabIndex, tabs]);

  const handleTabChange = (index: number) => {
    if (tabs && tabs[index]) {
      setSelectedTabIndex(index);
      setTabIndex(tabs[index].id);
    }
  };

  return (
    <React.Fragment>
      <Tab.Group selectedIndex={selectedTabIndex} onChange={handleTabChange}>
        {tabs.length > 1 && (
          <SafePerfectScrollbar className={`relative w-full whitespace-nowrap`}>
            <Tab.List className="rcm-tab-list">
              {tabs.map((tab, index) => (
                <ViewTab
                  id={tab.id}
                  key={`${tab.id}_${cacheKey}_${createStepFields.join(',')}_tab`}
                  label={tab.label}
                  tabIndex={tabIndex}
                  description={tab.description}
                  entityForm={entityForm}
                  createStepFields={createStepFields}
                  setTabIndex={setTabIndex}
                />
              ))}
            </Tab.List>
          </SafePerfectScrollbar>
        )}
        <Tab.Panels>
          {tabs.map((tab, index) => (
            <ViewTabPanel
              id={tab.id}
              key={`${tab.id}_${cacheKey}_${createStepFields.join(',')}_panel`}
              tabIndex={tabIndex}
              readonly={readonly}
              subCollectionEntity={subCollectionEntity}
              session={session}
              createStepFields={createStepFields}
              entityForm={entityForm}
              setEntityForm={setEntityForm}
            />
          ))}
        </Tab.Panels>
      </Tab.Group>
    </React.Fragment>
  );
});
