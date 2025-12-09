/**
 * Workout Editability Hook
 * Determines if a workout is editable (always true now - no tier restrictions)
 */

import { useCallback } from 'react';

import type { UseWorkoutEditabilityProps } from './types';

export function useWorkoutEditability({
  workout: _workout,
  workouts: _workouts,
}: UseWorkoutEditabilityProps) {
  /**
   * Check if workout is editable - always true now (no tier restrictions)
   */
  const isWorkoutEditable = useCallback((): boolean => {
    return true; // Everyone has full access
  }, []);

  /**
   * Show upgrade prompt when user tries to edit locked workout
   * (No longer needed - everyone has full access)
   */
  const handleShowUpgradePrompt = useCallback(async () => {
    // No-op - everyone has full access now
  }, []);

  return {
    isWorkoutEditable,
    handleShowUpgradePrompt,
  };
}
