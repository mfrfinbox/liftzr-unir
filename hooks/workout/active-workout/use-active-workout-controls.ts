/**
 * Active Workout Controls Hook
 * Handles workout control actions (pause, abandon, hide)
 */

import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { useTranslation } from 'react-i18next';

import { SimpleWorkoutPersistence } from '~/lib/services/workout-persistence';

interface UseActiveWorkoutControlsParams {
  handlePauseWorkout: (timestamp: number) => Promise<void>;
  saveWorkout: () => Promise<void>;
  hideCurrentWorkout: () => Promise<void>;
  saveNow: () => Promise<void>;
  safeNavigateBack: () => void;
}

interface UseActiveWorkoutControlsReturn {
  handleAbandonWorkout: () => Promise<void>;
  handlePauseWorkoutWithSave: () => Promise<void>;
  handleHideWorkout: () => Promise<void>;
}

export function useActiveWorkoutControls({
  handlePauseWorkout,
  saveWorkout,
  hideCurrentWorkout,
  saveNow,
  safeNavigateBack,
}: UseActiveWorkoutControlsParams): UseActiveWorkoutControlsReturn {
  const router = useRouter();
  const { t } = useTranslation();

  const handleAbandonWorkout = useCallback(async () => {
    Alert.alert(t('workout.discardWorkoutTitle'), t('workout.discardWorkoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('workout.discard'),
        style: 'destructive',
        onPress: async () => {
          await SimpleWorkoutPersistence.clear();
          safeNavigateBack();
        },
      },
    ]);
  }, [t, safeNavigateBack]);

  const handlePauseWorkoutWithSave = useCallback(async () => {
    const timestamp = Date.now();
    await handlePauseWorkout(timestamp);
    await saveWorkout();
  }, [handlePauseWorkout, saveWorkout]);

  const handleHideWorkout = useCallback(async () => {
    await saveNow();
    await hideCurrentWorkout();
    router.replace('/(app)/(tabs)/home');
  }, [saveNow, hideCurrentWorkout, router]);

  return {
    handleAbandonWorkout,
    handlePauseWorkoutWithSave,
    handleHideWorkout,
  };
}
