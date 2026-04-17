/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { ViewListGridClassNames } from "../../types/ViewListGridTheme.types";

/**
 * 모달용 ListGrid 테마 변형
 *
 * 모달 다이얼로그 내부에서 사용되는 테마입니다.
 * 제한된 공간에서 효율적으로 정보를 표시하도록 최적화되어 있습니다.
 *
 * 특징:
 * - 테두리/그림자 제거 (모달이 이미 스타일 제공)
 * - 최대 높이 제한
 * - 스크롤 영역 최적화
 * - 간소화된 헤더
 */
export const modalListGridTheme: Partial<ViewListGridClassNames> = {
  // 모달 내부에서는 테두리/그림자 제거
  panel: {
    container: "panel px-0 flex-1 gap-2 mt-0 border-0 shadow-none",
    mainEntity: "",
    subCollection: "",
    default: "",
  },

  // 헤더 간소화
  header: {
    container: "mb-2 flex flex-wrap items-center gap-2",
    titleWrapper: "flex items-center truncate py-2",
    titleText: "text-lg font-semibold dark:text-white-light",
    buttonGroup: "flex flex-wrap items-center gap-2 ml-auto",
  },

  // 검색바 간소화 - 좌우 패딩 제거
  searchBar: {
    container: "flex flex-1 p-0 mb-2",
    innerWrapper: "w-full px-0",
    layoutWrapper: "gap-2 md:flex md:items-center w-full md:justify-between",
  },

  // 테이블 높이 제한
  table: {
    responsiveWrapper: "table-responsive min-h-[300px] max-h-[50vh] w-full overflow-auto",
    container: "flex-grow overflow-auto",
    table: "table-hover w-full",
    thead: "border-t border-b border-white-light dark:border-[#17263c] sticky top-0 bg-white dark:bg-dark z-10",
    headerRow: "",
    tbody: "overflow-auto p-0 !border-0",
  },

  // 빈 상태 높이 조정
  empty: {
    container: "flex h-full !border-0 min-h-[250px] items-center whitespace-nowrap justify-center text-md",
    message: "text-gray-500 dark:text-gray-400",
    icon: "w-12 h-12 text-gray-300 mb-3",
  },

  // 페이지네이션 간소화
  pagination: {
    container: "w-full py-4 flex justify-center border-t dark:border-[#17263c]",
    wrapper: "",
  },

  // 팝업 모드 스타일
  popup: {
    container: "max-h-[70vh] flex flex-col",
    scrollArea: "overflow-y-auto flex-1",
    table: "",
  },
};
