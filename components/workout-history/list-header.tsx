/**
 * List Header Component
 * Header UI for workout history screen
 */

import { View, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@react-navigation/native';
import { ChevronLeft, Filter, LayoutList, Rows3, CheckSquare } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { WorkoutHistoryFilterChips } from '~/components/workout/workout-history-filter-chips';
import { WorkoutHistorySearchBar } from '~/components/workout/workout-history-search-bar';

import type { ListHeaderProps } from './types';

/**
 * Header component for workout history list
 */
export function ListHeader({
  totalWorkouts,
  totalWorkoutsBeforeSearch,
  searchQuery,
  setSearchQuery,
  selectedFilters,
  setSelectedFilters,
  showFilters,
  setShowFilters,
  viewMode,
  setViewMode,
  customDateRange,
  handleFilterToggle,
  handleCustomDateRangeSelect,
  searchStatsHasActive,
  searchStatsMatchingResults,
  searchStatsTotalVisible,
  searchStatsHiddenCount,
  workoutHistoryLength,
  isSelectMode,
  onSelectModeToggle,
  selectedCount,
  onSelectAll,
  onDeleteSelected,
}: ListHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      {/* Custom Compact Header */}
      <View className="mb-3 pt-2">
        <View className="mb-2 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-2"
            testID="header-back-button">
            <ChevronLeft size={26} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground" testID="workout-history-title">
            {t('workoutHistory.title')}
          </Text>
        </View>
      </View>

      {/* Compact Stats Header */}
      <View className="mb-2 flex-row items-center justify-between" testID="workout-history-stats">
        <Text className="text-base font-medium text-foreground" testID="workout-history-period">
          {t('workoutHistory.allTimeHistory')}
        </Text>
        <Text className="text-sm text-muted-foreground" testID="workout-history-count">
          {searchStatsHasActive
            ? `${searchStatsMatchingResults} ${t('workoutHistory.of')} ${searchStatsTotalVisible}`
            : `${totalWorkouts} ${totalWorkouts === 1 ? t('workoutHistory.workout') : t('workoutHistory.workouts')}`}
        </Text>
      </View>

      {/* Search Bar and Controls - Only show if there's workout history */}
      {totalWorkoutsBeforeSearch > 0 && (
        <>
          {!isSelectMode ? (
            /* Normal Mode Controls */
            <>
              <View className="mb-2 flex-row items-center gap-2">
                <View className="flex-1">
                  <WorkoutHistorySearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('workoutHistory.searchPlaceholder')}
                  />
                </View>

                {/* View Mode Toggle */}
                <TouchableOpacity
                  onPress={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
                  className={`items-center justify-center rounded-md border border-border bg-muted px-2`}
                  style={{ height: 44 }}
                  activeOpacity={0.7}
                  testID="view-mode-toggle"
                  accessibilityLabel={`Switch to ${viewMode === 'compact' ? 'detailed' : 'compact'} view`}>
                  {viewMode === 'compact' ? (
                    <LayoutList size={18} color={colors.text} />
                  ) : (
                    <Rows3 size={18} color={colors.text} />
                  )}
                </TouchableOpacity>

                {/* Compact Filter Button */}
                <TouchableOpacity
                  onPress={() => setShowFilters(!showFilters)}
                  testID="filter-toggle-button"
                  className={`flex-row items-center rounded-md border ${
                    showFilters ? 'border-primary bg-primary/10' : 'border-border bg-muted'
                  } px-2.5`}
                  style={{ height: 44 }}
                  activeOpacity={0.7}>
                  <Filter size={16} color={showFilters ? colors.primary : colors.text} />
                  {selectedFilters.length > 0 && (
                    <View className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5">
                      <Text className="text-[10px] font-semibold text-primary-foreground">
                        {selectedFilters.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Select Button */}
                <TouchableOpacity
                  onPress={onSelectModeToggle}
                  testID="select-mode-button"
                  className="items-center justify-center rounded-md border border-border bg-muted px-2.5"
                  style={{ height: 44 }}
                  activeOpacity={0.7}
                  accessibilityLabel="Select workouts to delete">
                  <CheckSquare size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Collapsible Filter Section */}
              {showFilters && (
                <WorkoutHistoryFilterChips
                  selectedFilters={selectedFilters}
                  onFilterToggle={handleFilterToggle}
                  onCustomDateRangeSelect={handleCustomDateRangeSelect}
                  customDateRange={customDateRange}
                />
              )}
            </>
          ) : (
            /* Select Mode Controls */
            <View className="mb-2 flex-col gap-2">
              {/* Selection Actions Row */}
              <View className="flex-row items-center gap-2">
                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={onSelectModeToggle}
                  testID="cancel-select-button"
                  className="rounded-md border border-border bg-muted px-3"
                  style={{ height: 44 }}
                  activeOpacity={0.7}
                  accessibilityLabel={t('common.cancel')}>
                  <View className="flex-row items-center justify-center" style={{ height: '100%' }}>
                    <Text className="font-medium text-foreground">{t('common.cancel')}</Text>
                  </View>
                </TouchableOpacity>

                {/* Select All Button */}
                <TouchableOpacity
                  onPress={onSelectAll}
                  testID="select-all-button"
                  className="flex-1 rounded-md border border-border bg-muted px-3"
                  style={{ height: 44 }}
                  activeOpacity={0.7}
                  accessibilityLabel={
                    selectedCount === totalWorkoutsBeforeSearch ? t('workoutHistory.deselectAll') : t('workoutHistory.selectAll')
                  }>
                  <View className="flex-row items-center justify-center" style={{ height: '100%' }}>
                    <Text className="font-medium text-foreground">
                      {selectedCount === totalWorkoutsBeforeSearch ? t('workoutHistory.deselectAll') : t('workoutHistory.selectAll')}{' '}
                      ({selectedCount}/{totalWorkoutsBeforeSearch})
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Delete Button Row */}
              <TouchableOpacity
                onPress={onDeleteSelected}
                disabled={selectedCount === 0}
                testID="delete-selected-button"
                className={`flex-row items-center justify-center rounded-md py-3 ${
                  selectedCount === 0
                    ? 'bg-muted opacity-50'
                    : 'bg-destructive active:bg-destructive/90'
                }`}
                activeOpacity={0.8}>
                <Text
                  className={`font-semibold ${selectedCount === 0 ? 'text-muted-foreground' : 'text-white'}`}>
                  {selectedCount === 0
                    ? t('workoutHistory.selectWorkoutsToDelete')
                    : selectedCount === 1
                      ? t('workoutHistory.deleteWorkout', { count: selectedCount })
                      : t('workoutHistory.deleteWorkouts', { count: selectedCount })}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Results counter - compact inline with clear button - Only show in normal mode */}
      {!isSelectMode && (searchQuery || selectedFilters.length > 0) && (
        <View className="mb-2 flex-row items-center" testID="search-results-info">
          <Text className="text-xs text-muted-foreground" testID="search-results-count">
            {t('workout.searchResults', { count: workoutHistoryLength })}
            {searchStatsHiddenCount > 0 && ` (${searchStatsHiddenCount} ${t('workoutHistory.hidden')})`}
            {' • '}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedFilters([]);
            }}
            testID="clear-search-filters">
            <Text className="text-xs font-medium text-primary">{t('workoutHistory.clearAll')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
