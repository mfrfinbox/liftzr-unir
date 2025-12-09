import { useState, useEffect } from 'react';

import { View, Pressable, Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { useHiddenWorkoutState } from '~/hooks/workout/use-hidden-workout-state';
import { useWorkoutRecovery } from '~/hooks/workout/use-workout-recovery';
import { SimpleWorkoutPersistence } from '~/lib/services/workout-persistence';

interface ActiveWorkoutIndicatorProps {
  // Optional prop to hide on certain screens
  hideOnActiveWorkout?: boolean;
}

export function ActiveWorkoutIndicator({
  hideOnActiveWorkout = false,
}: ActiveWorkoutIndicatorProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isLoaded = true;

  // Use both the hidden workout state hook and recovery hook
  const { hiddenWorkout, showCurrentWorkout, clearHiddenWorkout, forceStateCheck } =
    useHiddenWorkoutState();
  const { recoveryData, handleRecoveryResume, handleRecoveryStartFresh } = useWorkoutRecovery({
    isLoaded,
  });

  // Use hidden workout if available, otherwise use recovery data
  const activeWorkout = hiddenWorkout || recoveryData;

  // Clean up logging for production

  // Update timer every second for live time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't show if no active workout (hidden or recovery)
  if (!activeWorkout) {
    return null;
  }

  // Don't show on active workout screen if specified
  if (hideOnActiveWorkout) {
    return null;
  }

  // Calculate elapsed time
  let elapsedSeconds = 0;

  if (activeWorkout.elapsedTime !== undefined) {
    // Use the saved elapsed time directly
    elapsedSeconds = activeWorkout.elapsedTime;

    // If not paused, add the time since it was saved
    if (!activeWorkout.isPaused && activeWorkout.lastSaved) {
      const timeSinceSaved = Math.floor((currentTime - activeWorkout.lastSaved) / 1000);
      elapsedSeconds = activeWorkout.elapsedTime + timeSinceSaved;
    }
  } else {
    // Fallback to old calculation if elapsedTime not available
    const startTime = new Date(activeWorkout.startTime).getTime();
    const elapsedMs = currentTime - startTime - activeWorkout.pausedTime; // pausedTime is now in ms
    elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  }

  // Format time as HH:MM:SS or MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle showing the workout
  const handleShowWorkout = () => {
    if (hiddenWorkout) {
      // Handle hidden workout
      showCurrentWorkout();
      router.push({
        pathname: '/(app)/(stacks)/active-workout',
        params: {
          workoutId: activeWorkout.workoutId,
          recovery: JSON.stringify(activeWorkout),
        },
      });
    } else if (recoveryData) {
      // Handle recovery data
      handleRecoveryResume();
    }
  };

  // Handle discarding the workout
  const handleDiscardWorkout = () => {
    Alert.alert(
      t('activeWorkout.discardWorkout'),
      t('activeWorkout.discardWorkoutConfirm', { workoutName: activeWorkout.workoutName }),
      [
        { text: t('activeWorkout.cancel'), style: 'cancel' },
        {
          text: t('activeWorkout.discard'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Step 1: Clear both systems to be sure
              if (hiddenWorkout) {
                await clearHiddenWorkout();
              }
              if (recoveryData) {
                await handleRecoveryStartFresh();
              }

              // Step 2: Also clear persistence directly as a failsafe
              await SimpleWorkoutPersistence.clear();

              // Step 3: Force immediate state updates
              forceStateCheck();
              setCurrentTime(Date.now());

              // Step 4: Additional delayed check to ensure everything is cleared
              setTimeout(() => {
                forceStateCheck();
                setCurrentTime(Date.now());
              }, 100);

              // Step 5: Final check after a longer delay
              setTimeout(() => {
                forceStateCheck();
                setCurrentTime(Date.now());
              }, 500);
            } catch (_error) {}
          },
        },
      ]
    );
  };

  return (
    <View className="mb-4" testID="active-workout-indicator">
      <View className="rounded-md bg-primary/10 p-4" testID="recovery-card">
        <View className="mb-2 flex-row items-center justify-between" testID="recovery-card-header">
          <View className="flex-row items-center gap-x-1">
            <View className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <Text className="text-sm font-medium text-primary" testID="active-workout-label">
              {t('activeWorkout.activeWorkout')}
            </Text>
          </View>
          <Text className="font-mono text-xs font-semibold text-primary" testID="workout-timer">
            {formatTime(elapsedSeconds)}
            {activeWorkout.isPaused && ` • ${t('activeWorkout.paused')}`}
          </Text>
        </View>

        <Pressable onPress={handleShowWorkout} className="mb-3" testID="show-active-workout">
          <Text
            className="mb-1 text-lg font-semibold text-foreground"
            numberOfLines={1}
            testID="workout-name">
            {activeWorkout.workoutName}
          </Text>
          <Text className="text-sm text-muted-foreground" testID="tap-to-continue-text">
            {t('activeWorkout.tapToContinue')}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-3" testID="recovery-card-actions">
          <Pressable
            onPress={handleShowWorkout}
            className="flex-1 rounded-md bg-primary px-4 py-2"
            testID="continue-workout-button">
            <Text
              className="text-center font-medium text-primary-foreground"
              testID="continue-button-text">
              {t('activeWorkout.continue')}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDiscardWorkout}
            className="flex-1 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-2"
            testID="discard-workout-button">
            <Text className="text-center font-medium text-destructive" testID="discard-button-text">
              {t('activeWorkout.discard')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
