import React from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { getTranslation } from '../../../utils/i18n';
import { ViewEntityFormAlertsProps } from '../types/ViewEntityFormAlerts.types';
import { getIndicatorTone, useAlertManager } from '../hooks/useAlertManager';
import { AlertItem } from './AlertItem';

export const ViewEntityFormAlerts = React.memo(function ViewEntityFormAlerts({
  alertMessages,
  onRemove,
  onTabChange,
  onFieldFocus,
}: ViewEntityFormAlertsProps): React.ReactNode {
  const { t } = getTranslation();
  const {
    visibleAlerts,
    isCollapsed,
    handleLinkClick,
    handleCloseAlert,
    toggleCollapse,
    getDominantColor,
  } = useAlertManager(alertMessages, onRemove, onTabChange, onFieldFocus);

  // 조건부 return은 모든 hooks 호출 이후에
  if (!alertMessages || alertMessages.length === 0 || visibleAlerts.length === 0) {
    return null;
  }

  const dominantColor = getDominantColor();

  // 알림이 1개일 때는 헤더 없이 직접 렌더링
  if (visibleAlerts.length === 1) {
    return (
      <div className="rcm-alerts-single">
        <AlertItem
          key={'alert-' + visibleAlerts[0]!.key}
          alert={visibleAlerts[0]!}
          onLinkClick={handleLinkClick}
          onClose={handleCloseAlert}
          t={t}
        />
      </div>
    );
  }

  // 알림이 2개 이상일 때만 헤더와 함께 렌더링
  return (
    <div className={isCollapsed ? '' : 'rcm-alerts-multi'}>
      {/* 심플한 헤더 */}
      <div
        className={`rcm-alerts-header ${isCollapsed ? 'rcm-alerts-header-collapsed' : 'rcm-alerts-header-expanded'}`}
        onClick={toggleCollapse}
      >
        <div className="rcm-alerts-header-left">
          {/* 색상 인디케이터 점 — rcm-icon-frame (circle/xs) primitive + data-tone */}
          <span
            className="rcm-icon-frame rcm-alerts-indicator"
            data-shape="circle"
            data-size="xs"
            data-tone={getIndicatorTone(dominantColor)}
            aria-hidden="true"
          />
          <span className="rcm-text" data-weight="medium">
            알림 ({visibleAlerts.length})
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
          className="rcm-icon-btn"
          data-size="sm"
          aria-label={isCollapsed ? '알림 펼치기' : '알림 접기'}
        >
          {isCollapsed ? (
            <IconChevronDown className="rcm-icon" data-size="sm" />
          ) : (
            <IconChevronUp className="rcm-icon" data-size="sm" />
          )}
        </button>
      </div>

      {/* 알림 목록 - 접힌 상태에서는 숨김 */}
      <div
        className={`rcm-alerts-body ${isCollapsed ? 'rcm-alerts-body-collapsed' : 'rcm-alerts-body-expanded'}`}
      >
        <div className="rcm-alerts-list">
          {visibleAlerts.map((alert) => (
            <AlertItem
              key={'alert-' + alert.key}
              alert={alert}
              onLinkClick={handleLinkClick}
              onClose={handleCloseAlert}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
