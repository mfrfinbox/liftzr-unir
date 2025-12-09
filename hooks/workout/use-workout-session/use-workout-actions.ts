import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useRouter } from 'expo-router';

interface UseWorkoutActionsProps {
  workoutId: string;
  hasChanges: boolean;
  isEditingName: boolean;
  saveWorkout: () => Promise<void>;
}

export function useWorkoutActions({
  workoutId,
  hasChanges,
  isEditingName,
  saveWorkout,
}: UseWorkoutActionsProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    if (hasChanges && !isEditingName) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save',
            style: 'default',
            onPress: async () => {
              await saveWorkout();
              router.back();
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      router.back();
    }
  }, [hasChanges, isEditingName, saveWorkout, router]);

  const handleStartWorkout = useCallback(() => {
    router.push({
      pathname: '/active-workout',
      params: { workoutId },
    });
  }, [router, workoutId]);

  return {
    handleClose,
    handleStartWorkout,
  };
}
