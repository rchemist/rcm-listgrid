/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { IconFilter } from '@tabler/icons-react';
import React from 'react';

interface FilterButtonProps {
  isActive: boolean; // 필터 적용 여부
  onClick: () => void;
  disabled?: boolean;
}

export const FilterButton = ({ isActive, onClick, disabled }: FilterButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center transition-colors ${
        isActive ? 'text-primary' : 'text-gray-400 hover:text-primary'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label="필터"
      type="button"
    >
      <IconFilter className="w-3.5 h-3.5 mt-0.5" />
    </button>
  );
};
