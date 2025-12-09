import { useRef, useCallback, useEffect } from 'react';

import type { ExerciseWithDetails } from '~/types';

interface UseSetRemovalProps {
  exercisesWithDetails: ExerciseWithDetails[];
  timerState: any;
  currentExerciseIndex: number | null;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
  recalculatePRsAfterSetRemoval?: (exerciseIndex: number, removedSet: any) => void;
  cancelActiveTimer: () => Promise<void>;
}

export function useSetRemoval({
  exercisesWithDetails,
  timerState,
  currentExerciseIndex,
  onRemoveSet,
  recalculatePRsAfterSetRemoval,
  cancelActiveTimer,
}: UseSetRemovalProps) {
  const prRecalcTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRemoveSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      if (timerState.active && timerState.type === 'set') {
        const triggeredByThisSet =
          timerState.triggeredByExerciseIndex === exerciseIndex &&
          timerState.triggeredBySetIndex === setIndex;

        if (triggeredByThisSet) {
          cancelActiveTimer();
        }
      }

      if (
        timerState.active &&
        timerState.type === 'exercise' &&
        currentExerciseIndex === exerciseIndex
      ) {
        cancelActiveTimer();
      }

      const removedSet = exercisesWithDetails[exerciseIndex]?.setsData?.[setIndex];

      if (onRemoveSet) {
        onRemoveSet(exerciseIndex, setIndex);

        if (recalculatePRsAfterSetRemoval && removedSet?.completed) {
          if (prRecalcTimeoutRef.current) {
            clearTimeout(prRecalcTimeoutRef.current);
            prRecalcTimeoutRef.current = null;
          }

          prRecalcTimeoutRef.current = setTimeout(() => {
            recalculatePRsAfterSetRemoval(exerciseIndex, removedSet);
            prRecalcTimeoutRef.current = null;
          }, 100);
        }
      }
    },
    [
      onRemoveSet,
      timerState,
      cancelActiveTimer,
      exercisesWithDetails,
      currentExerciseIndex,
      recalculatePRsAfterSetRemoval,
    ]
  );

  useEffect(() => {
    return () => {
      if (prRecalcTimeoutRef.current) {
        clearTimeout(prRecalcTimeoutRef.current);
        prRecalcTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    handleRemoveSet,
  };
}
