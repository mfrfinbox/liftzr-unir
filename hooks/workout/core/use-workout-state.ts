import { useState, useEffect, useRef } from 'react';

import { useLocalSearchParams } from 'expo-router';

import { useSelector } from '@legendapp/state/react';

import { useExercises } from '~/hooks/data/use-exercises';
import { workoutsStore$ } from '~/lib/legend-state/stores/workoutsStore';
import type { Workout, ExerciseWithDetails } from '~/types';

interface UseWorkoutStateParams {
  exercisesWithDetails: ExerciseWithDetails[];
  workoutName: string;
  originalDataRef: React.MutableRefObject<{
    name: string;
    exercises: ExerciseWithDetails[];
  }>;
}

export function useWorkoutState({
  exercisesWithDetails,
  workoutName,
  originalDataRef,
}: UseWorkoutStateParams) {
  const { workoutId, recovery } = useLocalSearchParams<{
    workoutId: string;
    recovery?: string;
  }>();
  const isRecovering = !!recovery;

  // Parse recovery state to get the saved workout name if available
  const recoveredWorkoutName = recovery
    ? (() => {
        try {
          const parsed = JSON.parse(recovery);
          return parsed.workoutName;
        } catch {
          return null;
        }
      })()
    : null;

  // Data hooks
  const { exercises: allExercises } = useExercises();

  // PERFORMANCE FIX: Initialize workout state IMMEDIATELY with peek() to avoid flash of empty state
  // Then use reactive selector for updates
  const [workout, setWorkout] = useState<Workout | null>(() => {
    // Get initial workout synchronously without reactive subscription
    if (!workoutId || workoutId === 'quick') return null;
    return workoutsStore$.workouts.peek().find((w) => w.id === workoutId) || null;
  });

  // Get workout from local store (in-memory, not database)
  // Subscribe reactively for updates after initial render
  const workoutFromStore = useSelector(() => {
    if (!workoutId || workoutId === 'quick') return undefined;
    return workoutsStore$.workouts.get().find((w) => w.id === workoutId);
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Refs for preventing infinite loops and managing sync
  const initializedWorkoutsRef = useRef<Set<string>>(new Set());
  const justSavedRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track the last processed workout ID and data to prevent unnecessary re-processing
  const lastProcessedWorkoutRef = useRef<{
    id: string;
    title: string;
    exerciseCount: number;
    exerciseSignature: string;
  } | null>(null);

  // Set up global callback for save coordination
  useEffect(() => {
    (globalThis as any).workoutJustSavedCallback = () => {
      justSavedRef.current = true;
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Reset after a short delay to allow database reload to complete
      // This prevents false change detection from the data reload
      saveTimeoutRef.current = setTimeout(() => {
        justSavedRef.current = false;
      }, 100); // 100ms cooldown period
    };

    // Add callback to clear initialized ref when needed (for refresh after reordering)
    (globalThis as any).clearInitializedWorkoutRef = (id: string) => {
      // Clear ALL entries for this workout ID (since the key includes exercise order)
      const keysToDelete = Array.from(initializedWorkoutsRef.current).filter((key) =>
        key.startsWith(id)
      );
      keysToDelete.forEach((key) => {
        initializedWorkoutsRef.current.delete(key);
      });

      // Also clear the last processed workout to force re-processing
      lastProcessedWorkoutRef.current = null;
    };

    return () => {
      delete (globalThis as any).workoutJustSavedCallback;
      delete (globalThis as any).clearInitializedWorkoutRef;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle workout data from database
  useEffect(() => {
    // Handle Quick Workout initialization
    if (workoutId === 'quick') {
      if (allExercises.length > 0) {
        // Create a minimal workout object for Quick Workouts
        // Use the recovered name if available, or the current workoutName if it's been edited,
        // otherwise fall back to 'Quick Workout'
        const quickWorkoutTitle =
          recoveredWorkoutName ||
          (workoutName && workoutName !== '' ? workoutName : 'Quick Workout');

        const quickWorkout: Workout = {
          id: 'quick',
          title: quickWorkoutTitle,
          description: '',
          exercises: [],
          created: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setWorkout(quickWorkout);
      }
      return;
    }

    if (!workoutFromStore || allExercises.length === 0) return;
    if (isRecovering) {
      setWorkout(workoutFromStore);
      return;
    }

    // Check if we've already processed this exact workout data
    // Include orderIndex in signature to detect reordering changes
    const exerciseSignature =
      workoutFromStore.exercises
        ?.map((ex, index) => `${ex.id}-${ex.sets}-${ex.reps}-${ex.rest}-${ex.orderIndex ?? index}`)
        .join('|') || '';

    const currentWorkoutData = {
      id: workoutFromStore.id,
      title: workoutFromStore.title,
      exerciseCount: workoutFromStore.exercises?.length || 0,
      exerciseSignature,
    };

    const lastProcessed = lastProcessedWorkoutRef.current;
    if (
      lastProcessed &&
      lastProcessed.id === currentWorkoutData.id &&
      lastProcessed.title === currentWorkoutData.title &&
      lastProcessed.exerciseCount === currentWorkoutData.exerciseCount &&
      lastProcessed.exerciseSignature === currentWorkoutData.exerciseSignature
    ) {
      return; // Skip - already processed this exact data
    }

    lastProcessedWorkoutRef.current = currentWorkoutData;
    setWorkout(workoutFromStore);
  }, [workoutFromStore, allExercises.length, workoutId, isRecovering]);

  // Change detection logic
  useEffect(() => {
    // Allow change detection even without workout object (for active workouts)
    // But we need original data to compare against
    if (!originalDataRef.current.exercises || originalDataRef.current.exercises.length === 0) {
      return;
    }

    // CRITICAL FIX: Skip ALL change detection during post-save cooldown
    // After a successful save, the database is up-to-date and there are no unsaved changes
    // The cooldown period exists to wait for the database reload to complete
    // During this time, we should NOT detect any changes
    if (justSavedRef.current) {
      // Force hasChanges to false during cooldown - we just saved!
      setHasChanges((prev) => {
        if (prev !== false) {
          return false;
        }
        return prev;
      });
      return;
    }

    // Use a more efficient comparison to avoid race conditions
    const nameChanged = workoutName !== originalDataRef.current.name;

    // Comprehensive check for exercise changes
    const exercisesChanged = (() => {
      if (exercisesWithDetails.length !== originalDataRef.current.exercises.length) {
        return true;
      }

      // Check both order AND content changes
      for (let i = 0; i < exercisesWithDetails.length; i++) {
        const current = exercisesWithDetails[i];
        const original = originalDataRef.current.exercises[i];

        if (!original) {
          return true;
        }

        // Check if order changed (exercise IDs don't match at same position)
        if (current.id !== original.id) {
          return true;
        }

        // Check if the actual exercise was replaced (details.id changed)
        const currentExerciseId = current.details?.id;
        const originalExerciseId = original.details?.id;
        if (currentExerciseId !== originalExerciseId) {
          return true;
        }

        // Check if exercise properties changed
        if (
          current.reps !== original.reps ||
          current.rest !== original.rest ||
          current.nextExerciseRest !== original.nextExerciseRest ||
          current.exerciseNotes !== original.exerciseNotes ||
          current.setsData?.length !== original.setsData?.length
        ) {
          return true;
        }

        // Check if sets data changed
        if (current.setsData && original.setsData) {
          for (let j = 0; j < current.setsData.length; j++) {
            const currentSet = current.setsData[j];
            const originalSet = original.setsData[j];

            if (
              !originalSet ||
              currentSet.reps !== originalSet.reps ||
              currentSet.weight !== originalSet.weight ||
              currentSet.time !== originalSet.time ||
              currentSet.distance !== originalSet.distance
            ) {
              return true;
            }
          }
        }
      }

      return false;
    })();

    const hasChangesValue = nameChanged || exercisesChanged;

    // Only update hasChanges if it's actually different to prevent unnecessary re-renders
    setHasChanges((prev) => {
      if (prev !== hasChangesValue) {
        return hasChangesValue;
      }
      return prev;
    });
  }, [workoutName, exercisesWithDetails, originalDataRef]);

  return {
    workout,
    setWorkout,
    hasChanges,
    setHasChanges,
    initializedWorkoutsRef,
    justSavedRef,
    saveTimeoutRef,
    lastProcessedWorkoutRef,
  };
}
