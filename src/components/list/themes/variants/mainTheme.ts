/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { ViewListGridClassNames } from "../../types/ViewListGridTheme.types";

/**
 * 메인 페이지용 ListGrid 테마 변형
 *
 * 메인 엔티티 목록 페이지에서 사용되는 테마입니다.
 * 기본 테마에서 메인 페이지에 적합한 스타일을 오버라이드합니다.
 *
 * 특징:
 * - 넓은 패널 여백
 * - 명확한 테두리와 그림자
 * - 전체적으로 여유로운 레이아웃
 */
export const mainListGridTheme: Partial<ViewListGridClassNames> = {
  // 메인 페이지에서는 패널에 테두리와 그림자 적용
  panel: {
    container: "panel px-0 flex-1 gap-2.5 mt-5 border dark:border-[#17263c] rounded-xl shadow-sm",
    mainEntity: "", // 이미 container에서 처리
    subCollection: "mt-2 py-4 border dark:border-[#17263c] rounded",
    default: "",
  },

  // 헤더에 더 큰 여백
  header: {
    container: "mt-4 mb-2 flex flex-wrap items-start gap-3",
    titleWrapper: "flex items-center min-h-[60px] truncate py-4",
    titleText: "text-2xl font-bold dark:text-white-light",
    buttonGroup: "flex max-w-full shrink-0 flex-wrap items-center gap-3",
  },

  // 검색바에 더 넓은 패딩
  searchBar: {
    container: "flex flex-1 p-0 mb-4",
    innerWrapper: "w-full px-6",
    layoutWrapper: "gap-3 md:flex md:items-center w-full md:justify-between",
  },

  // 테이블 행에 더 넓은 여백
  table: {
    responsiveWrapper: "table-responsive min-h-[450px] w-full",
    container: "flex-grow overflow-auto",
    table: "table-hover w-full",
    thead: "border-t border-b border-white-light dark:border-[#17263c] bg-gray-50 dark:bg-dark/30",
    headerRow: "",
    tbody: "overflow-auto p-0 !border-0",
  },

  // 페이지네이션에 더 큰 여백
  pagination: {
    container: "w-full py-8 flex justify-center",
    wrapper: "",
  },
};
