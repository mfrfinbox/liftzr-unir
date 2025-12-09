import { observable } from '@legendapp/state';

import type { WorkoutHistory } from '~/types';

import { ObservablePersistMMKV } from '../config/mmkvPersistPlugin';
import { generateId } from '../utils/idGenerator';

// Store for workout history with local-only persistence
export const workoutHistoryStore$ = observable({
  workoutHistory: [] as WorkoutHistory[],
  isLoading: false,
});

// Initialize persistence for local-only functionality
export function setupWorkoutHistorySync() {
  try {
    // Load persisted data with safe defaults
    const storedHistory = ObservablePersistMMKV.get('workoutHistory-store');

    // Initialize store with persisted data (with extra safety checks)
    if (storedHistory && Array.isArray(storedHistory)) {
      // Limit initial load to prevent memory issues on production
      const limitedHistory = storedHistory.slice(-500); // Keep only last 500 entries
      workoutHistoryStore$.workoutHistory.set(limitedHistory);
    }
  } catch {
    // Reset to empty state on error
    workoutHistoryStore$.workoutHistory.set([]);
  }

  // Auto-save to MMKV on any change - with error handling
  try {
    workoutHistoryStore$.workoutHistory.onChange(() => {
      const data = workoutHistoryStore$.workoutHistory.peek();
      if (data) {
        ObservablePersistMMKV.set('workoutHistory-store', data);
      }
    });
  } catch {}
}

// CRUD Operations (local-only)
export const workoutHistoryOperations = {
  // Add a new workout history entry
  addWorkoutEntry: async (entry: Omit<WorkoutHistory, 'id'>) => {
    try {
      // Validate input
      if (!entry || !entry.workoutId) {
        throw new Error('Invalid workout entry: missing workoutId');
      }

      const newEntry: WorkoutHistory = {
        id: generateId(),
        workoutId: entry.workoutId,
        workoutName: entry.workoutName,
        date: entry.date || new Date().toISOString(),
        duration: entry.duration || 0,
        exercises: entry.exercises || [],
        customName: entry.customName,
      };

      // Update Legend-State immediately
      workoutHistoryStore$.workoutHistory.push(newEntry);

      return newEntry;
    } catch (error) {
      throw error;
    }
  },

  // Update a workout history entry
  updateWorkoutEntry: async (id: string, updates: Partial<WorkoutHistory>) => {
    const history = workoutHistoryStore$.workoutHistory.peek();
    const index = history.findIndex((h) => h.id === id);

    if (index !== -1) {
      const updatedEntry = {
        ...history[index],
        ...updates,
      };

      workoutHistoryStore$.workoutHistory[index].set(updatedEntry);
    }
  },

  // Delete a workout history entry
  deleteWorkoutEntry: async (id: string) => {
    const history = workoutHistoryStore$.workoutHistory.peek();
    const filtered = history.filter((h) => h.id !== id);
    workoutHistoryStore$.workoutHistory.set(filtered);
  },

  // Get workout history by workout ID (local filter)
  getHistoryByWorkoutId: (workoutId: string) => {
    const history = workoutHistoryStore$.workoutHistory.peek();
    return history.filter((h) => h.workoutId === workoutId);
  },

  // Get recent workout history (local filter)
  getRecentHistory: (days: number = 30) => {
    const history = workoutHistoryStore$.workoutHistory.peek();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return history.filter((h) => new Date(h.date) >= cutoffDate);
  },

  // Get workout history for a specific date range (local filter)
  getHistoryByDateRange: (startDate: string, endDate: string) => {
    const history = workoutHistoryStore$.workoutHistory.peek();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return history.filter((h) => {
      const entryDate = new Date(h.date);
      return entryDate >= start && entryDate <= end;
    });
  },
};

// Initialize persistence on module load with error handling
try {
  setupWorkoutHistorySync();
} catch {}
