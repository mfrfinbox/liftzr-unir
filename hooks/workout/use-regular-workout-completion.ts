/**
 * Regular Workout Completion Flow
 * Handles completion logic for regular workouts
 */

import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { SimpleWorkoutPersistence } from '~/lib/services/workout-persistence';
import type { Workout } from '~/types';

import { resetActiveWorkoutSortMethod } from './use-exercise-sorting';

const STATISTICS_ROUTE = '/(app)/(tabs)/statistics' as const;

interface RegularWorkoutCompletionProps {
  workout: Workout | null;
  workoutId: string;
  hasChanges: boolean;
  elapsedTime: number;
  isModalInteractionInProgress: React.MutableRefObject<boolean>;
  handleFinishWorkout: (
    time: number
  ) => Promise<{ id: string; workoutId?: string } | undefined> | void;
  saveWorkout: () => void;
  sendFinishWorkoutToWatch?: () => void;
  processAchievementsInBackground: (workoutHistoryId: string) => Promise<void>;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useRegularWorkoutCompletion(props: RegularWorkoutCompletionProps) {
  const {
    workout,
    workoutId,
    hasChanges,
    elapsedTime,
    isModalInteractionInProgress,
    handleFinishWorkout,
    saveWorkout,
    sendFinishWorkoutToWatch,
    processAchievementsInBackground,
    setIsSaving,
  } = props;

  const router = useRouter();

  const handleRegularWorkoutCompletion = useCallback(
    async (saveWithoutConfirmation?: boolean) => {
      if (isModalInteractionInProgress.current) return;

      if (saveWithoutConfirmation) {
        await SimpleWorkoutPersistence.clear();
        const workoutResult = await handleFinishWorkout(elapsedTime);
        await processAchievementsInBackground(workoutResult?.id || 'temp-id');
        router.replace(STATISTICS_ROUTE);
        return;
      }

      if (!workout || workoutId === 'quick') {
        return;
      }

      // Main confirmation: Do you want to finish this workout?
      Alert.alert('Complete Workout', 'Do you want to finish this workout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Complete',
          style: 'default',
          onPress: async () => {
            // After confirming, check if there are changes to save
            if (hasChanges) {
              Alert.alert(
                'Save Changes',
                "You've made changes to this workout. Save these changes to the template?",
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'No, Just Complete',
                    style: 'default',
                    onPress: async () => {
                      setIsSaving(true);

                      const workoutResult = await handleFinishWorkout(elapsedTime);
                      await processAchievementsInBackground(workoutResult?.id || 'temp-id');

                      setIsSaving(false);
                      router.replace(STATISTICS_ROUTE);

                      Promise.all([
                        sendFinishWorkoutToWatch?.(),
                        SimpleWorkoutPersistence.clear(),
                        resetActiveWorkoutSortMethod(),
                      ]).catch(() => {
                        // Cleanup errors handled silently
                      });
                    },
                  },
                  {
                    text: 'Yes, Save Changes',
                    style: 'default',
                    onPress: async () => {
                      setIsSaving(true);

                      saveWorkout();
                      const workoutResult = await handleFinishWorkout(elapsedTime);
                      await processAchievementsInBackground(workoutResult?.id || 'temp-id');

                      setIsSaving(false);
                      router.replace(STATISTICS_ROUTE);

                      Promise.all([
                        sendFinishWorkoutToWatch?.(),
                        SimpleWorkoutPersistence.clear(),
                        resetActiveWorkoutSortMethod(),
                      ]).catch(() => {
                        // Cleanup errors handled silently
                      });
                    },
                  },
                ]
              );
            } else {
              // No changes, just complete the workout directly
              setIsSaving(true);

              const history = await handleFinishWorkout(elapsedTime);
              const historyId = history?.id || 'fallback-id';
              await processAchievementsInBackground(historyId);

              setIsSaving(false);
              router.replace(STATISTICS_ROUTE);

              Promise.all([
                sendFinishWorkoutToWatch?.(),
                SimpleWorkoutPersistence.clear(),
                resetActiveWorkoutSortMethod(),
              ]).catch(() => {
                // Cleanup errors handled silently
              });
            }
          },
        },
      ]);
    },
    [
      isModalInteractionInProgress,
      workout,
      workoutId,
      hasChanges,
      elapsedTime,
      handleFinishWorkout,
      saveWorkout,
      sendFinishWorkoutToWatch,
      processAchievementsInBackground,
      router,
    ]
  );

  return { handleRegularWorkoutCompletion };
}
