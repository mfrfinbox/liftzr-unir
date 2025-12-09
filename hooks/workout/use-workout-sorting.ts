import { useState, useCallback, useEffect } from 'react';

import { MMKV } from 'react-native-mmkv';

import type { WorkoutStatsMap } from '~/hooks/data/use-workout-history';
import { Workout } from '~/types';

const storage = new MMKV({ id: 'liftzr-sorting-preferences' });

export type SortMethod =
  | 'manual'
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'completion-recent'
  | 'completion-oldest'
  | 'created-newest'
  | 'created-oldest';

interface UseWorkoutSortingProps {
  workouts: Workout[];
  workoutCompletionStats: WorkoutStatsMap;
  reorderWorkouts: (workoutIds: string[]) => Promise<{ success: boolean; error?: unknown }>;
}

const WORKOUT_SORT_METHOD_KEY = 'workoutSortMethod';

export function useWorkoutSorting({
  workouts,
  workoutCompletionStats,
  reorderWorkouts,
}: UseWorkoutSortingProps) {
  const [sortMethod, setSortMethod] = useState<SortMethod>('manual');

  // Load persisted sort method on mount
  useEffect(() => {
    try {
      const storedMethod = storage.getString(WORKOUT_SORT_METHOD_KEY);
      if (storedMethod) {
        setSortMethod(storedMethod as SortMethod);
      } else {
        // Default to manual if nothing stored
        setSortMethod('manual');
      }
    } catch (_error) {
      setSortMethod('manual');
    }
  }, []);

  const handleSortMethodChange = useCallback(
    async (method: SortMethod) => {
      setSortMethod(method);

      // Persist the sort method
      try {
        storage.set(WORKOUT_SORT_METHOD_KEY, method);
      } catch (_error) {}

      // If manual, don't reorder - let user use the drag-and-drop modal
      if (method === 'manual') {
        return;
      }

      // Calculate the new sorted order
      const sortedWorkouts = [...workouts].sort((a, b) => {
        if (method === 'alphabetical-asc') {
          return a.title.localeCompare(b.title);
        } else if (method === 'alphabetical-desc') {
          return b.title.localeCompare(a.title);
        } else if (method === 'completion-recent' || method === 'completion-oldest') {
          // Sort by last completed date
          const aStats = workoutCompletionStats[a.id];
          const bStats = workoutCompletionStats[b.id];

          // Workouts never done go to the bottom for recent, top for oldest
          if (!aStats?.lastCompleted && !bStats?.lastCompleted) return 0;
          if (!aStats?.lastCompleted) return method === 'completion-recent' ? 1 : -1;
          if (!bStats?.lastCompleted) return method === 'completion-recent' ? -1 : 1;

          // Compare dates
          const timeDiff =
            new Date(bStats.lastCompleted).getTime() - new Date(aStats.lastCompleted).getTime();
          return method === 'completion-recent' ? timeDiff : -timeDiff;
        } else if (method === 'created-newest' || method === 'created-oldest') {
          // Sort by creation date
          const aDate = new Date(a.created || 0).getTime();
          const bDate = new Date(b.created || 0).getTime();
          const timeDiff = bDate - aDate;
          return method === 'created-newest' ? timeDiff : -timeDiff;
        }
        return 0;
      });

      // Extract the workout IDs in the new order
      const sortedWorkoutIds = sortedWorkouts.map((w) => w.id);

      try {
        // Update the database with the new order
        const result = await reorderWorkouts(sortedWorkoutIds);

        if (result.success) {
        } else {
        }
      } catch (_error) {}
    },
    [workouts, workoutCompletionStats, reorderWorkouts]
  );

  return {
    sortMethod,
    setSortMethod,
    handleSortMethodChange,
  };
}
