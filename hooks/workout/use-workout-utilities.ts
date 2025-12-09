import { useCallback } from 'react';

import type { ExerciseWithDetails } from '~/types';

// import { useToastMessage } from '~/components/ui/toast-message';
// import { TOAST_DURATION } from '~/lib/constants';

interface UseWorkoutUtilitiesProps {
  exercisesWithDetails: ExerciseWithDetails[];
  setExercisesWithDetails: React.Dispatch<React.SetStateAction<ExerciseWithDetails[]>>;
  workoutId: string;
}

export function useWorkoutUtilities({
  setExercisesWithDetails,
  workoutId,
}: UseWorkoutUtilitiesProps) {
  // const { showToast } = useToastMessage();

  const updateRestTime = useCallback(
    (exerciseIndex: number, change: number) => {
      setExercisesWithDetails((prev) => {
        const updated = [...prev];
        const exercise = { ...updated[exerciseIndex] };
        const currentRest = exercise.rest || 0;
        const newRest = Math.max(0, currentRest + change);
        updated[exerciseIndex] = { ...exercise, rest: newRest };
        return updated;
      });
    },
    [setExercisesWithDetails]
  );

  const updateNextExerciseRest = useCallback(
    (exerciseIndex: number, seconds: number) => {
      setExercisesWithDetails((prev) => {
        const updated = [...prev];
        const exercise = { ...updated[exerciseIndex] };
        const newRestTime = Math.max(0, seconds);
        updated[exerciseIndex] = {
          ...exercise,
          nextExerciseRest: newRestTime,
        };
        return updated;
      });
    },
    [setExercisesWithDetails]
  );

  const toggleRest = useCallback(
    (exerciseIndex: number) => {
      setExercisesWithDetails((prev) => {
        const updated = [...prev];
        const exercise = { ...updated[exerciseIndex] };
        const newRest = exercise.rest === 0 ? 60 : 0;
        updated[exerciseIndex] = { ...exercise, rest: newRest };
        return updated;
      });
    },
    [setExercisesWithDetails]
  );

  const reorderQuickWorkoutExercises = useCallback(
    (exerciseIds: string[]) => {
      if (workoutId !== 'quick') return;
      setExercisesWithDetails((prev) => {
        const reorderedExercises: ExerciseWithDetails[] = [];
        const currentExercisesMap = new Map(prev.map((ex) => [ex.id, ex]));
        exerciseIds.forEach((id) => {
          const exercise = currentExercisesMap.get(id);
          if (exercise) {
            reorderedExercises.push(exercise);
            currentExercisesMap.delete(id);
          }
        });
        currentExercisesMap.forEach((exercise) => reorderedExercises.push(exercise));
        return reorderedExercises;
      });
    },
    [workoutId, setExercisesWithDetails]
  );

  const reorderRegularWorkoutExercises = useCallback(
    (reorderedExercises: ExerciseWithDetails[]) => {
      if (workoutId === 'quick') return;
      setExercisesWithDetails(reorderedExercises);
    },
    [workoutId, setExercisesWithDetails]
  );

  const replaceWorkoutState = useCallback(
    (newExercisesWithDetails: ExerciseWithDetails[]) => {
      setExercisesWithDetails(newExercisesWithDetails);
    },
    [setExercisesWithDetails]
  );

  const propagateSetRest = useCallback(
    (restTime: number) => {
      setExercisesWithDetails((prev) => {
        const updated = prev.map((exercise) => ({
          ...exercise,
          rest: restTime,
        }));
        return updated;
      });

      // Toast message removed - Applied set rest to all exercises
    },
    [setExercisesWithDetails]
  );

  const propagateNextRest = useCallback(
    (restTime: number) => {
      setExercisesWithDetails((prev) => {
        const updated = prev.map((exercise) => ({
          ...exercise,
          nextExerciseRest: restTime,
        }));
        return updated;
      });

      // Toast message removed - Applied next exercise rest to all exercises
    },
    [setExercisesWithDetails]
  );

  return {
    updateRestTime,
    updateNextExerciseRest,
    toggleRest,
    reorderQuickWorkoutExercises,
    reorderRegularWorkoutExercises,
    replaceWorkoutState,
    propagateSetRest,
    propagateNextRest,
  };
}
