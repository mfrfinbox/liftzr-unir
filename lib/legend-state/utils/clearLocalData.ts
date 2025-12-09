/**
 * Clear Local Data Utility
 * Clears all local app data
 */

import { MMKV } from 'react-native-mmkv';

import { exercisesStore$ } from '~/lib/legend-state/stores/exercisesStore';
import { personalRecordsStore$ } from '~/lib/legend-state/stores/personalRecordsStore';
import {
  userPreferencesStore$,
  DEFAULT_USER_PREFERENCES,
} from '~/lib/legend-state/stores/userPreferencesStore';
import { workoutHistoryStore$ } from '~/lib/legend-state/stores/workoutHistoryStore';
import { workoutsStore$ } from '~/lib/legend-state/stores/workoutsStore';

import { ObservablePersistMMKV } from '../config/mmkvPersistPlugin';

// Create MMKV instances
const i18nStorage = new MMKV({ id: 'liftzr-i18n-preferences' });
const sortingStorage = new MMKV({ id: 'liftzr-sorting-preferences' });
const workoutPersistenceStorage = new MMKV({ id: 'liftzr-workout-persistence' });

/**
 * Clear all local data from Legend State stores and MMKV
 * This is called on sign out to ensure clean state for next user
 */
export async function clearLocalData() {
  // Clear Legend State stores
  workoutsStore$.workouts.set([]);
  workoutsStore$.isLoading.set(false);

  workoutHistoryStore$.workoutHistory.set([]);
  workoutHistoryStore$.isLoading.set(false);

  // IMPORTANT: Save default exercises before clearing, then restore them
  // This ensures default exercises from JSON remain available after logout
  const currentExercises = exercisesStore$.exercises.peek();
  const defaultExercises = currentExercises.filter((e) => !e.isCustom);

  // Only clear custom exercises
  exercisesStore$.exercises.set(defaultExercises);
  exercisesStore$.isLoading.set(false);

  personalRecordsStore$.data.set({});
  personalRecordsStore$.isLoading.set(false);
  personalRecordsStore$.error.set(null);

  // Reset user preferences to defaults
  userPreferencesStore$.userPreferences.set(DEFAULT_USER_PREFERENCES);
  userPreferencesStore$.hasExistingPreferences.set(false);

  // Clear MMKV keys
  const keysToDelete = [
    'workouts-store',
    'workoutHistory-store',
    'exercises-store',
    'personalRecords-data',
    'userPreferences',
  ];

  keysToDelete.forEach((key) => {
    try {
      ObservablePersistMMKV.delete(key);
    } catch {}
  });

  // Clear other MMKV instances
  try {
    i18nStorage.delete('user-language-preference');
    sortingStorage.delete('workoutSortMethod');
    sortingStorage.delete('exerciseSortMethod');
    sortingStorage.delete('activeWorkoutSortMethod');
    workoutPersistenceStorage.delete('workout_state');
  } catch {}
}
