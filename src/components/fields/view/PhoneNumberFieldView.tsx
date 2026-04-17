/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

'use client';

import React, {useEffect, useState} from 'react';
import {IconCopy, IconMessage} from '@tabler/icons-react';
import {Tooltip} from '@gjcu/ui/elements/tooltip/Tooltip';
import {useModalManagerStore} from '@gjcu/ui/store';
import {showToast} from '@gjcu/ui/message/messageUtils';
import {readonlyClass} from '@gjcu/ui/form/Style';
import {formatPhoneNumber, removePhoneNumberHyphens} from '@gjcu/ui/utils/PhoneUtil';
import {SmsModal} from './SmsModal';
import {Session} from '@gjcu/ui/auth';
import {RenderType} from '../../../config/Config';

interface PhoneNumberFieldViewProps {
  name: string;
  value: string | null | undefined;
  onChange: (value: string, commit?: boolean) => void;
  onError?: (message: string) => void;
  readonly?: boolean;
  placeHolder?: string;
  regex?: { pattern: RegExp; message: string };
  enableSms?: boolean;
  session?: Session;
  renderType?: RenderType;
}

export const PhoneNumberFieldView = ({
  name,
  value,
  onChange,
  onError,
  readonly = false,
  placeHolder,
  regex,
  enableSms,
  session,
  renderType,
}: PhoneNumberFieldViewProps) => {
  const { openModal, closeModal } = useModalManagerStore();
  const [displayValue, setDisplayValue] = useState('');

  // Sync displayValue when external value changes
  useEffect(() => {
    if (value) {
      const formatted = formatPhoneNumber(value);
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Check if user has admin role
  const roles = session?.authentication?.roles ?? session?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');

  // SMS can be sent if: admin + enableSms + phoneNumber + update mode
  const canSendSms = isAdmin && enableSms && displayValue && renderType === 'update';

  // Copy is always available when there's a phone number
  const canCopy = !!displayValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digitsOnly = removePhoneNumberHyphens(inputValue);
    const truncated = digitsOnly.substring(0, 11);
    const formatted = formatPhoneNumber(truncated);
    setDisplayValue(formatted);
    onChange(truncated, false);
  };

  const handleBlur = () => {
    const digitsOnly = removePhoneNumberHyphens(displayValue);

    if (regex && digitsOnly) {
      const isValid = regex.pattern.test(digitsOnly);
      if (!isValid) {
        onError?.(regex.message);
      } else {
        onError?.('');
      }
    }

    onChange(digitsOnly, true);
  };

  const handleCopy = async () => {
    try {
      const rawNumber = removePhoneNumberHyphens(displayValue);
      await navigator.clipboard.writeText(rawNumber);
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

  const handleSms = () => {
    const rawNumber = removePhoneNumberHyphens(displayValue);
    const modalId = `sms-modal-${rawNumber}-${Date.now()}`;
    openModal({
      modalId,
      title: 'SMS 발송',
      size: 'md',
      content: (
        <SmsModal
          phoneNumber={displayValue}
          onClose={() => closeModal(modalId)}
        />
      ),
    });
  };

  // Determine if buttons should be shown
  const showButtons = canCopy || canSendSms;

  return (
    <div className="flex w-full">
      <div className="flex w-full items-center">
        <div className="group relative flex w-full">
          <div className="dropdown flex w-full">
            <input
              type="text"
              className={readonlyClass(readonly, `form-input ${showButtons ? 'rounded-r-none border-r-0' : ''}`)}
              id={name}
              value={displayValue}
              placeholder={placeHolder}
              disabled={readonly}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </div>
        {showButtons && (
          <div className="flex h-full items-center border border-white-light bg-[#fafafa] font-semibold text-secondary dark:border-[#17263c] dark:bg-[#1b2e4b] rounded-r-md border-l-0">
            {canCopy && (
              <Tooltip label="전화번호 복사">
                <button
                  type="button"
                  className="flex h-[30px] w-[36px] items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleCopy}
                >
                  <IconCopy className="h-4 w-4" />
                </button>
              </Tooltip>
            )}
            {canSendSms && (
              <Tooltip label="SMS 보내기">
                <button
                  type="button"
                  className="flex h-[30px] w-[36px] items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleSms}
                >
                  <IconMessage className="h-4 w-4" />
                </button>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
