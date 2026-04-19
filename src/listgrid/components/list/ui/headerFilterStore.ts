/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { create } from 'zustand';

interface HeaderFilterState {
  // 현재 열린 필터의 식별자 (테이블ID + 필드명 또는 유니크한 ID)
  openFilterId: string | null;

  // 필터 열기
  openFilter: (filterId: string) => void;

  // 필터 닫기
  closeFilter: () => void;

  // 특정 필터가 열려있는지 확인
  isFilterOpen: (filterId: string) => boolean;
}

export const useHeaderFilterStore = create<HeaderFilterState>((set, get) => ({
  openFilterId: null,

  openFilter: (filterId: string) => {
    set({ openFilterId: filterId });
  },

  closeFilter: () => {
    set({ openFilterId: null });
  },

  isFilterOpen: (filterId: string) => {
    return get().openFilterId === filterId;
  },
}));
