/**
 * Home Handlers
 * Handler factory functions for home screen actions
 */

import { Alert } from 'react-native';

import type { Workout } from '~/types';

import type { TFunction } from 'i18next';

/**
 * Create delete workout handler
 */
export function createDeleteHandler(
  selectedWorkout: Workout | null,
  closeMenu: () => void,
  deleteWorkout: (workoutId: string) => Promise<any>,
  t: TFunction
) {
  return async () => {
    if (!selectedWorkout) return;

    // Close menu first to prevent visual issues
    closeMenu();

    // Show confirmation alert with a small delay to ensure menu is closed
    setTimeout(() => {
      Alert.alert(
        t('home.deleteWorkout'),
        t('home.deleteWorkoutConfirm', { workoutTitle: selectedWorkout.title }),
        [
          {
            text: t('home.cancel'),
            style: 'cancel',
          },
          {
            text: t('home.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                // Delete workout from database
                await deleteWorkout(selectedWorkout.id);
              } catch (_error) {
                Alert.alert(t('home.error'), t('home.deleteWorkoutError'));
              }
            },
          },
        ]
      );
    }, 100);
  };
}

/**
 * Create start workout handlers with guards
 */
export function createStartWorkoutHandlers(
  confirmStartNewWorkout: (callback: () => void) => void,
  originalHandleStartWorkout: (workout: Workout) => void,
  originalHandleStartQuickWorkout: () => void
) {
  const handleStartWorkout = (workout: Workout) => {
    confirmStartNewWorkout(() => originalHandleStartWorkout(workout));
  };

  const handleStartQuickWorkout = () => {
    confirmStartNewWorkout(() => originalHandleStartQuickWorkout());
  };

  return {
    handleStartWorkout,
    handleStartQuickWorkout,
  };
}
