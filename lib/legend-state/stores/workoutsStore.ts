import { observable } from '@legendapp/state';

import type { Workout } from '~/types';

import { ObservablePersistMMKV } from '../config/mmkvPersistPlugin';
import { generateId } from '../utils/idGenerator';

// Store for workouts with local-only persistence
export const workoutsStore$ = observable({
  workouts: [] as Workout[],
  isLoading: false,
});

// Guard against multiple initializations
let isInitialized = false;

// Initialize persistence for local-only functionality
export function setupWorkoutsSync() {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  // Helper to extract value from stored data
  const getValue = (data: any, defaultValue: any) => {
    if (data?.value !== undefined) return data.value;
    return data !== undefined ? data : defaultValue;
  };

  // Load persisted data
  const stored = {
    workouts: getValue(ObservablePersistMMKV.get('workouts-store'), []),
  };

  // Initialize store with persisted data
  // Ensure all workouts have an orderIndex for proper manual sorting
  // CRITICAL: Always sort by orderIndex to ensure physical array order matches logical order
  const workoutsWithOrder = Array.isArray(stored.workouts)
    ? stored.workouts
        .map((workout: Workout, index: number) => ({
          ...workout,
          orderIndex: workout.orderIndex ?? index,
        }))
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    : [];

  workoutsStore$.workouts.set(workoutsWithOrder);

  // Auto-save to MMKV on any change
  workoutsStore$.workouts.onChange(() => {
    ObservablePersistMMKV.set('workouts-store', workoutsStore$.workouts.peek());
  });
}

// Direct getters for non-reactive reads (performance optimization)
export const workoutsGetters = {
  // Get workout by ID without creating reactive subscription
  getById: (id: string): Workout | undefined => {
    const workouts = workoutsStore$.workouts.peek();
    return workouts.find((w) => w.id === id);
  },

  // Get all workouts without creating reactive subscription
  getAll: (): Workout[] => {
    return workoutsStore$.workouts.peek();
  },
};

// CRUD Operations (local-only)
export const workoutsOperations = {
  // Create a new workout
  create: (data: Partial<Workout>) => {
    const currentWorkouts = workoutsStore$.workouts.peek();
    const maxOrderIndex = currentWorkouts.reduce((max, w) => Math.max(max, w.orderIndex ?? 0), 0);

    const newWorkout: Workout = {
      id: generateId(),
      title: data.title || '',
      description: data.description || '',
      notes: data.notes,
      exercises: data.exercises || [],
      created: data.created || new Date().toISOString(),
      orderIndex: data.orderIndex ?? maxOrderIndex + 1,
    };

    workoutsStore$.workouts.push(newWorkout);
    return newWorkout;
  },

  // Update an existing workout
  update: (id: string, updates: Partial<Workout>) => {
    const workouts = workoutsStore$.workouts.peek();
    const index = workouts.findIndex((w) => w.id === id);

    if (index !== -1) {
      const updatedWorkout = {
        ...workouts[index],
        ...updates,
      };
      workoutsStore$.workouts[index].set(updatedWorkout);
      return updatedWorkout;
    }
    return null;
  },

  // Delete a workout
  delete: (id: string) => {
    const workouts = workoutsStore$.workouts.peek();
    const filtered = workouts.filter((w) => w.id !== id);
    workoutsStore$.workouts.set(filtered);
  },

  // Reorder workouts
  reorder: (workouts: Workout[]) => {
    // CRITICAL: Always sort by orderIndex before setting to ensure
    // physical array order matches logical order in MMKV storage
    const sorted = [...workouts].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    workoutsStore$.workouts.set(sorted);
  },
};

// Initialize persistence on module load
setupWorkoutsSync();
