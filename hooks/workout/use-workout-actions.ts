import { useCallback } from 'react';

import { useRouter } from 'expo-router';

import { SimpleWorkoutPersistence, SimpleWorkoutState } from '~/lib/services/workout-persistence';
import { Workout } from '~/types';

import { inheritSortMethodForActiveWorkout } from './use-exercise-sorting';

interface UseWorkoutActionsProps {
  recoveryData: SimpleWorkoutState | null;
  setRecoveryData: (data: SimpleWorkoutState | null) => void;
  canStartOnWatch: boolean;
  startWorkoutOnWatch?: () => Promise<boolean>;
  currentSortMethod?: string;
}

export function useWorkoutActions({
  recoveryData,
  setRecoveryData,
  canStartOnWatch,
  startWorkoutOnWatch,
  currentSortMethod,
}: UseWorkoutActionsProps) {
  const router = useRouter();

  const startWorkoutWithWatchSync = useCallback(
    async (
      workoutId: string,
      workoutType: 'regular' | 'quick' = 'regular',
      currentSortMethod?: string
    ) => {
      // Auto-discard any existing backup when starting a new workout
      if (recoveryData) {
        await SimpleWorkoutPersistence.clear();
        setRecoveryData(null);
      }

      // For regular workouts, inherit the sort method from workout-details
      if (workoutType === 'regular') {
        await inheritSortMethodForActiveWorkout(currentSortMethod as any);
      }

      // Start workout on iPhone first
      router.push({
        pathname: '/(app)/(stacks)/active-workout',
        params: { workoutId },
      });

      // Try to start workout on Apple Watch if available (non-blocking)
      if (canStartOnWatch && startWorkoutOnWatch) {
        startWorkoutOnWatch().catch(() => {
          // Silent fail - user doesn't need to know
        });
      }
    },
    [recoveryData, setRecoveryData, router, canStartOnWatch, startWorkoutOnWatch]
  );

  const handleStartWorkout = useCallback(
    async (workout: Workout) => {
      await startWorkoutWithWatchSync(workout.id, 'regular', currentSortMethod);
    },
    [startWorkoutWithWatchSync, currentSortMethod]
  );

  const handleStartQuickWorkout = useCallback(async () => {
    await startWorkoutWithWatchSync('quick', 'quick');
  }, [startWorkoutWithWatchSync]);

  const handleOpenCreateWorkout = useCallback(() => {
    router.push('/(app)/(modals)/create-workout');
  }, [router]);

  const handleOpenWorkoutDetails = useCallback(
    (workout: Workout) => {
      router.push({
        pathname: '/(app)/(stacks)/workout-details',
        params: { workoutId: workout.id, workoutName: workout.title },
      });
    },
    [router]
  );

  return {
    handleStartWorkout,
    handleStartQuickWorkout,
    handleOpenCreateWorkout,
    handleOpenWorkoutDetails,
  };
}
