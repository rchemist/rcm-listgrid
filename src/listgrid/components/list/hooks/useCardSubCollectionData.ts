'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchForm } from '../../../form/SearchForm';
import { PageResult } from '../../../form/Type';

/**
 * Configuration for card subcollection data fetching
 */
export interface CardSubCollectionDataConfig {
  /** Field name that maps the child to parent (e.g., 'parentId') */
  mappedBy: string;
  /** Filter field name (defaults to mappedBy) */
  filterBy?: string;
  /** Optional filters to apply */
  filters?: Record<string, any>;
  /** Whether to use SearchForm-based fetching (POST request) */
  useSearchForm?: boolean;
  /** SearchForm instance for fetching (when useSearchForm is true) */
  searchForm?: SearchForm;
}

/**
 * Hook for fetching card subcollection data
 * Fetches all data at once (no pagination) from the specified URL
 *
 * Supports two modes:
 * 1. Simple GET request (default) - fetches from URL directly
 * 2. SearchForm-based POST request - uses PageResult.fetchListData
 *
 * @param fetchUrl - String URL or function returning URL
 * @param config - Card subcollection configuration
 * @returns Object with data, loading, error states and refresh function
 */
export function useCardSubCollectionData(
  fetchUrl: string | (() => string),
  config: CardSubCollectionDataConfig,
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // AbortController ref for cleanup (for simple GET requests)
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track if mounted
  const isMountedRef = useRef(true);

  /**
   * Helper to get the actual URL string
   */
  const getUrl = useCallback((url: string | (() => string)): string => {
    return typeof url === 'function' ? url() : url;
  }, []);

  /**
   * Helper to extract data from response
   * Handles both array responses and paginated responses with 'data' or 'list' property
   */
  const extractData = useCallback((response: any): any[] => {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object') {
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.list)) {
        return response.list;
      }
    }
    return [];
  }, []);

  /**
   * Fetch data using SearchForm-based POST request
   */
  const fetchDataWithSearchForm = useCallback(async () => {
    if (!config.searchForm) {
      setError(new Error('SearchForm is required when useSearchForm is true'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = getUrl(fetchUrl);
      const result = await PageResult.fetchListData(url, config.searchForm);

      if (!isMountedRef.current) return;

      if (result.errors && result.errors.length > 0) {
        setError(new Error(result.errors.join(', ')));
        setData([]);
      } else {
        setData(result.list);
        setError(null);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setData([]);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchUrl, getUrl, config.searchForm]);

  /**
   * Fetch data using simple GET request
   */
  const fetchDataSimple = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const url = getUrl(fetchUrl);

        const response = await fetch(url, signal !== undefined ? { signal } : {});

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const jsonData = await response.json();
        const items = extractData(jsonData);

        // Only update state if not aborted and mounted
        if (!signal?.aborted && isMountedRef.current) {
          setData(items);
          setError(null);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const errorObj = err instanceof Error ? err : new Error(String(err));
        if (isMountedRef.current) {
          setError(errorObj);
          setData([]);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchUrl, getUrl, extractData],
  );

  /**
   * Effect to fetch data on mount and when dependencies change
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (config.useSearchForm) {
      // Use SearchForm-based fetching
      fetchDataWithSearchForm();
    } else {
      // Use simple GET request
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      fetchDataSimple(abortController.signal);
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    fetchUrl,
    config.mappedBy,
    config.filterBy,
    config.useSearchForm,
    config.searchForm,
    fetchDataWithSearchForm,
    fetchDataSimple,
  ]);

  /**
   * Refresh function to manually refetch data
   */
  const refresh = useCallback(async () => {
    if (config.useSearchForm) {
      await fetchDataWithSearchForm();
    } else {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      await fetchDataSimple(abortController.signal);
    }
  }, [config.useSearchForm, fetchDataWithSearchForm, fetchDataSimple]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
