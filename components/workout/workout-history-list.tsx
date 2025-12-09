/**
 * Workout History List Component
 * Main list container for workout history with Legend List optimization
 */

import React, { useCallback } from 'react';

import { LegendList, LegendListRenderItemProps } from '@legendapp/list';

import { WorkoutHistoryItem } from '~/components/workout-history/workout-history-item';
import type { PersonalRecord, WorkoutHistory, NumberFormattingConfig } from '~/types';

interface WorkoutHistoryListProps {
  workoutHistory: WorkoutHistory[];
  personalRecords: PersonalRecord[];
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  formatDuration: (duration: number) => string;
  renderWorkoutName: (workoutId: string) => React.ReactNode;
  getExerciseName: (exerciseId: string) => string;
  getExerciseType: (exerciseId: string) => string;
  formatTimeValue: (seconds: number) => string;
  displayWeight: (weight: number) => string;
  unit: string;
  onPRPress: (prs: PersonalRecord[]) => void;
  NUMBER_FORMATTING: NumberFormattingConfig;
  viewMode: 'compact' | 'detailed';
  expandedItems: Set<string>;
  onItemExpandToggle: (itemId: string) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  isSelectMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (itemId: string) => void;
}

export function WorkoutHistoryList({
  workoutHistory,
  personalRecords,
  formatDate,
  formatTime,
  formatDuration,
  renderWorkoutName,
  getExerciseName,
  getExerciseType,
  formatTimeValue,
  displayWeight,
  unit,
  onPRPress,
  NUMBER_FORMATTING,
  viewMode,
  expandedItems,
  onItemExpandToggle,
  ListHeaderComponent,
  ListEmptyComponent,
  isSelectMode,
  selectedIds,
  onToggleSelection,
}: WorkoutHistoryListProps) {
  // Sort workouts by date (newest first)
  const sortedWorkouts = React.useMemo(
    () =>
      [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [workoutHistory]
  );

  // Pre-index workout positions for O(1) lookup
  const workoutIndices = React.useMemo(() => {
    const indices = new Map<string, number>();
    sortedWorkouts.forEach((w, i) => indices.set(w.id, i));
    return indices;
  }, [sortedWorkouts]);

  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<WorkoutHistory>) => {
      const index = workoutIndices.get(item.id) ?? -1;
      const isSelected = selectedIds?.has(item.id) || false;

      return (
        <WorkoutHistoryItem
          key={`${item.id}-${expandedItems.has(item.id)}`}
          item={item}
          index={index}
          personalRecords={personalRecords}
          formatDate={formatDate}
          formatTime={formatTime}
          formatDuration={formatDuration}
          renderWorkoutName={renderWorkoutName}
          getExerciseName={getExerciseName}
          getExerciseType={getExerciseType}
          formatTimeValue={formatTimeValue}
          displayWeight={displayWeight}
          unit={unit}
          onPRPress={onPRPress}
          NUMBER_FORMATTING={NUMBER_FORMATTING}
          viewMode={viewMode}
          isExpanded={expandedItems.has(item.id)}
          onExpandToggle={() => onItemExpandToggle(item.id)}
          isSelectMode={isSelectMode}
          isSelected={isSelected}
          onToggleSelection={() => onToggleSelection?.(item.id)}
        />
      );
    },
    [
      workoutIndices,
      personalRecords,
      formatDate,
      formatTime,
      formatDuration,
      renderWorkoutName,
      getExerciseName,
      getExerciseType,
      formatTimeValue,
      displayWeight,
      unit,
      onPRPress,
      NUMBER_FORMATTING,
      viewMode,
      expandedItems,
      onItemExpandToggle,
      isSelectMode,
      selectedIds,
      onToggleSelection,
    ]
  );

  return (
    <LegendList
      key={`${viewMode}-${expandedItems.size}`}
      data={sortedWorkouts}
      renderItem={renderItem}
      keyExtractor={(item: WorkoutHistory) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      recycleItems={false}
      estimatedItemSize={viewMode === 'compact' ? 180 : 280}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}
