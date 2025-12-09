import { useEffect } from 'react';

import { useLocalSearchParams } from 'expo-router';

import { WORKOUT_FIELDS } from '~/lib/constants';
import type { Workout, Exercise, ExerciseWithDetails } from '~/types';

interface UseWorkoutDataProcessorParams {
  workout: Workout | null;
  allExercises: Exercise[];
  setWorkoutName: React.Dispatch<React.SetStateAction<string>>;
  setExercisesWithDetails: React.Dispatch<React.SetStateAction<ExerciseWithDetails[]>>;
  initializedWorkoutsRef: React.MutableRefObject<Set<string>>;
  originalDataRef: React.MutableRefObject<{
    name: string;
    exercises: ExerciseWithDetails[];
  }>;
  refreshKey?: number;
}

export function useWorkoutDataProcessor({
  workout,
  allExercises,
  setWorkoutName,
  setExercisesWithDetails,
  initializedWorkoutsRef,
  originalDataRef,
  refreshKey = 0,
}: UseWorkoutDataProcessorParams) {
  const { recovery, created } = useLocalSearchParams<{
    recovery?: string;
    created?: string;
  }>();

  // Process workout data when workout or exercises change
  useEffect(() => {
    if (!workout || allExercises.length === 0) {
      return;
    }

    // 🚨 CRITICAL: Skip processing if we have recovery data - let recovery hook handle it
    if (recovery) {
      return;
    }

    // Check if we should update after save
    const shouldUpdateAfterSave = (globalThis as any).shouldUpdateOriginalAfterSave === true;

    // Prevent re-processing the same workout (unless refresh key changes or after save)
    // Include exercise order in the key to detect reordering
    // Use fallback to ex.exerciseId for backward compatibility with persisted items
    const exerciseOrderSignature =
      workout.exercises?.map((ex) => ex.id || (ex as any).exerciseId).join('-') || '';
    const workoutKey = `${workout.id}-${exerciseOrderSignature}-${refreshKey}`;

    if (initializedWorkoutsRef.current.has(workoutKey) && !shouldUpdateAfterSave) {
      return;
    }

    // Set workout name
    setWorkoutName(workout.title || '');

    // Process exercises with details
    if (workout.exercises && workout.exercises.length > 0) {
      const processedExercises: ExerciseWithDetails[] = workout.exercises.map(
        (workoutExercise, _index) => {
          // Find the exercise details
          let exerciseDetails = allExercises.find((ex) => ex.id === workoutExercise.id);

          // If not found and it's a custom exercise, try to match by name as fallback
          if (!exerciseDetails && workoutExercise.name && workoutExercise.isCustom) {
            exerciseDetails = allExercises.find(
              (ex) => ex.isCustom && ex.name === workoutExercise.name
            );
          }

          if (!exerciseDetails) {
            // Use existing setsData from database or create fallback
            const fallbackSetsData =
              workoutExercise.setsData ||
              Array.from(
                {
                  length: Array.isArray(workoutExercise.sets)
                    ? workoutExercise.sets.length
                    : workoutExercise.sets || 1,
                },
                () => ({
                  reps: '',
                  weight: '',
                  time: '',
                  distance: '',
                  completed: false,
                })
              );

            // Create a fallback exercise
            const fallbackStableId =
              workoutExercise.workoutExerciseId || `${workout.id}-ex-${workoutExercise.id}`;

            return {
              id: fallbackStableId,
              workoutExerciseId: fallbackStableId,
              details: {
                id: workoutExercise.id || fallbackStableId,
                name: 'Unknown Exercise',
                type: WORKOUT_FIELDS.REPS,
                isCustom: false,
                primaryMuscleGroup: null,
                secondaryMuscleGroups: [],
              },
              sets: fallbackSetsData.length,
              reps: workoutExercise.reps || '',
              rest: workoutExercise.rest || 60,
              nextExerciseRest: workoutExercise.nextExerciseRest || 120,
              exerciseNotes: '',
              setsData: fallbackSetsData,
            };
          }

          // Use existing setsData from database or create new ones
          const setsData =
            workoutExercise.setsData ||
            Array.from(
              {
                length: Array.isArray(workoutExercise.sets)
                  ? workoutExercise.sets.length
                  : workoutExercise.sets || 1,
              },
              () => ({
                reps: workoutExercise.reps || '',
                weight: '',
                time: '',
                distance: '',
                completed: false,
              })
            );

          // Calculate sets count from setsData length
          const setsCount = setsData.length;

          // Create exercise with details
          // Use stable workoutExerciseId if available, otherwise generate based on exercise ID only (no index!)
          const stableId =
            workoutExercise.workoutExerciseId || `${workout.id}-ex-${workoutExercise.id}`;

          const exerciseWithDetails: ExerciseWithDetails = {
            id: stableId, // Use stable ID that doesn't change with reordering
            workoutExerciseId: stableId,
            details: exerciseDetails,
            sets: setsCount,
            reps: workoutExercise.reps || '',
            rest: workoutExercise.rest || 60,
            nextExerciseRest: workoutExercise.nextExerciseRest || 120,
            exerciseNotes: workoutExercise.exerciseNotes || '',
            setsData,
          };

          return exerciseWithDetails;
        }
      );

      // Update state
      setExercisesWithDetails(processedExercises);

      // Store original data for change detection
      // Only update originalDataRef if it's empty (initial load), refreshKey changed, after save, or newly created
      const isNewlyCreated = created === 'true';
      const shouldUpdateOriginal =
        !originalDataRef.current.exercises ||
        originalDataRef.current.exercises.length === 0 ||
        refreshKey > 0 ||
        shouldUpdateAfterSave ||
        isNewlyCreated;

      if (shouldUpdateOriginal) {
        if (shouldUpdateAfterSave) {
          // Clear the flag immediately
          (globalThis as any).shouldUpdateOriginalAfterSave = false;
        }
        // 🔧 CRITICAL FIX: Deep copy to prevent reference mutations from breaking change detection
        originalDataRef.current = {
          name: workout.title || '',
          exercises: JSON.parse(JSON.stringify(processedExercises)),
        };
      }

      // Mark as initialized
      initializedWorkoutsRef.current.add(workoutKey);
    } else {
      // Empty workout
      setExercisesWithDetails([]);
      // 🔧 CRITICAL FIX: Deep copy for consistency
      originalDataRef.current = {
        name: workout.title || '',
        exercises: JSON.parse(JSON.stringify([])),
      };
    }
  }, [
    workout,
    allExercises,
    setWorkoutName,
    setExercisesWithDetails,
    initializedWorkoutsRef,
    originalDataRef,
    recovery,
    refreshKey,
  ]);
}
