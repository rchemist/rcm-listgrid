import { showConfirm } from '../../../../message';
import { removeTrailingSeparator } from '../../../../utils/StringUtil';
import { ButtonProps } from '../../types/ViewEntityFormButtons.types';
import { isTrue } from '../../../../utils/BooleanUtil';
import { cn } from '../../../../utils/cn';

export const ListButton = ({
  entityForm,
  router,
  pathname,
  buttonLinks,
  subCollection,
  openBaseLoading,
  readonly,
  buttonClassNames,
}: ButtonProps) => {
  const listUrl = removeTrailingSeparator(pathname, '/') || '/';

  const navigateToList = () => {
    openBaseLoading?.(true);

    // Check if user came from the list page (to preserve URL state like page, filters)
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    // Use router.back() if we came from the list page (preserves URL query params)
    // Otherwise use router.push() for direct access (bookmarks, external links, etc.)
    if (
      router.back &&
      referrer &&
      referrer.startsWith(currentOrigin) &&
      referrer.includes(listUrl)
    ) {
      router.back();
    } else {
      router.push(listUrl);
    }
  };

  return (
    <button
      className={cn('rcm-button', buttonClassNames?.list)}
      data-variant="outline"
      key={'button_list'}
      onClick={(e) => {
        (async () => {
          e.stopPropagation();
          const dirty = isTrue(readonly) ? false : entityForm.isDirty();

          if (dirty) {
            showConfirm({
              title: subCollection ? '이 창을 닫으시겠습니까?' : '목록으로 돌아가시겠습니까?',
              message: '수정 중인 정보가 있습니다.',
              confirmButtonText: subCollection ? '닫기' : '목록으로',
              cancelButtonText: '취소',
              onConfirm: async () => {
                if (buttonLinks?.onClickList) {
                  await buttonLinks.onClickList();
                } else {
                  navigateToList();
                }
              },
            });
          } else {
            if (buttonLinks?.onClickList) {
              buttonLinks.onClickList().then();
            } else {
              navigateToList();
            }
          }
        })();
      }}
    >
      {subCollection ? '닫기' : '목록'}
    </button>
  );
};
