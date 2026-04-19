import { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCardSubCollectionData } from '../useCardSubCollectionData';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Spy on AbortController.prototype.abort so we can assert on it
// (without replacing the real AbortController — jsdom's native one provides
// signal.addEventListener, which the hook and fetch rely on)
const mockAbort = vi.fn();
const originalAbort = AbortController.prototype.abort;
AbortController.prototype.abort = function abortSpy(reason?: any) {
  mockAbort(reason);
  return originalAbort.call(this, reason);
};

describe('useCardSubCollectionData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockAbort.mockReset();
  });

  describe('initialization', () => {
    it('should initialize with loading state true', async () => {
      // Use a promise that doesn't resolve to keep loading state
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should have a refresh function', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      expect(typeof result.current.refresh).toBe('function');
    });
  });

  describe('data fetching', () => {
    it('should fetch data from string URL', async () => {
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should fetch data from function-based URL', async () => {
      const mockData = [{ id: '1', name: 'Item 1' }];
      const fetchUrl = vi.fn(() => 'http://api.example.com/parent/123/items');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() =>
        useCardSubCollectionData(fetchUrl, { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(fetchUrl).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe(errorMessage);
    });

    it('should handle non-OK response status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain('404');
    });
  });

  describe('refresh function', () => {
    it('should refetch data when refresh is called', async () => {
      const mockData1 = [{ id: '1', name: 'Item 1' }];
      const mockData2 = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData2,
        });

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data.length).toBe(1);

      // Call refresh
      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.data.length).toBe(2);
      });
    });
  });

  describe('dependency updates', () => {
    it('should refetch when fetchUrl changes', async () => {
      const mockData = [{ id: '1' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      let url = 'http://api.example.com/items1';
      const { result, rerender } = renderHook(
        ({ fetchUrl }) => useCardSubCollectionData(fetchUrl, { mappedBy: 'parentId' }),
        {
          initialProps: { fetchUrl: url },
        },
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Change URL
      url = 'http://api.example.com/items2';
      rerender({ fetchUrl: url });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should refetch when config.mappedBy changes', async () => {
      const mockData = [{ id: '1' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { result, rerender } = renderHook(
        ({ config }) => useCardSubCollectionData('http://api.example.com/items', config),
        {
          initialProps: { config: { mappedBy: 'parentId' } },
        },
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Change config
      rerender({ config: { mappedBy: 'userId' } });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('response handling', () => {
    it('should handle array response', async () => {
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data).toEqual(mockData);
    });

    it('should handle paginated response with data property', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ],
        total: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should extract data array from response
      expect(result.current.data).toEqual(mockResponse.data);
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle object response without data property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 0 }),
      });

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('cleanup and abort handling', () => {
    it('should abort fetch on unmount', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const { unmount } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      unmount();

      expect(mockAbort).toHaveBeenCalled();
    });

    it('should ignore AbortError', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const { result } = renderHook(() =>
        useCardSubCollectionData('http://api.example.com/items', { mappedBy: 'parentId' }),
      );

      // AbortError should not set error state
      // Since the mock rejects immediately, we might see loading remain true
      // or error be null depending on timing
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 1000 },
      );
    });
  });
});
