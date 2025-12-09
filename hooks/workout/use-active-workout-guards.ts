import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { SimpleWorkoutPersistence } from '~/lib/services/workout-persistence';

export function useActiveWorkoutGuards() {
  const router = useRouter();

  // Get current active workout state from persistence (dynamic check)
  const getActiveWorkout = useCallback(() => {
    return SimpleWorkoutPersistence.restore();
  }, []);

  // Check if there's an active workout (visible or hidden) - dynamic check
  const hasActiveWorkout = useCallback(() => {
    return Boolean(getActiveWorkout());
  }, [getActiveWorkout]);

  // Check if the current active workout matches a given workout ID
  const isWorkoutCurrentlyActive = useCallback(
    (workoutId: string): boolean => {
      const activeWorkout = getActiveWorkout();
      return Boolean(activeWorkout && activeWorkout.workoutId === workoutId);
    },
    [getActiveWorkout]
  );

  // Show confirmation dialog when trying to start a new workout while one is active
  const confirmStartNewWorkout = useCallback(
    (onProceed: () => void): void => {
      const activeWorkout = getActiveWorkout();
      if (!activeWorkout) {
        onProceed();
        return;
      }

      Alert.alert(
        'Active Workout',
        `"${activeWorkout?.workoutName}" is currently in progress. Discard it to start a new workout?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard Current',
            style: 'destructive',
            onPress: () => {
              // Discard current workout and proceed with new one
              SimpleWorkoutPersistence.clear();
              onProceed();
            },
          },
        ],
        { cancelable: true }
      );
    },
    [getActiveWorkout, router]
  );

  // Check if editing a workout should be prevented
  const shouldPreventWorkoutEdit = useCallback(
    (workoutId: string): boolean => {
      return isWorkoutCurrentlyActive(workoutId);
    },
    [isWorkoutCurrentlyActive]
  );

  // Show warning when trying to edit an active workout
  const showActiveWorkoutEditWarning = useCallback(
    (workoutTitle: string): void => {
      const activeWorkout = getActiveWorkout();
      Alert.alert(
        'Workout Currently Active',
        `"${workoutTitle}" is already running in an active workout session. You can continue with the existing session or start a new one.`,
        [
          {
            text: 'OK',
            style: 'default',
          },
          {
            text: 'Show Active Workout',
            style: 'default',
            onPress: () => {
              router.push({
                pathname: '/(app)/(stacks)/active-workout',
                params: {
                  workoutId: activeWorkout?.workoutId || 'quick',
                  recovery: JSON.stringify(activeWorkout),
                },
              });
            },
          },
        ]
      );
    },
    [getActiveWorkout, router]
  );

  return {
    hasActiveWorkout,
    activeWorkout: getActiveWorkout,
    isWorkoutCurrentlyActive,
    confirmStartNewWorkout,
    shouldPreventWorkoutEdit,
    showActiveWorkoutEditWarning,
  };
}
