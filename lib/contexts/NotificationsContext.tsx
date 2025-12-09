import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { logger } from '~/lib/utils/logger';

// Set up Android notification channel (for rest timer notifications)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('rest-timer', {
    name: 'Rest Timer',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
  }).catch((_error) => {});
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

interface NotificationOptions {
  title?: string;
  body?: string;
  delaySeconds: number;
  data?: Record<string, any>;
}

interface NotificationsContextType {
  scheduleNotification: (options: NotificationOptions) => Promise<string | undefined>;
  hasPermissions: boolean | null;
  requestPermissions: () => Promise<boolean>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    checkPermissions();

    // Helper function to handle notification navigation
    const handleNotificationNavigation = (notification: Notifications.Notification) => {
      const data = notification.request.content.data;

      // Use URL-based navigation if available (recommended approach)
      if (data?.url && typeof data.url === 'string') {
        try {
          // Validate that the URL matches expected route patterns
          const validRoutePattern = /^\/(app|auth)\/.*/;
          if (!validRoutePattern.test(data.url)) {
            logger.error('Invalid notification URL format', { context: { url: data.url } });
            return;
          }
          logger.info('Navigating via notification URL', { context: { url: data.url } });
          // Type assertion is safe after validation
          router.push(data.url as any);
          return;
        } catch (error) {
          logger.error('Failed to navigate via URL', error);
        }
      }

      // Fallback to type-based navigation for backwards compatibility
      if (data?.source === 'watch' && data?.action === 'workout_started') {
        try {
          router.push('/(app)/(tabs)/home');
        } catch (_error) {}
      }
    };

    // Check if app was opened by tapping a notification (cold start)
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response?.notification) {
          logger.info('App opened from notification (cold start)');
          handleNotificationNavigation(response.notification);
        }
      })
      .catch((error) => {
        logger.error('Failed to get last notification response', error);
      });

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Do nothing when notification is received
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      logger.info('Notification tapped (app running)');
      handleNotificationNavigation(response.notification);
    });

    // Clean up
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Check permissions
  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const hasPermission = status === 'granted';
      setHasPermissions(hasPermission);
      return hasPermission;
    } catch (_error) {
      setHasPermissions(false);
      return false;
    }
  };

  // Request permissions
  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const hasPermission = status === 'granted';
      setHasPermissions(hasPermission);
      return hasPermission;
    } catch (_error) {
      setHasPermissions(false);
      return false;
    }
  };

  // Schedule a notification
  const scheduleNotification = async ({ title, body, delaySeconds, data }: NotificationOptions) => {
    try {
      // Check permissions first
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          return;
        }
      }

      // Schedule notification with proper trigger type
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title || 'Liftzr Notification! 💪',
          body: body || `This notification was scheduled to appear after ${delaySeconds} seconds.`,
          data: data || { delaySeconds },
          sound: true,
          priority: 'max',
          ...(Platform.OS === 'android' && { channelId: 'rest-timer' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
        },
      });

      return notificationId;
    } catch (_error) {
      throw _error;
    }
  };

  const value = {
    scheduleNotification,
    hasPermissions,
    requestPermissions,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
