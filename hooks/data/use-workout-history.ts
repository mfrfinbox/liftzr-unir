import { useMemo } from 'react';

import { useSelector } from '@legendapp/state/react';

import { workoutHistoryStore$ } from '~/lib/legend-state/stores/workoutHistoryStore';
import type { WorkoutHistory } from '~/types';

export type WorkoutStatsMap = Record<
  string,
  {
    completionCount: number;
    lastCompleted: string | null;
  }
>;

export function useWorkoutHistory() {
  const allWorkoutHistory = useSelector(workoutHistoryStore$.workoutHistory);
  const isLoading = useSelector(workoutHistoryStore$.isLoading);

  // Sort workout history by date (newest first)
  const workoutHistory = useMemo(() => {
    return [...allWorkoutHistory].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.date);
      const dateB = new Date(b.completedAt || b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [allWorkoutHistory]);

  const addWorkoutEntry = (entry: Omit<WorkoutHistory, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: WorkoutHistory = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    workoutHistoryStore$.workoutHistory.push(newEntry);
    return newEntry;
  };

  const updateWorkoutEntry = (id: string, updates: Partial<WorkoutHistory>) => {
    const history = workoutHistoryStore$.workoutHistory.peek();
    const index = history.findIndex((h) => h.id === id);
    if (index !== -1) {
      workoutHistoryStore$.workoutHistory[index].set({
        ...history[index],
        ...updates,
        updatedAt: new Date(),
      });
    }
  };

  const deleteWorkoutEntry = (id: string) => {
    const history = workoutHistoryStore$.workoutHistory.peek();
    const filtered = history.filter((h) => h.id !== id);
    workoutHistoryStore$.workoutHistory.set(filtered);
  };

  return {
    workoutHistory,
    isLoading,
    addWorkoutEntry,
    updateWorkoutEntry,
    deleteWorkoutEntry,
  };
}

export function useWorkoutCompletionStats(): WorkoutStatsMap {
  const allWorkoutHistory = useSelector(workoutHistoryStore$.workoutHistory);

  return useMemo(() => {
    const statsMap: WorkoutStatsMap = {};

    // Group history by workout ID and calculate stats
    allWorkoutHistory.forEach((entry) => {
      if (!statsMap[entry.workoutId]) {
        statsMap[entry.workoutId] = {
          completionCount: 0,
          lastCompleted: null,
        };
      }

      statsMap[entry.workoutId].completionCount++;

      // Update last completed date if this entry is more recent
      const entryDate = entry.date;
      const lastCompleted = statsMap[entry.workoutId].lastCompleted;
      if (!lastCompleted || new Date(entryDate) > new Date(lastCompleted)) {
        statsMap[entry.workoutId].lastCompleted = entryDate;
      }
    });

    return statsMap;
  }, [allWorkoutHistory]);
}
