/**
 * Complete Only Handler
 * Basic completion handler for different workout scenarios
 */

import { useCallback } from 'react';

import { useRouter } from 'expo-router';

import { SimpleWorkoutPersistence } from '~/lib/services/workout-persistence';
import type { ExerciseWithDetails, Workout } from '~/types';

import { resetActiveWorkoutSortMethod } from './use-exercise-sorting';

interface CompleteOnlyProps {
  workout: Workout | null;
  workoutId: string;
  isQuickWorkout: boolean;
  quickWorkoutName: string;
  exercisesWithDetails: ExerciseWithDetails[];
  elapsedTime: number;
  hasChanges: boolean;
  showCompletionModal: boolean;
  handleFinishWorkout: (
    time: number,
    name?: string,
    id?: string
  ) => Promise<{ id: string; workoutId?: string } | undefined> | void;
  saveWorkout: () => void;
  setWorkoutName: (name: string) => void;
  sendFinishWorkoutToWatch?: () => void;
  safeNavigateBack: () => void;
  handleCloseModal: (modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  processAchievementsInBackground: (workoutHistoryId: string) => Promise<void>;
}

export function useCompleteOnly(props: CompleteOnlyProps) {
  const {
    workout,
    workoutId,
    isQuickWorkout,
    quickWorkoutName,
    exercisesWithDetails,
    elapsedTime,
    hasChanges,
    handleFinishWorkout,
    saveWorkout,
    setWorkoutName,
    sendFinishWorkoutToWatch,
    safeNavigateBack,
    processAchievementsInBackground,
  } = props;

  const router = useRouter();

  const handleCompleteOnly = useCallback(async () => {
    sendFinishWorkoutToWatch?.();
    await SimpleWorkoutPersistence.clear();
    await resetActiveWorkoutSortMethod();

    if (workout && workoutId !== 'quick') {
      if (hasChanges) {
        saveWorkout();
      }

      const workoutResult = await handleFinishWorkout(elapsedTime);

      await processAchievementsInBackground(workoutResult?.id || 'temp-id');
      router.replace('/(app)/(tabs)/statistics');
    } else if (isQuickWorkout && exercisesWithDetails.length > 0) {
      if (quickWorkoutName && quickWorkoutName !== 'Quick Workout') {
        setWorkoutName(quickWorkoutName);
      }

      const workoutResult = await handleFinishWorkout(elapsedTime);

      await processAchievementsInBackground(workoutResult?.id || 'temp-id');
      router.replace('/(app)/(tabs)/statistics');
    } else {
      safeNavigateBack();
    }
  }, [
    workout,
    workoutId,
    handleFinishWorkout,
    elapsedTime,
    router,
    isQuickWorkout,
    exercisesWithDetails,
    quickWorkoutName,
    setWorkoutName,
    sendFinishWorkoutToWatch,
    safeNavigateBack,
    hasChanges,
    saveWorkout,
    processAchievementsInBackground,
  ]);

  return { handleCompleteOnly };
}
