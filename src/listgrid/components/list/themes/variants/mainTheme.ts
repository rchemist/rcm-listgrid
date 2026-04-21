import { ViewListGridClassNames } from '../../types/ViewListGridTheme.types';

/**
 * 메인 페이지용 ListGrid 테마 변형 — 중립 버전.
 *
 * 기본 테마 위에 메인 페이지 느낌의 미세 조정(더 큰 여백, 그림자)을 얹습니다.
 * 구체적 스타일은 `rcm-*` 클래스의 조합 + CSS 변수로만 구성.
 */
export const mainListGridTheme: Partial<ViewListGridClassNames> = {
  panel: {
    container: 'rcm-listgrid-panel rcm-listgrid-panel-main',
    mainEntity: '',
    subCollection: 'rcm-listgrid-panel-sub',
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
    innerWrapper: 'rcm-listgrid-searchbar-inner',
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

  pagination: {
    container: 'rcm-listgrid-pagination',
    wrapper: '',
  },
};
