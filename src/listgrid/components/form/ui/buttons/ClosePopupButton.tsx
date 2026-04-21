import { showConfirm } from '../../../../message';
import { isTrue } from '../../../../utils/BooleanUtil';
import { ButtonProps } from '../../types/ViewEntityFormButtons.types';
import { cn } from '../../../../utils/cn';

/**
 * 새창(팝업) 모드 전용 닫기 버튼
 *
 * - 저장되지 않은 변경사항이 있으면 확인 다이얼로그 표시
 * - 확인 시 window.close() 호출
 */
export const ClosePopupButton = ({ entityForm, readonly, buttonClassNames }: ButtonProps) => {
  return (
    <button
      className={cn('rcm-button', buttonClassNames?.close)}
      data-variant="outline"
      key="button_close_popup"
      onClick={(e) => {
        (async () => {
          e.stopPropagation();
          const dirty = isTrue(readonly) ? false : entityForm.isDirty();

          if (dirty) {
            showConfirm({
              title: '창을 닫으시겠습니까?',
              message: '저장되지 않은 변경사항이 있습니다.',
              confirmButtonText: '닫기',
              cancelButtonText: '취소',
              onConfirm: async () => {
                window.close();
              },
            });
          } else {
            window.close();
          }
        })();
      }}
    >
      닫기
    </button>
  );
};
