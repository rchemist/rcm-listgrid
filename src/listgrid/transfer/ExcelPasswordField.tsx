'use client';

import React, {useState} from 'react';
import {Tooltip} from '../ui';
import {ShowError} from '../message';
import {getTranslation} from '../utils/i18n';

interface ExcelPasswordFieldProps {
  password: string;
  onPasswordChange: (password: string) => void;
  error?: string;
  onErrorChange?: (error: string) => void;
}

export const ExcelPasswordField: React.FC<ExcelPasswordFieldProps> = ({
  password,
  onPasswordChange,
  error,
  onErrorChange,
}) => {
  const {t} = getTranslation();
  const [usePassword, setUsePassword] = useState(false);

  const usePasswordLabel = t('form.list.dataTransfer.tab.export.usepassword.label') || '비밀번호 설정';
  const passwordLabel = t('form.list.dataTransfer.tab.export.password.label') || '비밀번호';

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Tooltip
          label={<div>파일에 비밀번호를 설정하는 경우 데이터 양이 많을 경우 암호화에 다소 시간이 소요될 수 있습니다.</div>}
          zIndex={1100}
          color="gray"
          withArrow={true}
          position="top-start"
        >
          <label htmlFor="usePassword" className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox text-indigo-600 focus:ring-indigo-500"
              id="usePassword"
              name="usePassword"
              checked={usePassword}
              onChange={(event) => {
                const checked = event.target.checked;
                setUsePassword(checked);
                if (!checked) {
                  onPasswordChange('');
                }
                onErrorChange?.('');
              }}
            />
            <span className="text-sm font-medium text-gray-700">{usePasswordLabel}</span>
          </label>
        </Tooltip>
      </div>
      {usePassword && (
        <div className="space-y-2 pl-6">
          <label htmlFor="excelPassword" className="block text-sm font-medium text-gray-700">
            {passwordLabel}
          </label>
          <input
            type="text"
            className="form-input max-w-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            id="excelPassword"
            name="excelPassword"
            maxLength={32}
            value={password}
            onChange={(event) => {
              onPasswordChange(event.target.value);
              onErrorChange?.('');
            }}
          />
          {error && <ShowError message={error} gap="0" />}
        </div>
      )}
    </div>
  );
};
