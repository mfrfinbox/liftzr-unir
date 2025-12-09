import { workoutsStore$, workoutsOperations } from '~/lib/legend-state/stores/workoutsStore';
import { generateUniqueWorkoutName } from '~/lib/utils/workout-utils';
import type { Workout } from '~/types';

export function useAddWorkout() {
  const addWorkout = async (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Get existing workouts to check for duplicate names
      const existingWorkouts = workoutsStore$.workouts.peek();

      // Generate unique name if needed
      const uniqueTitle = generateUniqueWorkoutName(workout.title, existingWorkouts);

      // Create workout locally (no sync needed - local-only)
      const newWorkout = workoutsOperations.create({
        ...workout,
        title: uniqueTitle,
      });

      return { success: true, workoutId: newWorkout.id, data: newWorkout };
    } catch (_error) {
      return { success: false, error: _error instanceof Error ? _error.message : 'Unknown error' };
    }
  };

  return {
    addWorkout,
    isLoading: false,
  };
}
