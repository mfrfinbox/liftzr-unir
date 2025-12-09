import { useEffect } from 'react';

import { AppState, Platform } from 'react-native';

import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

import { useNotifications } from '~/lib/contexts/NotificationsContext';

export function useExerciseNotifications() {
  const { scheduleNotification, requestPermissions } = useNotifications();

  // Function to show a notification only if app is in background
  const showImmediateNotification = async (title: string, body: string) => {
    try {
      // Get current app state
      const currentAppState = AppState.currentState;

      // Always trigger haptic feedback regardless of app state
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Only show visual notification if app is in background
      if (currentAppState === 'background' || currentAppState === 'inactive') {
        // Use scheduleNotificationAsync with a 1-second delay for background
        // This is more reliable than presentNotificationAsync for background state
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            ...(Platform.OS === 'android' && {
              channelId: 'rest-timer',
              vibrate: [0, 250, 250, 250],
              priority: Notifications.AndroidNotificationPriority.MAX,
            }),
          },
          trigger: {
            seconds: 1, // Small delay to ensure reliable delivery
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          },
        });
        return notificationId;
      } else {
        return null;
      }
    } catch (_error) {
      return null;
    }
  };

  // Request notification permissions on hook initialization
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  return {
    showImmediateNotification,
    scheduleNotification,
    requestPermissions,
  };
}
