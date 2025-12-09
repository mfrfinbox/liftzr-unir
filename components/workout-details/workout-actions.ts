/**
 * Workout Actions
 * Handler functions for workout operations (delete, start)
 */

import { Alert } from 'react-native';

import type { Router } from 'expo-router';

import type { Workout } from '~/types';

import type { TFunction } from 'i18next';

/**
 * Handle delete workout with confirmation
 */
export function createDeleteWorkoutHandler(
  workout: Workout | null,
  workoutName: string,
  deleteWorkout: (workoutId: string) => Promise<{ success: boolean; error?: string }>,
  router: Router,
  t: TFunction
) {
  return () => {
    if (!workout) return;

    Alert.alert(
      t('workout.deleteWorkoutTitle'),
      t('workout.deleteWorkoutMessage', { workoutName }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(workout.id);
              router.replace('/(app)/(tabs)/home');
            } catch (_error) {
              Alert.alert(t('common.error'), t('workout.deleteWorkoutError'));
            }
          },
        },
      ]
    );
  };
}

/**
 * Handle start workout with confirmation
 */
export function createStartWorkoutHandler(
  workout: Workout | null,
  confirmStartNewWorkout: (onConfirm: () => void) => void,
  inheritSortMethodAndStartWorkout: () => void,
  router: Router
) {
  return () => {
    if (!workout) return;

    // Use the same confirmation flow as the home page
    confirmStartNewWorkout(() => {
      // Inherit sort method based on save state
      inheritSortMethodAndStartWorkout();

      // Start workout on iPhone
      router.push({
        pathname: '/(app)/(stacks)/active-workout',
        params: { workoutId: workout?.id || '' },
      });
    });
  };
}
