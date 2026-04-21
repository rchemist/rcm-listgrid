import React, { ReactNode } from 'react';
import { getTranslation } from '../../../utils/i18n';

interface ViewErrorProps {
  errors?: string[];
}

export const ViewFieldError = (props: ViewErrorProps) => {
  const { t } = getTranslation();

  if (!props.errors || props.errors.length === 0) return null;

  const errors: ReactNode[] = [];
  props.errors?.forEach((error, index) => {
    errors.push(
      <div key={index} className="rcm-field-error">
        {t(error ?? '')}
      </div>,
    );
  });
  return <>{errors}</>;
};
