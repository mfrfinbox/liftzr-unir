import { observable } from '@legendapp/state';

import type { Exercise } from '~/types';

import { ObservablePersistMMKV } from '../config/mmkvPersistPlugin';
import { generateId } from '../utils/idGenerator';

// Store for exercises with local-only persistence
export const exercisesStore$ = observable({
  exercises: [] as Exercise[],
  isLoading: false,
});

// Store cleanup functions for onChange subscriptions
let cleanupFunctions: (() => void)[] = [];

// Initialize persistence for local-only functionality
export function setupExercisesSync() {
  try {
    // Load persisted data with safe defaults
    const storedExercises = ObservablePersistMMKV.get('exercises-store');

    // Initialize store with persisted data
    if (storedExercises && Array.isArray(storedExercises)) {
      exercisesStore$.exercises.set(storedExercises);
    }
  } catch {
    // Error initializing exercises
  }

  // Clear any existing subscriptions first
  cleanupExercisesSync();

  // Auto-save to MMKV on any change
  try {
    const unsubExercises = exercisesStore$.exercises.onChange(() => {
      const data = exercisesStore$.exercises.peek();
      if (data) {
        ObservablePersistMMKV.set('exercises-store', data);
      }
    });
    cleanupFunctions.push(unsubExercises);
  } catch {}
}

// Cleanup function to unsubscribe all onChange listeners
export function cleanupExercisesSync() {
  const currentCleanupFunctions = cleanupFunctions;
  cleanupFunctions = [];

  currentCleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch {}
  });
}

// CRUD Operations (local-only)
export const exercisesOperations = {
  // Add a new exercise (custom exercise)
  addExercise: async (exercise: Omit<Exercise, 'id'>) => {
    const localId = generateId();
    const newExercise: Exercise = {
      id: localId,
      name: exercise.name,
      type: exercise.type,
      isCustom: true,
      primaryMuscleGroup: exercise.primaryMuscleGroup || null,
      secondaryMuscleGroups: exercise.secondaryMuscleGroups || [],
      usesPlates: exercise.usesPlates || false,
    };

    exercisesStore$.exercises.push(newExercise);
    return newExercise;
  },

  // Update an exercise (only custom exercises can be updated)
  updateExercise: async (id: string, updates: Partial<Exercise>) => {
    const exercises = exercisesStore$.exercises.peek();
    const index = exercises.findIndex((e) => e.id === id);

    if (index !== -1) {
      // Only allow updating custom exercises
      if (!exercises[index].isCustom) {
        return;
      }

      const updatedExercise = {
        ...exercises[index],
        ...updates,
        isCustom: true,
        usesPlates:
          updates.usesPlates !== undefined ? updates.usesPlates : exercises[index].usesPlates,
      };

      exercisesStore$.exercises[index].set(updatedExercise);
    }
  },

  // Delete an exercise (only custom exercises can be deleted)
  deleteExercise: async (id: string) => {
    const exercises = exercisesStore$.exercises.peek();
    const exercise = exercises.find((e) => e.id === id);

    // Only allow deleting custom exercises
    if (exercise && !exercise.isCustom) {
      return;
    }

    const filtered = exercises.filter((e) => e.id !== id);
    exercisesStore$.exercises.set(filtered);
  },

  // Search exercises by name (local search)
  searchExercises: (query: string) => {
    const exercises = exercisesStore$.exercises.peek();
    const searchTerm = query.toLowerCase();

    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(searchTerm));
  },

  // Filter exercises by muscle group (local filter)
  filterByMuscleGroup: (muscleGroupId: string) => {
    const exercises = exercisesStore$.exercises.peek();

    return exercises.filter(
      (exercise) =>
        exercise.primaryMuscleGroup === muscleGroupId ||
        exercise.secondaryMuscleGroups?.includes(muscleGroupId)
    );
  },
};

// Initialize persistence on module load
setupExercisesSync();
