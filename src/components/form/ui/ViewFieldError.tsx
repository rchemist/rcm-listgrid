/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React, {ReactNode} from "react";
import {getTranslation} from "@gjcu/ui/utils/i18n";

interface ViewErrorProps {
  errors?: string[];
}

export const ViewFieldError = (props: ViewErrorProps) => {

  const {t} = getTranslation();

  if (!props.errors || props.errors.length === 0)
    return null;

  const errors: ReactNode[] = [];
  props.errors?.forEach((error, index) => {
    errors.push(<div key={index} className="text-danger text-[11px] mt-1">{t(error ?? '')}</div>);
  })
  return <>
    {errors}</>;

}
