import type { Workout } from '~/types';

import { useAddWorkout } from './use-add-workout';

interface WorkoutExercise {
  id: string;
  sets: number;
  reps: string;
  rest: number;
  setsData: any[];
  exerciseNotes: string;
}

export function useSaveQuickWorkout() {
  const { addWorkout } = useAddWorkout();

  const saveQuickWorkout = async (workoutName: string, exercises: WorkoutExercise[]) => {
    try {
      const workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> = {
        title: workoutName,
        description: '',
        created: new Date().toISOString(),
        exercises: exercises.map((ex, index) => ({
          id: ex.id,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          nextExerciseRest: 0,
          exerciseNotes: ex.exerciseNotes || '',
          orderIndex: index, // Add orderIndex to maintain order
          // Reset all sets to not completed when saving as a workout template
          setsData: (ex.setsData || []).map((set: any) => ({
            ...set,
            completed: false, // Always set to false for workout templates
          })),
        })),
        // userId: '', // Not needed for Legend State
        // isShared: false,
        // tags: [],
        notes: '',
        // color: '',
      };

      const result = await addWorkout(workoutData);

      if (result.success) {
        return {
          success: true,
          workout: result.data,
          workoutId: result.workoutId,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown error',
      };
    }
  };

  return {
    saveQuickWorkout,
  };
}
