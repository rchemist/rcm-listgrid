import React from 'react';
import { IconExternalLink, IconX } from '@tabler/icons-react';
import { AlertItemProps } from '../types/ViewEntityFormAlerts.types';
import { getAlertStyles } from '../hooks/useAlertManager';

/**
 * AlertItem 컴포넌트
 * 개별 알림 아이템을 렌더링합니다.
 */
export const AlertItem = React.memo(function AlertItem({
  alert,
  onLinkClick,
  onClose,
  t,
}: AlertItemProps): React.ReactNode {
  const styles = getAlertStyles(alert.color);
  const IconComponent = styles.icon;
  const hasLink = !!alert.link;
  const isClickable = hasLink && alert.link?.type !== 'external';

  return (
    <div
      className={`${styles.className} rcm-alert-item ${isClickable ? 'rcm-cursor-pointer' : ''}`}
      data-tone={styles.dataTone}
      onClick={
        hasLink && alert.link?.type !== 'external' ? () => onLinkClick(alert.link!) : undefined
      }
    >
      <div className="rcm-alert-item-content">
        <IconComponent className="rcm-icon" data-size="md" />
        <div className="rcm-alert-item-body">
          <div className="rcm-alert-item-message">
            <span className="rcm-text" data-weight="medium">
              {typeof alert.message === 'string' ? t(alert.message) : alert.message}
            </span>
            {alert.link && alert.link.type === 'external' && (
              <a
                href={alert.link.value as string}
                target={alert.link.target || '_blank'}
                rel="noopener noreferrer"
                className="rcm-button"
                data-variant="link"
                data-size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <IconExternalLink className="rcm-icon" data-size="xs" />
              </a>
            )}
          </div>
          {alert.description && (
            <span className="rcm-text" data-size="sm">
              {alert.description}
            </span>
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
