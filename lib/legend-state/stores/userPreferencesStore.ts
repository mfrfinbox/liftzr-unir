import { observable } from '@legendapp/state';

import type { UserPreferences } from '~/types';

import { ObservablePersistMMKV } from '../config/mmkvPersistPlugin';

import type { PendingOperation } from '../config/createStore';

// Default user preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  measurementSystem: 'metric',
  defaultSetRest: 60,
  defaultExerciseRest: 120,
  weekStartDay: 1, // Monday
  bodyweight: undefined,
  showWorkoutCompletionAlerts: true,
};

// Create the observable store with network status
export const userPreferencesStore$ = observable({
  // Single user preferences object (no array needed)
  userPreferences: DEFAULT_USER_PREFERENCES as UserPreferences,
  isInitialized: false,
  hasExistingPreferences: false,
  isOffline: false,
  // Sync-related properties
  pendingOperations: [] as PendingOperation<UserPreferences>[],
  lastSyncTime: null as number | null,
  isSyncing: false,
});

// Initialize persistence for user preferences
export function setupUserPreferencesSync() {
  // Load persisted preferences
  const storedString = ObservablePersistMMKV.get('userPreferences');
  let stored = DEFAULT_USER_PREFERENCES;

  if (storedString) {
    try {
      const parsed = JSON.parse(storedString);
      // Merge parsed data with defaults to ensure all fields exist
      stored = {
        ...DEFAULT_USER_PREFERENCES,
        ...parsed,
      };
    } catch (_e) {
      // Failed to parse stored preferences
      stored = DEFAULT_USER_PREFERENCES;
    }
  }

  // Initialize store with persisted data
  userPreferencesStore$.userPreferences.set(stored);

  // Check if we have actual saved preferences or just defaults
  const hasExisting = stored && JSON.stringify(stored) !== JSON.stringify(DEFAULT_USER_PREFERENCES);
  userPreferencesStore$.hasExistingPreferences.set(hasExisting);
  userPreferencesStore$.isInitialized.set(true);

  // Load persisted pending operations
  const storedPending = ObservablePersistMMKV.get('userPreferences-pending');
  if (storedPending && Array.isArray(storedPending)) {
    userPreferencesStore$.pendingOperations.set(storedPending);
  }

  const storedSyncTime = ObservablePersistMMKV.get('userPreferences-sync');
  if (typeof storedSyncTime === 'number') {
    userPreferencesStore$.lastSyncTime.set(storedSyncTime);
  }

  // Auto-save to MMKV on any change
  userPreferencesStore$.userPreferences.onChange(() => {
    const prefs = userPreferencesStore$.userPreferences.peek();
    // Ensure we always save a valid value, never undefined
    const toSave = prefs || DEFAULT_USER_PREFERENCES;
    ObservablePersistMMKV.set('userPreferences', JSON.stringify(toSave));
  });

  // Persist pending operations
  userPreferencesStore$.pendingOperations.onChange(() => {
    ObservablePersistMMKV.set(
      'userPreferences-pending',
      userPreferencesStore$.pendingOperations.peek()
    );
  });

  // Persist last sync time
  userPreferencesStore$.lastSyncTime.onChange(() => {
    ObservablePersistMMKV.set('userPreferences-sync', userPreferencesStore$.lastSyncTime.peek());
  });
}

// Initialize persistence on module load
setupUserPreferencesSync();

// Operations for user preferences
export const userPreferencesOperations = {
  // Get current preferences
  getPreferences: (): UserPreferences => {
    return userPreferencesStore$.userPreferences.peek();
  },

  // Update preferences (partial update)
  updatePreferences: (updates: Partial<UserPreferences>): void => {
    const currentPrefs = userPreferencesStore$.userPreferences.peek();
    const updatedPrefs = {
      ...currentPrefs,
      ...updates,
    };

    // Update the store
    userPreferencesStore$.userPreferences.set(updatedPrefs);
    userPreferencesStore$.hasExistingPreferences.set(true);

    // Queue for sync - user preferences is a single record, so we use 'update' operation
    // Clear any existing pending operations since we're replacing the entire preferences
    userPreferencesStore$.pendingOperations.set([
      {
        id: 'user-preferences', // Fixed ID for single-record entity
        type: 'update',
        data: updatedPrefs,
        timestamp: Date.now(),
      },
    ]);

    // Sync will be triggered automatically by change listeners
  },

  // Reset to defaults
  resetToDefaults: (): void => {
    userPreferencesStore$.userPreferences.set(DEFAULT_USER_PREFERENCES);
    userPreferencesStore$.hasExistingPreferences.set(false);
  },

  // Check if preferences have been modified from defaults
  hasCustomPreferences: (): boolean => {
    const current = userPreferencesStore$.userPreferences.peek();
    return JSON.stringify(current) !== JSON.stringify(DEFAULT_USER_PREFERENCES);
  },

  // Measurement system helpers
  setMeasurementSystem: (system: 'metric' | 'imperial'): void => {
    userPreferencesOperations.updatePreferences({ measurementSystem: system });
  },

  // Rest time helpers
  setDefaultRestTimes: (setRest: number, exerciseRest: number): void => {
    userPreferencesOperations.updatePreferences({
      defaultSetRest: Math.max(0, setRest),
      defaultExerciseRest: Math.max(0, exerciseRest),
    });
  },

  // Week start helper
  setWeekStartDay: (day: number): void => {
    if (day >= 0 && day <= 6) {
      userPreferencesOperations.updatePreferences({ weekStartDay: day });
    }
  },

  // Process pending operations (called by sync manager)
  processPendingOperations: async (): Promise<void> => {
    // Nothing to do here - sync manager handles the actual sync
    // This is just to satisfy the store interface
    userPreferencesStore$.isSyncing.set(false);
  },

  // Bodyweight helper
  setBodyweight: (weight: number | undefined): void => {
    userPreferencesOperations.updatePreferences({ bodyweight: weight });
  },
};

// Debug utilities
export const userPreferencesDebug = {
  logState: () => {
    // Debug logging removed for production
  },
};
