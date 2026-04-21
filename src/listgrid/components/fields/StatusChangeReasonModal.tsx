'use client';

import React, { useState } from 'react';
import { Textarea } from '../../ui';
import { SelectOption } from '../../form/Type';
import { FieldValue } from '../../config/Config';

interface StatusReason {
  message: string;
  fieldName: string;
  required?: boolean;
}

interface StatusChangeReasonModalProps {
  currentStatus: FieldValue;
  newStatus: FieldValue;
  options: SelectOption[];
  reason: StatusReason;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const StatusChangeReasonModal: React.FC<StatusChangeReasonModalProps> = ({
  currentStatus,
  newStatus,
  options,
  reason,
  onConfirm,
  onCancel,
}) => {
  const [changeReason, setChangeReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 현재 상태와 새 상태의 라벨 찾기
  const currentLabel =
    options.find((opt) => opt.value === currentStatus)?.label || String(currentStatus);
  const newLabel = options.find((opt) => opt.value === newStatus)?.label || String(newStatus);

  const handleConfirm = () => {
    if (reason.required && !changeReason.trim()) {
      setError('변경 사유를 입력해주세요.');
      return;
    }
    onConfirm(changeReason);
  };

  const handleReasonChange = (value: string) => {
    setChangeReason(value);
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="rcm-status-change-modal">
      <div className="rcm-status-change-box">
        <div className="rcm-status-change-caption">상태 변경</div>
        <div className="rcm-status-change-row">
          <span className="rcm-status-change-from">{currentLabel}</span>
          <span className="rcm-status-change-arrow">→</span>
          <span className="rcm-status-change-to">{newLabel}</span>
        </div>
      </div>

      <div>
        <Textarea
          name="changeReason"
          label="변경 사유"
          value={changeReason}
          onChange={handleReasonChange}
          placeHolder={reason.message}
          required={reason.required}
          rows={4}
          errors={error ? [error] : undefined}
        />
      </div>

      <div className="rcm-status-change-footer">
        <button
          type="button"
          className="rcm-button"
          data-variant="ghost"
          data-size="sm"
          onClick={onCancel}
        >
          취소
        </button>
        <button
          type="button"
          className="rcm-button"
          data-variant="primary"
          data-size="sm"
          onClick={handleConfirm}
        >
          확인
        </button>
      </div>
    </div>
  );
};
