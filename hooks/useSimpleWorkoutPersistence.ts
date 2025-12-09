import { useCallback, useEffect, useRef } from 'react';

import { AppState } from 'react-native';

import { SimpleWorkoutPersistence, SimpleWorkoutState } from '~/lib/services/workout-persistence';

export function useSimpleWorkoutPersistence(
  workoutId: string,
  workoutName: string,
  startTime: Date,
  elapsedTime: number,
  pausedTime: number,
  isPaused: boolean,
  exercisesWithDetails: any[],
  isActive: boolean
) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create complete state from current data
  const createState = useCallback((): SimpleWorkoutState => {
    // Check if there's an existing state to preserve isHidden
    const existingState = SimpleWorkoutPersistence.restore();
    const isHidden = existingState?.isHidden || false;

    return {
      workoutId,
      workoutName,
      startTime: startTime.toISOString(),
      elapsedTime,
      pausedTime,
      isPaused,
      isHidden,
      exercises: exercisesWithDetails.map((ex) => ({
        id: ex.id,
        sets: ex.sets || 0,
        reps: ex.reps || '0',
        rest: ex.rest || 0,
        nextExerciseRest: ex.nextExerciseRest || 0,
        exerciseNotes: ex.exerciseNotes || '',
        setsData: ex.setsData || [],
        details: ex.details || {
          id: ex.id,
          name: 'Unknown Exercise',
          primaryMuscleGroup: ['other'],
          secondaryMuscleGroups: undefined,
          equipment: 'Unknown',
          difficulty: 'Beginner',
          instructions: [],
        },
      })),
      lastSaved: Date.now(),
    };
  }, [workoutId, workoutName, startTime, elapsedTime, pausedTime, isPaused, exercisesWithDetails]);

  // Debounced save (saves 5 seconds after last change to avoid immediate recovery triggers)
  const debouncedSave = useCallback(() => {
    if (!isActive || !workoutId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      await SimpleWorkoutPersistence.save(createState());
    }, 5000);
  }, [createState, isActive, workoutId]);

  // Immediate save for critical moments
  const saveNow = useCallback(async () => {
    if (!isActive || !workoutId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    await SimpleWorkoutPersistence.save(createState());
  }, [createState, isActive, workoutId]);

  // Auto-save when exercises change (debounced) - but only if there's meaningful progress
  useEffect(() => {
    if (isActive && workoutId) {
      // Only save if there are exercises with some data (not just quick workout start)
      const hasProgress = exercisesWithDetails.some(
        (ex) =>
          ex.setsData &&
          ex.setsData.length > 0 &&
          ex.setsData.some(
            (set: any) =>
              set.completed ||
              (set.weight !== null && set.weight !== undefined && set.weight !== '') ||
              (set.reps !== null && set.reps !== undefined && set.reps !== '')
          )
      );

      if (hasProgress) {
        debouncedSave();
      }
    }
  }, [exercisesWithDetails, debouncedSave, isActive, workoutId]);

  // Save immediately when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && isActive) {
        saveNow();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [saveNow, isActive]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { saveNow };
}
