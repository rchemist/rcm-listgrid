/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {ViewEntityFormClassNames} from "../types/ViewEntityFormTheme.types";

/**
 * ViewEntityForm 기본 테마
 *
 * 현재 컴포넌트들에서 사용되는 모든 Tailwind 클래스를 기본값으로 정의합니다.
 * 커스텀 테마를 만들 때 이 테마를 참고하세요.
 */
export const defaultEntityFormTheme: ViewEntityFormClassNames = {
  // 최상위 컨테이너
  root: "",

  // 로딩 상태
  loading: {
    container: "relative",
    skeleton: "h-[400px] w-full",
  },

  // 헤더 영역
  header: {
    container: "mt-1",
    desktop: "hidden md:flex md:flex-wrap md:items-start md:gap-1",
    mobile: "md:hidden",
    titleWrapper: "min-w-[200px] max-w-full flex-1 overflow-hidden",
    buttonWrapper: "",
  },

  // 제목
  title: {
    container: "flex items-center mt-2 min-h-[60px] truncate py-3 pt-2 md:mt-0",
    text: "text-[1.8rem] font-bold dark:text-white-light",
  },

  // 버튼
  buttons: {
    container: "",
    innerWrapper: "",
    save: "btn btn-primary text-[13px]",
    list: "btn btn-outline-primary gap-2",
    delete: "btn btn-outline-danger gap-2",
    close: "btn btn-outline-primary gap-2",
    custom: "btn btn-primary gap-2",
  },

  // Alerts
  alerts: {
    singleContainer: "mb-4",
    multiContainer: "mb-4",
    header:
      "flex items-center justify-between p-3 bg-gray-50 border border-gray-200 cursor-pointer transition-all",
    headerExpanded: "rounded-t-lg border-b-0",
    headerCollapsed: "rounded-lg",
    listContainer:
      "border-x border-b border-gray-200 rounded-b-lg bg-white overflow-hidden transition-all duration-300",
    listExpanded: "max-h-[2000px] opacity-100",
    listCollapsed: "max-h-0 opacity-0",
    listContent: "p-2 space-y-2",
  },

  // AlertItem
  alertItem: {
    container: "p-4 rounded-lg border border-current/20 flex items-start justify-between gap-3",
    icon: "h-5 w-5 mt-0.5 flex-shrink-0",
    contentWrapper: "flex items-start gap-3 flex-1",
    message: "font-medium",
    description: "mt-1 text-sm",
    closeButton: "hover:opacity-70 transition-opacity flex-shrink-0",
    colorVariants: {
      success: "bg-success-light text-success",
      danger: "bg-danger-light text-danger",
      warning: "bg-warning-light text-warning",
      info: "bg-info-light text-info",
      primary: "bg-primary-light text-primary",
      secondary: "bg-secondary-light text-secondary",
      dark: "bg-dark-light text-dark",
    },
  },

  // 에러 표시
  errors: {
    container: "",
    header:
      "flex w-full items-center justify-between p-3 bg-danger text-white hover:bg-danger/90 transition-colors",
    headerExpanded: "rounded-t-lg",
    headerCollapsed: "rounded-lg",
    headerIcon: "ml-2 h-5 w-5",
    headerTitle: "font-semibold",
    headerBadge: "text-sm bg-white/20 px-2 py-1 rounded-full",
    content: "space-y-2",
    item: "text-danger bg-danger-light dark:bg-danger-dark-light p-4 mb-2",
    tabName: "py-2 font-bold text-[16px] cursor-pointer hover:underline",
    fieldErrors: "space-y-1 text-[15px]",
    fieldErrorButton:
      "flex space-x-2 items-center cursor-pointer hover:underline text-left w-full",
  },

  // 탭
  tabs: {
    list: "mt-3 flex flex-row border-b border-white-light dark:border-[#191e3a] whitespace-nowrap",
    tab: "-mb-[1px] block border border-transparent px-2.5 py-1.5 hover:text-primary dark:hover:border-b-black",
    tabSelected:
      "!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black",
    tabDisabled: "opacity-50 cursor-not-allowed",
  },

  // 탭 패널
  tabPanel: {
    container: "",
    emptyMessage: "p-4 text-gray-500 dark:text-gray-400",
    content: "pt-2 md:pt-3",
  },

  // 패널/스크롤 영역
  panel: {
    scrollContainer: "relative h-full",
    layoutWrapper: "flex w-full max-w-full flex-col gap-1.5 pt-3 xl:flex-row",
    container: "panel w-full max-w-full flex-1 rounded-xl px-0 pt-1",
    inner: "w-full max-w-full pl-1.5 pr-1.5 md:pl-3 md:pr-3",
  },

  // 필드 그룹
  fieldGroup: {
    container:
      "panel mb-3 md:mb-4 border-0 md:border shadow-none md:shadow-md bg-transparent md:bg-white dark:md:bg-dark px-1 md:px-4",
    headerWrapper: "mb-2.5 md:mb-3",
    title:
      "text-sm md:text-base font-semibold dark:text-white-light flex flex-1 items-center justify-between",
    icons: "flex items-center gap-2 justify-end",
    collapseIcon: "text-sm color-secondary cursor-pointer",
    content: "grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-x-4 gap-y-3.5 md:gap-y-4",
  },

  // 개별 필드
  field: {
    container: "",
    labelWrapper: "flex items-center",
    label: "text-gray-500 dark:text-gray-400 text-xs md:text-sm",
    requiredIcon: "mb-0.5 md:mb-1 cursor-help text-red-600 w-2.5 h-2.5 md:w-3 md:h-3",
    dirtyIcon: "mb-0.5 md:mb-1 cursor-help text-yellow-600 w-2.5 h-2.5 md:w-3 md:h-3",
    tooltipIcon: "text-[11px] text-white-dark h-2.5 w-2.5 md:h-3 md:w-3",
    valueContainer: "max-w-full text-wrap",
  },

  // 필드 에러
  fieldError: {
    message: "text-danger text-[11px] mt-1",
  },

  // 도움말 텍스트
  helpText: {
    text: "text-white-dark text-[11px] inline-block mt-1",
  },

  // CreateStep (단계별 생성)
  createStep: {
    container: "flex flex-col gap-2.5 pt-5 xl:flex-row",
    panel: "panel relative flex-1 rounded-xl p-5",
    stepperWrapper: "mb-2",
    stepLabel: "text-lg font-semibold",
    buttonGroup: "pt-2 space-x-2",
    prevButton: "btn btn-default",
    nextButton: "btn btn-primary",
    saveButton: "btn btn-primary",
    toggleButton:
      "absolute bottom-4 right-4 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700",
  },
};
