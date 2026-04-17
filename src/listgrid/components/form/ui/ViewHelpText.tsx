/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {isBlank} from '../../../utils/StringUtil';
import {getTranslation} from "../../../utils/i18n";
import {useEntityFormTheme} from "../context/EntityFormThemeContext";

interface ViewHelpTextProps {
  helpText?: React.ReactNode;
}

export const ViewHelpText = (props: ViewHelpTextProps) => {

  const {t} = getTranslation();
  const { classNames, cn } = useEntityFormTheme();

  const helpText = typeof props.helpText === "string" ? t(props.helpText) : props.helpText;

  return isBlank(props.helpText) ? null : <div className={cn("text-white-dark text-[11px] inline-block mt-1", classNames.helpText?.text)}>{helpText}</div>
}
