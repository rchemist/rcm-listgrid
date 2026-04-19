'use client';

import React, { useState } from 'react';
import { Tooltip } from '../ui';
import { ShowError } from '../message';
import { getTranslation } from '../utils/i18n';

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
  const { t } = getTranslation();
  const [usePassword, setUsePassword] = useState(false);

  const usePasswordLabel =
    t('form.list.dataTransfer.tab.export.usepassword.label') || '비밀번호 설정';
  const passwordLabel = t('form.list.dataTransfer.tab.export.password.label') || '비밀번호';

  return (
    <div className="rcm-panel rcm-panel-muted rcm-stack">
      <div className="rcm-row-between">
        <Tooltip
          label={
            <div>
              파일에 비밀번호를 설정하는 경우 데이터 양이 많을 경우 암호화에 다소 시간이 소요될 수
              있습니다.
            </div>
          }
          zIndex={1100}
          color="gray"
          withArrow={true}
          position="top-start"
        >
          <label htmlFor="usePassword" className="rcm-row rcm-cursor-pointer">
            <input
              type="checkbox"
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
            <span className="rcm-text-sm rcm-text-emphasis">{usePasswordLabel}</span>
          </label>
        </Tooltip>
      </div>
      {usePassword && (
        <div className="rcm-field-root rcm-field-indent">
          <label htmlFor="excelPassword" className="rcm-field-label">
            {passwordLabel}
          </label>
          <input
            type="text"
            className="rcm-input rcm-field-input-compact"
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
