/**
 * Active Workout Modals Hook
 * Handles modal interactions (replace exercise, reorder, add exercises)
 */

import { useCallback, useRef } from 'react';

import { useRouter, useFocusEffect } from 'expo-router';

import {
  getQuickWorkoutReorderResult,
  getExerciseReorderResult,
  clearQuickWorkoutReorderResult,
  clearExerciseReorderResult,
} from '~/lib/utils/reorder-exercises';
import type { ExerciseWithDetails } from '~/types';

interface UseActiveWorkoutModalsParams {
  workoutId: string | undefined;
  isQuickWorkout: boolean;
  displayWorkoutName: string | null;
  exercisesWithDetails: ExerciseWithDetails[];
  reorderRegularWorkoutExercises: (exercises: ExerciseWithDetails[]) => void;
  reorderQuickWorkoutExercises: (exercises: string[]) => void;
}

interface UseActiveWorkoutModalsReturn {
  handleReplaceExercise: (exerciseIndex: number) => void;
  handleOpenReorderModal: () => void;
  isModalInteractionInProgressRef: React.MutableRefObject<boolean>;
}

export function useActiveWorkoutModals({
  workoutId,
  isQuickWorkout,
  displayWorkoutName,
  exercisesWithDetails,
  reorderRegularWorkoutExercises,
  reorderQuickWorkoutExercises,
}: UseActiveWorkoutModalsParams): UseActiveWorkoutModalsReturn {
  const router = useRouter();
  const isModalInteractionInProgressRef = useRef(false);

  const handleReplaceExercise = useCallback(
    (exerciseIndex: number) => {
      if (isModalInteractionInProgressRef.current) return;

      isModalInteractionInProgressRef.current = true;

      const exercise = exercisesWithDetails[exerciseIndex];
      if (!exercise) {
        isModalInteractionInProgressRef.current = false;
        return;
      }

      const hasCompletedSets = exercise.setsData?.some((set) => set.completed) || false;
      const currentWorkoutExerciseIds = exercisesWithDetails.map((ex) => ex.details.id);

      router.push({
        pathname: '/(app)/(modals)/replace-exercise',
        params: {
          exerciseId: exercise.id,
          exerciseIndex: exerciseIndex.toString(),
          exerciseName: exercise.details.name,
          primaryMuscleGroup: exercise.details.primaryMuscleGroup || '',
          secondaryMuscleGroups: JSON.stringify(exercise.details.secondaryMuscleGroups || []),
          exerciseType: exercise.details.type,
          isActiveWorkout: 'true',
          hasCompletedSets: hasCompletedSets ? 'true' : 'false',
          currentWorkoutExerciseIds: JSON.stringify(currentWorkoutExerciseIds),
        },
      });
    },
    [router, exercisesWithDetails]
  );

  const handleOpenReorderModal = useCallback(() => {
    if (isModalInteractionInProgressRef.current) return;

    isModalInteractionInProgressRef.current = true;

    router.push({
      pathname: '/(app)/(modals)/reorder-exercises',
      params: {
        exercises: JSON.stringify(exercisesWithDetails),
        workoutId: workoutId || '',
        workoutName: displayWorkoutName || '',
      },
    });
  }, [router, exercisesWithDetails, workoutId, displayWorkoutName]);

  // Handle navigation result from modals
  useFocusEffect(
    useCallback(() => {
      if (!isModalInteractionInProgressRef.current) {
        return;
      }

      // Handle regular workout reorder
      try {
        const reorderResult = getExerciseReorderResult();
        if (reorderResult && !isQuickWorkout && workoutId) {
          reorderRegularWorkoutExercises(reorderResult.exercises);
          clearExerciseReorderResult();
        }
      } catch (error) {
        console.error('[useActiveWorkoutModals] Failed to process reorder result:', error);
      }

      // Handle quick workout reorder
      try {
        const quickReorderResult = getQuickWorkoutReorderResult();
        if (quickReorderResult && isQuickWorkout) {
          reorderQuickWorkoutExercises(quickReorderResult);
          clearQuickWorkoutReorderResult();
        }
      } catch (error) {
        console.error('[useActiveWorkoutModals] Failed to process quick reorder result:', error);
      }

      isModalInteractionInProgressRef.current = false;
    }, [isQuickWorkout, workoutId, reorderRegularWorkoutExercises, reorderQuickWorkoutExercises])
  );

  return {
    handleReplaceExercise,
    handleOpenReorderModal,
    isModalInteractionInProgressRef,
  };
}
