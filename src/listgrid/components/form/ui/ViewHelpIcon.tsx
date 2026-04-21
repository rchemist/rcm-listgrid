import { TooltipCard } from '../../../ui';
import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';
import { isBlank } from '../../../utils/StringUtil';
import { getTranslation } from '../../../utils/i18n';

interface ViewHelpIconProps {
  helpText?: string;
}

export const ViewHelpIcon = (props: ViewHelpIconProps) => {
  const helpText = props.helpText;

  if (isBlank(helpText)) return null;

  const { t } = getTranslation();

  const value = t(helpText ?? '');

  return (
    <TooltipCard width={280} shadow="md">
      <TooltipCard.Target>
        <div className="rcm-text-muted">
          <IconInfoCircle width={18} color={'#808080'} />
        </div>
      </TooltipCard.Target>
      <TooltipCard.Dropdown>
        <div className="rcm-field-help" dangerouslySetInnerHTML={{ __html: value }}></div>
      </TooltipCard.Dropdown>
    </TooltipCard>
  );
};
