/**
 * Filter State Hook
 * Manages filter state and handlers for workout history
 */

import { useState, useCallback } from 'react';

import type { FilterChipId } from '~/components/workout/workout-history-filter-chips';

import type { UseFilterStateReturn } from './types';

/**
 * Hook to manage filter state and handlers
 */
export function useFilterState(): UseFilterStateReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterChipId[]>([]);
  const [customDateRange, setCustomDateRange] = useState<{ startDate: Date; endDate: Date } | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  // Filter toggle handler
  const handleFilterToggle = useCallback((filterId: FilterChipId) => {
    setSelectedFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((id) => id !== filterId);
      }
      return [...prev, filterId];
    });
  }, []);

  // Custom date range handler
  const handleCustomDateRangeSelect = useCallback((startDate: Date, endDate: Date) => {
    setCustomDateRange({ startDate, endDate });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    customDateRange,
    setCustomDateRange,
    showFilters,
    setShowFilters,
    handleFilterToggle,
    handleCustomDateRangeSelect,
  };
}
