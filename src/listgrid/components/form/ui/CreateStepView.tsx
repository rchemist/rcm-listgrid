import React from 'react';
import { Stepper } from '../../../ui';
import { Group } from '../../../ui';
import { EntityForm } from '../../../config/EntityForm';
import { Session } from '../../../auth/types';
import { useEntityFormTheme } from '../context/EntityFormThemeContext';

/**
 * Validate current step fields and determine if step can advance
 */
export async function validateAndAdvanceStep(
  entityForm: EntityForm,
  currentStep: number,
  session?: Session,
): Promise<{ canAdvance: boolean; updatedForm: EntityForm }> {
  const fieldNames: string[] = [];
  for (let i = 0; i <= currentStep; i++) {
    const step = entityForm.getCreateStep()![i]!;
    fieldNames.push(...step.fields);
  }
  const result = await entityForm.validate({ fieldNames, session });
  if (result.length > 0) {
    const newEntityForm = entityForm.clone(true);
    newEntityForm.withErrors(result);
    return { canAdvance: false, updatedForm: newEntityForm };
  }
  return { canAdvance: true, updatedForm: entityForm.clone(true).withErrors([]) };
}

/**
 * CreateStepView 컴포넌트
 * - 다단계 입력/스텝 UI를 렌더링합니다.
 * - 단계 전환, 유효성 검사, 저장 버튼, stepper 표시/숨김 토글 등 포함
 *
 * @param props.currentStep - 현재 단계 인덱스
 * @param props.setCurrentStep - 단계 setter
 * @param props.maxStep - 최대 단계 수
 * @param props.entityForm - EntityForm 인스턴스
 * @param props.setEntityForm - EntityForm setter
 * @param props.onClickSaveButton - 저장 버튼 클릭 핸들러
 * @param props.showStepper - stepper 표시 여부
 * @param props.setShowStepper - stepper 표시 토글 setter
 * @param props.session - 세션 정보
 * @param props.buttonPosition - 버튼 위치 ('top' | 'bottom')
 */
export interface CreateStepViewProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  maxStep: number;
  entityForm: EntityForm;
  setEntityForm: React.Dispatch<React.SetStateAction<EntityForm | undefined>>;
  onClickSaveButton: () => void;
  showStepper: boolean;
  setShowStepper: (show: boolean) => void;
  session?: Session;
  buttonPosition?: 'top' | 'bottom';
}

export const CreateStepView = React.memo(function CreateStepView({
  currentStep,
  setCurrentStep,
  maxStep,
  entityForm,
  setEntityForm,
  onClickSaveButton,
  showStepper,
  setShowStepper,
  session,
  buttonPosition = 'top',
}: CreateStepViewProps) {
  const { classNames, cn, stepperRenderer, buttonLabels } = useEntityFormTheme();
  const createSteps = entityForm.getCreateStep()!;

  const stepsForRenderer = React.useMemo(
    () =>
      createSteps.map((step) => ({
        id: step.id,
        label: step.label,
        ...(step.description !== undefined ? { description: step.description } : {}),
      })),
    [createSteps],
  );

  const handleStepClick = React.useCallback(
    (step: number) => {
      if (step < currentStep) {
        setCurrentStep(step);
      }
    },
    [currentStep, setCurrentStep],
  );

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
    <div className={cn('rcm-create-step-container', classNames.createStep?.container)}>
      <div className={cn('rcm-create-step-panel', classNames.createStep?.panel)}>
        <div
          className={cn('rcm-create-step-stepper-wrapper', classNames.createStep?.stepperWrapper)}
        >
          {showStepper ? (
            stepperRenderer ? (
              (() => {
                const StepRenderer = stepperRenderer;
                return (
                  <StepRenderer
                    steps={stepsForRenderer}
                    currentStep={currentStep}
                    maxStep={maxStep}
                    onStepClick={handleStepClick}
                  />
                );
              })()
            ) : (
              <Stepper active={currentStep} onStepClick={handleStepClick}>
                {createSteps.map((step) => (
                  <Stepper.Step key={step.id} label={step.label} description={step.description} />
                ))}
              </Stepper>
            )
          ) : (
            <div className={cn('rcm-create-step-label', classNames.createStep?.stepLabel)}>
              {createSteps[currentStep]!.label}
            </div>
          )}
        </div>
        {buttonPosition === 'top' && (
          <Group
            justify="center"
            className={cn('rcm-create-step-button-group', classNames.createStep?.buttonGroup)}
          >
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
                disabled={currentStep === maxStep}
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
          </Group>
        )}
      </div>
    </div>
  );
});
