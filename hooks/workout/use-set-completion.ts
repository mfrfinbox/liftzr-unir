import { useCallback } from 'react';

import * as Notifications from 'expo-notifications';

import { WorkoutExercise } from '~/types';

let globalActiveNotificationId: string | null = null;

interface UseSetCompletionProps {
  item: WorkoutExercise & { details: any };
  onToggleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  onSetRestTimerStart?: (
    exerciseName: string,
    seconds: number,
    exerciseIndex: number,
    setIndex: number
  ) => void;
}

export function useSetCompletion({
  item,
  onToggleSetCompletion,
  onSetRestTimerStart,
}: UseSetCompletionProps) {
  const handleSetCompletion = useCallback(
    async (exerciseIndex: number, setIndex: number, isCompleted: boolean) => {
      if (onToggleSetCompletion) {
        onToggleSetCompletion(exerciseIndex, setIndex);

        if (isCompleted) {
          const willAllSetsBeCompleted =
            item.setsData &&
            item.setsData.every((set, idx) => (idx === setIndex ? true : set.completed || false));

          if (willAllSetsBeCompleted) {
            return;
          }

          if (globalActiveNotificationId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(globalActiveNotificationId);
              globalActiveNotificationId = null;
            } catch (_error) {}
          }

          const restTime = item.rest || 0;
          if (restTime > 0) {
            try {
              if (onSetRestTimerStart) {
                onSetRestTimerStart(
                  item.details?.name || 'Exercise',
                  restTime,
                  exerciseIndex,
                  setIndex
                );
              }
            } catch (_error) {}
          }
        } else {
          // When unchecking a set, we need to check if it should cancel the timer
          // This is handled in exercise-manager.tsx handleSetCompletion
        }
      }
    },
    [item, onToggleSetCompletion, onSetRestTimerStart]
  );

  return { handleSetCompletion };
}
