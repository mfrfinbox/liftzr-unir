import { observable } from '@legendapp/state';

import type { MuscleGroup } from '~/types';

import { ObservablePersistMMKV } from '../config/mmkvPersistPlugin';

// Re-export the type for backward compatibility
export type { MuscleGroup };

// Create the muscle groups store
export const muscleGroupsStore$ = observable({
  muscleGroups: [] as MuscleGroup[],
  isLoading: false,
});

// Initialize persistence for offline-first functionality
export function setupMuscleGroupsSync() {
  try {
    // Load persisted data
    const storedMuscleGroups = ObservablePersistMMKV.get('muscle-groups-store');

    if (storedMuscleGroups) {
      try {
        const parsed = JSON.parse(storedMuscleGroups);
        if (Array.isArray(parsed)) {
          muscleGroupsStore$.muscleGroups.set(parsed);
        }
      } catch (_e) {
        // Reset to safe default
        const defaultState: MuscleGroup[] = [];
        muscleGroupsStore$.muscleGroups.set(defaultState);
        // Clear corrupted data
        ObservablePersistMMKV.delete('muscle-groups-store');
        // Save clean state
        ObservablePersistMMKV.set('muscle-groups-store', JSON.stringify(defaultState));
      }
    }

    // Set up persistence on changes
    muscleGroupsStore$.muscleGroups.onChange((muscleGroups) => {
      ObservablePersistMMKV.set('muscle-groups-store', JSON.stringify(muscleGroups));
    });
  } catch (_error) {}
}

// Initialize persistence on module load
setupMuscleGroupsSync();
