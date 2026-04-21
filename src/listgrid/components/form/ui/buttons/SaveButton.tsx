import { useState } from 'react';
import { isEmpty } from '../../../../utils';
import { ButtonProps } from '../../types/ViewEntityFormButtons.types';
import { openToast } from '../../../../message';
import { useEntityFormTheme } from '../../context/EntityFormThemeContext';

export const SaveButton = ({
  entityForm,
  postSave,
  router,
  pathname,
  setEntityForm,
  buttonLinks,
  openBaseLoading,
  session,
  buttonClassNames,
  ...props
}: ButtonProps) => {
  const { classNames, cn, buttonLabels } = useEntityFormTheme();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <button
      type="button"
      disabled={isSaving}
      className={cn('rcm-button', buttonClassNames?.save ?? classNames.buttons?.save)}
      data-variant="primary"
      key={'button_save'}
      onClick={(e) => {
        e.stopPropagation();
        if (isSaving) return;

        (async () => {
          setIsSaving(true);
          openBaseLoading?.(true);
          // 에러와 notifications 를 초기화하고 시작
          props.setErrors([]);
          props.setNotifications([]);

          try {
            const saveResult = await entityForm.save(session);

            setEntityForm?.(saveResult.entityForm);

            if (isEmpty(saveResult.errors)) {
              try {
                await postSave?.(saveResult.entityForm);
              } catch (e) {
                console.error(e);
              }
            } else {
              const error = saveResult.errors?.[0] ?? '저장 중 오류가 발생 했습니다.';
              props.setErrors([error]);
              openToast({
                message: `${error}`,
                color: 'danger',
                showCloseButton: false,
              });
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : '저장 중 오류가 발생 했습니다.';
            props.setErrors([message]);
            openToast({
              message,
              color: 'danger',
              showCloseButton: false,
            });
          } finally {
            setIsSaving(false);
            openBaseLoading?.(false);
          }
        })();
      }}
    >
      {buttonLabels?.save ?? '저장'}
    </button>
  );
};
