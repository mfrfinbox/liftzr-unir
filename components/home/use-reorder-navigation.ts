/**
 * Reorder Navigation Hook
 * Manages navigation to reorder modal and result handling
 */

import { useCallback } from 'react';

import { useRouter, useFocusEffect } from 'expo-router';

import type { Workout } from '~/types';

import type { UseReorderNavigationReturn } from './types';

/**
 * Hook to manage reorder modal navigation
 */
export function useReorderNavigation({
  workouts,
}: {
  workouts: Workout[];
}): UseReorderNavigationReturn {
  const router = useRouter();

  const handleOpenReorderModal = useCallback(() => {
    // Navigate to reorder modal with workouts data
    router.push({
      pathname: '/(app)/(modals)/reorder-workouts',
      params: {
        workouts: JSON.stringify(workouts),
      },
    });
  }, [router, workouts]);

  // Handle navigation result from reorder modal
  // Only reload when returning from the reorder modal specifically
  useFocusEffect(
    useCallback(() => {
      // Import getReorderResult function
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getReorderResult } = require('../../app/(app)/(modals)/reorder-workouts');

      const result = getReorderResult();
      if (result) {
        // We're returning from the reorder modal, reload sort method
        const reloadSortMethod = () => {
          // The sorting preference will be automatically reloaded by the useWorkoutSorting hook
          // No manual intervention needed since the hook persists the sort method
        };

        reloadSortMethod();
      }
      // If no result, we're just gaining focus normally (e.g., from sort menu closing)
      // so don't reload the sort method
    }, [])
  );

  return {
    handleOpenReorderModal,
  };
}
