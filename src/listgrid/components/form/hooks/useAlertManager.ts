'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {useCallback, useEffect, useState} from 'react';
import {AlertMessage, AlertMessageLink} from '../../../config/EntityFormTypes';
import {ModalOptions, useModalManagerStore} from '../../../../store';
import {IconAlertTriangle, IconCheck, IconInfoCircle} from '@tabler/icons-react';
import {AlertStyles} from '../types/ViewEntityFormAlerts.types';

export const useAlertManager = (
  alertMessages: AlertMessage[],
  onRemove?: (key: string) => void,
  onTabChange?: (tabId: string) => void,
  onFieldFocus?: (fieldName: string) => void
) => {
  const { openModal } = useModalManagerStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [closedAlerts, setClosedAlerts] = useState<Set<string>>(new Set());

  // alertMessages가 변경되면 닫힌 알림 초기화
  useEffect(() => {
    setClosedAlerts(new Set());
  }, [alertMessages.length]);

  // 닫히지 않은 알림들
  const visibleAlerts = alertMessages.filter(alert => !closedAlerts.has(alert.key));

  const handleLinkClick = useCallback((link: AlertMessageLink) => {
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
  }, [onTabChange, onFieldFocus, openModal]);
  
  const handleCloseAlert = useCallback((key: string) => {
    setClosedAlerts(prev => new Set(prev).add(key));
    if (onRemove) {
      onRemove(key);
    }
  }, [onRemove]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // 주요 알림 색상 결정 (우선순위 기반)
  const getDominantColor = useCallback(() => {
    const hasColor = (color: string) => visibleAlerts.some(alert => alert.color === color);
    
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
    getDominantColor
  };
};

// 알림 스타일 가져오기
export const getAlertStyles = (color: AlertMessage['color']): AlertStyles => {
  switch (color) {
    case 'success':
      return {
        bg: 'bg-success-light',
        hoverBg: 'bg-success/15',
        text: 'text-success',
        icon: IconCheck
      };
    case 'danger':
      return {
        bg: 'bg-danger-light',
        hoverBg: 'bg-danger/15',
        text: 'text-danger',
        icon: IconAlertTriangle
      };
    case 'warning':
      return {
        bg: 'bg-warning-light',
        hoverBg: 'bg-warning/15',
        text: 'text-warning',
        icon: IconAlertTriangle
      };
    case 'info':
      return {
        bg: 'bg-info-light',
        hoverBg: 'bg-info/15',
        text: 'text-info',
        icon: IconInfoCircle
      };
    case 'secondary':
      return {
        bg: 'bg-secondary-light',
        hoverBg: 'bg-secondary/15',
        text: 'text-secondary',
        icon: IconInfoCircle
      };
    case 'primary':
      return {
        bg: 'bg-primary-light',
        hoverBg: 'bg-primary/15',
        text: 'text-primary',
        icon: IconInfoCircle
      };
    case 'dark':
      return {
        bg: 'bg-dark-light',
        hoverBg: 'bg-dark/15',
        text: 'text-dark',
        icon: IconInfoCircle
      };
    default:
      return {
        bg: 'bg-info-light',
        hoverBg: 'bg-info/15',
        text: 'text-info',
        icon: IconInfoCircle
      };
  }
};

// 색상별 인디케이터 스타일
export const getColorIndicator = (color: string): string => {
  switch (color) {
    case 'danger':
      return 'bg-red-500';
    case 'warning':
      return 'bg-amber-500';
    case 'success':
      return 'bg-green-500';
    default:
      return 'bg-blue-500';
  }
};
