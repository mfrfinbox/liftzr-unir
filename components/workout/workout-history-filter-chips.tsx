import React, { useState } from 'react';

import { View, Pressable } from 'react-native';

import { Text } from '~/components/ui/text';

import { CustomDateRangeModal } from './custom-date-range-modal';

export type FilterChipId =
  // Time period filters
  | 'this-week'
  | 'last-7-days'
  | 'this-month'
  | 'custom-date-range'
  // Duration filters
  | 'short'
  | 'long'
  // Content filters
  | 'prs-only';

export interface FilterChip {
  id: FilterChipId;
  label: string;
  isPremium: boolean;
}

interface WorkoutHistoryFilterChipsProps {
  selectedFilters: FilterChipId[];
  onFilterToggle: (filterId: FilterChipId) => void;
  onCustomDateRangeSelect?: (startDate: Date, endDate: Date) => void;
  customDateRange?: { startDate: Date; endDate: Date } | null;
}

// Define mutually exclusive filter groups
const FILTER_GROUPS = {
  TIME_PERIOD: ['last-7-days', 'this-week', 'this-month', 'custom-date-range'] as FilterChipId[],
  DURATION: ['short', 'long'] as FilterChipId[],
} as const;

// Helper function to check if two filters conflict
function filtersConflict(filter1: FilterChipId, filter2: FilterChipId): boolean {
  // Check if both filters are in the same mutually exclusive group
  for (const group of Object.values(FILTER_GROUPS)) {
    if (group.includes(filter1) && group.includes(filter2)) {
      return true;
    }
  }
  return false;
}

// Helper function to get conflicting filters for a given filter
function getConflictingFilters(
  filterId: FilterChipId,
  selectedFilters: FilterChipId[]
): FilterChipId[] {
  return selectedFilters.filter((selected) => filtersConflict(filterId, selected));
}

// Unified filter list with categories
const ALL_FILTERS: FilterChip[] = [
  // Time period filters
  { id: 'last-7-days', label: 'Last 7 Days', isPremium: false },
  { id: 'this-week', label: 'This Week', isPremium: false },
  { id: 'this-month', label: 'This Month', isPremium: false },
  { id: 'custom-date-range', label: 'Custom Date Range', isPremium: true },
  // Duration filters
  { id: 'short', label: 'Short (<30min)', isPremium: false },
  { id: 'long', label: 'Long (>60min)', isPremium: false },
  // Content filters
  { id: 'prs-only', label: 'PRs Only', isPremium: true },
];

export function WorkoutHistoryFilterChips({
  selectedFilters,
  onFilterToggle,
  onCustomDateRangeSelect,
  customDateRange,
}: WorkoutHistoryFilterChipsProps) {
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);

  const handleChipPress = (filter: FilterChip) => {
    // All filters are available to everyone now
    if (filter.id === 'custom-date-range') {
      // Special handling for custom date range
      setShowDateRangeModal(true);
    } else {
      // Handle mutually exclusive filters
      const conflictingFilters = getConflictingFilters(filter.id, selectedFilters);

      if (conflictingFilters.length > 0) {
        // Remove conflicting filters first, then add the new one
        conflictingFilters.forEach((f) => onFilterToggle(f)); // Remove conflicts
        if (!selectedFilters.includes(filter.id)) {
          onFilterToggle(filter.id); // Add new filter
        }
      } else {
        // Normal toggle
        onFilterToggle(filter.id);
      }
    }
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    onCustomDateRangeSelect?.(startDate, endDate);
    // Add the custom-date-range filter if not already selected
    if (!selectedFilters.includes('custom-date-range')) {
      onFilterToggle('custom-date-range');
    }
  };

  const renderFilterChip = (filter: FilterChip) => {
    const isSelected = selectedFilters.includes(filter.id);
    const isPremiumDisabled = false; // All filters available to everyone

    // Check if this filter conflicts with any currently selected filters
    const hasConflict = !isSelected && getConflictingFilters(filter.id, selectedFilters).length > 0;
    const isDisabled = isPremiumDisabled || hasConflict;

    // Custom label for date range filter when selected
    let displayLabel = filter.label;
    if (filter.id === 'custom-date-range' && isSelected && customDateRange) {
      const startStr = customDateRange.startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const endStr = customDateRange.endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      displayLabel = `${startStr} - ${endStr}`;
    }

    return (
      <Pressable
        key={filter.id}
        onPress={() => handleChipPress(filter)}
        className={`mb-1.5 mr-2 rounded-sm px-2.5 py-1 ${
          isSelected && !isDisabled
            ? 'bg-primary'
            : isDisabled
              ? 'border border-border bg-muted/30'
              : 'border border-border bg-muted'
        }`}
        testID={`filter-chip-${filter.id}`}>
        <View className="flex-row items-center">
          <Text
            className={`text-sm ${
              isSelected && !isDisabled
                ? 'font-medium text-primary-foreground'
                : isDisabled
                  ? 'text-muted-foreground/50'
                  : 'text-foreground'
            }`}>
            {displayLabel}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="pb-2">
      {/* Unified Filters - Single Section */}
      <View className="flex-row flex-wrap">{ALL_FILTERS.map(renderFilterChip)}</View>

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        visible={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        onDateRangeSelect={handleDateRangeSelect}
        initialStartDate={customDateRange?.startDate}
        initialEndDate={customDateRange?.endDate}
      />
    </View>
  );
}

// Helper function to get filter label for display
export function getFilterLabel(filterId: FilterChipId): string {
  const filter = ALL_FILTERS.find((f) => f.id === filterId);
  return filter?.label || filterId;
}
