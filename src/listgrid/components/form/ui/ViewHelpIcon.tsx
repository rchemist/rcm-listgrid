/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {TooltipCard} from "../../../ui";
import {IconInfoCircle} from "@tabler/icons-react";
import React from "react";
import {isBlank} from '../../../utils/StringUtil';
import {getTranslation} from "../../../utils/i18n";

interface ViewHelpIconProps {
  helpText?: string;
}

export const ViewHelpIcon = (props: ViewHelpIconProps) => {

  const helpText = props.helpText;

  if (isBlank(helpText))
    return null;

  const {t} = getTranslation();

  const value = t(helpText ?? '');

  return <TooltipCard width={280} shadow="md">
    <TooltipCard.Target>
      <div className="text-white-dark">
        <IconInfoCircle width={18} color={'#808080'}/>
      </div>
    </TooltipCard.Target>
    <TooltipCard.Dropdown>
      <div className="text-white-dark text-[11px] inline-block mt-1"
           dangerouslySetInnerHTML={{__html: value}}
      ></div>
    </TooltipCard.Dropdown>
  </TooltipCard>

}
