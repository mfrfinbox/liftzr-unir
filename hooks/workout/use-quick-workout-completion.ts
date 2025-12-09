/**
 * Quick Workout Completion Flow
 * Handles completion logic for quick workouts
 */

import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { useSaveQuickWorkout } from '~/hooks/data';
import { SimpleWorkoutPersistence } from '~/lib/services/workout-persistence';
import type { ExerciseWithDetails } from '~/types';

import { resetActiveWorkoutSortMethod } from './use-exercise-sorting';

interface QuickWorkoutCompletionProps {
  exercisesWithDetails: ExerciseWithDetails[];
  quickWorkoutName: string;
  elapsedTime: number;
  showWorkoutCompletionAlerts: boolean;
  isModalInteractionInProgress: React.MutableRefObject<boolean>;
  handleFinishWorkout: (
    time: number,
    name?: string,
    id?: string
  ) => Promise<{ id: string; workoutId?: string } | undefined> | void;
  setWorkoutName: (name: string) => void;
  sendFinishWorkoutToWatch?: () => void;
  safeNavigateBack: () => void;
  processAchievementsInBackground: (workoutHistoryId: string) => Promise<void>;
}

export function useQuickWorkoutCompletion(props: QuickWorkoutCompletionProps) {
  const {
    exercisesWithDetails,
    quickWorkoutName,
    elapsedTime,
    showWorkoutCompletionAlerts,
    isModalInteractionInProgress,
    handleFinishWorkout,
    setWorkoutName,
    sendFinishWorkoutToWatch,
    safeNavigateBack,
    processAchievementsInBackground,
  } = props;

  const router = useRouter();
  const { saveQuickWorkout } = useSaveQuickWorkout();

  const handleQuickWorkoutCompletion = useCallback(
    async (saveWithoutConfirmation?: boolean) => {
      if (isModalInteractionInProgress.current) return;

      if (saveWithoutConfirmation) {
        await SimpleWorkoutPersistence.clear();
        const workoutResult = await handleFinishWorkout(elapsedTime);
        await processAchievementsInBackground(workoutResult?.id || 'temp-id');
        router.replace('/(app)/(tabs)/statistics');
        return;
      }

      const hasCompletedSets = exercisesWithDetails.some((ex) =>
        ex.setsData?.some((set: any) => set.completed)
      );

      if (exercisesWithDetails.length === 0 || !hasCompletedSets) {
        await SimpleWorkoutPersistence.clear();
        await resetActiveWorkoutSortMethod();
        safeNavigateBack();
        return;
      }

      // Main confirmation: Do you want to finish this workout?
      Alert.alert('Complete Workout', 'Do you want to finish this workout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Complete',
          style: 'default',
          onPress: async () => {
            if (exercisesWithDetails.length > 0) {
              if (quickWorkoutName && quickWorkoutName !== 'Quick Workout') {
                setWorkoutName(quickWorkoutName);
              }

              if (!showWorkoutCompletionAlerts) {
                const workoutResult = await handleFinishWorkout(elapsedTime, quickWorkoutName);
                await processAchievementsInBackground(workoutResult?.id || 'temp-id');
                router.replace('/(app)/(tabs)/statistics');

                Promise.all([
                  sendFinishWorkoutToWatch?.(),
                  SimpleWorkoutPersistence.clear(),
                  resetActiveWorkoutSortMethod(),
                ]).catch(() => {
                  // Cleanup errors handled silently
                });
                return;
              }

              Alert.alert(
                'Save Workout',
                'Save this workout as a new template? (It will be recorded in your history either way)',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Just Finish',
                    style: 'default',
                    onPress: async () => {
                      const workoutResult = await handleFinishWorkout(
                        elapsedTime,
                        quickWorkoutName
                      );
                      await processAchievementsInBackground(workoutResult?.id || 'temp-id');
                      router.replace('/(app)/(tabs)/statistics');

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
                    text: 'Save as new workout',
                    style: 'default',
                    onPress: async () => {
                      try {
                        sendFinishWorkoutToWatch?.();
                        await SimpleWorkoutPersistence.clear();
                        const workoutExercises = exercisesWithDetails.map((ex) => ({
                          id: ex.details?.id || ex.id,
                          sets: typeof ex.sets === 'number' ? ex.sets : ex.setsData?.length || 0,
                          reps: ex.reps || '',
                          rest: ex.rest || 0,
                          setsData: ex.setsData || [],
                          exerciseNotes: ex.exerciseNotes || '',
                        }));
                        const result = await saveQuickWorkout(quickWorkoutName, workoutExercises);

                        if (result.success && result.workout) {
                          setWorkoutName(result.workout.title);
                          const newWorkoutId = result.workoutId || result.workout?.id;
                          const workoutResult = await handleFinishWorkout(
                            elapsedTime,
                            result.workout.title,
                            newWorkoutId
                          );
                          await processAchievementsInBackground(workoutResult?.id || 'temp-id');
                          router.replace('/(app)/(tabs)/statistics');
                        } else {
                          Alert.alert('Error', 'Failed to save workout. Please try again.');
                        }
                      } catch (_error) {
                        // Error saving workout
                      }
                    },
                  },
                ]
              );
            }
          },
        },
      ]);
    },
    [
      isModalInteractionInProgress,
      exercisesWithDetails,
      elapsedTime,
      quickWorkoutName,
      showWorkoutCompletionAlerts,
      handleFinishWorkout,
      setWorkoutName,
      sendFinishWorkoutToWatch,
      safeNavigateBack,
      saveQuickWorkout,
      router,
      processAchievementsInBackground,
    ]
  );

  return { handleQuickWorkoutCompletion };
}
