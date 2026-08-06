// configureLabels — module-scope catalog for the built-in React-layer UI
// copy. Components read it during render so a host can configure labels once
// at app bootstrap without taking on a provider dependency.

export interface Labels {
  save: string;
  delete: string;
  deleteConfirm: string;
  quickSearchPlaceholder: string;
  quickSearchPlaceholderFor: (labels: string[]) => string;
  quickSearchAria: string;
  quickSearchSubmitAria: string;
  quickSearchClearAria: string;
  advancedSearchToggle: string;
  advancedSearchApply: string;
  advancedSearchReset: string;
  advancedSearchClose: string;
  unifiedSearchToggle: string;
  unifiedSearchHint: (labels: string[]) => string;
  unifiedSearchInputLabel: (labels: string[]) => string;
  unifiedSearchPlaceholder: (labels: string[]) => string;
  unifiedSearchDescription: (labels: string[]) => string;
  selectionConfirm: string;
  columnSettings: string;
  columnSettingsApply: string;
  columnFilterAria: (name: string) => string;
  filterReset: string;
  selectAllAria: string;
  emptyState: string;
  searchError: string;
  searchErrorDismiss: string;
  openInNewWindowTooltip: string;
  errorSummaryCollapsedTitle: string;
  errorSummaryExpandedTitle: string;
  errorSummaryCount: (n: number) => string;
  rowNumberHeader: string;
  paginationPrev: string;
  paginationNext: string;
}

const defaults: Labels = {
  save: 'Save',
  delete: 'Delete',
  deleteConfirm: '정말 삭제하시겠습니까?',
  quickSearchPlaceholder: '검색',
  quickSearchPlaceholderFor: (labels) => `Search ${labels.join(', ')}...`,
  quickSearchAria: 'Quick search',
  quickSearchSubmitAria: '빠른 검색',
  quickSearchClearAria: 'Clear quick search',
  advancedSearchToggle: '고급검색',
  advancedSearchApply: '검색',
  advancedSearchReset: '초기화',
  advancedSearchClose: '닫기',
  unifiedSearchToggle: '통합검색 사용',
  unifiedSearchHint: (labels) => `${labels.join(', ')} 필드를 하나의 검색어로 검색합니다`,
  unifiedSearchInputLabel: (labels) => `${labels.join(', ')} 검색`,
  unifiedSearchPlaceholder: (labels) => `${labels.join(', ')} 중 아무거나 입력...`,
  unifiedSearchDescription: (labels) =>
    `입력한 검색어가 ${labels.join(', ')} 중 하나라도 포함되면 검색됩니다 (OR 조건)`,
  selectionConfirm: '확인',
  columnSettings: '목록 설정',
  columnSettingsApply: '적용',
  columnFilterAria: (name) => `${name} 필터`,
  filterReset: '초기화',
  selectAllAria: '전체 선택',
  emptyState: '데이터가 없습니다.',
  searchError: '검색 중 오류가 발생했습니다. 검색 조건을 확인해 주세요.',
  searchErrorDismiss: '검색 오류 닫기',
  openInNewWindowTooltip: '새 창에서 보기',
  errorSummaryCollapsedTitle: '작성하신 정보에 누락 또는 오류가 있습니다.',
  errorSummaryExpandedTitle: '누락(오류) 정보 목록을 확인해 주세요.',
  errorSummaryCount: (n) => `${n}개 오류`,
  rowNumberHeader: 'No.',
  paginationPrev: 'Prev',
  paginationNext: 'Next',
};

let registry: Labels = { ...defaults };

/** Install label overrides. Merges with the current catalog. */
export function configureLabels(config: Partial<Labels>): void {
  registry = { ...registry, ...config };
}

/** The active label catalog — React components read this during render. */
export function getLabels(): Labels {
  return registry;
}
