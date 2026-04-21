import { Tooltip } from '../../../../ui';
import { EntityFormActionResult } from '../../../../config/Config';
import { showConfirm, showSuccess } from '../../../../message';
import { isEmpty, isTrue } from '../../../../utils';
import { EntityError, parse, removeTrailingSeparator } from '../../../../misc';
import { ButtonProps } from '../../types/ViewEntityFormButtons.types';
import { cn } from '../../../../utils/cn';

export const DeleteButton = ({
  entityForm,
  router,
  pathname,
  buttonLinks,
  setErrors,
  openBaseLoading,
  postDelete,
  buttonClassNames,
  ...props
}: ButtonProps) => {
  const neverDelete = isTrue(entityForm.neverDelete);

  if (neverDelete) {
    const active = entityForm.getField('active')?.value?.current ?? true;

    if (!active) {
      return (
        <Tooltip
          color="red"
          label={`사용 중지 되었습니다. 상태정보 > 사용 여부를 변경해 다시 사용할 수 있습니다.`}
        >
          <button
            type="button"
            disabled
            className={cn('rcm-button', buttonClassNames?.delete)}
            data-variant="primary"
            data-color="error"
            key={'button_delete'}
          >
            사용 안 함
          </button>
        </Tooltip>
      );
    }
  }

  const message = neverDelete ? '사용 중지' : '삭제';
  const text = neverDelete
    ? '이 데이터는 삭제할 수 없으며, 사용 중지 처리만 가능합니다.'
    : '삭제된 데이터는 복구할 수 없습니다.';

  const confirmButtonText = neverDelete ? '사용 중지' : '삭제';

  return (
    <button
      type="button"
      className={cn('rcm-button', buttonClassNames?.delete)}
      data-variant="primary"
      data-color="error"
      key={'button_delete'}
      onClick={() => {
        (async () => {
          showConfirm({
            title: text,
            message: message + '하시겠습니까?',
            confirmButtonText: confirmButtonText,
            cancelButtonText: '돌아가기',
            onConfirm: async () => {
              openBaseLoading?.(true);

              const deleteResult = await entityForm.delete();

              const onThen: (result: EntityFormActionResult) => void =
                buttonLinks?.onDelete?.success ??
                ((result: EntityFormActionResult) => {
                  (async () => {
                    await postDelete?.(entityForm);
                  })();

                  // 새창(팝업) 모드일 때는 원본 창에 메시지 전송 후 창 닫기
                  if (isTrue(props.popupMode)) {
                    try {
                      if (window.opener) {
                        window.opener.postMessage(
                          {
                            type: 'ENTITY_DELETED',
                            entityId: entityForm.id,
                          },
                          '*',
                        );
                      }
                    } catch (e) {
                      console.error('Failed to send message to opener:', e);
                    }
                    window.close();
                    return;
                  }

                  // sub collection 인 경우에는 refresh 가 아니라 지워졌음을 상위로 전파해야 한다.
                  if (!isTrue(props.subCollection)) {
                    const listUrl =
                      result.redirectUrl ?? (removeTrailingSeparator(pathname, '/') || '/');
                    if (router !== undefined) {
                      router.push(listUrl);
                    }
                  }
                });

              if (isTrue(deleteResult.refreshOrList)) {
                // 정상 완료되어 리프레시가 필요한 경우
                showSuccess({
                  message: message + '가 완료 되었습니다',
                });
                setTimeout(() => {
                  onThen(deleteResult);
                }, 1500);
              } else {
                if (deleteResult.errors && !isEmpty(deleteResult.errors)) {
                  // 삭제 실패 시 에러 메시지가 아래와 같이 올 수도 있다.
                  // {"error":{"error":true,"status":400,"errorType":"CANNOT_DELETE_IS_USED_SEMESTER","message":"학기 정보에 사용중인 등록금 정보를 삭제할 수 없습니다","fieldError":{}}}
                  // EntityError 형태로 온다는 뜻이다. 문자열을 json 으로 파싱하되, 문자열이 아니라면 그대로 둔다.

                  const error = deleteResult.errors[0];
                  if (typeof error === 'string') {
                    try {
                      const json = parse<{ error?: unknown }>(error);
                      if (json.error) {
                        const entityError = EntityError.create(json);
                        setErrors(
                          entityError.error.message
                            ? [entityError.error.message]
                            : ['삭제 중 오류가 발생했습니다.'],
                        );
                      }
                    } catch (e) {
                      setErrors(deleteResult.errors);
                    }
                  } else {
                    setErrors(deleteResult.errors);
                  }

                  openBaseLoading?.(false);
                }
              }
            },
            onCancel: () => {
              // 취소 시 아무 동작 없음
            },
          });
        })();
      }}
    >
      {message}
    </button>
  );
};
