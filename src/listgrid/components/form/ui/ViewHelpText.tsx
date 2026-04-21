import { isBlank } from '../../../utils/StringUtil';
import { getTranslation } from '../../../utils/i18n';
import { useEntityFormTheme } from '../context/EntityFormThemeContext';

interface ViewHelpTextProps {
  helpText?: React.ReactNode;
}

export const ViewHelpText = (props: ViewHelpTextProps) => {
  const { t } = getTranslation();
  const { classNames, cn } = useEntityFormTheme();

  const helpText = typeof props.helpText === 'string' ? t(props.helpText) : props.helpText;

  return isBlank(props.helpText) ? null : (
    <div className={cn('rcm-field-help', classNames.helpText?.text)}>{helpText}</div>
  );
};
