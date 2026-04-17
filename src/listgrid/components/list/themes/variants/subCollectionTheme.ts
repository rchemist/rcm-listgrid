/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { ViewListGridClassNames } from "../../types/ViewListGridTheme.types";

/**
 * 서브콜렉션용 ListGrid 테마 변형 (Clean & Simple)
 *
 * 메인 ListGrid와 구분되는 깔끔하고 컴팩트한 디자인.
 * 테두리 최소화, 여백 축소, 작은 폰트로 부모 폼과 조화.
 *
 * 디자인 컨셉:
 * - Borderless: 외곽 테두리 없음
 * - Compact: 작은 여백과 패딩
 * - Subtle: 은은한 배경색으로 영역 구분
 * - Small: 작은 폰트와 아이콘
 */
export const subCollectionListGridTheme: Partial<ViewListGridClassNames> = {
  // 테두리 없는 깔끔한 패널 - 은은한 배경으로 영역 구분, 좌우 여백 없음
  panel: {
    container: "mt-2 py-3 px-0 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg",
    mainEntity: "",
    subCollection: "",
    default: "",
  },

  // 헤더 숨김
  header: {
    container: "hidden",
    titleWrapper: "",
    titleText: "",
    buttonGroup: "",
  },

  // 서브콜렉션 버튼 - 오른쪽 정렬, 컴팩트, 좌우 여백 없음
  subCollectionButtons: {
    container: "flex items-center justify-end gap-2 px-0 mb-2",
    buttonGroup: "flex items-center gap-1.5",
    addButton: "btn btn-primary btn-sm gap-1",
    deleteButton: "btn btn-outline-danger btn-sm gap-1",
    actionButton: "btn btn-outline-primary btn-sm gap-1",
  },

  // 검색바 - 컴팩트, 좌우 여백 없음
  searchBar: {
    container: "flex flex-1 p-0 mb-1",
    innerWrapper: "w-full px-0",
    layoutWrapper: "gap-2 md:flex md:items-center w-full md:justify-between",
  },

  // 검색 인풋 - 작고 깔끔하게
  searchInput: {
    container: "relative flex items-center w-full md:w-auto",
    input: "form-input form-input-sm peer pr-8 rounded-md bg-white dark:bg-dark border-gray-200 dark:border-gray-700 focus:border-primary text-sm",
    icon: "absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4",
    button: "btn btn-primary btn-sm rounded-md ml-2",
    clearButton: "absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer w-3 h-3",
  },

  // 검색바 액션 - 컴팩트
  searchBarActions: {
    container: "flex items-center gap-2 mt-2 md:mt-0",
    pageSizeSelect: "form-select form-select-sm w-auto rounded-md bg-white dark:bg-dark border-gray-200 dark:border-gray-700",
    filterButton: "btn btn-outline-primary btn-sm gap-1",
    fieldSelectorButton: "btn btn-outline-primary btn-sm gap-1",
    advancedSearchButton: "btn btn-outline-primary btn-sm gap-1",
  },

  // 깔끔한 테이블 - 최소한의 구분선
  table: {
    responsiveWrapper: "w-full overflow-x-auto",
    container: "overflow-auto",
    table: "w-full text-sm",
    // 헤더: 얇은 하단 선만
    thead: "border-b border-gray-200 dark:border-gray-700",
    headerRow: "",
    tbody: "",
    contentWrapper: "overflow-y-auto",
  },

  // 작은 헤더 셀
  headerCell: {
    cell: "py-2 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap",
    sortable: "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300",
    sorted: "text-primary",
    sortIcon: "ml-0.5 inline-block w-3 h-3",
    filterIcon: "ml-0.5 text-gray-400 hover:text-primary cursor-pointer w-3 h-3",
    checkboxCell: "w-10",
    dragHandleCell: "w-6",
    openNewWindowCell: "w-8 hidden md:table-cell",
    selectCell: "w-8",
  },

  // 행 스타일 - 부드러운 호버
  row: {
    row: "",
    hover: "hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors",
    selected: "bg-primary/10 dark:bg-primary/20",
    even: "",
    odd: "",
    dragging: "opacity-50 bg-gray-100",
    clickable: "cursor-pointer",
  },

  // 셀 스타일 - 컴팩트
  cell: {
    cell: "py-2 text-sm",
    checkboxCell: "w-10 text-center",
    numberCell: "text-center text-xs text-gray-400",
    dragHandleCell: "w-6 cursor-grab",
    openNewWindowCell: "w-8 hidden md:table-cell",
    selectCell: "w-8",
    dataCell: "",
  },

  // 빈 상태 - 간결
  empty: {
    container: "flex flex-col items-center justify-center py-8 text-center",
    message: "text-sm text-gray-400 dark:text-gray-500",
    icon: "w-8 h-8 text-gray-300 dark:text-gray-600 mb-2",
  },

  // 페이지네이션 - 작게
  pagination: {
    container: "flex justify-center py-3",
    wrapper: "",
  },

  // 체크박스 - 작게
  checkbox: {
    container: "flex items-center justify-center",
    input: "form-checkbox w-4 h-4 rounded cursor-pointer",
    selectAll: "",
    item: "",
    checked: "",
    indeterminate: "",
  },
};
