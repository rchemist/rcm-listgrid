import { ViewListGridClassNames } from '../types/ViewListGridTheme.types';

/**
 * ViewListGrid 기본 테마 — 중립(neutral) 버전.
 *
 * 라이브러리가 제공하는 기본 스타일은 `@rchemist/listgrid/styles.css`의
 * `rcm-*` scoped 클래스로만 구성됩니다. 호스트의 Tailwind/shadcn/HeroUI
 * 설정과 무관하게 동작하며, 스타일 커스터마이즈는 다음 네 경로로 가능:
 *
 *   1) CSS 변수 override — `:root { --rcm-color-primary: ... }`
 *   2) `@layer rcm-listgrid` 밖에서 `.rcm-button { ... }` 재정의
 *   3) `<ViewListGrid classNames={{...}}>` prop
 *   4) 이 파일을 복사해 자체 theme 객체를 만들고 `ListGridThemeProvider`에 주입
 */
export const defaultListGridTheme: ViewListGridClassNames = {
  root: '',

  loading: {
    container: 'rcm-loading-overlay',
    overlay: '',
    skeleton: 'rcm-skeleton',
  },

  header: {
    container: 'rcm-listgrid-header',
    titleContainer: 'rcm-listgrid-title-container',
    titleWrapper: 'rcm-listgrid-title',
    titleText: 'rcm-listgrid-title',
    buttonGroup: 'rcm-listgrid-button-group',
  },

  panel: {
    container: 'rcm-listgrid-panel',
    mainEntity: 'rcm-listgrid-panel-main',
    subCollection: 'rcm-listgrid-panel-sub',
    default: '',
  },

  subCollectionButtons: {
    container: 'rcm-action-bar-end',
    buttonGroup: 'rcm-row rcm-gap-sm',
    addButton: 'rcm-button',
    deleteButton: 'rcm-button',
    actionButton: 'rcm-button',
  },

  searchBar: {
    container: 'rcm-listgrid-searchbar',
    innerWrapper: 'rcm-listgrid-searchbar-inner',
    layoutWrapper: 'rcm-row-between rcm-gap-sm',
  },

  searchInput: {
    container: 'rcm-row',
    input: 'rcm-listgrid-search-input',
    icon: 'rcm-listgrid-search-icon',
    button: 'rcm-button',
    clearButton: 'rcm-listgrid-search-clear',
  },

  searchBarActions: {
    container: 'rcm-row rcm-gap-sm',
    pageSizeSelect: 'rcm-field-input',
    filterButton: 'rcm-button',
    fieldSelectorButton: 'rcm-button',
    advancedSearchButton: 'rcm-button',
  },

  advancedSearch: {
    container: 'rcm-stack',
    panel: 'rcm-panel',
    fieldGrid: 'rcm-grid',
    buttonArea: 'rcm-action-bar-end',
    searchButton: 'rcm-button',
    resetButton: 'rcm-button',
    closeButton: 'rcm-button',
  },

  table: {
    responsiveWrapper: 'rcm-skeleton-table-wrapper',
    container: 'rcm-scroll-y',
    table: 'rcm-table',
    thead: 'rcm-listgrid-thead',
    headerRow: '',
    tbody: 'rcm-listgrid-tbody',
    contentWrapper: 'rcm-scroll-y',
  },

  headerCell: {
    cell: '',
    sortable: 'rcm-cursor-pointer rcm-listgrid-row-hover',
    sorted: 'rcm-text-emphasis',
    sortIcon: '',
    filterIcon: 'rcm-cursor-pointer rcm-text-muted',
    checkboxCell: '',
    dragHandleCell: '',
    openNewWindowCell: '',
    selectCell: '',
  },

  row: {
    row: '',
    hover: 'rcm-listgrid-row-hover',
    selected: 'rcm-listgrid-row-selected',
    even: '',
    odd: '',
    dragging: 'rcm-listgrid-row-dragging',
    clickable: 'rcm-cursor-pointer',
  },

  cell: {
    cell: '',
    checkboxCell: 'rcm-skeleton-td-checkbox',
    numberCell: '',
    dragHandleCell: 'rcm-cursor-pointer',
    openNewWindowCell: '',
    selectCell: '',
    dataCell: '',
  },

  checkbox: {
    container: 'rcm-row-center',
    input: 'rcm-cursor-pointer',
    selectAll: '',
    item: '',
    checked: '',
    indeterminate: '',
  },

  empty: {
    container: 'rcm-listgrid-empty',
    message: 'rcm-text-muted',
    icon: 'rcm-text-muted',
  },

  pagination: {
    container: 'rcm-listgrid-pagination',
    wrapper: '',
  },

  notifications: {
    container: '',
    error: 'rcm-notice rcm-notice-error',
    success: 'rcm-notice',
    warning: 'rcm-notice rcm-notice-warning',
    info: 'rcm-notice rcm-notice-info',
  },

  fieldSelector: {
    container: '',
    dropdown: 'rcm-listgrid-dropdown',
    item: 'rcm-listgrid-dropdown-item',
    selectedItem: 'rcm-listgrid-row-selected',
    checkbox: '',
  },

  filterDropdown: {
    container: '',
    panel: 'rcm-listgrid-dropdown-left',
    input: 'rcm-field-input',
    applyButton: 'rcm-button',
    resetButton: 'rcm-button',
  },

  modal: {
    overlay: 'rcm-modal-overlay',
    container: 'rcm-modal-container',
    header: 'rcm-modal-header',
    body: 'rcm-modal-body',
    footer: 'rcm-modal-footer',
    closeButton: 'rcm-button',
  },

  dataTransferModal: {
    container: 'rcm-dialog-body',
    optionGrid: 'rcm-grid',
    optionItem: 'rcm-panel rcm-cursor-pointer',
    progressBar: 'rcm-progress-bar',
  },

  priority: {
    dragHandle: 'rcm-cursor-pointer',
    dragHandleIcon: 'rcm-text-muted',
    button: 'rcm-button',
    active: '',
  },

  popup: {
    container: 'rcm-skeleton-popup-container',
    scrollArea: 'rcm-scroll-y',
    table: '',
  },
};
