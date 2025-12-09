/**
 * Workout History Deletion Service
 * Handles deletion of workout history entries
 */

import { Alert } from 'react-native';

import { personalRecordsOperations } from '~/lib/legend-state/stores/personalRecordsStore';
import { workoutHistoryOperations } from '~/lib/legend-state/stores/workoutHistoryStore';

/**
 * Internal helper to delete a single history entry and its PRs
 */
async function deleteHistoryEntryWithPRs(historyId: string): Promise<void> {
  // 1. Delete workout history entry first (to avoid orphaned PRs)
  await workoutHistoryOperations.deleteWorkoutEntry(historyId);

  // 2. Get and delete associated PRs (cascade delete)
  const associatedPRs = personalRecordsOperations.getByWorkoutHistoryId(historyId);
  associatedPRs.forEach((pr) => {
    personalRecordsOperations.deletePersonalRecord(pr.id);
  });
}

/**
 * Delete a single workout history entry
 * Cascades to associated PRs
 */
export async function deleteWorkoutHistory(
  historyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteHistoryEntryWithPRs(historyId);
    return { success: true };
  } catch (error: any) {
    console.error('[HistoryDeletionService] Error deleting workout history:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete workout history',
    };
  }
}

/**
 * Delete multiple workout history entries at once
 */
export async function bulkDeleteWorkoutHistory(
  historyIds: string[]
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (historyIds.length === 0) {
    return { success: true, deletedCount: 0 };
  }

  let deletedCount = 0;

  try {
    for (const historyId of historyIds) {
      try {
        await deleteHistoryEntryWithPRs(historyId);
        deletedCount++;
      } catch (itemError) {
        console.error(`[HistoryDeletionService] Failed to delete history ${historyId}:`, itemError);
      }
    }

    if (deletedCount === 0) {
      return {
        success: false,
        deletedCount: 0,
        error: 'Failed to delete any workout history entries',
      };
    }

    return { success: true, deletedCount };
  } catch (error: any) {
    console.error('[HistoryDeletionService] Error in bulk deletion:', error);
    return {
      success: false,
      deletedCount,
      error: error.message || 'Failed to delete workout history',
    };
  }
}

/**
 * Show confirmation dialog before deleting workout history
 */
export function confirmDelete(count: number = 1): Promise<boolean> {
  return new Promise((resolve) => {
    const title = count === 1 ? 'Delete Workout' : `Delete ${count} Workouts`;
    const message =
      count === 1
        ? 'This will permanently delete this workout. This cannot be undone.'
        : `This will permanently delete ${count} workouts. This cannot be undone.`;

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => resolve(false),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => resolve(true),
      },
    ]);
  });
}
