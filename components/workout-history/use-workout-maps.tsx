/**
 * Workout Maps Hook
 * Manages workout name mapping logic for workout history
 */

import { useMemo, useCallback } from 'react';

import { Text } from '~/components/ui/text';
import type { Workout, WorkoutHistory } from '~/types';

import type { UseWorkoutMapsReturn } from './types';

/**
 * Hook to manage workout mapping and name rendering
 */
export function useWorkoutMaps({
  workouts,
  workoutHistory,
}: {
  workouts: Workout[];
  workoutHistory: WorkoutHistory[];
}): UseWorkoutMapsReturn {
  // Get unique workout IDs from history for batch fetching
  const uniqueWorkoutIds = useMemo(() => {
    const ids = new Set<string>();
    workoutHistory.forEach((item) => {
      if (item.workoutId) {
        ids.add(item.workoutId);
      }
    });
    return Array.from(ids);
  }, [workoutHistory]);

  // Pre-index workouts for O(1) lookups
  const workoutsById = useMemo(() => {
    const m = new Map<string, Workout>();
    for (const w of workouts) {
      m.set(w.id, w);
    }
    return m;
  }, [workouts]);

  // Pre-index history entries by workoutId for O(1) lookups
  const historyByWorkoutId = useMemo(() => {
    const m = new Map<string, WorkoutHistory>();
    for (const h of workoutHistory) {
      if (h.workoutId && !m.has(h.workoutId)) {
        m.set(h.workoutId, h);
      }
    }
    return m;
  }, [workoutHistory]);

  // Create a map of workout data for efficient lookup
  const workoutMap = useMemo(() => {
    const map: Record<string, string> = {};

    uniqueWorkoutIds.forEach((workoutId) => {
      const historyEntry = historyByWorkoutId.get(workoutId);
      const workout = workoutsById.get(workoutId);

      // Check if this is an external workout (from HealthKit)
      const isExternalWorkout = workoutId.startsWith('healthkit-');

      // Check if this appears to be any type of quick workout
      // Quick workouts have "Quick Workout" in their name (even with suffixes like "Quick Workout 2")
      const isQuickWorkout =
        workoutId.startsWith('quick-') ||
        workoutId === 'quick' ||
        (historyEntry && historyEntry.workoutName?.startsWith('Quick Workout'));

      if (isExternalWorkout) {
        // For external workouts, use the workoutName directly (never show as deleted)
        map[workoutId] = historyEntry?.workoutName || 'External Workout';
      } else if (isQuickWorkout) {
        // For ALL quick workouts - NEVER show as deleted, regardless of whether they were saved as templates
        if (historyEntry) {
          // Use customName first (for backward compatibility), then workoutName, then fallback
          map[workoutId] = historyEntry.customName || historyEntry.workoutName || 'Quick Workout';
        } else {
          map[workoutId] = 'Quick Workout';
        }
      } else {
        // For regular workouts only (non-quick workouts)
        if (historyEntry && historyEntry.workoutName) {
          // Check if the original workout template still exists
          const isDeleted = !workout;

          // Show as deleted only for regular workouts whose templates were deleted
          map[workoutId] = isDeleted
            ? `${historyEntry.workoutName} (Deleted)`
            : historyEntry.workoutName;
        } else {
          // Fallback to current workout template (might show "Unknown Workout" if deleted)
          map[workoutId] = workout ? workout.title : 'Unknown Workout';
        }
      }
    });
    return map;
  }, [uniqueWorkoutIds, workoutsById, historyByWorkoutId]);

  // Get workout name
  const getWorkoutName = useCallback(
    (workoutId: string) => {
      return workoutMap[workoutId] || 'Unknown Workout';
    },
    [workoutMap]
  );

  // Render workout name with styled (Deleted) indicator
  const renderWorkoutName = useCallback(
    (workoutId: string) => {
      const fullName = getWorkoutName(workoutId);
      const deletedMatch = fullName.match(/^(.*?)\s*\(Deleted\)$/);

      if (deletedMatch) {
        const [, baseName] = deletedMatch;
        return (
          <>
            {baseName}{' '}
            <Text className="text-sm italic text-muted-foreground opacity-70">(Deleted)</Text>
          </>
        );
      }

      return fullName;
    },
    [getWorkoutName]
  );

  return {
    workoutMap,
    getWorkoutName,
    renderWorkoutName,
  };
}
