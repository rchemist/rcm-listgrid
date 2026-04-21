import React, { ReactNode } from 'react';
import { Tooltip } from '../../../ui';
import { getTranslation } from '../../../utils/i18n';
import { useEntityFormTheme } from '../context/EntityFormThemeContext';

/**
 * ViewEntityFormTitle 컴포넌트
 * - EntityForm의 제목 영역만 렌더링합니다.
 * - 20자 이상이면 Tooltip으로 감싸서 표시합니다.
 *
 * @param props.title - 제목(ReactNode)
 * @param props.hideTitle - 제목 숨김 여부
 */
interface ViewEntityFormTitleProps {
  title: ReactNode;
  hideTitle?: boolean;
}

export const ViewEntityFormTitle = React.memo(function ViewEntityFormTitle({
  title,
  hideTitle,
}: ViewEntityFormTitleProps): React.ReactNode {
  const { t } = getTranslation();
  const { classNames, cn } = useEntityFormTheme();

  if (hideTitle) return null;

  if (typeof title === 'string') {
    const titleText = t(title);
    const titleView = (
      <div
        className={cn(
          'flex items-center mt-2 min-h-[60px] truncate py-3 pt-2 md:mt-0',
          classNames.title?.container,
        )}
      >
        <span
          className={cn('text-[1.8rem] font-bold dark:text-white-light', classNames.title?.text)}
        >
          {titleText}
        </span>
      </div>
    );
    if (titleText.length > 20) {
      return (
        <Tooltip label={titleText} usePortal={true} position="top-start">
          {titleView}
        </Tooltip>
      );
    }
    return titleView;
  }
  // ReactNode가 string이 아니면 JSX.Element로 강제 변환
  return <>{title}</>;
});
