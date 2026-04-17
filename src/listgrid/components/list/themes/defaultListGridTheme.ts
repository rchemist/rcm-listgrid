/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { ViewListGridClassNames } from "../types/ViewListGridTheme.types";

/**
 * ViewListGrid 기본 테마
 *
 * 현재 컴포넌트들에서 사용되는 모든 Tailwind 클래스를 기본값으로 정의합니다.
 * 커스텀 테마를 만들 때 이 테마를 참고하세요.
 */
export const defaultListGridTheme: ViewListGridClassNames = {
  // 최상위 컨테이너
  root: "",

  // 로딩 상태
  loading: {
    container: "h-400 relative",
    overlay: "",
    skeleton: "h-[400px] w-full",
  },

  // 헤더 영역 (ListGridHeader)
  header: {
    container: "mt-2 flex flex-wrap items-start gap-2",
    titleContainer: "min-w-[200px] max-w-full flex-1 overflow-hidden",
    titleWrapper: "flex items-center mt-2 min-h-[60px] truncate py-3 pt-2 md:mt-0 overflow-ellipsis text-[1.8rem] font-bold dark:text-white-light",
    titleText: "text-[1.8rem] font-bold dark:text-white-light",
    buttonGroup: "flex max-w-full shrink-0 flex-wrap items-center gap-2",
  },

  // 헤더 버튼
  headerButtons: {
    wrapper: "flex items-center justify-start space-x-2 whitespace-nowrap",
    default: "btn btn-default gap-2",
    primary: "btn btn-primary gap-2",
    outline: "btn btn-outline-primary gap-2",
    danger: "btn btn-outline-danger gap-2",
    icon: "btn btn-outline-primary btn-icon rounded-full",
    delete: "btn btn-outline-danger gap-2",
    refresh: "btn btn-outline-primary gap-2",
    download: "btn btn-outline-primary gap-2",
    upload: "btn btn-outline-primary gap-2",
    create: "btn btn-primary gap-2",
  },

  // 패널 (메인 컨텐츠 영역)
  panel: {
    container: "panel px-0 flex-1 gap-2.5",
    mainEntity: "mt-5 border dark:border-[#17263c] rounded-xl shadow-none",
    subCollection: "mt-2 py-4 border dark:border-[#17263c] rounded",
    default: "",
  },

  // 서브콜렉션 버튼
  subCollectionButtons: {
    container: "flex items-center justify-end space-x-2 whitespace-nowrap px-2 md:px-4 mb-2",
    buttonGroup: "flex items-center gap-2",
    addButton: "btn btn-primary btn-sm gap-1",
    deleteButton: "btn btn-outline-danger btn-sm gap-1",
    actionButton: "btn btn-outline-primary btn-sm gap-1",
  },

  // 검색바 (QuickSearchBar)
  searchBar: {
    container: "flex flex-1 p-0 mb-2",
    innerWrapper: "w-full px-4",
    layoutWrapper: "gap-2 md:flex md:items-center w-full md:justify-between",
  },

  // 검색 인풋 (QuickSearchInput)
  searchInput: {
    container: "relative flex items-center w-full md:w-auto",
    input: "form-input peer pr-9 ltr:pr-9 rtl:pl-9 rounded-full bg-white-light/40 focus:border-primary focus:bg-white dark:bg-dark/40 dark:focus:bg-dark",
    icon: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
    button: "btn btn-primary rounded-full ml-2",
    clearButton: "absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer",
  },

  // 검색바 액션
  searchBarActions: {
    container: "flex items-center gap-2 mt-2 md:mt-0",
    pageSizeSelect: "form-select w-auto rounded-full bg-white-light/40 dark:bg-dark/40",
    filterButton: "btn btn-outline-primary btn-sm gap-1",
    fieldSelectorButton: "btn btn-outline-primary btn-sm gap-1",
    advancedSearchButton: "btn btn-outline-primary btn-sm gap-1",
  },

  // 고급 검색
  advancedSearch: {
    container: "mb-4",
    panel: "panel p-4 rounded-lg border dark:border-[#17263c]",
    fieldGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    buttonArea: "flex items-center justify-end gap-2 mt-4 pt-4 border-t dark:border-[#17263c]",
    searchButton: "btn btn-primary",
    resetButton: "btn btn-outline-primary",
    closeButton: "btn btn-outline-secondary",
  },

  // 테이블
  table: {
    responsiveWrapper: "table-responsive min-h-[400px] w-full",
    container: "flex-grow overflow-auto",
    table: "table-hover w-full",
    thead: "border-t border-b border-white-light dark:border-[#17263c]",
    headerRow: "",
    tbody: "overflow-auto p-0 !border-0",
    contentWrapper: "overflow-y-auto p-0",
  },

  // 테이블 헤더 셀
  headerCell: {
    cell: "whitespace-nowrap",
    sortable: "cursor-pointer hover:bg-gray-50 dark:hover:bg-dark/30",
    sorted: "text-primary",
    sortIcon: "ml-1 inline-block",
    filterIcon: "ml-1 text-gray-400 hover:text-primary cursor-pointer",
    checkboxCell: "",
    dragHandleCell: "",
    openNewWindowCell: "w-2 whitespace-nowrap hidden md:table-cell",
    selectCell: "w-2 whitespace-nowrap",
  },

  // 테이블 행
  row: {
    row: "",
    hover: "hover:bg-gray-50 dark:hover:bg-dark/30",
    selected: "bg-primary-light dark:bg-primary-dark-light",
    even: "",
    odd: "",
    dragging: "opacity-50",
    clickable: "cursor-pointer",
  },

  // 테이블 셀
  cell: {
    cell: "",
    checkboxCell: "w-[50px]",
    numberCell: "text-center",
    dragHandleCell: "w-[30px] cursor-grab",
    openNewWindowCell: "hidden md:table-cell",
    selectCell: "",
    dataCell: "",
  },

  // 체크박스
  checkbox: {
    container: "flex items-center justify-center",
    input: "form-checkbox cursor-pointer",
    selectAll: "",
    item: "",
    checked: "",
    indeterminate: "",
  },

  // 빈 상태
  empty: {
    container: "flex h-full !border-0 min-h-[400px] items-center whitespace-nowrap justify-center text-md sm:min-h-[300px]",
    message: "text-gray-500 dark:text-gray-400",
    icon: "w-16 h-16 text-gray-300 mb-4",
  },

  // 페이지네이션
  pagination: {
    container: "w-full py-6 flex justify-center",
    wrapper: "",
  },

  // 알림
  notifications: {
    container: "",
    error: "text-danger bg-danger-light dark:bg-danger-dark-light",
    success: "text-success bg-success-light dark:bg-success-dark-light",
    warning: "text-warning bg-warning-light dark:bg-warning-dark-light",
    info: "text-info bg-info-light dark:bg-info-dark-light",
  },

  // 필드 선택기
  fieldSelector: {
    container: "relative",
    dropdown: "absolute right-0 top-full mt-1 w-64 bg-white dark:bg-dark border dark:border-[#17263c] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto",
    item: "flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark/50 cursor-pointer",
    selectedItem: "bg-primary-light dark:bg-primary-dark-light",
    checkbox: "form-checkbox mr-2",
  },

  // 필터 드롭다운
  filterDropdown: {
    container: "relative",
    panel: "absolute left-0 top-full mt-1 w-64 bg-white dark:bg-dark border dark:border-[#17263c] rounded-lg shadow-lg z-50 p-4",
    input: "form-input w-full mb-2",
    applyButton: "btn btn-primary btn-sm w-full",
    resetButton: "btn btn-outline-secondary btn-sm w-full mt-2",
  },

  // 모달
  modal: {
    overlay: "fixed inset-0 bg-black/50 z-50",
    container: "fixed inset-4 md:inset-10 lg:inset-20 bg-white dark:bg-dark rounded-xl shadow-xl z-50 overflow-hidden flex flex-col",
    header: "flex items-center justify-between px-6 py-4 border-b dark:border-[#17263c]",
    body: "flex-1 overflow-auto p-6",
    footer: "flex items-center justify-end gap-2 px-6 py-4 border-t dark:border-[#17263c]",
    closeButton: "btn btn-outline-secondary",
  },

  // 데이터 전송 모달
  dataTransferModal: {
    container: "p-6",
    optionGrid: "grid grid-cols-2 gap-4 mb-4",
    optionItem: "border dark:border-[#17263c] rounded-lg p-4 cursor-pointer hover:border-primary transition-colors",
    progressBar: "h-2 bg-gray-200 rounded-full overflow-hidden",
  },

  // 우선순위 조절
  priority: {
    dragHandle: "cursor-grab hover:bg-gray-100 dark:hover:bg-dark/50 rounded p-1",
    dragHandleIcon: "w-4 h-4 text-gray-400",
    button: "btn btn-outline-primary btn-sm gap-1",
    active: "btn-primary",
  },

  // 팝업 모드
  popup: {
    container: "max-h-[70vh] flex flex-col",
    scrollArea: "overflow-y-auto",
    table: "",
  },
};
