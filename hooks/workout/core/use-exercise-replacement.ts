import { useCallback } from 'react';

import { WORKOUT_FIELDS } from '~/lib/constants';
import type { Exercise, ExerciseWithDetails } from '~/types';

interface UseExerciseReplacementParams {
  exercisesWithDetails: ExerciseWithDetails[];
  setExercisesWithDetails: React.Dispatch<React.SetStateAction<ExerciseWithDetails[]>>;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  setSessionAchievedPRs: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setSessionNotifiedPRs: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export function useExerciseReplacement({
  exercisesWithDetails,
  setExercisesWithDetails,
  setHasChanges,
  setSessionAchievedPRs,
  setSessionNotifiedPRs,
}: UseExerciseReplacementParams) {
  const replaceExercise = useCallback(
    (exerciseIndex: number, newExercise: Exercise) => {
      if (!exercisesWithDetails[exerciseIndex]) return;

      setExercisesWithDetails((prev) => {
        const updated = [...prev];
        const oldExercise = updated[exerciseIndex];

        if (!oldExercise) return updated;

        const oldExerciseActualId = oldExercise.details?.id || oldExercise.id;

        // If it's the same exercise, no need to replace
        if (oldExerciseActualId === newExercise.id) {
          return updated;
        }

        // Create new sets data based on exercise type
        let newSetsData;

        // If exercise type changed or we're switching to a different exercise
        if (
          newExercise.type !== oldExercise.details.type ||
          oldExerciseActualId !== newExercise.id
        ) {
          // Create fresh sets based on the new exercise type
          newSetsData = [
            {
              reps: newExercise.type === WORKOUT_FIELDS.REPS ? '' : '0',
              weight: '',
              time: newExercise.type === WORKOUT_FIELDS.TIME ? '' : '0',
              distance: newExercise.type === WORKOUT_FIELDS.DISTANCE ? '' : '0',
              completed: false,
            },
          ];
        } else {
          // Keep existing set configuration but clear values if type changed
          newSetsData = oldExercise.setsData?.map((set) => ({
            reps: newExercise.type === oldExercise.details.type ? set.reps : '',
            weight: newExercise.type === oldExercise.details.type ? set.weight : '',
            time: newExercise.type === oldExercise.details.type ? set.time : '',
            distance: newExercise.type === oldExercise.details.type ? set.distance : '',
            completed: false, // Always reset completion status
          })) || [
            {
              reps: '',
              weight: '',
              time: '',
              distance: '',
              completed: false,
            },
          ];
        }

        // Replace the exercise while preserving workout-specific properties
        // Keep the old exercise's unique workout ID to avoid duplicate keys
        updated[exerciseIndex] = {
          ...oldExercise,
          id: oldExercise.workoutExerciseId || oldExercise.id, // Keep the unique workout exercise ID
          workoutExerciseId: oldExercise.workoutExerciseId || oldExercise.id, // Preserve unique ID
          details: newExercise,
          sets: newSetsData.length,
          reps: oldExercise.reps,
          setsData: newSetsData,
          // Keep existing rest times and notes unless they don't make sense
          exerciseNotes: '', // Clear notes as they're specific to the old exercise
        };

        // Mark as changed
        setHasChanges(true);

        return updated;
      });

      // Clear session PRs for the replaced exercise
      // This ensures that if we replace back to the same exercise, PRs can be achieved again
      const oldExerciseActualId =
        exercisesWithDetails[exerciseIndex]?.details?.id || exercisesWithDetails[exerciseIndex]?.id;
      if (oldExerciseActualId) {
        setSessionAchievedPRs((prev) => {
          const newState = { ...prev };
          delete newState[oldExerciseActualId];
          return newState;
        });

        setSessionNotifiedPRs((prev) => {
          const newState = { ...prev };
          delete newState[oldExerciseActualId];
          return newState;
        });
      }
    },
    [setHasChanges, exercisesWithDetails, setSessionAchievedPRs, setSessionNotifiedPRs]
  );

  return {
    replaceExercise,
  };
}
