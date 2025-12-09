import { observable } from '@legendapp/state';

import type { ActiveWorkout, ActiveWorkoutExercise, ActiveWorkoutSet } from '~/types';

import { ObservablePersistMMKV } from '../config/mmkvPersistPlugin';
import { generateId } from '../utils/idGenerator';

// Create the observable store for active workout
export const activeWorkoutStore$ = observable({
  activeWorkout: null as ActiveWorkout | null,
  isWorkoutActive: false,
});

// Store cleanup functions for subscriptions
let cleanupFunctions: (() => void)[] = [];

// Initialize persistence for active workout
export function setupActiveWorkoutSync() {
  // Clean up any existing subscriptions first
  cleanupActiveWorkoutSync();

  // Helper to extract value from stored data
  const getValue = (data: any, defaultValue: any) => {
    if (data?.value !== undefined) return data.value;
    return data !== undefined ? data : defaultValue;
  };

  // Load persisted active workout
  const storedWorkout = getValue(ObservablePersistMMKV.get('activeWorkout'), null);
  const storedIsActive = getValue(ObservablePersistMMKV.get('isWorkoutActive'), false);

  // Initialize store with persisted data
  activeWorkoutStore$.activeWorkout.set(storedWorkout);
  activeWorkoutStore$.isWorkoutActive.set(storedIsActive);

  // Auto-save to MMKV on any change - store cleanup functions
  const unsubscribeWorkout = activeWorkoutStore$.activeWorkout.onChange(() => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    ObservablePersistMMKV.set('activeWorkout', workout);
  });

  const unsubscribeIsActive = activeWorkoutStore$.isWorkoutActive.onChange(() => {
    const isActive = activeWorkoutStore$.isWorkoutActive.peek();
    ObservablePersistMMKV.set('isWorkoutActive', isActive);
  });

  // Store cleanup functions
  cleanupFunctions = [unsubscribeWorkout, unsubscribeIsActive];
}

// Cleanup function to unsubscribe all listeners
export function cleanupActiveWorkoutSync() {
  cleanupFunctions.forEach((cleanup) => cleanup?.());
  cleanupFunctions = [];
}

// Initialize persistence on module load
setupActiveWorkoutSync();

// Operations for active workout
export const activeWorkoutOperations = {
  // Start a new workout
  startWorkout: (workout: {
    workoutId?: string;
    title: string;
    exercises: {
      exerciseId: string;
      sets: number;
      restTime: number;
      nextExerciseRestTime: number;
    }[];
  }): void => {
    const activeWorkout: ActiveWorkout = {
      id: generateId(),
      workoutId: workout.workoutId,
      title: workout.title,
      startTime: new Date().toISOString(),
      exercises: workout.exercises.map((ex) => ({
        id: generateId(),
        exerciseId: ex.exerciseId,
        sets: Array.from({ length: ex.sets }, () => ({
          id: generateId(),
          reps: '',
          weight: '',
          completed: false,
        })),
        restTime: ex.restTime,
        nextExerciseRestTime: ex.nextExerciseRestTime,
      })),
      isPaused: false,
      totalPausedTime: 0,
      isHidden: false,
    };

    activeWorkoutStore$.activeWorkout.set(activeWorkout);
    activeWorkoutStore$.isWorkoutActive.set(true);
  },

  // Update a set in the active workout
  updateSet: (exerciseId: string, setId: string, updates: Partial<ActiveWorkoutSet>): void => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout) return;

    const exerciseIndex = workout.exercises.findIndex((ex) => ex.id === exerciseId);
    if (exerciseIndex === -1) return;

    const setIndex = workout.exercises[exerciseIndex].sets.findIndex((s) => s.id === setId);
    if (setIndex === -1) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, ...updates } : s)),
            }
          : ex
      ),
    };

    activeWorkoutStore$.activeWorkout.set(updatedWorkout);
  },

  // Add a set to an exercise
  addSet: (exerciseId: string): void => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout) return;

    const exerciseIndex = workout.exercises.findIndex((ex) => ex.id === exerciseId);
    if (exerciseIndex === -1) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: generateId(),
                  reps: '',
                  weight: '',
                  completed: false,
                },
              ],
            }
          : ex
      ),
    };

    activeWorkoutStore$.activeWorkout.set(updatedWorkout);
  },

  // Remove a set from an exercise
  removeSet: (exerciseId: string, setId: string): void => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout) return;

    const exerciseIndex = workout.exercises.findIndex((ex) => ex.id === exerciseId);
    if (exerciseIndex === -1) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              sets: ex.sets.filter((s) => s.id !== setId),
            }
          : ex
      ),
    };

    activeWorkoutStore$.activeWorkout.set(updatedWorkout);
  },

  // Update exercise properties
  updateExercise: (
    exerciseId: string,
    updates: Partial<Omit<ActiveWorkoutExercise, 'id' | 'exerciseId' | 'sets'>>
  ): void => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, ...updates } : ex)),
    };

    activeWorkoutStore$.activeWorkout.set(updatedWorkout);
  },

  // Complete the workout
  completeWorkout: (): ActiveWorkout | null => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout) return null;

    const completedWorkout = {
      ...workout,
      endTime: new Date().toISOString(),
      isPaused: false,
    };

    // Clear the active workout
    activeWorkoutStore$.activeWorkout.set(null);
    activeWorkoutStore$.isWorkoutActive.set(false);

    return completedWorkout;
  },

  // Cancel the workout
  cancelWorkout: (): void => {
    activeWorkoutStore$.activeWorkout.set(null);
    activeWorkoutStore$.isWorkoutActive.set(false);
  },

  // Pause the workout
  pauseWorkout: (): void => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout || workout.isPaused) return;

    const updatedWorkout = {
      ...workout,
      isPaused: true,
      pausedAt: new Date().toISOString(),
    };

    activeWorkoutStore$.activeWorkout.set(updatedWorkout);
  },

  // Resume the workout
  resumeWorkout: (): void => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout || !workout.isPaused || !workout.pausedAt) return;

    const pausedDuration = Date.now() - new Date(workout.pausedAt).getTime();
    const updatedWorkout = {
      ...workout,
      isPaused: false,
      pausedAt: undefined,
      totalPausedTime: workout.totalPausedTime + pausedDuration,
    };

    activeWorkoutStore$.activeWorkout.set(updatedWorkout);
  },

  // Hide the workout
  hideWorkout: (): void => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout) return;

    const updatedWorkout = {
      ...workout,
      isHidden: true,
    };

    activeWorkoutStore$.activeWorkout.set(updatedWorkout);
  },

  // Show the workout
  showWorkout: (): void => {
    const workout = activeWorkoutStore$.activeWorkout.peek();
    if (!workout) return;

    const updatedWorkout = {
      ...workout,
      isHidden: false,
    };

    activeWorkoutStore$.activeWorkout.set(updatedWorkout);
  },
};

// Debug utilities
export const activeWorkoutDebug = {
  logState: () => {
    // Debug logging removed for production
  },
};
