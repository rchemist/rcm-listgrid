import React from 'react';
import { ShowNotifications } from '../../../components/helper/ShowNotifications';
import { ViewEntityError } from '../ui/ViewEntityError';
import { EntityForm } from '../../../config/EntityForm';
import { FieldError } from '../../../config/EntityFormTypes';
import { EntityTab } from '../../../config/EntityTab';

/**
 * ViewEntityFormErrors 컴포넌트
 * - EntityForm의 에러 및 알림 메시지 영역만 렌더링합니다.
 *
 * @param props.errors - 에러 메시지 배열
 * @param props.entityErrorMap - 필드별 에러 맵 (Map<string, FieldError[]>)
 * @param props.notifications - 알림 메시지 배열
 * @param props.onTabChange - 탭 변경 콜백 함수
 * @param props.tabs - 탭 정보 배열
 * @param props.entityForm - EntityForm 인스턴스
 */
interface ViewEntityFormErrorsProps {
  errors: string[];
  entityErrorMap: Map<string, FieldError[]>;
  notifications: string[];
  onTabChange?: (tabIndex: number) => void;
  tabs?: EntityTab[];
  entityForm?: EntityForm;
}

export const ViewEntityFormErrors = React.memo(function ViewEntityFormErrors({
  errors,
  entityErrorMap,
  notifications,
  onTabChange,
  tabs,
  entityForm,
}: ViewEntityFormErrorsProps): React.ReactNode {
  // EntityTab 배열을 ViewEntityError에서 사용할 수 있는 형태로 변환
  const tabInfo = tabs?.map((tab) => ({ id: tab.id, label: tab.label }));

  return (
    <>
      {/*
      entityErrorMap 이 빈 값이 아니라면 errors 는 표시하지 않는다.
      */}
      {entityErrorMap.size === 0 && <ShowNotifications messages={errors} error={true} />}
      <ViewEntityError
        errors={entityErrorMap}
        {...(onTabChange !== undefined ? { onTabChange } : {})}
        {...(tabInfo !== undefined ? { tabs: tabInfo } : {})}
        {...(entityForm !== undefined ? { entityForm } : {})}
      />
      <ShowNotifications messages={notifications} timeout={10000} showClose={true} />
    </>
  );
});
