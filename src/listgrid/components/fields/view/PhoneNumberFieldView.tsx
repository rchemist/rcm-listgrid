'use client';

import React, { useEffect, useState } from 'react';
import { IconCopy, IconMessage } from '@tabler/icons-react';
import { Tooltip } from '../../../ui';
import { useModalManagerStore } from '../../../store';
import { showToast } from '../../../message';
import { readonlyClass } from '../../../ui';
import { formatPhoneNumber, removePhoneNumberHyphens } from '../../../utils/PhoneUtil';
import { SmsModal } from './SmsModal';
import { Session } from '../../../auth';
import { RenderType } from '../../../config/Config';

interface PhoneNumberFieldViewProps {
  name: string;
  value: string | null | undefined;
  onChange: (value: string, commit?: boolean | undefined) => void;
  onError?: ((message: string) => void) | undefined;
  readonly?: boolean | undefined;
  placeHolder?: string | undefined;
  regex?: { pattern: RegExp; message: string } | undefined;
  enableSms?: boolean | undefined;
  session?: Session | undefined;
  renderType?: RenderType | undefined;
  /** Permission to send SMS, resolved by PhoneNumberField at render time. */
  canSendSmsByPermission?: boolean | undefined;
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
  canSendSmsByPermission,
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

  // SMS can be sent if: permitted + enableSms + phoneNumber + update mode
  // `canSendSmsByPermission` is evaluated and injected by PhoneNumberField
  // (either field-level withSmsPermission override or RuntimeConfig.permissions.canSendSms).
  const canSendSms = canSendSmsByPermission && enableSms && displayValue && renderType === 'update';

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

  const handleSms = () => {
    const rawNumber = removePhoneNumberHyphens(displayValue);
    const modalId = `sms-modal-${rawNumber}-${Date.now()}`;
    openModal({
      modalId,
      title: 'SMS 발송',
      size: 'md',
      content: <SmsModal phoneNumber={displayValue} onClose={() => closeModal(modalId)} />,
    });
  };

  // Determine if buttons should be shown
  const showButtons = canCopy || canSendSms;

  return (
    <div className="rcm-input-group">
      <div className="rcm-input-group-input">
        <input
          type="text"
          className={readonlyClass(
            readonly,
            `rcm-input ${showButtons ? 'rcm-input-group-input-with-addon' : ''}`,
          )}
          id={name}
          value={displayValue}
          placeholder={placeHolder}
          disabled={readonly}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      {showButtons && (
        <div className="rcm-input-addon">
          {canCopy && (
            <Tooltip label="전화번호 복사">
              <button type="button" className="rcm-icon-btn" data-size="sm" onClick={handleCopy}>
                <IconCopy className="rcm-icon" data-size="sm" />
              </button>
            </Tooltip>
          )}
          {canSendSms && (
            <Tooltip label="SMS 보내기">
              <button type="button" className="rcm-icon-btn" data-size="sm" onClick={handleSms}>
                <IconMessage className="rcm-icon" data-size="sm" />
              </button>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};
