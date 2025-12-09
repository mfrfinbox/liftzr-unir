import {
  workoutHistoryStore$,
  workoutHistoryOperations,
} from '~/lib/legend-state/stores/workoutHistoryStore';
import { workoutsStore$, workoutsOperations } from '~/lib/legend-state/stores/workoutsStore';

export function useUpdateWorkout() {
  const updateWorkout = async (
    workoutId: string,
    updates: {
      title?: string;
      description?: string;
      notes?: string;
      workoutExercises?: any[];
      exercises?: any[];
    }
  ) => {
    try {
      // If workoutExercises is provided, map it to exercises field
      const exercisesToUpdate = updates.workoutExercises || updates.exercises;

      const updateData = {
        ...updates,
        // Make sure exercises field is updated when workoutExercises is provided
        ...(exercisesToUpdate && { exercises: exercisesToUpdate }),
      };

      // Remove workoutExercises from the final object as it's not part of the schema
      delete updateData.workoutExercises;

      // Use workoutsOperations to ensure pending operation is created for sync
      const updateSuccess = await workoutsOperations.update(workoutId, updateData);

      if (!updateSuccess) {
        return { success: false, error: 'Workout not found' };
      }

      // If the workout name changed, update all workout history entries
      if (updates.title) {
        try {
          const workoutHistory = workoutHistoryStore$.workoutHistory.peek();

          // Find all history entries for this workout and update them
          const entriesToUpdate = workoutHistory.filter((entry) => entry.workoutId === workoutId);

          // Update each entry using the proper operation that syncs with database
          for (const entry of entriesToUpdate) {
            await workoutHistoryOperations.updateWorkoutEntry(entry.id, {
              workoutName: updates.title,
            });
          }
        } catch {
          // Don't fail the whole operation if history update fails
        }
      }

      // Get the updated workout for return (no ID mapping needed - local-only)
      const workouts = workoutsStore$.workouts.peek();
      const updatedWorkout = workouts.find((w) => w.id === workoutId);

      if (updatedWorkout) {
        return { success: true, data: updatedWorkout };
      }

      // This shouldn't happen if update was successful, but just in case
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const reorderWorkouts = async (workoutIds: string[]) => {
    try {
      // Map workout IDs to actual workout objects with updated orderIndex
      const workouts = workoutsStore$.workouts.peek();
      const reorderedWorkouts = workoutIds
        .map((id, index) => {
          const workout = workouts.find((w) => w.id === id);
          if (workout) {
            // Update orderIndex to reflect new position
            return {
              ...workout,
              orderIndex: index,
            };
          }
          return undefined;
        })
        .filter((w): w is NonNullable<typeof w> => w !== undefined);

      await workoutsOperations.reorder(reorderedWorkouts);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder workouts',
      };
    }
  };

  return {
    updateWorkout,
    reorderWorkouts,
    isLoading: false,
  };
}
