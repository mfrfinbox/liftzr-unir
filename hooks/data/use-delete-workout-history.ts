/**
 * Hook for deleting workout history with confirmation
 */

import { useCallback, useState } from 'react';

import { Alert } from 'react-native';

import {
  deleteWorkoutHistory,
  bulkDeleteWorkoutHistory,
  confirmDelete,
} from '~/lib/services/history-deletion-service';
import { logger } from '~/lib/utils/logger';

export function useDeleteWorkoutHistory() {
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Delete a single workout history entry with confirmation
   */
  const deleteHistory = useCallback(
    async (historyId: string) => {
      if (isDeleting) {
        Alert.alert('Please wait', 'A deletion is already in progress');
        return false;
      }

      try {
        // Show confirmation
        const confirmed = await confirmDelete(1);
        if (!confirmed) return false;

        setIsDeleting(true);

        const result = await deleteWorkoutHistory(historyId);

        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to delete workout');
          return false;
        }

        return true;
      } catch (error: unknown) {
        logger.error(
          'Failed to delete workout history',
          error instanceof Error ? error : new Error(String(error)),
          {
            context: { historyId },
          }
        );
        Alert.alert('Error', 'Failed to delete workout');
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting]
  );

  /**
   * Delete multiple workout history entries with confirmation
   */
  const bulkDeleteHistory = useCallback(
    async (historyIds: string[]) => {
      if (isDeleting) {
        Alert.alert('Please wait', 'A deletion is already in progress');
        return { success: false, deletedCount: 0 };
      }
      if (historyIds.length === 0) return { success: true, deletedCount: 0 };

      try {
        // Show confirmation
        const confirmed = await confirmDelete(historyIds.length);
        if (!confirmed) return { success: false, deletedCount: 0 };

        setIsDeleting(true);

        const result = await bulkDeleteWorkoutHistory(historyIds);

        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to delete workouts');
          return { success: false, deletedCount: 0 };
        }

        return { success: true, deletedCount: result.deletedCount };
      } catch (error: unknown) {
        logger.error(
          'Failed to bulk delete workout history',
          error instanceof Error ? error : new Error(String(error)),
          {
            context: { count: historyIds.length },
          }
        );
        Alert.alert('Error', 'Failed to delete workouts');
        return { success: false, deletedCount: 0 };
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting]
  );

  return {
    deleteHistory,
    bulkDeleteHistory,
    isDeleting,
  };
}
