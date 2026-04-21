'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertMessage, AlertMessageLink } from '../../../config/EntityFormTypes';
import { ModalOptions, useModalManagerStore } from '../../../store';
import { IconAlertTriangle, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { AlertStyles } from '../types/ViewEntityFormAlerts.types';

export const useAlertManager = (
  alertMessages: AlertMessage[],
  onRemove?: (key: string) => void,
  onTabChange?: (tabId: string) => void,
  onFieldFocus?: (fieldName: string) => void,
) => {
  const { openModal } = useModalManagerStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [closedAlerts, setClosedAlerts] = useState<Set<string>>(new Set());

  // alertMessages가 변경되면 닫힌 알림 초기화
  useEffect(() => {
    setClosedAlerts(new Set());
  }, [alertMessages.length]);

  // 닫히지 않은 알림들
  const visibleAlerts = alertMessages.filter((alert) => !closedAlerts.has(alert.key));

  const handleLinkClick = useCallback(
    (link: AlertMessageLink) => {
      const linkType = link.type || 'tab';

      switch (linkType) {
        case 'tab':
          if (typeof link.value === 'string' && onTabChange) {
            onTabChange(link.value);
          }
          break;

        case 'field':
          if (typeof link.value === 'string' && onFieldFocus) {
            onFieldFocus(link.value);
          }
          break;

        case 'external':
          if (typeof link.value === 'string') {
            window.open(link.value, link.target || '_blank');
          }
          break;

        case 'modal':
          if (typeof link.value === 'object' && link.value !== null) {
            openModal(link.value as ModalOptions);
          }
          break;
      }
    },
    [onTabChange, onFieldFocus, openModal],
  );

  const handleCloseAlert = useCallback(
    (key: string) => {
      setClosedAlerts((prev) => new Set(prev).add(key));
      if (onRemove) {
        onRemove(key);
      }
    },
    [onRemove],
  );

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // 주요 알림 색상 결정 (우선순위 기반)
  const getDominantColor = useCallback(() => {
    const hasColor = (color: string) => visibleAlerts.some((alert) => alert.color === color);

    // 우선순위: danger > warning > success > info
    if (hasColor('danger')) return 'danger';
    if (hasColor('warning')) return 'warning';
    if (hasColor('success')) return 'success';
    return 'info';
  }, [visibleAlerts]);

  return {
    visibleAlerts,
    isCollapsed,
    handleLinkClick,
    handleCloseAlert,
    toggleCollapse,
    getDominantColor,
  };
};

// 알림 스타일 가져오기 — rcm-notice 기본 + data-tone 반환
// className / dataTone 을 분리해 consumer 에서 data 속성으로 전달합니다.
export const getAlertStyles = (color: AlertMessage['color']): AlertStyles => {
  const base = { className: 'rcm-notice' };
  switch (color) {
    case 'success':
      return { ...base, dataTone: 'success', icon: IconCheck };
    case 'danger':
      return { ...base, dataTone: 'error', icon: IconAlertTriangle };
    case 'warning':
      return { ...base, dataTone: 'warning', icon: IconAlertTriangle };
    case 'info':
      return { ...base, dataTone: 'info', icon: IconInfoCircle };
    case 'secondary':
    case 'primary':
    case 'dark':
      return { ...base, icon: IconInfoCircle };
    default:
      return { ...base, dataTone: 'info', icon: IconInfoCircle };
  }
};

// 색상 → data-tone 값 매핑 (알림 요약 헤더의 인디케이터 점)
export const getIndicatorTone = (color: string): 'info' | 'success' | 'warning' | 'error' => {
  switch (color) {
    case 'danger':
      return 'error';
    case 'warning':
      return 'warning';
    case 'success':
      return 'success';
    default:
      return 'info';
  }
};
