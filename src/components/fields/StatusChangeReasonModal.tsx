'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React, {useState} from 'react';
import {Textarea} from '@gjcu/ui/form/Textarea';
import {SelectOption} from '@gjcu/ui/form/Type';
import {FieldValue} from '../../config/Config';

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
  onCancel
}) => {
  const [changeReason, setChangeReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 현재 상태와 새 상태의 라벨 찾기
  const currentLabel = options.find(opt => opt.value === currentStatus)?.label || String(currentStatus);
  const newLabel = options.find(opt => opt.value === newStatus)?.label || String(newStatus);

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
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">상태 변경</div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{currentLabel}</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium text-primary-600">{newLabel}</span>
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

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onCancel}
        >
          취소
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleConfirm}
        >
          확인
        </button>
      </div>
    </div>
  );
};
