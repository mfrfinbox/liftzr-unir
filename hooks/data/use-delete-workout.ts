import { workoutsOperations } from '~/lib/legend-state/stores/workoutsStore';

export function useDeleteWorkout() {
  const deleteWorkout = async (workoutId: string) => {
    try {
      // Use workoutsOperations to ensure pending operation is created for sync
      await workoutsOperations.delete(workoutId);
      return { success: true };
    } catch (_error) {
      return { success: false, error: _error instanceof Error ? _error.message : 'Unknown error' };
    }
  };

  return {
    deleteWorkout,
    isLoading: false,
  };
}
