import { useMemo, useCallback, useState } from 'react';

import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Screen } from '~/components/layout/screen';
import { PRDetailsModal } from '~/components/ui/pr-details-modal';
import { WorkoutHistoryList } from '~/components/workout/workout-history-list';
import {
  formatDate,
  formatTime,
  formatDuration,
  formatTimeValue,
  getExerciseType,
  getExerciseName,
} from '~/components/workout-history/format-helpers';
import { ListEmpty } from '~/components/workout-history/list-empty';
import { ListHeader } from '~/components/workout-history/list-header';
import { useFilterState } from '~/components/workout-history/use-filter-state';
import { usePRModal } from '~/components/workout-history/use-pr-modal';
import { useViewMode } from '~/components/workout-history/use-view-mode';
import { useWorkoutMaps } from '~/components/workout-history/use-workout-maps';
import { useExercises, usePersonalRecords, useWorkouts } from '~/hooks/data';
import { useDeleteWorkoutHistory } from '~/hooks/data/use-delete-workout-history';
import { useWorkoutHistorySearch } from '~/hooks/workout/use-workout-history-search';
import { NUMBER_FORMATTING } from '~/lib/constants';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';

export default function WorkoutHistoryScreen() {
  const { i18n } = useTranslation();
  const { displayWeight, unit } = useMeasurement();

  // Database hooks
  const { exercises } = useExercises();
  const { workouts } = useWorkouts();
  const { personalRecords } = usePersonalRecords();

  // Custom hooks
  const filterState = useFilterState();
  const viewModeState = useViewMode();
  const prModalState = usePRModal();

  // Selection mode state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete history hook
  const { bulkDeleteHistory } = useDeleteWorkoutHistory();

  // Use search hook for filtered workout history
  const { workoutHistory, searchStats } = useWorkoutHistorySearch({
    searchQuery: filterState.searchQuery,
    selectedFilters: filterState.selectedFilters,
    customDateRange: filterState.customDateRange,
  });

  // Workout mapping hook
  const { renderWorkoutName } = useWorkoutMaps({ workouts, workoutHistory });

  // Guard against undefined searchStats during initial load
  const safeSearchStats = useMemo(
    () => ({
      hasActiveSearchOrFilter: searchStats?.hasActiveSearchOrFilter ?? false,
      matchingResults: searchStats?.matchingResults ?? 0,
      totalVisible: searchStats?.totalVisible ?? 0,
      hiddenCount: searchStats?.hiddenCount ?? 0,
    }),
    [searchStats]
  );

  // Track total workouts before search for UI display logic
  const totalWorkoutsBeforeSearch = safeSearchStats.totalVisible;

  // Create format function wrappers with locale
  const formatDateWithLocale = useCallback(
    (dateString: string) => formatDate(dateString, i18n.language),
    [i18n.language]
  );

  const formatTimeWithLocale = useCallback(
    (dateString: string) => formatTime(dateString, i18n.language),
    [i18n.language]
  );

  const getExerciseTypeWrapper = useCallback(
    (exerciseId: string) => getExerciseType(exerciseId, exercises),
    [exercises]
  );

  const getExerciseNameWrapper = useCallback(
    (exerciseId: string) => getExerciseName(exerciseId, exercises),
    [exercises]
  );

  // All-time stats
  const totalWorkouts = workoutHistory.length;

  // Selection mode handlers
  const handleSelectModeToggle = useCallback(() => {
    setIsSelectMode((prev) => {
      // Clear selections when exiting select mode
      if (prev) {
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  const handleToggleSelection = useCallback((itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === workoutHistory.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(workoutHistory.map((w) => w.id)));
    }
  }, [selectedIds.size, workoutHistory]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const result = await bulkDeleteHistory(Array.from(selectedIds));

    if (result.success) {
      setSelectedIds(new Set());
      setIsSelectMode(false);
    }
  }, [selectedIds, bulkDeleteHistory]);

  // Create ListHeader component with all the header content
  const ListHeaderComponent = useMemo(
    () => (
      <ListHeader
        totalWorkouts={totalWorkouts}
        totalWorkoutsBeforeSearch={totalWorkoutsBeforeSearch}
        searchQuery={filterState.searchQuery}
        setSearchQuery={filterState.setSearchQuery}
        selectedFilters={filterState.selectedFilters}
        setSelectedFilters={filterState.setSelectedFilters}
        showFilters={filterState.showFilters}
        setShowFilters={filterState.setShowFilters}
        viewMode={viewModeState.viewMode}
        setViewMode={viewModeState.setViewMode}
        customDateRange={filterState.customDateRange}
        handleFilterToggle={filterState.handleFilterToggle}
        handleCustomDateRangeSelect={filterState.handleCustomDateRangeSelect}
        searchStatsHasActive={safeSearchStats.hasActiveSearchOrFilter}
        searchStatsMatchingResults={safeSearchStats.matchingResults}
        searchStatsTotalVisible={safeSearchStats.totalVisible}
        searchStatsHiddenCount={safeSearchStats.hiddenCount}
        workoutHistoryLength={workoutHistory.length}
        isSelectMode={isSelectMode}
        onSelectModeToggle={handleSelectModeToggle}
        selectedCount={selectedIds.size}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
      />
    ),
    [
      totalWorkouts,
      totalWorkoutsBeforeSearch,
      filterState,
      viewModeState,
      safeSearchStats,
      workoutHistory.length,
      isSelectMode,
      handleSelectModeToggle,
      selectedIds.size,
      handleSelectAll,
      handleDeleteSelected,
    ]
  );

  // Create ListEmpty component
  const ListEmptyComponent = useMemo(
    () =>
      workoutHistory.length === 0 ? (
        <ListEmpty hasActiveSearchOrFilter={safeSearchStats.hasActiveSearchOrFilter} />
      ) : null,
    [workoutHistory.length, safeSearchStats.hasActiveSearchOrFilter]
  );

  return (
    <Screen scrollable={false} withTabBarPadding={false}>
      <View className="flex-1">
        <WorkoutHistoryList
          workoutHistory={workoutHistory}
          personalRecords={personalRecords}
          formatDate={formatDateWithLocale}
          formatTime={formatTimeWithLocale}
          formatDuration={formatDuration}
          renderWorkoutName={renderWorkoutName}
          getExerciseName={getExerciseNameWrapper}
          getExerciseType={getExerciseTypeWrapper}
          formatTimeValue={formatTimeValue}
          displayWeight={displayWeight}
          unit={unit}
          onPRPress={prModalState.handlePRPress}
          NUMBER_FORMATTING={NUMBER_FORMATTING}
          viewMode={viewModeState.viewMode}
          expandedItems={viewModeState.expandedItems}
          onItemExpandToggle={viewModeState.handleItemExpandToggle}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          isSelectMode={isSelectMode}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
        />
      </View>

      <PRDetailsModal
        visible={prModalState.prModalVisible}
        onClose={prModalState.closePRModal}
        prs={prModalState.selectedWorkoutPRs}
      />
    </Screen>
  );
}
