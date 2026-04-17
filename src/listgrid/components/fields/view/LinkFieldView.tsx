/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */
'use client'

import {InputRendererProps} from '../../../config/Config';
import React, {useEffect, useState} from "react";
import {readonlyClass} from "../../../ui";
import {Tooltip, TooltipColor} from "../../../ui";
import {IconExternalLink} from "@tabler/icons-react";
import {isBlank} from '../../../utils/StringUtil';
import {normalizeUrl} from "../../../misc";

interface LinkFieldProps extends InputRendererProps {
  min?: string;
  max?: string;
  tooltip?: { label: React.ReactNode, color?: TooltipColor }
  className?: string;
}

export const LinkFieldView = (props: LinkFieldProps) => {
  const [value, setValue] = useState(props.value ?? '');

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const input = <input type={'text'} 
    className={readonlyClass(props.readonly, `form-input ${!isBlank(value) ? ' rounded-r-none border-r-0' : ''} ${props.className}`)} 
    id={`${props.name}`}
    value={value ?? ''}
    placeholder={props.placeHolder}
    disabled={props.readonly}
    min={props.min}
    max={props.max}
    onChange={(e) => {
      const value = e.target.value ?? '';
      setValidatedValue(props, value, setValue);
    }} 
    />;

  if (props.tooltip !== undefined) {
    return <Tooltip label={props.tooltip.label} color={props.tooltip.color}>
      <div className="flex w-full">
        <div className="flex w-full items-center">
          <div className="group relative flex w-full">
            <div className={"dropdown flex w-full"}>
              {input}
            </div>
          </div>
          {!isBlank(value) && (
            <button
              type="button"
              className="flex h-full min-w-[40px] cursor-pointer items-center justify-center space-x-1 whitespace-nowrap border border-secondary bg-secondary px-2 font-semibold text-white hover:bg-secondary/85 disabled:opacity-20 dark:border-[#17263c] rounded-r-md border-l-0"
              onClick={() => {
                window.open(normalizeUrl(value), "_blank");
              }}
            >
              <IconExternalLink className={"h-4 w-4"} />
            </button>
          )}
        </div>
      </div>
    </Tooltip>;
  }

  return (
    <div className="flex w-full">
      <div className="flex w-full items-center">
        <div className="group relative flex w-full">
          <div className={"dropdown flex w-full"}>
            {input}
          </div>
        </div>
        {!isBlank(value) && (
          <button
            type="button"
            className="flex h-full min-w-[40px] cursor-pointer items-center justify-center space-x-1 whitespace-nowrap border border-secondary bg-secondary px-2 font-semibold text-white hover:bg-secondary/85 disabled:opacity-20 dark:border-[#17263c] rounded-r-md border-l-0"
            onClick={() => {
              window.open(normalizeUrl(value), "_blank");
            }}
          >
            <IconExternalLink className={"h-4 w-4"} />
          </button>
        )}
      </div>
    </div>
  );
}

function setValidatedValue(props: LinkFieldProps, value: string, setValue: React.Dispatch<any>) {
  let acceptable = true;
  let errorMessage: string = 'form.save.error.invalid';
  if (props.regex !== undefined) {
    acceptable = props.regex.pattern.test(value);
    errorMessage = props.regex.message;
  }
  setValue(value);
  props.onChange(value, false);
  if (!acceptable) {
    setTimeout(() => {
      props.onError?.(errorMessage);
    }, 50);
  }
}

