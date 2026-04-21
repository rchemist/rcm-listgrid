'use client';

import { useCallback, useRef } from 'react';
import { parseAsString, useQueryStates } from '../../../urlState';
import { SearchForm } from '../../../form/SearchForm';
import {
  hasUrlParams,
  ListGridUrlState,
  parseAsFilters,
  parseAsPage,
  parseAsPageSize,
  parseAsSort,
} from './urlStateParsers';
import {
  areUrlStatesEqual,
  mergeUrlAndSessionState,
  searchFormToUrlState,
} from './searchFormUrlSync';

export interface UrlSyncOptions {
  /** Enable URL sync (default: true for main entities) */
  enabled?: boolean;
  /** Include filters in URL (default: true) */
  includeFilters?: boolean;
  /** Include sort in URL (default: true) */
  includeSort?: boolean;
  /** Include pageSize in URL (default: true) */
  includePageSize?: boolean;
  /** Use sessionStorage as fallback (default: true) */
  sessionStorageFallback?: boolean;
}

export interface UseListGridUrlStateOptions {
  /** URL sync configuration */
  urlSync?: UrlSyncOptions | boolean;
  /** Whether this is a main entity (not subCollection) */
  isMainEntity: boolean;
  /** Quick search property name */
  quickSearchPropertyName?: string;
  /** Additional fields for OR condition quick search */
  orFields?: string[];
  /** Session storage SearchForm (for fallback) */
  sessionSearchForm?: SearchForm;
}

export interface UseListGridUrlStateReturn {
  /** Current URL state */
  urlState: ListGridUrlState;
  /** Whether URL sync is enabled */
  isEnabled: boolean;
  /** Whether URL has params (user navigated via deep link) */
  hasUrlParams: boolean;
  /** Sync SearchForm state to URL */
  syncToUrl: (searchForm: SearchForm) => void;
  /** Get initial SearchForm from URL or session */
  getInitialSearchForm: (baseSearchForm: SearchForm) => SearchForm;
  /** Clear all URL params */
  clearUrlParams: () => void;
}

/**
 * Resolve UrlSyncOptions from boolean or object
 */
function resolveUrlSyncOptions(
  urlSync: UrlSyncOptions | boolean | undefined,
  isMainEntity: boolean,
): UrlSyncOptions {
  // If explicitly false, disable
  if (urlSync === false) {
    return { enabled: false };
  }

  // If true or undefined, use defaults
  if (urlSync === true || urlSync === undefined) {
    return {
      enabled: isMainEntity, // Default: enabled only for main entities
      includeFilters: true,
      includeSort: true,
      includePageSize: true,
      sessionStorageFallback: true,
    };
  }

  // Merge provided options with defaults
  return {
    enabled: urlSync.enabled ?? isMainEntity,
    includeFilters: urlSync.includeFilters ?? true,
    includeSort: urlSync.includeSort ?? true,
    includePageSize: urlSync.includePageSize ?? true,
    sessionStorageFallback: urlSync.sessionStorageFallback ?? true,
  };
}

/**
 * Custom hook for ListGrid URL state synchronization using nuqs
 */
export function useListGridUrlState(
  options: UseListGridUrlStateOptions,
): UseListGridUrlStateReturn {
  const { urlSync, isMainEntity, quickSearchPropertyName, orFields, sessionSearchForm } = options;

  const resolvedOptions = resolveUrlSyncOptions(urlSync, isMainEntity);
  const isEnabled = resolvedOptions.enabled ?? false;

  // Track last synced state to prevent unnecessary updates
  const lastSyncedStateRef = useRef<ListGridUrlState | null>(null);

  // Use nuqs for URL state management
  const [urlState, setUrlState] = useQueryStates(
    {
      page: parseAsPage,
      pageSize: parseAsPageSize,
      q: parseAsString,
      sort: parseAsSort,
      filters: parseAsFilters,
    },
    {
      // Use replace instead of push to avoid polluting browser history
      history: 'replace',
      // Shallow routing to avoid full page reload
      shallow: true,
    },
  );

  // Check if URL has any ListGrid params
  const urlHasParams = hasUrlParams(urlState as ListGridUrlState);

  /**
   * Sync SearchForm state to URL
   */
  const syncToUrl = useCallback(
    (searchForm: SearchForm) => {
      if (!isEnabled) return;

      const newUrlState = searchFormToUrlState(searchForm, quickSearchPropertyName, orFields);

      // Apply options to filter what goes to URL
      const filteredState: ListGridUrlState = {
        page: newUrlState.page,
        pageSize: resolvedOptions.includePageSize ? newUrlState.pageSize : null,
        q: newUrlState.q,
        sort: resolvedOptions.includeSort ? newUrlState.sort : null,
        filters: resolvedOptions.includeFilters ? newUrlState.filters : null,
      };

      // Skip if state hasn't changed
      if (
        lastSyncedStateRef.current &&
        areUrlStatesEqual(lastSyncedStateRef.current, filteredState)
      ) {
        return;
      }

      lastSyncedStateRef.current = filteredState;

      // Update URL
      setUrlState({
        page: filteredState.page,
        pageSize: filteredState.pageSize,
        q: filteredState.q,
        sort: filteredState.sort,
        filters: filteredState.filters,
      });
    },
    [isEnabled, quickSearchPropertyName, orFields, resolvedOptions, setUrlState],
  );

  /**
   * Get initial SearchForm from URL or session storage
   */
  const getInitialSearchForm = useCallback(
    (baseSearchForm: SearchForm): SearchForm => {
      if (!isEnabled) {
        // URL sync disabled, use session if available
        return sessionSearchForm?.clone() ?? baseSearchForm.clone();
      }

      // Merge URL state with session state (URL priority)
      const mergedForm = mergeUrlAndSessionState(
        urlState as ListGridUrlState,
        resolvedOptions.sessionStorageFallback ? sessionSearchForm : undefined,
        quickSearchPropertyName,
        orFields,
      );

      // Apply base form settings if merged form is empty
      if (!hasUrlParams(urlState as ListGridUrlState) && !sessionSearchForm) {
        return baseSearchForm.clone();
      }

      // Copy settings from base form that aren't in URL
      if (!urlState.pageSize && baseSearchForm.getPageSize()) {
        mergedForm.withPageSize(baseSearchForm.getPageSize());
      }

      return mergedForm;
    },
    [isEnabled, urlState, sessionSearchForm, quickSearchPropertyName, orFields, resolvedOptions],
  );

  /**
   * Clear all URL params
   */
  const clearUrlParams = useCallback(() => {
    if (!isEnabled) return;

    lastSyncedStateRef.current = null;
    setUrlState({
      page: null,
      pageSize: null,
      q: null,
      sort: null,
      filters: null,
    });
  }, [isEnabled, setUrlState]);

  return {
    urlState: urlState as ListGridUrlState,
    isEnabled,
    hasUrlParams: urlHasParams,
    syncToUrl,
    getInitialSearchForm,
    clearUrlParams,
  };
}

export default useListGridUrlState;
