/**
 * Statistics Calculations Hook
 * Calculates workout statistics for selected time period
 */

import { useMemo } from 'react';

import { WORKOUT_FIELDS } from '~/lib/constants';
import type { Exercise, WorkoutHistory } from '~/types';

interface UseStatisticsCalculationsProps {
  workoutHistory: WorkoutHistory[];
  exercises: Exercise[];
  weekStartDayNumber: number;
  timePeriod: 'week' | 'month';
  monthOffset: number;
}

export function useStatisticsCalculations({
  workoutHistory,
  exercises,
  weekStartDayNumber,
  timePeriod,
  monthOffset,
}: UseStatisticsCalculationsProps) {
  // Calculate the earliest workout date to limit navigation
  const earliestWorkoutDate = useMemo(() => {
    if (workoutHistory.length === 0) return new Date();
    const dates = workoutHistory.map((w) => new Date(w.date));
    return new Date(Math.min(...dates.map((d) => d.getTime())));
  }, [workoutHistory]);

  // Memoize statistics calculations based on selected time period
  const { weeklyWorkouts, thisWeekStats, thisWeekWorkouts, periodStartDate, periodEndDate } =
    useMemo(() => {
      if (workoutHistory.length === 0) {
        return {
          weeklyWorkouts: {},
          thisWeekStats: { workouts: 0, sets: 0, weightLifted: 0, totalTime: 0 },
          thisWeekWorkouts: [],
          periodStartDate: new Date(),
          periodEndDate: new Date(),
        };
      }

      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
      const weekStartDay = weekStartDayNumber; // 0 = Sunday, 1 = Monday

      let periodStartDate: Date;
      let periodEndDate: Date;

      if (timePeriod === 'week') {
        // Calculate how many days to go back to reach the start of the week
        let daysToSubtract = currentDay - weekStartDay;
        if (daysToSubtract < 0) {
          daysToSubtract += 7; // Handle case where current day is before week start
        }

        periodStartDate = new Date(today);
        periodStartDate.setDate(today.getDate() - daysToSubtract);
        periodStartDate.setHours(0, 0, 0, 0);
        periodEndDate = new Date(today);
        periodEndDate.setHours(23, 59, 59, 999);
      } else {
        // For month view, calculate based on monthOffset
        const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
        periodStartDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        periodStartDate.setHours(0, 0, 0, 0);

        // End date is either last day of month or today if viewing current month
        if (monthOffset === 0) {
          periodEndDate = new Date(today);
          periodEndDate.setHours(23, 59, 59, 999);
        } else {
          periodEndDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
          periodEndDate.setHours(23, 59, 59, 999);
        }
      }

      // Create a map of days with workouts this week
      const daysWithWorkouts: Record<number, boolean> = {};
      const weekWorkoutsList: typeof workoutHistory = [];
      let weekWorkouts = 0;
      let weekSets = 0;
      let weekWeightLifted = 0;
      let weekTotalTime = 0;

      workoutHistory.forEach((workout) => {
        const workoutDate = new Date(workout.date);

        // Check if the workout is from the current period
        if (workoutDate >= periodStartDate && workoutDate <= periodEndDate) {
          const day = workoutDate.getDay();
          daysWithWorkouts[day] = true;

          // Add to this week's workout list (only for week view)
          if (timePeriod === 'week') {
            weekWorkoutsList.push(workout);
          }

          // Count this week's workouts
          weekWorkouts++;

          // Count this week's sets, weight, and time
          workout.exercises.forEach((exercise) => {
            weekSets += exercise.sets.length;

            const exerciseType =
              exercises.find((ex) => ex.id === exercise.exerciseId)?.type || WORKOUT_FIELDS.REPS;

            if (exerciseType === WORKOUT_FIELDS.REPS) {
              // Count weight volume for rep-based exercises
              exercise.sets.forEach((set) => {
                weekWeightLifted += (set.weight || 0) * (set.reps || 0);
              });
            } else if (exerciseType === 'time' || exerciseType === 'distance') {
              // Count time volume for time-based and distance-based exercises
              exercise.sets.forEach((set) => {
                const timeValue = (set as any).time || (set as any).duration || 0;
                weekTotalTime += timeValue;
              });
            }
          });
        }
      });

      // Sort workouts by date (most recent first)
      weekWorkoutsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        weeklyWorkouts: daysWithWorkouts,
        thisWeekStats: {
          workouts: weekWorkouts,
          sets: weekSets,
          weightLifted: weekWeightLifted,
          totalTime: weekTotalTime,
        },
        thisWeekWorkouts: weekWorkoutsList,
        periodStartDate,
        periodEndDate,
      };
    }, [workoutHistory, weekStartDayNumber, exercises, timePeriod, monthOffset]);

  return {
    weeklyWorkouts,
    thisWeekStats,
    thisWeekWorkouts,
    periodStartDate,
    periodEndDate,
    earliestWorkoutDate,
  };
}
