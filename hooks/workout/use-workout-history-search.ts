import { useMemo } from 'react';

import type { FilterChipId } from '~/components/workout/workout-history-filter-chips';
import { useExercises, useWorkouts, usePersonalRecords } from '~/hooks/data';
import { useWorkoutHistory } from '~/hooks/data/use-workout-history';

export interface UseWorkoutHistorySearchProps {
  searchQuery?: string;
  selectedFilters?: FilterChipId[];
  customDateRange?: { startDate: Date; endDate: Date } | null;
}

export function useWorkoutHistorySearch({
  searchQuery = '',
  selectedFilters = [],
  customDateRange = null,
}: UseWorkoutHistorySearchProps) {
  const { workoutHistory, isLoading } = useWorkoutHistory();
  const { exercises } = useExercises();
  const { workouts } = useWorkouts();
  const { personalRecords } = usePersonalRecords();

  // Filter workout history based on search query and selected filters
  const filteredWorkoutHistory = useMemo(() => {
    let filtered = [...workoutHistory];

    // Apply search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      filtered = filtered.filter((historyEntry) => {
        // Search in workout name (preserved name or template name)
        const workoutName = historyEntry.workoutName || historyEntry.customName || '';
        if (workoutName.toLowerCase().includes(query)) {
          return true;
        }

        // Search in current workout template name (if it still exists)
        if (historyEntry.workoutId && !historyEntry.workoutId.startsWith('quick-')) {
          const currentWorkout = workouts.find((w) => w.id === historyEntry.workoutId);
          if (currentWorkout && currentWorkout.title.toLowerCase().includes(query)) {
            return true;
          }
        }

        // Search in exercise names within the workout
        const hasMatchingExercise = historyEntry.exercises.some((exerciseData) => {
          const exercise = exercises.find((ex) => ex.id === exerciseData.exerciseId);
          return exercise && exercise.name.toLowerCase().includes(query);
        });

        if (hasMatchingExercise) {
          return true;
        }

        // Search for "quick workout" or "quick" keyword
        if (query.includes('quick') && historyEntry.workoutId.startsWith('quick-')) {
          return true;
        }

        // Notes search removed - not available in WorkoutHistory type

        return false;
      });
    }

    // Apply filter chips
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((historyEntry) => {
        const workoutDate = new Date(historyEntry.date);
        const today = new Date();

        return selectedFilters.every((filterId) => {
          switch (filterId) {
            // Date filters
            case 'this-week': {
              const startOfWeek = new Date(today);
              const dayOfWeek = today.getDay();
              startOfWeek.setDate(today.getDate() - dayOfWeek);
              startOfWeek.setHours(0, 0, 0, 0);
              return workoutDate >= startOfWeek;
            }
            case 'last-7-days': {
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(today.getDate() - 7);
              sevenDaysAgo.setHours(0, 0, 0, 0);
              return workoutDate >= sevenDaysAgo;
            }
            case 'this-month': {
              return (
                workoutDate.getMonth() === today.getMonth() &&
                workoutDate.getFullYear() === today.getFullYear()
              );
            }
            // Duration filters
            case 'short': {
              return historyEntry.duration < 30 * 60; // Less than 30 minutes
            }
            case 'long': {
              return historyEntry.duration > 60 * 60; // More than 60 minutes
            }

            // Premium filters
            case 'custom-date-range': {
              if (!customDateRange) return true;
              const startDate = new Date(customDateRange.startDate);
              const endDate = new Date(customDateRange.endDate);
              // Set to end of day for end date
              endDate.setHours(23, 59, 59, 999);
              return workoutDate >= startDate && workoutDate <= endDate;
            }
            case 'prs-only': {
              return personalRecords.some((pr) => pr.workoutHistoryId === historyEntry.id);
            }

            default:
              return true;
          }
        });
      });
    }

    return filtered;
  }, [
    workoutHistory,
    searchQuery,
    selectedFilters,
    customDateRange,
    exercises,
    workouts,
    personalRecords,
  ]);

  // Get search suggestions based on current query
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const suggestions = new Set<string>();

    // Add matching exercise names
    exercises.forEach((exercise) => {
      if (exercise.name.toLowerCase().includes(query) && suggestions.size < 5) {
        suggestions.add(exercise.name);
      }
    });

    // Add matching workout template names
    workouts.forEach((workout) => {
      if (workout.title.toLowerCase().includes(query) && suggestions.size < 5) {
        suggestions.add(workout.title);
      }
    });

    return Array.from(suggestions);
  }, [searchQuery, exercises, workouts]);

  // Get search stats
  const searchStats = useMemo(() => {
    const totalVisible = workoutHistory.length;
    const matchingResults = filteredWorkoutHistory.length;
    const hasActiveSearch = searchQuery.trim().length > 0;
    const hasActiveFilters = selectedFilters.length > 0;
    const hasActiveSearchOrFilter = hasActiveSearch || hasActiveFilters;

    // When searching/filtering, calculate how many are hidden from the filtered results
    const hiddenCount = hasActiveSearchOrFilter ? totalVisible - matchingResults : 0;

    return {
      totalVisible,
      matchingResults,
      hasActiveSearch,
      hasActiveFilters,
      hasActiveSearchOrFilter,
      showingAll: !hasActiveSearchOrFilter,
      hiddenCount,
    };
  }, [workoutHistory.length, filteredWorkoutHistory.length, searchQuery, selectedFilters.length]);

  return {
    workoutHistory: filteredWorkoutHistory,
    isLoading,
    searchSuggestions,
    searchStats,
  };
}
