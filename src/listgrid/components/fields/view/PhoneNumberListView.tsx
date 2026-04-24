'use client';

import React from 'react';
import { IconCopy, IconDotsVertical, IconMessage } from '@tabler/icons-react';
import { Popover } from '../../../ui';
import { Tooltip } from '../../../ui';
import { getOverlayZIndex, POPOVER_Z_INDEX, useModalManagerStore } from '../../../store';
import { showToast } from '../../../message';
import { SmsModal } from './SmsModal';
import { Session } from '../../../auth';
import { formatPhoneNumber } from '../../../utils/PhoneUtil';

interface PhoneNumberListViewProps {
  phoneNumber: string;
  formattedValue: string;
  enableSms?: boolean | undefined;
  session?: Session | undefined;
  /** Permission to send SMS, resolved by PhoneNumberField at render time. */
  canSendSmsByPermission?: boolean | undefined;
}

export const PhoneNumberListView = ({
  phoneNumber,
  formattedValue,
  enableSms,
  canSendSmsByPermission,
}: PhoneNumberListViewProps) => {
  const { openModal, closeModal } = useModalManagerStore();

  // SMS can be sent if: permitted + enableSms + phoneNumber
  // `canSendSmsByPermission` is evaluated and injected by PhoneNumberField.
  const canSendSms = canSendSmsByPermission && enableSms && phoneNumber;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phoneNumber);
      showToast({
        message: '전화번호가 복사되었습니다.',
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
    <div className="rcm-phone-list-wrap">
      <span>{formattedValue}</span>
      <Popover position="bottom" withArrow shadow="md" zIndex={getOverlayZIndex(POPOVER_Z_INDEX)}>
        <Popover.Target>
          <Tooltip label="메뉴">
            <button className="rcm-phone-list-menu-btn">
              <IconDotsVertical className="rcm-m2o-action-icon" />
            </button>
          </Tooltip>
        </Popover.Target>
        <Popover.Dropdown onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <div className="rcm-phone-list-dropdown">
            <button className="rcm-phone-list-dropdown-item" onClick={handleCopy}>
              <IconCopy className="rcm-m2o-action-icon" />
              <span>전화번호 복사</span>
            </button>
            {canSendSms && (
              <button className="rcm-phone-list-dropdown-item" onClick={handleSms}>
                <IconMessage className="rcm-m2o-action-icon" />
                <span>SMS 보내기</span>
              </button>
            )}
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};
