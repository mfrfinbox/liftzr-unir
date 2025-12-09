import { useMemo } from 'react';

import { useWorkoutHistory } from '~/hooks/data';
import type { Exercise, WorkoutHistory } from '~/types';

import type { GroupedHistoryEntry, HistoricalSet } from './types';

export function useExerciseHistory(exercise?: Exercise) {
  const { workoutHistory: allHistory } = useWorkoutHistory();

  // Filter history to only include entries with this exercise
  const exerciseHistory = useMemo(() => {
    if (!exercise || !allHistory.length) return [];

    return allHistory.filter(
      (h: WorkoutHistory) =>
        h.exercises &&
        Array.isArray(h.exercises) &&
        h.exercises.some((e: any) => e.exerciseId === exercise.id)
    );
  }, [allHistory, exercise]);

  // Group history by date
  const groupedHistory = useMemo(() => {
    if (!exercise || !exerciseHistory.length) return [];

    const dates: { [key: string]: { date: string; sets: any[] } } = {};

    exerciseHistory.forEach((workoutSession: WorkoutHistory) => {
      const dateKey = new Date(workoutSession.date).toLocaleDateString('en-US');
      const exerciseEntry = workoutSession.exercises.find((e: any) => e.exerciseId === exercise.id);

      if (exerciseEntry) {
        if (!dates[dateKey]) {
          dates[dateKey] = {
            date: workoutSession.date,
            sets: [],
          };
        }

        exerciseEntry.sets.forEach((set: any) => {
          dates[dateKey].sets.push({
            ...set,
            dateString: workoutSession.date,
          });
        });
      }
    });

    return Object.values(dates).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ) as GroupedHistoryEntry[];
  }, [exerciseHistory, exercise]);

  // Extract all sets for this exercise from the history
  const historicalSets = useMemo(() => {
    if (!exercise) return [];

    const sets: HistoricalSet[] = [];

    exerciseHistory.forEach((workoutSession: WorkoutHistory) => {
      const exerciseEntry = workoutSession.exercises.find((e: any) => e.exerciseId === exercise.id);

      if (exerciseEntry) {
        exerciseEntry.sets.forEach((set: any) => {
          const timeValue = set.time || set.duration || 0;

          sets.push({
            date: workoutSession.date,
            reps: set.reps || 0,
            weight: set.weight || 0,
            rest: set.rest,
            time: timeValue,
            distance: set.distance || 0,
          });
        });
      }
    });

    return sets;
  }, [exerciseHistory, exercise]);

  return {
    exerciseHistory,
    groupedHistory,
    historicalSets,
  };
}
