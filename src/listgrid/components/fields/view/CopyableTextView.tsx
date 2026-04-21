'use client';

import React from 'react';
import { IconCopy } from '@tabler/icons-react';
import { Tooltip } from '../../../ui';
import { showToast } from '../../../message';

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
        color: 'success',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast({
        message: '복사에 실패했습니다.',
        color: 'danger',
      });
    }
  };

  return (
    <div className={className ?? 'rcm-copy-addon-wrap'}>
      <Tooltip label="복사">
        <button type="button" className="rcm-icon-btn" data-size="sm" onClick={handleCopy}>
          <IconCopy className="rcm-icon" data-size="sm" />
        </button>
      </Tooltip>
    </div>
  );
};

interface CopyableTextViewProps {
  value: string;
  displayValue?: string;
}

export const CopyableTextView = ({ value, displayValue }: CopyableTextViewProps) => {
  return (
    <div className="rcm-copy-text-wrap">
      <span>{displayValue ?? value}</span>
      <Tooltip label="복사">
        <button
          className="rcm-icon-btn"
          data-size="xs"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await navigator.clipboard.writeText(value);
              showToast({
                message: '복사되었습니다.',
                color: 'success',
              });
            } catch (error) {
              console.error('Failed to copy:', error);
              showToast({
                message: '복사에 실패했습니다.',
                color: 'danger',
              });
            }
          }}
        >
          <IconCopy className="rcm-icon" data-size="xs" />
        </button>
      </Tooltip>
    </div>
  );
};
