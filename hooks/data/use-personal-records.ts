import { useMemo } from 'react';

import { useSelector } from '@legendapp/state/react';

import {
  personalRecordsStore$,
  personalRecordsOperations,
} from '~/lib/legend-state/stores/personalRecordsStore';
import type { PersonalRecord } from '~/types';

export function usePersonalRecords() {
  const personalRecordsData = useSelector(personalRecordsStore$.data);
  const allPersonalRecords = Object.values(personalRecordsData);
  const isLoading = useSelector(personalRecordsStore$.isLoading);

  const personalRecords = useMemo(() => {
    // Return all PRs - all users have full access to PR history
    return allPersonalRecords;
  }, [allPersonalRecords]);

  const addPersonalRecord = async (pr: Omit<PersonalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Use personalRecordsOperations to ensure pending operation is created for sync
      const newPR = personalRecordsOperations.addPersonalRecord({
        ...pr,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, data: newPR };
    } catch (_error) {
      return { success: false, error: _error instanceof Error ? _error.message : 'Unknown error' };
    }
  };

  const addMultiplePersonalRecords = (
    prs: Omit<PersonalRecord, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const newPRs = prs.map((pr) => {
      // Use personalRecordsOperations to ensure pending operation is created for sync
      return personalRecordsOperations.addPersonalRecord({
        ...pr,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return newPRs;
  };

  const updatePersonalRecord = (id: string, updates: Partial<PersonalRecord>) => {
    const prData = personalRecordsStore$.data[id].peek();
    if (prData) {
      personalRecordsStore$.data[id].set({
        ...prData,
        ...updates,
      } as PersonalRecord);
    }
  };

  const deletePersonalRecord = (id: string) => {
    personalRecordsStore$.data[id].delete();
  };

  return {
    personalRecords,
    isLoading,
    addPersonalRecord,
    addMultiplePersonalRecords,
    updatePersonalRecord,
    deletePersonalRecord,
  };
}

export function usePersonalRecordsByExercise(exerciseId: string) {
  const personalRecordsData = useSelector(personalRecordsStore$.data);
  const allPersonalRecords = Object.values(personalRecordsData);

  const personalRecords = useMemo(() => {
    // Filter by exercise ID
    const filtered = allPersonalRecords.filter(
      (pr: PersonalRecord) => pr.exerciseId === exerciseId
    );
    return filtered;
  }, [allPersonalRecords, exerciseId]);

  return {
    personalRecords,
    isLoading: false,
  };
}

export function usePersonalRecordsByWorkout(workoutHistoryId: string) {
  const personalRecordsData = useSelector(personalRecordsStore$.data);
  const personalRecords = Object.values(personalRecordsData);
  const filtered = personalRecords.filter(
    (pr: PersonalRecord) => pr.workoutHistoryId === workoutHistoryId
  );

  return {
    personalRecords: filtered,
    isLoading: false,
  };
}
