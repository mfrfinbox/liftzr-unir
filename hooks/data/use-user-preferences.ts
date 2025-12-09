import { useSelector } from '@legendapp/state/react';

import {
  userPreferencesStore$,
  userPreferencesOperations,
} from '~/lib/legend-state/stores/userPreferencesStore';

export function useUserPreferences() {
  const userPreferences = useSelector(userPreferencesStore$.userPreferences);
  const isLoading = useSelector(userPreferencesStore$.isInitialized) === false;

  const updateUserPreferences = (updates: any) => {
    // Use the operations method which handles pending operations and sync
    userPreferencesOperations.updatePreferences(updates);
  };

  return {
    userPreferences,
    isLoading,
    updateUserPreferences,
  };
}
