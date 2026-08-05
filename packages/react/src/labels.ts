// configureLabels — module-scope catalog for the built-in React-layer UI
// copy. Components read it during render so a host can configure labels once
// at app bootstrap without taking on a provider dependency.

export interface Labels {
  save: string;
  delete: string;
  deleteConfirm: string;
  quickSearchPlaceholder: string;
  quickSearchAria: string;
  advancedSearchToggle: string;
  advancedSearchApply: string;
  selectionConfirm: string;
  columnSettings: string;
  columnSettingsApply: string;
  columnFilterAria: (name: string) => string;
}

const defaults: Labels = {
  save: 'Save',
  delete: 'Delete',
  deleteConfirm: '정말 삭제하시겠습니까?',
  quickSearchPlaceholder: '검색',
  quickSearchAria: 'Quick search',
  advancedSearchToggle: '고급검색',
  advancedSearchApply: '검색',
  selectionConfirm: '확인',
  columnSettings: '목록 설정',
  columnSettingsApply: '적용',
  columnFilterAria: (name) => `${name} 필터`,
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
