import { useState, useEffect, useRef } from 'react';

import { AppState, AppStateStatus, Platform, FlatList } from 'react-native';

import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

import {
  trackRestTimerNotification,
  untrackRestTimerNotification,
} from '~/lib/services/notifications';

// Types for the timer state
export type TimerType = 'set' | 'exercise';

export interface TimerState {
  active: boolean;
  type: TimerType;
  seconds: number;
  totalSeconds: number;
  exerciseName: string;
  nextExerciseName?: string;
  notificationId?: string; // Track notification ID
  startTime?: number; // Track when the timer started (timestamp)
  // Track which set triggered this timer so we can cancel it if that set is unchecked
  triggeredByExerciseIndex?: number;
  triggeredBySetIndex?: number;
}

// Global variables for tracking inter-exercise rest
let globalInterExerciseNotificationId: string | null = null;
let globalInterExerciseTimerId: NodeJS.Timeout | null = null;

interface UseTimerProps {
  flatListRef: React.RefObject<FlatList | null>;
  nextExerciseIndex: number | null;
  showImmediateNotification: (title: string, body: string) => void;
}

export function useTimer({
  flatListRef,
  nextExerciseIndex,
  showImmediateNotification,
}: UseTimerProps) {
  // Global timer state that both set and exercise timers will use
  const [timerState, setTimerState] = useState<TimerState>({
    active: false,
    type: 'set',
    seconds: 0,
    totalSeconds: 0,
    exerciseName: '',
    nextExerciseName: undefined,
    notificationId: undefined,
    startTime: undefined,
    triggeredByExerciseIndex: undefined,
    triggeredBySetIndex: undefined,
  });

  const appStateRef = useRef(AppState.currentState);
  const timerStateRef = useRef(timerState);

  // Keep ref in sync with state
  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  // Function to cancel active notifications and timers
  const cancelActiveTimer = async () => {
    // Cancel the notification if we have its ID
    if (timerState.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(timerState.notificationId);
        // Remove from global tracking
        untrackRestTimerNotification(timerState.notificationId);
      } catch (_err) {
        // Error canceling notification
      }
    }

    // Also cancel any global inter-exercise notification
    if (globalInterExerciseNotificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(globalInterExerciseNotificationId);
        globalInterExerciseNotificationId = null;
      } catch (_err) {
        // Error canceling global notification
      }
    }

    // Additional safety: try to get and cancel all pending notifications
    try {
      const pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();

      // Cancel any that appear to be rest timer notifications
      for (const notification of pendingNotifications) {
        if (
          notification.content.title?.includes('Rest Timer') ||
          notification.content.title?.includes('Rest Time')
        ) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          // Remove from global tracking
          untrackRestTimerNotification(notification.identifier);
        }
      }
    } catch (_err) {
      // Failed to clean up additional notifications
    }

    // Clear any active timers
    if (globalInterExerciseTimerId) {
      clearInterval(globalInterExerciseTimerId);
      globalInterExerciseTimerId = null;
    }

    // Make sure to reset the timer state to inactive
    if (timerState.active) {
      setTimerState((prev) => ({
        ...prev,
        active: false,
        seconds: 0,
        notificationId: undefined,
        triggeredByExerciseIndex: undefined,
        triggeredBySetIndex: undefined,
      }));
    }
  };

  // Start a new timer
  const startTimer = async (
    type: TimerType,
    seconds: number,
    exerciseName: string,
    nextExerciseName?: string,
    exerciseIndex?: number,
    setIndex?: number
  ) => {
    // First, cancel any active timer and notifications
    await cancelActiveTimer();

    // Add a small delay to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Set up the new timer state
    setTimerState({
      active: true,
      type,
      seconds,
      totalSeconds: seconds,
      exerciseName,
      nextExerciseName,
      startTime: Date.now(),
      triggeredByExerciseIndex: exerciseIndex,
      triggeredBySetIndex: setIndex,
    });
  };

  // Handle app state changes for timer background/foreground
  // Using ref pattern to avoid recreating listener on every state change
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const prevAppState = appStateRef.current;
      const currentTimerState = timerStateRef.current;

      if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
        // If we have an active timer with a start time, adjust for elapsed time
        if (currentTimerState.active && currentTimerState.startTime) {
          const elapsedMs = Date.now() - currentTimerState.startTime;
          const elapsedSeconds = Math.floor(elapsedMs / 1000);
          const remainingSeconds = Math.max(0, currentTimerState.totalSeconds - elapsedSeconds);

          // Cancel any scheduled notification since we're back in foreground
          if (currentTimerState.notificationId) {
            const notificationId = currentTimerState.notificationId;
            Notifications.cancelScheduledNotificationAsync(notificationId)
              .then(() => {
                // Successfully cancelled notification
                untrackRestTimerNotification(notificationId);
              })
              .catch(() => {
                // Notification might have already fired or been cancelled
              });
          }

          setTimerState((prev) => ({
            ...prev,
            seconds: remainingSeconds,
            notificationId: undefined, // Clear the notification ID
          }));
        }
      } else if (prevAppState === 'active' && nextAppState.match(/inactive|background/)) {
        // Going to background with active timer - schedule a notification
        if (currentTimerState.active && currentTimerState.seconds > 0) {
          // Schedule a background notification for when timer would complete
          const notifTitle =
            currentTimerState.type === 'set' ? 'Rest Timer Completed' : 'Rest Time Complete';
          const notifBody =
            currentTimerState.type === 'set'
              ? `Time to start your next set of ${currentTimerState.exerciseName}!`
              : currentTimerState.nextExerciseName
                ? `Time to start your next exercise: ${currentTimerState.nextExerciseName}!`
                : `Rest complete! Time to finish your workout.`;

          // Calculate seconds until timer completion
          const secondsUntilCompletion = currentTimerState.seconds;

          // Schedule notification to fire when timer would complete
          Notifications.scheduleNotificationAsync({
            content: {
              title: notifTitle,
              body: notifBody,
              sound: true,
              ...(Platform.OS === 'android' && {
                channelId: 'rest-timer',
                vibrate: [0, 250, 250, 250],
                priority: Notifications.AndroidNotificationPriority.MAX,
              }),
            },
            trigger: {
              seconds: secondsUntilCompletion,
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            },
          })
            .then((id) => {
              // Save notification ID for potential cancellation
              setTimerState((prev) => ({
                ...prev,
                notificationId: id,
              }));
              // Track the notification
              trackRestTimerNotification(id);
            })
            .catch(() => {
              // Failed to schedule background notification
            });
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []); // Empty dependencies - only subscribe once

  // Separate useEffect specifically for the timer countdown
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;

    if (timerState.active && timerState.seconds > 0) {
      // If we don't have a start time yet, set it now
      if (!timerState.startTime) {
        setTimerState((prev) => ({
          ...prev,
          startTime: Date.now(),
        }));
      }

      countdownInterval = setInterval(() => {
        setTimerState((prev) => {
          // Only update if app is in foreground (active)
          // Background time adjustment is handled by the AppState listener
          if (AppState.currentState === 'active' && prev.startTime) {
            // Calculate remaining time from timestamp (same as Watch)
            const now = Date.now();
            const elapsed = Math.floor((now - prev.startTime) / 1000);
            const newSeconds = Math.max(0, prev.totalSeconds - elapsed);

            // Add haptic feedback at specific points
            if (
              newSeconds === Math.floor(prev.totalSeconds / 2) || // halfway
              (newSeconds <= 5 && newSeconds > 0)
            ) {
              // last 5 seconds
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            // Handle timer completion
            if (newSeconds <= 0) {
              // Timer finished
              if (prev.type === 'exercise' && nextExerciseIndex !== null) {
                // Scroll to next exercise
                if (flatListRef.current) {
                  flatListRef.current.scrollToIndex({
                    index: nextExerciseIndex,
                    animated: true,
                    viewOffset: 20,
                  });
                }
              }

              // Show an immediate notification based on the timer type
              const notifTitle =
                prev.type === 'set' ? 'Rest Timer Completed' : 'Rest Time Complete';

              const notifBody =
                prev.type === 'set'
                  ? `Time to start your next set of ${prev.exerciseName}!`
                  : prev.nextExerciseName
                    ? `Time to start your next exercise: ${prev.nextExerciseName}!`
                    : `Workout complete!`;

              // Trigger notification with proper app state handling
              showImmediateNotification(notifTitle, notifBody);

              // Reset timer state
              return {
                ...prev,
                active: false,
                seconds: 0,
                notificationId: undefined,
                triggeredByExerciseIndex: undefined,
                triggeredBySetIndex: undefined,
              };
            }

            return { ...prev, seconds: newSeconds };
          }
          return prev; // Don't update if app is in background
        });
      }, 1000);
    } else {
      // Clean up countdown interval when timer becomes inactive
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }

    // Cleanup function
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [timerState.active]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clean up global timer variables
      if (globalInterExerciseTimerId) {
        clearInterval(globalInterExerciseTimerId);
        globalInterExerciseTimerId = null;
      }

      // Clean up global notification ID
      if (globalInterExerciseNotificationId) {
        // Try to cancel the notification on unmount
        Notifications.cancelScheduledNotificationAsync(globalInterExerciseNotificationId).catch(
          () => {
            // Silent fail - notification might already be fired
          }
        );
        globalInterExerciseNotificationId = null;
      }
    };
  }, []);

  // Helper function to check if timer should be cancelled based on set unchecking
  const shouldCancelTimerForSet = (exerciseIndex: number, setIndex: number): boolean => {
    return (
      timerState.active &&
      timerState.triggeredByExerciseIndex === exerciseIndex &&
      timerState.triggeredBySetIndex === setIndex
    );
  };

  // Helper function to check if timer should be cancelled for exercise
  const shouldCancelTimerForExercise = (exerciseIndex: number): boolean => {
    return (
      timerState.active &&
      timerState.type === 'exercise' &&
      timerState.triggeredByExerciseIndex === exerciseIndex
    );
  };

  return {
    // State
    timerState,

    // Actions
    startTimer,
    cancelActiveTimer,

    // Helpers
    shouldCancelTimerForSet,
    shouldCancelTimerForExercise,

    // Global variables access (for cleanup)
    getGlobalInterExerciseNotificationId: () => globalInterExerciseNotificationId,
    setGlobalInterExerciseNotificationId: (id: string | null) => {
      globalInterExerciseNotificationId = id;
    },
    getGlobalInterExerciseTimerId: () => globalInterExerciseTimerId,
    setGlobalInterExerciseTimerId: (id: NodeJS.Timeout | null) => {
      globalInterExerciseTimerId = id;
    },
  };
}
