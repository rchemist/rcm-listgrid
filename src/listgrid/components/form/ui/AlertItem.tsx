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
      className={`${styles.bg} rcm-alert-item ${isClickable ? 'rcm-cursor-pointer' : ''}`}
      onClick={hasLink && alert.link?.type !== 'external' ? () => onLinkClick(alert.link!) : undefined}
    >
      <div className="rcm-alert-item-content">
        <IconComponent className="rcm-alert-item-icon" />
        <div className="rcm-alert-item-body">
          <div className="rcm-alert-item-message">
            {typeof alert.message === 'string' ? t(alert.message) : alert.message}
            {alert.link && alert.link.type === 'external' && (
              <a
                href={alert.link.value as string}
                target={alert.link.target || '_blank'}
                rel="noopener noreferrer"
                className="rcm-alert-item-external"
                onClick={(e) => e.stopPropagation()}
              >
                <IconExternalLink className="rcm-alert-item-external-icon" />
              </a>
            )}
          </div>
          {alert.description && (
            <div className="rcm-alert-item-description">
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
        className="rcm-icon-btn"
        data-size="sm"
        aria-label="메시지 닫기"
      >
        <IconX className="rcm-icon" data-size="sm" />
      </button>
    </div>
  );
});