/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React from 'react';
import {IconExternalLink, IconX} from '@tabler/icons-react';
import {AlertItemProps} from '../types/ViewEntityFormAlerts.types';
import {getAlertStyles} from '../hooks/useAlertManager';

/**
 * AlertItem 컴포넌트
 * 개별 알림 아이템을 렌더링합니다.
 */
export const AlertItem = React.memo(function AlertItem({
  alert,
  onLinkClick,
  onClose,
  t
}: AlertItemProps): React.ReactNode {
  const styles = getAlertStyles(alert.color);
  const IconComponent = styles.icon;
  const hasLink = !!alert.link;
  const isClickable = hasLink && alert.link?.type !== 'external';

  return (
    <div
      className={`${styles.bg} ${isClickable ? `hover:${styles.hoverBg} cursor-pointer transition-colors` : ''} ${styles.text} p-4 rounded-lg border border-current/20 flex items-start justify-between gap-3`}
      onClick={hasLink && alert.link?.type !== 'external' ? () => onLinkClick(alert.link!) : undefined}
    >
      <div className="flex items-start gap-3 flex-1">
        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium">
            {typeof alert.message === 'string' ? t(alert.message) : alert.message}
            {alert.link && alert.link.type === 'external' && (
              <a
                href={alert.link.value as string}
                target={alert.link.target || '_blank'}
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <IconExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          {alert.description && (
            <div className="mt-1 text-sm">
              {alert.description}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(alert.key);
        }}
        className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        aria-label="메시지 닫기"
      >
        <IconX className="h-4 w-4" />
      </button>
    </div>
  );
});