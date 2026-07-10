import { describe, it, expect, beforeEach, vi } from 'vitest';

import { renderHook } from '@testing-library/react';
import {
  useQuickSearchBar,
  getGlobalPageSize,
  setGlobalPageSize,
  PAGE_SIZE_STORAGE_KEY,
} from './useQuickSearchBar';
import { QuickSearchBarProps } from '../QuickSearchBar';
import { SearchForm } from '../../../form/SearchForm';

describe('useQuickSearchBar - defaultPageSize precedence (P0-4)', () => {
  beforeEach(() => {
    window.localStorage.removeItem(PAGE_SIZE_STORAGE_KEY);
  });

  it('keeps an explicit defaultPageSize even when a different global page size is stored', () => {
    setGlobalPageSize(20);
    expect(getGlobalPageSize()).toBe(20);

    const searchForm = SearchForm.create({ pageSize: 50 });
    const onChangeSearchForm = vi.fn();

    const props: QuickSearchBarProps = {
      viewFields: [],
      quickSearchValue: '',
      loading: false,
      onQuickSearch: vi.fn(),
      listFields: [],
      enableHandleData: true,
      showAdvancedSearch: false,
      subCollection: false,
      searchForm,
      onChangeSearchForm,
      entityUrl: '/entity',
      defaultPageSize: 50,
    };

    renderHook(() => useQuickSearchBar(props));

    expect(onChangeSearchForm).not.toHaveBeenCalled();
  });

  it('falls back to the global stored page size when no defaultPageSize is configured', () => {
    setGlobalPageSize(20);

    const searchForm = SearchForm.create({ pageSize: 10 });
    const onChangeSearchForm = vi.fn();

    const props: QuickSearchBarProps = {
      viewFields: [],
      quickSearchValue: '',
      loading: false,
      onQuickSearch: vi.fn(),
      listFields: [],
      enableHandleData: true,
      showAdvancedSearch: false,
      subCollection: false,
      searchForm,
      onChangeSearchForm,
      entityUrl: '/entity',
    };

    renderHook(() => useQuickSearchBar(props));

    expect(onChangeSearchForm).toHaveBeenCalledTimes(1);
    const updatedForm = onChangeSearchForm.mock.calls[0][0] as SearchForm;
    expect(updatedForm.getPageSize()).toBe(20);
  });
});
