/**
 * PR Modal Hook
 * Manages PR modal state for workout history
 */

import { useState, useCallback } from 'react';

import type { PersonalRecord } from '~/lib/services/pr-tracking/types';

import type { UsePRModalReturn } from './types';

/**
 * Hook to manage PR modal state
 */
export function usePRModal(): UsePRModalReturn {
  const [prModalVisible, setPrModalVisible] = useState(false);
  const [selectedWorkoutPRs, setSelectedWorkoutPRs] = useState<PersonalRecord[]>([]);

  const handlePRPress = useCallback((prs: PersonalRecord[]) => {
    setSelectedWorkoutPRs(prs);
    setPrModalVisible(true);
  }, []);

  const closePRModal = useCallback(() => {
    setPrModalVisible(false);
  }, []);

  return {
    prModalVisible,
    selectedWorkoutPRs,
    handlePRPress,
    closePRModal,
  };
}
