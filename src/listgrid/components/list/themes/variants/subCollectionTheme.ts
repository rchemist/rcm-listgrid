import { ViewListGridClassNames } from '../../types/ViewListGridTheme.types';

/**
 * 서브콜렉션용 ListGrid 테마 변형 — 중립 버전.
 *
 * 부모 폼 내부에 삽입되는 테이블의 컴팩트한 스타일. 기본 테마 위에
 * `rcm-*` scoped 클래스만 활용해 헤더 숨김/테두리 축소를 덮어씁니다.
 */
export const subCollectionListGridTheme: Partial<ViewListGridClassNames> = {
  panel: {
    container: 'rcm-panel rcm-panel-muted rcm-panel-compact',
    mainEntity: '',
    subCollection: '',
    default: '',
  },

  header: {
    container: 'rcm-visually-hidden',
    titleWrapper: '',
    titleText: '',
    buttonGroup: '',
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
    innerWrapper: '',
    layoutWrapper: 'rcm-row-between rcm-gap-sm',
  },

  searchInput: {
    container: 'rcm-row',
    input: 'rcm-field-input',
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

  table: {
    responsiveWrapper: 'rcm-skeleton-table-wrapper',
    container: 'rcm-scroll-y',
    table: 'rcm-table',
    thead: 'rcm-listgrid-thead',
    headerRow: '',
    tbody: '',
    contentWrapper: 'rcm-scroll-y',
  },

  headerCell: {
    cell: 'rcm-text-xs rcm-text-muted',
    sortable: 'rcm-cursor-pointer',
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
    cell: 'rcm-text-sm',
    checkboxCell: 'rcm-skeleton-td-checkbox',
    numberCell: 'rcm-text-xs rcm-text-muted',
    dragHandleCell: 'rcm-cursor-pointer',
    openNewWindowCell: '',
    selectCell: '',
    dataCell: '',
  },

  empty: {
    container: 'rcm-listgrid-empty',
    message: 'rcm-text-muted rcm-text-sm',
    icon: 'rcm-text-muted',
  },

  pagination: {
    container: 'rcm-listgrid-pagination',
    wrapper: '',
  },

  checkbox: {
    container: 'rcm-row-center',
    input: 'rcm-cursor-pointer',
    selectAll: '',
    item: '',
    checked: '',
    indeterminate: '',
  },
};
