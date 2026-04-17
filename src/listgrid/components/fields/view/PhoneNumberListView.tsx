/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

'use client';

import React from 'react';
import {IconCopy, IconDotsVertical, IconMessage} from '@tabler/icons-react';
import {Popover} from '@gjcu/ui/elements/popover/Popover';
import {Tooltip} from '@gjcu/ui/elements/tooltip/Tooltip';
import {getOverlayZIndex, POPOVER_Z_INDEX, useModalManagerStore} from '@gjcu/ui/store';
import {showToast} from '@gjcu/ui/message/messageUtils';
import {SmsModal} from './SmsModal';
import {Session} from '@gjcu/ui/auth';
import {formatPhoneNumber} from '@gjcu/ui/utils/PhoneUtil';

interface PhoneNumberListViewProps {
  phoneNumber: string;
  formattedValue: string;
  enableSms?: boolean;
  session?: Session;
}

export const PhoneNumberListView = ({
  phoneNumber,
  formattedValue,
  enableSms,
  session,
}: PhoneNumberListViewProps) => {
  const { openModal, closeModal } = useModalManagerStore();

  // Check if user has admin role
  const roles = session?.authentication?.roles ?? session?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');

  // SMS can be sent if: admin + enableSms + phoneNumber
  const canSendSms = isAdmin && enableSms && phoneNumber;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phoneNumber);
      showToast({
        message: '전화번호가 복사되었습니다.',
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

  const handleSms = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modalId = `sms-modal-${phoneNumber}-${Date.now()}`;
    openModal({
      modalId,
      title: 'SMS 발송',
      size: 'md',
      content: (
        <SmsModal
          phoneNumber={formatPhoneNumber(phoneNumber)}
          onClose={() => closeModal(modalId)}
        />
      ),
    });
  };

  // If no actions available, just show the formatted value
  if (!canSendSms) {
    return <span>{formattedValue}</span>;
  }

  return (
    <div className="flex items-center space-x-1">
      <span>{formattedValue}</span>
      <Popover
        position="bottom"
        withArrow
        shadow="md"
        zIndex={getOverlayZIndex(POPOVER_Z_INDEX)}
      >
        <Popover.Target>
          <Tooltip label="메뉴">
            <button
              className="h-6 w-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <IconDotsVertical className="h-4 w-4" />
            </button>
          </Tooltip>
        </Popover.Target>
        <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col space-y-1 p-1">
            <button
              className="flex items-center space-x-2 rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleCopy}
            >
              <IconCopy className="h-4 w-4" />
              <span>전화번호 복사</span>
            </button>
            {canSendSms && (
              <button
                className="flex items-center space-x-2 rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleSms}
              >
                <IconMessage className="h-4 w-4" />
                <span>SMS 보내기</span>
              </button>
            )}
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};
