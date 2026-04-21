import { useState, useCallback } from 'react';

export interface UseSubCollectionExpansionOptions {
  maxExpandedItems?: number;
  expansionMode?: 'single' | 'multiple';
  onExpand?: (id: string) => void;
  onCollapse?: (id: string) => void;
}

export interface UseSubCollectionExpansionReturn {
  expandedItems: string[];
  isExpanded: (id: string) => boolean;
  toggleExpansion: (id: string) => void;
  collapseItem: (id: string) => void;
  collapseAll: () => void;
  canExpand: boolean;
}

/**
 * Hook to manage SubCollection expansion state with FIFO auto-collapse
 *
 * @param options Configuration options
 * @returns Expansion state and control functions
 */
export function useSubCollectionExpansion(
  options: UseSubCollectionExpansionOptions = {},
): UseSubCollectionExpansionReturn {
  const { maxExpandedItems = 3, expansionMode = 'multiple', onExpand, onCollapse } = options;

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isExpanded = useCallback((id: string) => expandedItems.includes(id), [expandedItems]);

  const canExpand = expandedItems.length < maxExpandedItems;

  const toggleExpansion = useCallback(
    (id: string) => {
      setExpandedItems((prev) => {
        const isCurrentlyExpanded = prev.includes(id);

        if (isCurrentlyExpanded) {
          // Collapse
          onCollapse?.(id);
          return prev.filter((item) => item !== id);
        } else {
          // Expand
          let newExpandedItems: string[];

          if (expansionMode === 'single') {
            // Single mode: only one item expanded at a time
            newExpandedItems = [id];
          } else {
            // Multiple mode: maintain multiple expansions
            newExpandedItems = [...prev, id];

            // Enforce max expanded items with FIFO
            if (newExpandedItems.length > maxExpandedItems) {
              newExpandedItems = newExpandedItems.slice(-maxExpandedItems);
            }
          }

          // Trigger expand callback
          onExpand?.(id);
          return newExpandedItems;
        }
      });
    },
    [expansionMode, maxExpandedItems, onExpand, onCollapse],
  );

  const collapseItem = useCallback(
    (id: string) => {
      setExpandedItems((prev) => {
        if (prev.includes(id)) {
          onCollapse?.(id);
          return prev.filter((item) => item !== id);
        }
        return prev;
      });
    },
    [onCollapse],
  );

  const collapseAll = useCallback(() => {
    setExpandedItems([]);
  }, []);

  return {
    expandedItems,
    isExpanded,
    toggleExpansion,
    collapseItem,
    collapseAll,
    canExpand,
  };
}
