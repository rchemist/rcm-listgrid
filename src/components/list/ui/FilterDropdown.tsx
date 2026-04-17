'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {Transition} from "@headlessui/react";
import {IconX} from "@tabler/icons-react";
import {getOverlayZIndex} from '../../../../store';

export type FilterDropdownSize = 'sm' | 'md' | 'lg';
export type FilterDropdownPlacement = 'left' | 'right';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onApply?: () => void;
  onClear?: () => void;
  size?: FilterDropdownSize;
  placement?: FilterDropdownPlacement;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const FilterDropdown = ({
  isOpen,
  onClose,
  children,
  onApply,
  onClear,
  size = 'sm',
  placement = 'left',
  anchorRef,
}: FilterDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [zIndex, setZIndex] = useState(50);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  // z-index 동적 계산
  useEffect(() => {
    if (isOpen) {
      setZIndex(getOverlayZIndex());
    }
  }, [isOpen]);

  // 크기별 너비 (px)
  const getDropdownWidth = () => {
    switch (size) {
      case 'sm': return 260;
      case 'md': return 360;
      case 'lg': return 420;
      default: return 260;
    }
  };

  // 크기별 클래스 설정
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-[260px]';
      case 'md':
        return 'w-[360px]';
      case 'lg':
        return 'w-[420px]';
      default:
        return 'w-[260px]';
    }
  };

  // Portal + fixed positioning based on anchor element
  const updatePosition = useCallback(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const dropdownWidth = getDropdownWidth();

    const style: React.CSSProperties = {
      position: 'fixed',
      top: rect.bottom + 8,
    };

    if (placement === 'right') {
      style.left = Math.max(0, rect.right - dropdownWidth);
    } else {
      style.left = rect.left;
    }

    setPositionStyle(style);
  }, [anchorRef, placement, size]);

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!isOpen || !anchorRef?.current) return;

    const handleReposition = () => updatePosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen, updatePosition]);

  // Fallback: inline absolute positioning when no anchorRef
  const getPlacementStyle = (): React.CSSProperties => {
    if (placement === 'right') {
      return { top: '100%', right: 0 };
    }
    return { top: '100%', left: 0 };
  };

  // ESC 키 감지
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const usePortal = !!anchorRef?.current;

  const dropdownContent = (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <div
        ref={dropdownRef}
        className={`${usePortal ? '' : 'absolute'} mt-2 ${getSizeClass()} rounded-md bg-white dark:bg-[#0e1726] shadow-lg border border-gray-200 dark:border-[#17263c]`}
        style={usePortal ? { ...positionStyle, zIndex } : { ...getPlacementStyle(), zIndex }}
      >
        <div className="p-4 space-y-3">
          {/* 헤더: 닫기 버튼 */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#17263c]">
            <span className="text-sm font-semibold">필터</span>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="닫기"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          {/* 필터 UI */}
          <div className="max-h-[400px] overflow-y-auto">
            {children}
          </div>

          {/* 버튼 영역 */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-[#17263c]">
            {onClear && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={onClear}
              >
                초기화
              </button>
            )}
            {onApply && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onApply}
              >
                적용
              </button>
            )}
          </div>
        </div>
      </div>
    </Transition>
  );

  if (usePortal) {
    return ReactDOM.createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
};