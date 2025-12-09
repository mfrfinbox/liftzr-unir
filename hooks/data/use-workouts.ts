import { useSelector } from '@legendapp/state/react';

import { workoutsStore$, workoutsOperations } from '~/lib/legend-state/stores/workoutsStore';
import type { Workout } from '~/types';

export function useWorkouts() {
  const workouts = useSelector(workoutsStore$.workouts);
  const isLoading = useSelector(workoutsStore$.isLoading);

  const addWorkout = async (workout: Omit<Workout, 'id' | 'created'>) => {
    return workoutsOperations.create(workout);
  };

  const updateWorkout = async (id: string, updates: Partial<Workout>) => {
    await workoutsOperations.update(id, updates);
  };

  const deleteWorkout = async (id: string) => {
    await workoutsOperations.delete(id);
  };

  return {
    workouts,
    isLoading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
  };
}

export function useWorkoutById(workoutId: string | undefined) {
  const workouts = useSelector(workoutsStore$.workouts);

  // Find workout by ID (no ID mapping needed - local-only)
  const workout = workoutId ? workouts.find((w) => w.id === workoutId) : undefined;

  return {
    workout,
    isLoading: false,
  };
}
