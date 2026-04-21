import React, { ReactNode } from 'react';
import { SaveButton } from './buttons/SaveButton';
import { ListButton } from './buttons/ListButton';
import { DeleteButton } from './buttons/DeleteButton';
import { ClosePopupButton } from './buttons/ClosePopupButton';
import {
  EntityFormButton,
  EntityFormButtonProps,
  EntityFormReactNodeButton,
} from '../../../config/EntityFormButton';
import { isTrue } from '../../../utils/BooleanUtil';
import { ViewEntityFormButtonsProps } from '../types/ViewEntityFormButtons.types';
import { Tooltip } from '../../../ui';
import { useEntityFormTheme } from '../context/EntityFormThemeContext';

/**
 * ViewEntityFormButtons 컴포넌트
 * - EntityForm의 버튼 영역만 렌더링합니다.
 * - 버튼 그룹을 flex row로 배치합니다.
 *
 * @param props.buttons - 버튼(ReactNode)
 */
interface ViewButtonsProps {
  buttons: ReactNode;
}

export const ViewEntityFormButtons = React.memo(function ViewEntityFormButtons({
  buttons,
}: ViewButtonsProps): React.ReactNode {
  const { classNames } = useEntityFormTheme();

  return (
    <div
      className={`rcm-form-buttons-scroll ${classNames.buttons?.container ?? ''}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        direction: 'rtl',
      }}
    >
      <div
        className={`rcm-form-buttons-row ${classNames.buttons?.innerWrapper ?? ''}`}
        style={{ direction: 'ltr' }}
      >
        {buttons}
      </div>
    </div>
  );
});

export function getOverwriteButton(buttons: EntityFormButton[] | undefined, id: string) {
  return buttons !== undefined && buttons.find((button) => button.isOverwrite(id)) !== undefined;
}

/**
 * responsive screen 크기에 따라 버튼 사이즈와 위치를 조정하기 위해 별도의 functions 으로 분리한다.
 * row-reverse 를 사용하기 위해 단일 element 를 리턴하지 않고 reactnode[] 를 리턴할 수 있게 함수로 만들었다.
 * @param router
 * @param pathname
 * @param props
 */
export async function getEntityFormButtons(
  props: ViewEntityFormButtonsProps,
): Promise<ReactNode[]> {
  const {
    router,
    pathname,
    entityForm,
    setErrors,
    setNotifications,
    postSave,
    useCreateStep,
    showModal,
    closeModal,
    closeTopModal,
    getModalData,
    updateModalData,
  } = props;

  if (!entityForm) return [];

  const readonly = isTrue(props.readonly) || isTrue(entityForm?.readonly);

  const result: ReactNode[] = [];

  // entityForm의 buttons를 처리
  let entityFormButtons: EntityFormButton[] = [];
  let entityFormReactNodes: ReactNode[] = [];
  const processedButtonIds = new Set<string>(); // 중복 방지를 위한 ID 추적

  if (entityForm.buttons && entityForm.buttons.length > 0) {
    // entityForm.buttons는 함수 배열이므로 실행하여 버튼들을 가져옴
    const buttonsFromFunctions = await Promise.all(
      entityForm.buttons.map((buttonFunc) => buttonFunc(entityForm)),
    );

    // 결과를 flat하고 null/undefined 필터링
    const flatButtons = buttonsFromFunctions
      .flat()
      .filter((item) => item !== null && item !== undefined);

    flatButtons.forEach((item) => {
      if (item instanceof EntityFormButton) {
        // EntityFormButton 인스턴스
        const buttonId = item.getId();
        if (!processedButtonIds.has(buttonId)) {
          entityFormButtons.push(item);
          processedButtonIds.add(buttonId);
        }
      } else if (typeof item === 'object' && 'id' in item && 'button' in item) {
        // EntityFormReactNodeButton 타입
        const reactNodeButton = item as EntityFormReactNodeButton;
        if (!processedButtonIds.has(reactNodeButton.id)) {
          entityFormReactNodes.push(reactNodeButton.button);
          processedButtonIds.add(reactNodeButton.id);
        }
      }
    });
  }

  // props.buttons와 entityFormButtons를 합치되, ID 중복 제거
  let allButtons: EntityFormButton[] = [];
  const buttonIds = new Set<string>();

  // props.buttons 먼저 추가
  if (props.buttons) {
    props.buttons.forEach((button) => {
      const buttonId = button.getId();
      if (!buttonIds.has(buttonId)) {
        allButtons.push(button);
        buttonIds.add(buttonId);
      }
    });
  }

  // entityFormButtons 추가 (ID 중복 체크)
  entityFormButtons.forEach((button) => {
    const buttonId = button.getId();
    // 기존 버튼과 ID가 중복되는지 체크
    const isDuplicate =
      buttonIds.has(buttonId) ||
      // save, delete, list override 체크
      allButtons.some((b) => {
        return ['save', 'delete', 'list'].some((id) => button.isOverwrite(id) && b.isOverwrite(id));
      });

    if (!isDuplicate) {
      allButtons.push(button);
      buttonIds.add(buttonId);
    }
  });

  const buttons: EntityFormButton[] | undefined = allButtons.length > 0 ? allButtons : undefined;

  const excludeButtons: string[] = props.excludeButtons ?? [];

  const isCreatable = entityForm.isCreatable();
  const isUpdatable = entityForm.isUpdatable();
  const isDeletable = entityForm.isDeletable();

  if (!isCreatable || !isUpdatable || useCreateStep) {
    excludeButtons.push('save');
  }

  if (!isDeletable) {
    excludeButtons.push('delete');
  }

  // entityForm에 visible하고 readonly가 아닌 필드가 하나 이상 있는지 확인
  const hasEditableFields = async (): Promise<boolean> => {
    const fields = Array.from(entityForm.fields.values());
    for (const field of fields) {
      const isHidden = await field.isHidden({ entityForm, renderType: entityForm.getRenderType() });
      const isFieldReadonly = await field.isReadonly({
        entityForm,
        renderType: entityForm.getRenderType(),
      });

      if (!isHidden && !isFieldReadonly) {
        return true;
      }
    }
    return false;
  };

  const canShowSaveButton = await hasEditableFields();

  if (
    !readonly &&
    canShowSaveButton &&
    !excludeButtons.includes('save') &&
    !getOverwriteButton(buttons, 'save')
  ) {
    result.push(<SaveButton {...props} key={'button_save'} />);
  }

  // 새창(팝업) 모드에서는 목록 버튼 대신 닫기 버튼 표시
  if (props.popupMode) {
    result.push(<ClosePopupButton {...props} key={'button_close_popup'} />);
  } else if (!excludeButtons.includes('list') && !getOverwriteButton(buttons, 'list')) {
    result.push(<ListButton {...props} key={'button_list'} />);
  }

  if (
    !readonly &&
    !excludeButtons.includes('delete') &&
    !getOverwriteButton(buttons, 'delete') &&
    entityForm.getRenderType() === 'update'
  ) {
    result.push(<DeleteButton {...props} key={'button_delete'} />);
  }

  if (buttons && buttons.length > 0) {
    // 모든 버튼의 비동기 속성을 병렬로 처리
    const buttonElements = await Promise.all(
      buttons.map(async (button, index) => {
        // 버튼 클래스: button.className > props.buttonClassNames?.custom > 기본값
        const buttonClassName: string =
          button.className ?? props.buttonClassNames?.custom ?? `btn btn-primary gap-2`;

        const buttonProps: EntityFormButtonProps = {
          entityForm,
          router,
          pathname,
          setErrors,
          setNotifications,
          ...(useCreateStep && {
            step: {
              useCreateStep: true,
              currentStep: props.currentStep ?? 0,
              maxStep: props.maxStep ?? 0,
              createStepFields: props.createStepFields ?? [],
            },
          }),
          ...(showModal !== undefined ? { showModal } : {}),
          ...(closeModal !== undefined ? { closeModal } : {}),
          ...(closeTopModal !== undefined ? { closeTopModal } : {}),
          ...(getModalData !== undefined ? { getModalData } : {}),
          ...(updateModalData !== undefined ? { updateModalData } : {}),
        };

        const hidden = button.hidden ? await button.hidden(buttonProps) : false;

        // hidden 이 true 일 때는 버튼을 렌더링하지 않는다.
        if (hidden) {
          return null;
        }

        const disabled = button.disabled ? await button.disabled(buttonProps) : false;

        const tooltip = button.tooltip ? await button.tooltip(buttonProps) : null;

        const buttonElement = (
          <button
            type="button"
            className={`${buttonClassName}`}
            key={`custom_button_${index}`}
            disabled={disabled}
            hidden={hidden}
            onClick={async (e) => {
              e.stopPropagation();
              if (button.onClick !== undefined) {
                const form = await button.onClick(buttonProps);

                if (form.errors && form.errors.length > 0) {
                  // 에러가 있으면 에러 메시지를 표시한다.
                  const errorMessages = form.errors.flatMap((error) => error.errors);
                  setErrors(errorMessages);
                  return;
                } else {
                  if (button.isOverwrite('save')) {
                    await postSave?.(form);
                  }
                }
              }
            }}
          >
            {button.icon}
            {button.label}
          </button>
        );

        if (tooltip) {
          return (
            <Tooltip label={tooltip} key={`custom_button_${index}`} usePortal={true}>
              {buttonElement}
            </Tooltip>
          );
        }

        return buttonElement;
      }),
    );

    result.push(...buttonElements.filter(Boolean));
  }

  // entityForm에서 가져온 ReactNode들도 추가
  if (entityFormReactNodes.length > 0) {
    entityFormReactNodes.forEach((node, index) => {
      // React.cloneElement를 사용하여 key prop 추가
      if (React.isValidElement(node)) {
        result.push(React.cloneElement(node, { key: `entity_form_button_${index}` }));
      } else {
        // string이나 number인 경우 span으로 감싸서 key 추가
        result.push(<span key={`entity_form_button_${index}`}>{node}</span>);
      }
    });
  }

  return result;
}
