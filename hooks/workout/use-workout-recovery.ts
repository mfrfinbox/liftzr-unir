import { useState, useCallback } from 'react';

import { useRouter, useFocusEffect } from 'expo-router';

import { SimpleWorkoutPersistence, SimpleWorkoutState } from '~/lib/services/workout-persistence';
import { checkWorkoutRecovery } from '~/lib/services/WorkoutRecovery';

interface UseWorkoutRecoveryProps {
  isLoaded: boolean;
}

export function useWorkoutRecovery({ isLoaded }: UseWorkoutRecoveryProps) {
  const router = useRouter();
  const [recoveryData, setRecoveryData] = useState<SimpleWorkoutState | null>(null);

  // Check for workout recovery on app startup only (not on subsequent focuses)
  useFocusEffect(
    useCallback(() => {
      if (!isLoaded) return;
      const check = async () => {
        const recoveryWorkout = await checkWorkoutRecovery();
        setRecoveryData(recoveryWorkout);
      };
      check();
    }, [isLoaded])
  );

  const handleRecoveryResume = useCallback(() => {
    if (recoveryData) {
      router.push({
        pathname: '/(app)/(stacks)/active-workout',
        params: {
          workoutId: recoveryData.workoutId,
          recovery: JSON.stringify(recoveryData),
        },
      });
    }
  }, [recoveryData, router]);

  const handleRecoveryStartFresh = useCallback(async () => {
    // Clear iPhone state
    await SimpleWorkoutPersistence.clear();

    setRecoveryData(null);
  }, []);

  return {
    recoveryData,
    setRecoveryData,
    handleRecoveryResume,
    handleRecoveryStartFresh,
  };
}
