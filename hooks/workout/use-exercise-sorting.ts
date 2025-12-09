import { useState, useCallback, useEffect, useRef } from 'react';

import { MMKV } from 'react-native-mmkv';

import type { ExerciseWithDetails } from '~/types';

import { ExerciseSortMethod } from '../../components/workout/exercise-sort-menu';

const storage = new MMKV({ id: 'liftzr-sorting-preferences' });
const EXERCISE_SORT_METHOD_KEY = 'exerciseSortMethod';
const ACTIVE_WORKOUT_SORT_METHOD_KEY = 'activeWorkoutSortMethod';

// Utility function to reset active workout sort method only
export const resetActiveWorkoutSortMethod = () => {
  try {
    storage.set(ACTIVE_WORKOUT_SORT_METHOD_KEY, 'manual');
  } catch (_error) {}
};

// Utility function to copy sort method from workout-details to active-workout
export const inheritSortMethodForActiveWorkout = (currentSortMethod?: ExerciseSortMethod) => {
  try {
    let sortMethodToInherit = currentSortMethod;

    // If no current sort method provided, fall back to storage
    if (!sortMethodToInherit) {
      sortMethodToInherit = storage.getString(EXERCISE_SORT_METHOD_KEY) as ExerciseSortMethod;
    }

    // Always set the sort method, even if it's manual or undefined (default to manual)
    const methodToSet = sortMethodToInherit || 'manual';
    storage.set(ACTIVE_WORKOUT_SORT_METHOD_KEY, methodToSet);
  } catch (_error) {}
};

// Utility function to reset workout-details sort method to saved state
export const resetWorkoutDetailsSortMethod = (savedSortMethod: ExerciseSortMethod) => {
  try {
    storage.set(EXERCISE_SORT_METHOD_KEY, savedSortMethod);
  } catch (_error) {}
};

// Utility function to copy active workout sort method to workout-details when saving changes
export const saveActiveWorkoutSortMethodToWorkoutDetails = () => {
  try {
    const activeWorkoutSortMethod = storage.getString(ACTIVE_WORKOUT_SORT_METHOD_KEY);
    if (activeWorkoutSortMethod) {
      storage.set(EXERCISE_SORT_METHOD_KEY, activeWorkoutSortMethod);
    }
  } catch (_error) {}
};

interface UseExerciseSortingProps {
  exercises: ExerciseWithDetails[];
  onExercisesReordered: (exercises: ExerciseWithDetails[]) => void;
  context?: 'workout-details' | 'active-workout'; // Determines which storage key to use
  persistImmediately?: boolean; // If false, don't update AsyncStorage immediately (for workout-details)
}

export function useExerciseSorting({
  exercises,
  onExercisesReordered,
  context = 'workout-details',
  persistImmediately = true,
}: UseExerciseSortingProps) {
  const [sortMethod, setSortMethod] = useState<ExerciseSortMethod>('manual');
  const initialSortAppliedRef = useRef(false);

  const sortExercises = useCallback(
    (method: ExerciseSortMethod, exercisesToSort: ExerciseWithDetails[]) => {
      const sorted = [...exercisesToSort];

      switch (method) {
        case 'alphabetical-asc':
          return sorted.sort((a, b) => a.details.name.localeCompare(b.details.name));

        case 'alphabetical-desc':
          return sorted.sort((a, b) => b.details.name.localeCompare(a.details.name));

        case 'type-reps-time-distance':
          return sorted.sort((a, b) => {
            const typeOrder = { reps: 0, time: 1, distance: 2 };
            const aOrder = typeOrder[a.details.type] ?? 3;
            const bOrder = typeOrder[b.details.type] ?? 3;

            if (aOrder !== bOrder) {
              return aOrder - bOrder;
            }

            // If same type, sort alphabetically
            return a.details.name.localeCompare(b.details.name);
          });

        case 'muscle-group':
          return sorted.sort((a, b) => {
            const aMuscle = a.details.primaryMuscleGroup || 'Unknown';
            const bMuscle = b.details.primaryMuscleGroup || 'Unknown';

            if (aMuscle !== bMuscle) {
              return aMuscle.localeCompare(bMuscle);
            }

            // If same muscle group, sort alphabetically
            return a.details.name.localeCompare(b.details.name);
          });

        case 'manual':
        default:
          return sorted; // Return as-is for manual sorting
      }
    },
    []
  );

  // Load persisted sort method on mount and apply it
  useEffect(() => {
    try {
      const storageKey =
        context === 'active-workout' ? ACTIVE_WORKOUT_SORT_METHOD_KEY : EXERCISE_SORT_METHOD_KEY;
      const storedMethod = storage.getString(storageKey);
      if (storedMethod) {
        setSortMethod(storedMethod as ExerciseSortMethod);
      } else {
        // If no stored method, default to manual
        setSortMethod('manual');
      }
    } catch (_error) {}
  }, [context]);

  // Apply sort method to exercises when exercises are available and sort method is set
  useEffect(() => {
    // Only apply initial sort if:
    // 1. We haven't already applied it
    // 2. We have exercises
    // 3. The sort method is NOT manual (manual means keep existing order from database)
    if (!initialSortAppliedRef.current && exercises.length > 0) {
      initialSortAppliedRef.current = true;

      if (sortMethod !== 'manual') {
        const sortedExercises = sortExercises(sortMethod, exercises);
        onExercisesReordered(sortedExercises);
      } else {
      }
    }
  }, [exercises.length, sortMethod, sortExercises, onExercisesReordered]);

  const handleSortMethodChange = useCallback(
    (method: ExerciseSortMethod, _isQuickWorkout: boolean = false) => {
      setSortMethod(method);

      // Only persist to storage if persistImmediately is true
      // For workout-details with unsaved changes, we don't want to persist until saved
      if (persistImmediately) {
        try {
          const storageKey =
            context === 'active-workout'
              ? ACTIVE_WORKOUT_SORT_METHOD_KEY
              : EXERCISE_SORT_METHOD_KEY;
          storage.set(storageKey, method);
        } catch (_error) {}
      }

      if (method !== 'manual') {
        const sortedExercises = sortExercises(method, exercises);
        // Always call onExercisesReordered, it will handle both quick and regular workouts
        onExercisesReordered(sortedExercises);
      }
    },
    [exercises, sortExercises, onExercisesReordered, context, persistImmediately]
  );

  const resetSortMethod = useCallback(async () => {
    setSortMethod('manual');
    try {
      const storageKey =
        context === 'active-workout' ? ACTIVE_WORKOUT_SORT_METHOD_KEY : EXERCISE_SORT_METHOD_KEY;
      storage.set(storageKey, 'manual');
    } catch (_error) {}
  }, [context]);

  // Reload sort method from storage
  const reloadSortMethod = useCallback(async () => {
    try {
      const storageKey =
        context === 'active-workout' ? ACTIVE_WORKOUT_SORT_METHOD_KEY : EXERCISE_SORT_METHOD_KEY;
      const storedMethod = storage.getString(storageKey);
      if (storedMethod) {
        setSortMethod(storedMethod as ExerciseSortMethod);
      } else {
        setSortMethod('manual');
      }
    } catch (_error) {}
  }, [context]);

  return {
    sortMethod,
    handleSortMethodChange,
    resetSortMethod,
    reloadSortMethod,
  };
}
