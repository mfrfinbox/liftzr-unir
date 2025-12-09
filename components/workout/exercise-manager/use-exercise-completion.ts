import * as Haptics from 'expo-haptics';

import type { ExerciseWithDetails } from '~/types';

interface UseExerciseCompletionProps {
  exercisesWithDetails: ExerciseWithDetails[];
  timerState: any;
  currentExerciseIndex: number | null;
  onToggleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  handleSetRestTimer: (
    exerciseName: string,
    seconds: number,
    exerciseIndex: number,
    setIndex: number
  ) => Promise<void>;
  startInterExerciseRest: (currentExIndex: number, nextExIndex: number) => Promise<void>;
  cancelActiveTimer: () => Promise<void>;
  startTimer: (
    type: 'set' | 'exercise',
    seconds: number,
    exerciseName: string,
    nextExerciseName?: string,
    exerciseIndex?: number,
    setIndex?: number
  ) => Promise<void>;
}

export function useExerciseCompletion({
  exercisesWithDetails,
  timerState,
  currentExerciseIndex,
  onToggleSetCompletion,
  handleSetRestTimer,
  startInterExerciseRest,
  cancelActiveTimer,
  startTimer,
}: UseExerciseCompletionProps) {
  const areAllSetsComplete = (exerciseIndex: number) => {
    const exercise = exercisesWithDetails[exerciseIndex];
    if (!exercise.setsData || exercise.setsData.length === 0) {
      return false;
    }
    return exercise.setsData.every((set) => set.completed);
  };

  const findNextExercise = (currentIndex: number) => {
    for (let i = currentIndex + 1; i < exercisesWithDetails.length; i++) {
      if (!areAllSetsComplete(i)) {
        return i;
      }
    }

    for (let i = 0; i < currentIndex; i++) {
      if (!areAllSetsComplete(i)) {
        return i;
      }
    }

    return null;
  };

  const handleSetCompletion = async (exerciseIndex: number, setIndex: number) => {
    if (!onToggleSetCompletion) return;

    const exercise = exercisesWithDetails[exerciseIndex];
    const currentSetData = exercise?.setsData?.[setIndex];
    const isCurrentlyCompleted = currentSetData?.completed || false;

    const isCompletingSet = !isCurrentlyCompleted;
    const isUncheckingSet = isCurrentlyCompleted;

    if (isUncheckingSet && timerState.active && timerState.type === 'set') {
      const triggeredByThisSet =
        timerState.triggeredByExerciseIndex === exerciseIndex &&
        timerState.triggeredBySetIndex === setIndex;

      if (triggeredByThisSet) {
        cancelActiveTimer();
      }
    }

    if (isUncheckingSet && timerState.active && timerState.type === 'exercise') {
      const wasExerciseComplete = exercise?.setsData?.every((set) => set.completed || false);
      const wouldMakeIncomplete = wasExerciseComplete;
      const isTimerForThisExercise = currentExerciseIndex === exerciseIndex;

      if (wouldMakeIncomplete && isTimerForThisExercise) {
        cancelActiveTimer();
      }
    }

    let wouldCompleteExercise = false;
    if (isCompletingSet && exercise?.setsData) {
      wouldCompleteExercise = exercise.setsData.every((set, idx) =>
        idx === setIndex ? true : set.completed || false
      );
    }

    onToggleSetCompletion(exerciseIndex, setIndex);

    if (isCompletingSet && !wouldCompleteExercise) {
      const exercise = exercisesWithDetails[exerciseIndex];
      const restTime = exercise?.rest || 0;

      if (restTime > 0) {
        await handleSetRestTimer(
          exercise.details?.name || 'Exercise',
          restTime,
          exerciseIndex,
          setIndex
        );
      }
    }

    if (isCompletingSet && wouldCompleteExercise) {
      const nextIndex = findNextExercise(exerciseIndex);

      if (nextIndex !== null) {
        startInterExerciseRest(exerciseIndex, nextIndex);
      } else {
        cancelActiveTimer().catch((_error) => {});

        const currentExercise = exercisesWithDetails[exerciseIndex];
        const restTime = currentExercise.rest || 60;

        await startTimer(
          'set',
          restTime,
          currentExercise.details.name,
          undefined,
          exerciseIndex,
          setIndex
        );

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  return {
    handleSetCompletion,
    areAllSetsComplete,
    findNextExercise,
  };
}
