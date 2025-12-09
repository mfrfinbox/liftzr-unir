import { useSelector } from '@legendapp/state/react';

import { exercisesStore$, exercisesOperations } from '~/lib/legend-state/stores/exercisesStore';
import type { Exercise } from '~/types';

export function useExercises() {
  const exercises = useSelector(exercisesStore$.exercises);
  const isLoading = useSelector(exercisesStore$.isLoading);

  const addExercise = async (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Use the operations method which handles pending operations and sync
      const newExercise = await exercisesOperations.addExercise(exercise);

      return { success: true, exerciseId: newExercise.id, data: newExercise };
    } catch (_error) {
      // Check if it's a duplicate name error
      const errorMessage = _error instanceof Error ? _error.message : 'Failed to create exercise';
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        return {
          success: false,
          error: `You already have an exercise with this name. Please choose a different name.`,
        };
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const updateExercise = async (exerciseData: {
    id: string;
    name?: string;
    type?: 'reps' | 'time' | 'distance';
    primaryMuscleGroup?: string;
    secondaryMuscleGroups?: string[];
    usesPlates?: boolean;
  }) => {
    try {
      const exercises = exercisesStore$.exercises.peek();
      const exercise = exercises.find((e) => e.id === exerciseData.id);

      if (!exercise) {
        return { success: false, error: 'Exercise not found' };
      }

      // Only allow updating custom exercises
      if (!exercise.isCustom) {
        return { success: false, error: 'Cannot update non-custom exercise' };
      }

      // Convert the property names to match Exercise type
      const updates: Partial<Exercise> = {
        ...(exerciseData.name && { name: exerciseData.name }),
        ...(exerciseData.type && { type: exerciseData.type }),
        ...(exerciseData.primaryMuscleGroup !== undefined && {
          primaryMuscleGroup: exerciseData.primaryMuscleGroup,
        }),
        ...(exerciseData.secondaryMuscleGroups && {
          secondaryMuscleGroups: exerciseData.secondaryMuscleGroups,
        }),
        ...(exerciseData.usesPlates !== undefined && {
          usesPlates: exerciseData.usesPlates,
        }),
      };

      // Use the operations method which handles pending operations and sync
      await exercisesOperations.updateExercise(exerciseData.id, updates);

      return { success: true };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to update exercise',
      };
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const exercises = exercisesStore$.exercises.peek();
      const exercise = exercises.find((e) => e.id === id);

      if (!exercise) {
        return { success: false, error: 'Exercise not found' };
      }

      // Only allow deleting custom exercises
      if (!exercise.isCustom) {
        return { success: false, error: 'Cannot delete non-custom exercise' };
      }

      // Use the operations method which handles pending operations and sync
      await exercisesOperations.deleteExercise(id);

      return { success: true };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to delete exercise',
      };
    }
  };

  const searchExercises = (query: string) => {
    return exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));
  };

  return {
    exercises,
    isLoading,
    addExercise,
    updateExercise,
    deleteExercise,
    searchExercises,
  };
}

export function useExerciseById(exerciseId: string | undefined) {
  const exercises = useSelector(exercisesStore$.exercises);
  const exercise = exerciseId ? exercises.find((e) => e.id === exerciseId) : undefined;

  return {
    exercise,
    isLoading: false,
  };
}

export function useExercisesByIds(exerciseIds: string[]) {
  const exercises = useSelector(exercisesStore$.exercises);
  const filteredExercises = exercises.filter((e) => exerciseIds.includes(e.id));

  return {
    exercises: filteredExercises,
    isLoading: false,
  };
}
