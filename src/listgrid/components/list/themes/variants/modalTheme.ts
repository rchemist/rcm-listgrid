import { ViewListGridClassNames } from '../../types/ViewListGridTheme.types';

/**
 * 모달용 ListGrid 테마 변형 — 중립 버전.
 *
 * 모달 다이얼로그 내부에서 사용. 기본 테마에서 테두리/그림자를 제거하고
 * 팝업 높이 제한을 두는 정도의 조정.
 */
export const modalListGridTheme: Partial<ViewListGridClassNames> = {
  panel: {
    container: 'rcm-listgrid-panel',
    mainEntity: '',
    subCollection: '',
    default: '',
  },

  header: {
    container: 'rcm-listgrid-header',
    titleWrapper: 'rcm-listgrid-title',
    titleText: 'rcm-listgrid-title',
    buttonGroup: 'rcm-listgrid-button-group',
  },

  searchBar: {
    container: 'rcm-listgrid-searchbar',
    innerWrapper: '',
    layoutWrapper: 'rcm-row-between rcm-gap-sm',
  },

  table: {
    responsiveWrapper: 'rcm-skeleton-table-wrapper',
    container: 'rcm-scroll-y',
    table: 'rcm-table',
    thead: 'rcm-listgrid-thead',
    headerRow: '',
    tbody: 'rcm-listgrid-tbody',
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

  popup: {
    container: 'rcm-skeleton-popup-container',
    scrollArea: 'rcm-scroll-y',
    table: '',
  },
};
