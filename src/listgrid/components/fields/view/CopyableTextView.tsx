/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

'use client';

import React from 'react';
import {IconCopy} from '@tabler/icons-react';
import {Tooltip} from '../../../ui';
import {showToast} from '../../../message';

interface CopyButtonProps {
  value: string;
  className?: string;
}

export const CopyButton = ({ value, className }: CopyButtonProps) => {
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      showToast({
        message: '복사되었습니다.',
        color: 'success'
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast({
        message: '복사에 실패했습니다.',
        color: 'danger'
      });
    }
  };

  return (
    <div className={className ?? "rcm-copy-addon-wrap"}>
      <Tooltip label="복사">
        <button
          type="button"
          className="rcm-copy-addon-btn"
          onClick={handleCopy}
        >
          <IconCopy className="rcm-m2o-action-icon" />
        </button>
      </Tooltip>
    </div>
  );
};

interface CopyableTextViewProps {
  value: string;
  displayValue?: string;
}

export const CopyableTextView = ({
  value,
  displayValue,
}: CopyableTextViewProps) => {
  return (
    <div className="rcm-copy-text-wrap">
      <span>{displayValue ?? value}</span>
      <Tooltip label="복사">
        <button
          className="rcm-copy-text-btn"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await navigator.clipboard.writeText(value);
              showToast({
                message: '복사되었습니다.',
                color: 'success'
              });
            } catch (error) {
              console.error('Failed to copy:', error);
              showToast({
                message: '복사에 실패했습니다.',
                color: 'danger'
              });
            }
          }}
        >
          <IconCopy className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
    </div>
  );
};
