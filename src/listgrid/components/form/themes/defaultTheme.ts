/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {ViewEntityFormClassNames} from "../types/ViewEntityFormTheme.types";

/**
 * ViewEntityForm 기본 테마 — 중립(neutral) 버전.
 *
 * 라이브러리가 제공하는 기본 스타일은 `@rcm/listgrid/styles.css`의
 * `rcm-*` scoped 클래스로만 구성됩니다. 호스트의 Tailwind/shadcn/HeroUI
 * 설정과 무관하게 동작하며, 스타일 커스터마이즈는 CSS 변수 override,
 * `@layer rcm-listgrid` 밖 CSS, `<ViewEntityForm classNames={{...}}>` prop,
 * 혹은 `EntityFormThemeProvider`를 통한 전체 테마 주입으로 가능.
 */
export const defaultEntityFormTheme: ViewEntityFormClassNames = {
  root: "",

  loading: {
    container: "rcm-loading-overlay",
    skeleton: "rcm-skeleton",
  },

  header: {
    container: "",
    desktop: "rcm-listgrid-header",
    mobile: "",
    titleWrapper: "rcm-listgrid-title-container",
    buttonWrapper: "",
  },

  title: {
    container: "rcm-listgrid-title",
    text: "rcm-listgrid-title",
  },

  buttons: {
    container: "",
    innerWrapper: "",
    save: "rcm-button rcm-button-primary",
    list: "rcm-button rcm-button-outline",
    delete: "rcm-button rcm-button-danger",
    close: "rcm-button rcm-button-outline",
    custom: "rcm-button rcm-button-primary",
  },

  alerts: {
    singleContainer: "rcm-skeleton-row",
    multiContainer: "rcm-skeleton-row",
    header: "rcm-row-between rcm-panel rcm-cursor-pointer",
    headerExpanded: "",
    headerCollapsed: "",
    listContainer: "rcm-panel",
    listExpanded: "",
    listCollapsed: "",
    listContent: "rcm-stack",
  },

  alertItem: {
    container: "rcm-notice rcm-row-between",
    icon: "",
    contentWrapper: "rcm-row",
    message: "rcm-text-emphasis",
    description: "rcm-text-sm rcm-text-muted",
    closeButton: "rcm-cursor-pointer",
    colorVariants: {
      success: "rcm-notice",
      danger: "rcm-notice rcm-notice-error",
      warning: "rcm-notice rcm-notice-warning",
      info: "rcm-notice rcm-notice-info",
      primary: "rcm-notice",
      secondary: "rcm-notice",
      dark: "rcm-notice",
    },
  },

  errors: {
    container: "",
    header: "rcm-row-between rcm-notice rcm-notice-error rcm-cursor-pointer",
    headerExpanded: "",
    headerCollapsed: "",
    headerIcon: "",
    headerTitle: "rcm-text-emphasis",
    headerBadge: "rcm-text-sm",
    content: "rcm-stack",
    item: "rcm-notice rcm-notice-error",
    tabName: "rcm-cursor-pointer rcm-text-emphasis",
    fieldErrors: "rcm-stack",
    fieldErrorButton: "rcm-row rcm-cursor-pointer",
  },

  tabs: {
    list: "rcm-tab-list",
    tab: "rcm-tab",
    tabSelected: "rcm-tab-selected",
    tabDisabled: "rcm-tab-disabled",
  },

  tabPanel: {
    container: "",
    emptyMessage: "rcm-text-muted",
    content: "",
  },

  panel: {
    scrollContainer: "",
    layoutWrapper: "rcm-stack",
    container: "rcm-listgrid-panel",
    inner: "",
  },

  fieldGroup: {
    container: "rcm-panel",
    headerWrapper: "rcm-skeleton-row",
    title: "rcm-heading-sm rcm-row-between",
    icons: "rcm-row",
    collapseIcon: "rcm-cursor-pointer rcm-text-muted",
    content: "rcm-grid",
  },

  field: {
    container: "rcm-field-root",
    labelWrapper: "rcm-row",
    label: "rcm-field-label",
    requiredIcon: "rcm-text-error rcm-cursor-pointer",
    dirtyIcon: "rcm-text-warning rcm-cursor-pointer",
    tooltipIcon: "rcm-text-muted",
    valueContainer: "",
  },

  fieldError: {
    message: "rcm-field-error",
  },

  helpText: {
    text: "rcm-field-description",
  },

  createStep: {
    container: "rcm-stack",
    panel: "rcm-panel",
    stepperWrapper: "rcm-skeleton-row",
    stepLabel: "rcm-heading-sm",
    buttonGroup: "rcm-row",
    prevButton: "rcm-button",
    nextButton: "rcm-button rcm-button-primary",
    saveButton: "rcm-button rcm-button-primary",
    toggleButton: "rcm-button rcm-button-icon rcm-button-secondary",
  },
};
