import { useCallback } from 'react';

import type { ExerciseWithDetails } from '~/types';

import { useWorkoutActions } from './use-workout-actions';
import { useWorkoutFinish } from './use-workout-finish';
import { useWorkoutSave } from './use-workout-save';

import type { UseWorkoutSessionProps } from './types';

export function useWorkoutSession({
  workout,
  workoutId,
  workoutName,
  exercisesWithDetails,
  sessionAchievedPRs,
  setSessionAchievedPRs,
  setSessionNotifiedPRs,
  hasChanges,
  setHasChanges,
  isEditingName,
  setIsEditingName,
}: UseWorkoutSessionProps) {
  const { saveWorkout, originalDataRef } = useWorkoutSave({
    workoutId,
    workoutName,
    exercisesWithDetails,
    setHasChanges,
  });

  const { handleClose, handleStartWorkout } = useWorkoutActions({
    workoutId,
    hasChanges,
    isEditingName,
    saveWorkout,
  });

  const { handleFinishWorkout } = useWorkoutFinish({
    workout,
    exercisesWithDetails,
    workoutName,
    sessionAchievedPRs,
    setSessionAchievedPRs,
    setSessionNotifiedPRs,
  });

  const handleEndEditingName = useCallback(() => {
    setIsEditingName(false);
    if (
      originalDataRef.current &&
      workoutName !== originalDataRef.current.name &&
      workoutId !== 'quick'
    ) {
      saveWorkout();
    }
  }, [workoutName, saveWorkout, workoutId, setIsEditingName, originalDataRef]);

  const refreshWorkoutData = useCallback(() => {
    if (workoutId === 'quick') {
      return;
    }

    setHasChanges(false);

    if ((globalThis as any).clearInitializedWorkoutRef) {
      (globalThis as any).clearInitializedWorkoutRef(workoutId);
    }

    if (workout && exercisesWithDetails) {
      originalDataRef.current = {
        name: workoutName,
        exercises: JSON.parse(
          JSON.stringify(
            exercisesWithDetails.map((ex: ExerciseWithDetails) => ({
              ...ex,
              setsData: ex.setsData?.map((set) => {
                const { completed, ...templateSet } = set;
                return templateSet;
              }),
            }))
          )
        ),
      };
    }
  }, [workoutId, workout, workoutName, exercisesWithDetails, setHasChanges, originalDataRef]);

  return {
    saveWorkout,
    handleClose,
    handleStartWorkout,
    handleEndEditingName,
    handleFinishWorkout,
    refreshWorkoutData,
  };
}
