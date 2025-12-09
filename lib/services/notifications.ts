import * as Notifications from 'expo-notifications';

import { logger } from '~/lib/utils/logger';

/**
 * Notification manager class to handle rest timer notifications
 * Encapsulates state to avoid issues with module reloads
 */
class RestTimerNotificationManager {
  private restTimerNotificationIds: Set<string> = new Set();

  /**
   * Add a notification ID to the tracking set
   */
  trackNotification(notificationId: string) {
    this.restTimerNotificationIds.add(notificationId);
  }

  /**
   * Remove a notification ID from the tracking set
   */
  untrackNotification(notificationId: string) {
    this.restTimerNotificationIds.delete(notificationId);
  }

  /**
   * Get the number of currently tracked notifications
   */
  getTrackedNotificationCount() {
    return this.restTimerNotificationIds.size;
  }

  /**
   * Clear all tracked notification IDs
   */
  clearTrackedNotifications() {
    this.restTimerNotificationIds.clear();
  }

  /**
   * Get all tracked notification IDs
   */
  getTrackedNotificationIds() {
    return Array.from(this.restTimerNotificationIds);
  }
}

// Singleton instance
const notificationManager = new RestTimerNotificationManager();

/**
 * Add a notification ID to the tracking set
 */
export const trackRestTimerNotification = (notificationId: string) => {
  notificationManager.trackNotification(notificationId);
};

/**
 * Remove a notification ID from the tracking set
 */
export const untrackRestTimerNotification = (notificationId: string) => {
  notificationManager.untrackNotification(notificationId);
};

/**
 * Aggressively dismiss ALL rest timer related notifications
 * Handles both scheduled notifications and delivered notifications in the tray
 */
export const dismissAllRestTimerNotifications = async () => {
  const trackedIds = notificationManager.getTrackedNotificationIds();
  const trackedCount = trackedIds.length;

  // Step 1: Cancel all tracked scheduled notifications
  if (trackedCount > 0) {
    const cancelPromises = trackedIds.map(async (notificationId) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        return true;
      } catch (_error) {
        logger.warn('Failed to cancel tracked notification', {
          context: { notificationId, operation: 'cancelTracked' },
        });
        return false;
      }
    });

    await Promise.allSettled(cancelPromises);
  }

  // Step 2: Get all pending scheduled notifications and cancel rest timer ones
  try {
    const pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();

    const restTimerPending = pendingNotifications.filter(
      (notification) =>
        notification.content.title?.includes('Rest Timer') ||
        notification.content.title?.includes('Rest Time') ||
        notification.content.body?.includes('rest') ||
        notification.content.body?.includes('next set')
    );

    if (restTimerPending.length > 0) {
      const additionalCancelPromises = restTimerPending.map(async (notification) => {
        try {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          return true;
        } catch (_error) {
          logger.warn('Failed to cancel rest timer notification', {
            context: { notificationId: notification.identifier, operation: 'cancelRestTimer' },
          });
          return false;
        }
      });

      await Promise.allSettled(additionalCancelPromises);
    }
  } catch (_error) {
    logger.warn('Failed to get scheduled notifications', {
      context: { operation: 'getAllScheduled' },
    });
  }

  // Step 3: Clear delivered notifications that match rest timer content
  try {
    const deliveredNotifications = await Notifications.getPresentedNotificationsAsync();

    const restTimerDelivered = deliveredNotifications.filter(
      (notification) =>
        notification.request.content.title?.includes('Rest Timer') ||
        notification.request.content.title?.includes('Rest Time') ||
        notification.request.content.body?.includes('rest') ||
        notification.request.content.body?.includes('next set')
    );

    if (restTimerDelivered.length > 0) {
      // Dismiss each rest timer notification individually
      const dismissPromises = restTimerDelivered.map(async (notification) => {
        try {
          await Notifications.dismissNotificationAsync(notification.request.identifier);
          return true;
        } catch (_error) {
          return false;
        }
      });

      await Promise.allSettled(dismissPromises);
    }
  } catch (_error) {}

  // Step 4: Clear the tracking set
  notificationManager.clearTrackedNotifications();
};

/**
 * Get the number of currently tracked notifications
 */
export const getTrackedNotificationCount = () => {
  return notificationManager.getTrackedNotificationCount();
};

/**
 * Clear any existing rest timer notifications before starting a new timer
 * Call this when starting a new rest timer to prevent conflicts
 */
export const clearExistingRestTimerNotifications = async () => {
  await dismissAllRestTimerNotifications();
};
