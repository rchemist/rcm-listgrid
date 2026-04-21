import { Tooltip } from '../../../ui';
import { getTranslation } from '../../../utils/i18n';
import { isTrue } from '../../../utils/BooleanUtil';
import { useListGridTheme } from '../context/ListGridThemeContext';

export const HeaderTitle: React.FC<{ title: string; hideTitle?: boolean }> = ({
  title,
  hideTitle,
}) => {
  const { t } = getTranslation();
  const { classNames: themeClasses, cn } = useListGridTheme();
  const titleText = t(title);
  if (isTrue(hideTitle)) return null;

  return (
    <div
      className={cn(
        'min-w-[200px] max-w-full flex-1 overflow-hidden',
        themeClasses.header?.titleContainer,
      )}
    >
      <Tooltip label={titleText} zIndex={1000} usePortal={true} position="top-start">
        <div
          className={cn(
            'flex items-center mt-2 min-h-[60px] truncate py-3 pt-2 text-[1.8rem] font-bold dark:text-white-light md:mt-0 overflow-ellipsis',
            themeClasses.header?.titleWrapper,
          )}
        >
          {titleText}
        </div>
      </Tooltip>
    </div>
  );
};
