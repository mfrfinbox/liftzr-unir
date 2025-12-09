/**
 * View Mode Hook
 * Manages view mode and expanded items state for workout history
 */

import { useState, useCallback } from 'react';

import type { ViewMode } from '~/types';

import type { UseViewModeReturn } from './types';

/**
 * Hook to manage view mode and expanded items
 */
export function useViewMode(): UseViewModeReturn {
  const [viewMode, setViewMode] = useState<ViewMode>('compact'); // Default to compact
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set()); // Track expanded items

  const handleItemExpandToggle = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      // Return a new Set to ensure React detects the state change
      return new Set(newSet);
    });
  }, []);

  return {
    viewMode,
    setViewMode,
    expandedItems,
    handleItemExpandToggle,
  };
}
