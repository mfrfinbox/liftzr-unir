/**
 * Modal Management Hook
 * Handles modal interactions and result processing for workout details screen
 */

import { useCallback } from 'react';

import { useFocusEffect, useRouter } from 'expo-router';

import {
  getExercisesReorderedFlag,
  getExerciseReorderResult,
  clearExercisesReorderedFlag,
  clearExerciseReorderResult,
} from '~/lib/utils/reorder-exercises';

import type { UseModalManagementProps } from './types';

export function useModalManagement({
  exercisesWithDetails,
  workout,
  workoutName,
  isModalInteractionInProgress,
  hasProcessedModalResult,
  reorderRegularWorkoutExercises,
  refreshWorkoutData,
  setRefreshKey,
}: UseModalManagementProps) {
  const router = useRouter();
  const isDatabaseLoaded = true;

  /**
   * Open the reorder exercises modal
   */
  const handleOpenReorderModal = useCallback(() => {
    // Prevent opening modal if interaction is in progress or database not loaded
    if (isModalInteractionInProgress.current || !isDatabaseLoaded) return;

    isModalInteractionInProgress.current = true;

    // Navigate to reorder modal with exercises data
    router.push({
      pathname: '/(app)/(modals)/reorder-exercises',
      params: {
        exercises: JSON.stringify(exercisesWithDetails),
        workoutId: workout?.id || '',
        workoutName: workoutName || '',
      },
    });
  }, [
    isModalInteractionInProgress,
    isDatabaseLoaded,
    router,
    exercisesWithDetails,
    workout?.id,
    workoutName,
  ]);

  /**
   * Open the replace exercise modal for a specific exercise
   */
  const handleReplaceExercise = useCallback(
    (exerciseIndex: number) => {
      // Check if modal interaction is already in progress
      if (isModalInteractionInProgress.current) {
        return;
      }

      const exercise = exercisesWithDetails[exerciseIndex];
      if (!exercise) {
        return;
      }

      isModalInteractionInProgress.current = true;
      hasProcessedModalResult.current = false; // Reset the flag when opening modal

      // Get all exercise IDs in the current workout to exclude from replacement options
      const currentWorkoutExerciseIds = exercisesWithDetails.map((ex) => ex.details.id);

      // Navigate to replace exercise modal
      router.push({
        pathname: '/(app)/(modals)/replace-exercise',
        params: {
          exerciseId: exercise.id,
          exerciseIndex: exerciseIndex.toString(),
          exerciseName: exercise.details.name,
          primaryMuscleGroup: exercise.details.primaryMuscleGroup || '',
          secondaryMuscleGroups: JSON.stringify(exercise.details.secondaryMuscleGroups || []),
          exerciseType: exercise.details.type,
          isActiveWorkout: 'false', // This is workout details, not active workout
          hasCompletedSets: 'false', // Workout details shouldn't have completed sets
          currentWorkoutExerciseIds: JSON.stringify(currentWorkoutExerciseIds),
        },
      });
    },
    [router, exercisesWithDetails, isModalInteractionInProgress, hasProcessedModalResult]
  );

  /**
   * Process results from modals when screen regains focus
   */
  const handleModalResults = useCallback(() => {
    // Only process modal results if we were in a modal interaction
    // This prevents blocking normal change detection
    if (!isModalInteractionInProgress.current) {
      return;
    }

    // If we already processed results from THIS modal interaction, skip
    if (hasProcessedModalResult.current) {
      return;
    }

    // Check if exercises were reordered BEFORE clearing flags
    const wasReordered = getExercisesReorderedFlag();

    // Check for exercise reorder result BEFORE clearing flags
    let didReorder = false;
    try {
      const reorderResult = getExerciseReorderResult();

      if (reorderResult) {
        didReorder = true;
        // Apply the reordered exercises to local state only
        reorderRegularWorkoutExercises(reorderResult.exercises);
        clearExerciseReorderResult();
      }
    } catch (_error) {}

    // Clear flags AFTER processing results
    if (wasReordered) {
      clearExercisesReorderedFlag();
    }
    hasProcessedModalResult.current = true;
    isModalInteractionInProgress.current = false;

    // If exercises were reordered but we handled it locally, don't do a full refresh
    if (wasReordered && !didReorder) {
      // Only do full refresh if we didn't handle the reorder locally
      // This covers cases where the old reorder mechanism was used
      setRefreshKey((prev) => prev + 1);
    }

    // DON'T refresh if we handled a reorder locally
    // as this would overwrite the local changes and reset hasChanges to false
    if (refreshWorkoutData && !didReorder) {
      refreshWorkoutData();
    }
  }, [
    isModalInteractionInProgress,
    hasProcessedModalResult,
    reorderRegularWorkoutExercises,
    refreshWorkoutData,
    setRefreshKey,
  ]);

  // Process modal results when screen regains focus
  useFocusEffect(
    useCallback(() => {
      // Reset the processed flag when screen gains focus
      // This ensures we can process new modal results
      hasProcessedModalResult.current = false;
      handleModalResults();
    }, [handleModalResults])
  );

  return {
    handleOpenReorderModal,
    handleReplaceExercise,
    isDatabaseLoaded,
  };
}
