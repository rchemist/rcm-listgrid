import React from 'react';
import { EntityForm } from '../../../config/EntityForm';
import { Session } from '../../../auth/types';
import { useEntityFormTheme } from '../context/EntityFormThemeContext';
import { validateAndAdvanceStep } from './CreateStepView';

/**
 * CreateStepButtons 컴포넌트
 * - 단계별 생성 모드에서 하단에 표시되는 이전/다음/저장 버튼
 *
 * @param props.currentStep - 현재 단계 인덱스
 * @param props.maxStep - 최대 단계 수
 * @param props.entityForm - EntityForm 인스턴스
 * @param props.setEntityForm - EntityForm setter
 * @param props.setCurrentStep - 단계 setter
 * @param props.onClickSaveButton - 저장 버튼 클릭 핸들러
 * @param props.session - 세션 정보
 */
export interface CreateStepButtonsProps {
  currentStep: number;
  maxStep: number;
  entityForm: EntityForm;
  setEntityForm: React.Dispatch<React.SetStateAction<EntityForm | undefined>>;
  setCurrentStep: (step: number) => void;
  onClickSaveButton: () => void;
  session?: Session;
}

export const CreateStepButtons = React.memo(function CreateStepButtons({
  currentStep,
  maxStep,
  entityForm,
  setEntityForm,
  setCurrentStep,
  onClickSaveButton,
  session,
}: CreateStepButtonsProps) {
  const { classNames, cn, buttonLabels } = useEntityFormTheme();

  const handleNext = React.useCallback(async () => {
    const { canAdvance, updatedForm } = await validateAndAdvanceStep(
      entityForm,
      currentStep,
      session,
    );
    setEntityForm(updatedForm);
    if (canAdvance) {
      setCurrentStep(currentStep + 1);
    }
  }, [entityForm, currentStep, session, setEntityForm, setCurrentStep]);

  const handlePrev = React.useCallback(() => {
    setCurrentStep(currentStep > 0 ? currentStep - 1 : currentStep);
  }, [currentStep, setCurrentStep]);

  return (
    <div className={cn('rcm-create-step-buttons', classNames.createStep?.buttonGroup)}>
      <button
        type="button"
        className={cn('rcm-button', classNames.createStep?.prevButton)}
        onClick={handlePrev}
        disabled={currentStep === 0}
      >
        이전
      </button>
      {currentStep < maxStep && (
        <button
          type="button"
          className={cn('rcm-button', classNames.createStep?.nextButton)}
          data-variant="primary"
          onClick={handleNext}
        >
          다음
        </button>
      )}
      {currentStep === maxStep && (
        <button
          type="button"
          className={cn('rcm-button', classNames.createStep?.saveButton)}
          data-variant="primary"
          onClick={onClickSaveButton}
        >
          {buttonLabels?.save ?? '저장'}
        </button>
      )}
    </div>
  );
});
