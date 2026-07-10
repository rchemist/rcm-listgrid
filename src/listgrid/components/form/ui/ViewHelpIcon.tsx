import { TooltipCard } from '../../../ui';
import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';
import { isBlank } from '../../../utils/StringUtil';
import { getTranslation } from '../../../utils/i18n';
import { sanitizeHtmlOrWarn } from '../../../config/htmlSanitizer';

interface ViewHelpIconProps {
  helpText?: string;
}

export const ViewHelpIcon = (props: ViewHelpIconProps) => {
  const helpText = props.helpText;

  if (isBlank(helpText)) return null;

  const { t } = getTranslation();

  const value = t(helpText ?? '');
  const sanitized = sanitizeHtmlOrWarn(value);

  return (
    <TooltipCard width={280} shadow="md">
      <TooltipCard.Target>
        <div className="rcm-text-muted">
          <IconInfoCircle width={18} color={'#808080'} />
        </div>
      </TooltipCard.Target>
      <TooltipCard.Dropdown>
        {sanitized === null ? (
          <div className="rcm-field-help">{value}</div>
        ) : (
          <div className="rcm-field-help" dangerouslySetInnerHTML={{ __html: sanitized }}></div>
        )}
      </TooltipCard.Dropdown>
    </TooltipCard>
  );
};
