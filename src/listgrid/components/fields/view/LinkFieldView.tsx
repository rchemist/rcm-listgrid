'use client';

import { InputRendererProps } from '../../../config/Config';
import React, { useEffect, useState } from 'react';
import { readonlyClass } from '../../../ui';
import { Tooltip, TooltipColor } from '../../../ui';
import { IconExternalLink } from '@tabler/icons-react';
import { isBlank } from '../../../utils/StringUtil';
import { normalizeUrl } from '../../../misc';

interface LinkFieldProps extends InputRendererProps {
  min?: string;
  max?: string;
  tooltip?: { label: React.ReactNode; color?: TooltipColor };
  className?: string;
}

export const LinkFieldView = (props: LinkFieldProps) => {
  const [value, setValue] = useState(props.value ?? '');

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const input = (
    <input
      type={'text'}
      className={readonlyClass(
        props.readonly,
        `rcm-input${!isBlank(value) ? ' rcm-link-input-grouped' : ''}${props.className ? ' ' + props.className : ''}`,
      )}
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
    />
  );

  if (props.tooltip !== undefined) {
    return (
      <Tooltip label={props.tooltip.label} color={props.tooltip.color}>
        <div className="rcm-input-group-full">
          <div className="rcm-input-group-full-center">
            <div className="rcm-input-group-full-relative">
              <div className="rcm-input-group-full">{input}</div>
            </div>
            {!isBlank(value) && (
              <button
                type="button"
                className="rcm-link-button rcm-input-addon-btn"
                onClick={() => {
                  window.open(normalizeUrl(value), '_blank');
                }}
              >
                <IconExternalLink className="rcm-m2o-action-icon" />
              </button>
            )}
          </div>
        </div>
      </Tooltip>
    );
  }

  return (
    <div className="rcm-input-group-full">
      <div className="rcm-input-group-full-center">
        <div className="rcm-input-group-full-relative">
          <div className="rcm-m2o-input-wrap">{input}</div>
        </div>
        {!isBlank(value) && (
          <button
            type="button"
            className="rcm-link-button rcm-input-addon-btn"
            onClick={() => {
              window.open(normalizeUrl(value), '_blank');
            }}
          >
            <IconExternalLink className="rcm-m2o-action-icon" />
          </button>
        )}
      </div>
    </div>
  );
};

function setValidatedValue(
  props: LinkFieldProps,
  value: string,
  setValue: React.Dispatch<React.SetStateAction<string>>,
) {
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
