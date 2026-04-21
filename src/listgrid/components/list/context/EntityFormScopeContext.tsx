'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSubCollectionExpansion } from '../hooks/useSubCollectionExpansion';
import { EntityForm } from '../../../config/EntityForm';

export interface EntityFormScopeContextValue {
  // Depth information
  depth: number;
  maxInlineDepth: number;

  // Mode information
  isInlineMode: boolean;
  forceModalMode: boolean;

  // Expansion state
  expandedItems: string[];
  maxExpandedItems: number;
  expansionMode: 'single' | 'multiple';
  canExpand: boolean;

  // Expansion control
  toggleExpansion?: (id: string) => void;
  collapseItem?: (id: string) => void;
  collapseAll?: () => void;

  // Parent reference
  parentEntityForm?: EntityForm;
}

const defaultContextValue: EntityFormScopeContextValue = {
  depth: 0,
  maxInlineDepth: 1,
  isInlineMode: true,
  forceModalMode: false,
  expandedItems: [],
  maxExpandedItems: 3,
  expansionMode: 'multiple',
  canExpand: true,
};

const EntityFormScopeContext = createContext<EntityFormScopeContextValue>(defaultContextValue);

export interface EntityFormScopeProviderProps {
  children: ReactNode;
  depth?: number;
  maxInlineDepth?: number;
  maxExpandedItems?: number;
  expansionMode?: 'single' | 'multiple';
  forceModalMode?: boolean;
  parentEntityForm?: EntityForm;
}

/**
 * Provider component for EntityFormScope context
 *
 * Manages nesting depth, inline/modal mode, and expansion state
 */
export function EntityFormScopeProvider({
  children,
  depth = 0,
  maxInlineDepth,
  maxExpandedItems,
  expansionMode,
  forceModalMode = false,
  parentEntityForm,
}: EntityFormScopeProviderProps) {
  const parentScope = useContext(EntityFormScopeContext);

  // If nested, inherit some values from parent (use defaults only at root level)
  const effectiveDepth = depth;
  const effectiveMaxInlineDepth = maxInlineDepth ?? parentScope.maxInlineDepth;
  const effectiveMaxExpandedItems = maxExpandedItems ?? parentScope.maxExpandedItems;
  const effectiveExpansionMode = expansionMode ?? parentScope.expansionMode;
  const effectiveForceModalMode = forceModalMode || parentScope.forceModalMode;

  // Calculate isInlineMode based on depth and maxInlineDepth
  const isInlineMode = effectiveDepth <= effectiveMaxInlineDepth && !effectiveForceModalMode;

  // Use expansion hook for managing expanded items
  const { expandedItems, canExpand, toggleExpansion, collapseItem, collapseAll } =
    useSubCollectionExpansion({
      maxExpandedItems: effectiveMaxExpandedItems,
      expansionMode: effectiveExpansionMode,
    });

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<EntityFormScopeContextValue>(
    () => ({
      depth: effectiveDepth,
      maxInlineDepth: effectiveMaxInlineDepth,
      isInlineMode,
      forceModalMode: effectiveForceModalMode,
      expandedItems,
      maxExpandedItems: effectiveMaxExpandedItems,
      expansionMode: effectiveExpansionMode,
      canExpand,
      toggleExpansion,
      collapseItem,
      collapseAll,
      ...(parentEntityForm !== undefined ? { parentEntityForm } : {}),
    }),
    [
      effectiveDepth,
      effectiveMaxInlineDepth,
      isInlineMode,
      effectiveForceModalMode,
      expandedItems,
      effectiveMaxExpandedItems,
      effectiveExpansionMode,
      canExpand,
      toggleExpansion,
      collapseItem,
      collapseAll,
      parentEntityForm,
    ],
  );

  return (
    <EntityFormScopeContext.Provider value={value}>{children}</EntityFormScopeContext.Provider>
  );
}

/**
 * Hook to access EntityFormScope context
 *
 * @returns Current scope context value
 */
export function useEntityFormScope(): EntityFormScopeContextValue {
  const context = useContext(EntityFormScopeContext);
  return context;
}

export default EntityFormScopeContext;
