import { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';

import { renderHook, act } from '@testing-library/react';
import {
  useSubCollectionExpansion,
  UseSubCollectionExpansionOptions,
} from './useSubCollectionExpansion';

describe('useSubCollectionExpansion', () => {
  describe('basic expansion', () => {
    it('should initialize with empty expandedItems', () => {
      const { result } = renderHook(() => useSubCollectionExpansion());
      expect(result.current.expandedItems).toEqual([]);
    });

    it('should toggle expansion of an item', () => {
      const { result } = renderHook(() => useSubCollectionExpansion());

      act(() => {
        result.current.toggleExpansion('item-1');
      });

      expect(result.current.isExpanded('item-1')).toBe(true);
      expect(result.current.expandedItems).toContain('item-1');
    });

    it('should toggle off expanded item', () => {
      const { result } = renderHook(() => useSubCollectionExpansion());

      act(() => {
        result.current.toggleExpansion('item-1');
      });

      expect(result.current.isExpanded('item-1')).toBe(true);

      act(() => {
        result.current.toggleExpansion('item-1');
      });

      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.expandedItems).not.toContain('item-1');
    });
  });

  describe('multiple expansion', () => {
    it('should allow multiple items to be expanded', () => {
      const { result } = renderHook(() => useSubCollectionExpansion());

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-2');
        result.current.toggleExpansion('item-3');
      });

      expect(result.current.expandedItems).toHaveLength(3);
      expect(result.current.isExpanded('item-1')).toBe(true);
      expect(result.current.isExpanded('item-2')).toBe(true);
      expect(result.current.isExpanded('item-3')).toBe(true);
    });

    it('should enforce maxExpandedItems limit', () => {
      const { result } = renderHook(() => useSubCollectionExpansion({ maxExpandedItems: 2 }));

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-2');
        result.current.toggleExpansion('item-3');
      });

      expect(result.current.expandedItems).toHaveLength(2);
      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(true);
      expect(result.current.isExpanded('item-3')).toBe(true);
    });

    it('should use FIFO order when removing oldest expanded item', () => {
      const { result } = renderHook(() => useSubCollectionExpansion({ maxExpandedItems: 2 }));

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-2');
      });

      expect(result.current.expandedItems).toEqual(['item-1', 'item-2']);

      act(() => {
        result.current.toggleExpansion('item-3');
      });

      expect(result.current.expandedItems).toEqual(['item-2', 'item-3']);
    });
  });

  describe('single mode', () => {
    it('should collapse previous item in single mode', () => {
      const { result } = renderHook(() => useSubCollectionExpansion({ expansionMode: 'single' }));

      act(() => {
        result.current.toggleExpansion('item-1');
      });

      expect(result.current.isExpanded('item-1')).toBe(true);

      act(() => {
        result.current.toggleExpansion('item-2');
      });

      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(true);
      expect(result.current.expandedItems).toHaveLength(1);
    });
  });

  describe('collapse operations', () => {
    it('should collapse specific item', () => {
      const { result } = renderHook(() => useSubCollectionExpansion());

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-2');
      });

      expect(result.current.expandedItems).toHaveLength(2);

      act(() => {
        result.current.collapseItem('item-1');
      });

      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(true);
      expect(result.current.expandedItems).toHaveLength(1);
    });

    it('should collapse all items', () => {
      const { result } = renderHook(() => useSubCollectionExpansion());

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-2');
        result.current.toggleExpansion('item-3');
      });

      expect(result.current.expandedItems).toHaveLength(3);

      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.expandedItems).toHaveLength(0);
      expect(result.current.isExpanded('item-1')).toBe(false);
      expect(result.current.isExpanded('item-2')).toBe(false);
      expect(result.current.isExpanded('item-3')).toBe(false);
    });
  });

  describe('canExpand flag', () => {
    it('should indicate when more items can be expanded', () => {
      const { result } = renderHook(() => useSubCollectionExpansion({ maxExpandedItems: 2 }));

      expect(result.current.canExpand).toBe(true);

      act(() => {
        result.current.toggleExpansion('item-1');
      });

      expect(result.current.canExpand).toBe(true);

      act(() => {
        result.current.toggleExpansion('item-2');
      });

      expect(result.current.canExpand).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('should call onExpand callback', () => {
      const onExpand = vi.fn();
      const { result } = renderHook(() => useSubCollectionExpansion({ onExpand }));

      act(() => {
        result.current.toggleExpansion('item-1');
      });

      expect(onExpand).toHaveBeenCalledWith('item-1');
    });

    it('should call onCollapse callback', () => {
      const onCollapse = vi.fn();
      const { result } = renderHook(() => useSubCollectionExpansion({ onCollapse }));

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-1');
      });

      expect(onCollapse).toHaveBeenCalledWith('item-1');
    });

    it('should not call callbacks on FIFO auto-collapse', () => {
      const onCollapse = vi.fn();
      const { result } = renderHook(() =>
        useSubCollectionExpansion({ maxExpandedItems: 1, onCollapse }),
      );

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-2');
      });

      // Only explicit collapseItem should trigger callback, not FIFO auto-collapse
      expect(onCollapse).not.toHaveBeenCalled();
    });
  });

  describe('default values', () => {
    it('should use default maxExpandedItems of 3', () => {
      const { result } = renderHook(() => useSubCollectionExpansion());

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-2');
        result.current.toggleExpansion('item-3');
        result.current.toggleExpansion('item-4');
      });

      expect(result.current.expandedItems).toHaveLength(3);
      expect(result.current.isExpanded('item-1')).toBe(false);
    });

    it('should use default expansionMode of multiple', () => {
      const { result } = renderHook(() => useSubCollectionExpansion());

      act(() => {
        result.current.toggleExpansion('item-1');
        result.current.toggleExpansion('item-2');
      });

      expect(result.current.expandedItems).toHaveLength(2);
    });
  });
});
