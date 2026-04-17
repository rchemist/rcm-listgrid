/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React from "react";
import {IconChevronDown, IconChevronUp} from "@tabler/icons-react";
import {getTranslation} from "@gjcu/ui/utils/i18n";
import {ViewEntityFormAlertsProps} from "../types/ViewEntityFormAlerts.types";
import {getColorIndicator, useAlertManager} from "../hooks/useAlertManager";
import {AlertItem} from "./AlertItem";

export const ViewEntityFormAlerts = React.memo(function ViewEntityFormAlerts({ 
  alertMessages, 
  onRemove,
  onTabChange,
  onFieldFocus
}: ViewEntityFormAlertsProps): React.ReactNode {
  const { t } = getTranslation();
  const {
    visibleAlerts,
    isCollapsed,
    handleLinkClick,
    handleCloseAlert,
    toggleCollapse,
    getDominantColor
  } = useAlertManager(alertMessages, onRemove, onTabChange, onFieldFocus);
  
  // 조건부 return은 모든 hooks 호출 이후에
  if (!alertMessages || alertMessages.length === 0 || visibleAlerts.length === 0) {
    return null;
  }
  
  const dominantColor = getDominantColor();

  // 알림이 1개일 때는 헤더 없이 직접 렌더링
  if (visibleAlerts.length === 1) {
    return (
      <div className="mb-4">
        <AlertItem
          key={'alert-' + visibleAlerts[0].key}
          alert={visibleAlerts[0]}
          onLinkClick={handleLinkClick}
          onClose={handleCloseAlert}
          t={t}
        />
      </div>
    );
  }

  // 알림이 2개 이상일 때만 헤더와 함께 렌더링
  return (
    <div className={`${isCollapsed ? '' : 'mb-4'}`}>
      {/* 심플한 헤더 */}
      <div 
        className={`flex items-center justify-between p-3 bg-gray-50 border border-gray-200 cursor-pointer transition-all ${
          isCollapsed ? 'rounded-lg' : 'rounded-t-lg border-b-0'
        }`}
        onClick={toggleCollapse}
      >
        <div className="flex items-center gap-2">
          {/* 색상 인디케이터 점 */}
          <div className={`w-2 h-2 rounded-full ${getColorIndicator(dominantColor)}`} />
          <span className="font-medium text-gray-700">
            알림 ({visibleAlerts.length})
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={isCollapsed ? "알림 펼치기" : "알림 접기"}
        >
          {isCollapsed ? (
            <IconChevronDown className="h-4 w-4" />
          ) : (
            <IconChevronUp className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* 알림 목록 - 접힌 상태에서는 숨김 */}
      <div 
        className={`border-x border-b border-gray-200 rounded-b-lg bg-white overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
        }`}
      >
        <div className="p-2 space-y-2">
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