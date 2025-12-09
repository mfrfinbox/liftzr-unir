import { observable } from '@legendapp/state';

import type { PersonalRecord, PRType } from '~/lib/services/pr-tracking/types';

import { ObservablePersistMMKV } from '../config/mmkvPersistPlugin';
import { generateId } from '../utils/idGenerator';

// Personal Record types for the store
export type PersonalRecordInput = Omit<PersonalRecord, 'id'>;
export type PersonalRecordUpdate = Partial<Omit<PersonalRecord, 'id'>>;

// Store for personal records with local-only persistence
export const personalRecordsStore$ = observable({
  data: {} as Record<string, PersonalRecord>,
  isLoading: false,
  error: null as Error | null,
});

// Legacy export for backward compatibility
export const personalRecordsStore = personalRecordsStore$;

// Initialize persistence for local-only functionality
export function setupPersonalRecordsSync() {
  try {
    // Load persisted data with safe defaults
    const storedData = ObservablePersistMMKV.get('personalRecords-data');

    // Initialize store with persisted data
    if (storedData && typeof storedData === 'object') {
      personalRecordsStore$.data.set(storedData);
    }

    // Setup automatic persistence on changes
    personalRecordsStore$.data.onChange(() => {
      ObservablePersistMMKV.set('personalRecords-data', personalRecordsStore$.data.peek());
    });
  } catch {}
}

// Initialize persistence immediately
setupPersonalRecordsSync();

// Personal Records operations (local-only)
export const personalRecordsOperations = {
  // Add new personal record
  addPersonalRecord: (prData: PersonalRecordInput): PersonalRecord => {
    const newPR: PersonalRecord = {
      id: generateId(),
      ...prData,
    };

    // Validate required fields
    if (!newPR.exerciseId || !newPR.type || newPR.value === undefined) {
      throw new Error('Missing required fields for personal record');
    }

    if (!newPR.workoutHistoryId) {
      throw new Error('Missing workoutHistoryId for personal record');
    }

    // Validate PR type
    const validTypes: PRType[] = ['weight', 'reps', 'volume', 'time', 'distance'];
    if (!validTypes.includes(newPR.type)) {
      throw new Error(`Invalid PR type: ${newPR.type}`);
    }

    // Add to store
    personalRecordsStore$.data[newPR.id].set(newPR);

    return newPR;
  },

  // Update existing personal record
  updatePersonalRecord: (id: string, updates: PersonalRecordUpdate): PersonalRecord | null => {
    const existing = personalRecordsStore$.data[id].peek();

    if (!existing) {
      return null;
    }

    const updated: PersonalRecord = {
      ...existing,
      ...updates,
      id, // Ensure ID cannot be changed
    };

    // Validate updated data
    if (updates.type) {
      const validTypes: PRType[] = ['weight', 'reps', 'volume', 'time', 'distance'];
      if (!validTypes.includes(updates.type)) {
        throw new Error(`Invalid PR type: ${updates.type}`);
      }
    }

    // Update in store
    personalRecordsStore$.data[id].set(updated);

    return updated;
  },

  // Delete personal record
  deletePersonalRecord: (id: string): boolean => {
    const existing = personalRecordsStore$.data[id].peek();

    if (!existing) {
      return false;
    }

    // Remove from store
    personalRecordsStore$.data[id].delete();

    return true;
  },

  // Get personal records by exercise ID
  getByExerciseId: (exerciseId: string): PersonalRecord[] => {
    const allPRs = personalRecordsStore$.data.peek();
    if (!allPRs) return [];

    return Object.values(allPRs).filter((pr) => pr.exerciseId === exerciseId);
  },

  // Get personal records by workout history ID
  getByWorkoutHistoryId: (workoutHistoryId: string): PersonalRecord[] => {
    const allPRs = personalRecordsStore$.data.peek();
    if (!allPRs) return [];

    return Object.values(allPRs).filter((pr) => pr.workoutHistoryId === workoutHistoryId);
  },

  // Get best personal record for exercise and type
  getBestPR: (exerciseId: string, type: PRType): PersonalRecord | null => {
    const exercisePRs = personalRecordsOperations.getByExerciseId(exerciseId);
    const typePRs = exercisePRs.filter((pr) => pr.type === type);

    if (typePRs.length === 0) return null;

    // For all PR types, higher values are better
    return typePRs.reduce((best, current) => (current.value > best.value ? current : best));
  },

  // Get all personal records grouped by exercise
  getGroupedByExercise: (): Record<string, PersonalRecord[]> => {
    const allPRs = personalRecordsStore$.data.peek();
    if (!allPRs) return {};

    const grouped: Record<string, PersonalRecord[]> = {};

    Object.values(allPRs).forEach((pr) => {
      if (!grouped[pr.exerciseId]) {
        grouped[pr.exerciseId] = [];
      }
      grouped[pr.exerciseId].push(pr);
    });

    return grouped;
  },

  // Clear all personal records (for testing/reset)
  clearAll: () => {
    personalRecordsStore$.data.set({});
  },

  // Debug utilities
  debug: {
    getStoreState: () => ({
      data: personalRecordsStore$.data.peek(),
    }),
  },
};

// Export store selectors for reactive access
export const personalRecordsSelectors = {
  // Get all personal records as array
  getAll: () => {
    const data = personalRecordsStore$.data.get();
    return Object.values(data || {});
  },

  // Get personal record by ID
  getById: (id: string) => personalRecordsStore$.data[id].get(),

  // Get loading state
  isLoading: () => personalRecordsStore$.isLoading.get(),

  // Get error state
  getError: () => personalRecordsStore$.error.get(),
};

// Legacy exports for compatibility
export const personalRecordsActions = personalRecordsOperations;
