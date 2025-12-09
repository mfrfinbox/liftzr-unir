/**
 * Workout History Types
 * Type definitions for workout history screen components
 */

import type { FilterChipId } from '~/components/workout/workout-history-filter-chips';
import type { PersonalRecord } from '~/lib/services/pr-tracking/types';
import type { ViewMode } from '~/types';

export interface UseFilterStateReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilters: FilterChipId[];
  setSelectedFilters: (filters: FilterChipId[]) => void;
  customDateRange: { startDate: Date; endDate: Date } | null;
  setCustomDateRange: (range: { startDate: Date; endDate: Date } | null) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  handleFilterToggle: (filterId: FilterChipId) => void;
  handleCustomDateRangeSelect: (startDate: Date, endDate: Date) => void;
}

export interface UseWorkoutMapsReturn {
  workoutMap: Record<string, string>;
  getWorkoutName: (workoutId: string) => string;
  renderWorkoutName: (workoutId: string) => React.ReactNode;
}

export interface UsePRModalReturn {
  prModalVisible: boolean;
  selectedWorkoutPRs: PersonalRecord[];
  handlePRPress: (prs: PersonalRecord[]) => void;
  closePRModal: () => void;
}

export interface UseViewModeReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  expandedItems: Set<string>;
  handleItemExpandToggle: (itemId: string) => void;
}

export interface ListHeaderProps {
  totalWorkouts: number;
  totalWorkoutsBeforeSearch: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilters: FilterChipId[];
  setSelectedFilters: (filters: FilterChipId[]) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  customDateRange: { startDate: Date; endDate: Date } | null;
  handleFilterToggle: (filterId: FilterChipId) => void;
  handleCustomDateRangeSelect: (startDate: Date, endDate: Date) => void;
  searchStatsHasActive: boolean;
  searchStatsMatchingResults: number;
  searchStatsTotalVisible: number;
  searchStatsHiddenCount: number;
  workoutHistoryLength: number;
  // Selection mode props
  isSelectMode: boolean;
  onSelectModeToggle: () => void;
  selectedCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
}

export interface ListEmptyProps {
  hasActiveSearchOrFilter: boolean;
}
