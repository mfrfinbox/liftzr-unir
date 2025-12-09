import type { WorkoutHistory } from '~/types';

/**
 * Calculate current workout streak from workout history
 * A streak is consecutive days with at least one workout
 */
export function calculateWorkoutStreak(workoutHistory: WorkoutHistory[]): number {
  if (!workoutHistory || workoutHistory.length === 0) {
    return 0;
  }

  // Sort workouts by date (most recent first)
  const sortedWorkouts = [...workoutHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique workout dates (ignore time, only consider date)
  const workoutDates = Array.from(
    new Set(
      sortedWorkouts.map((workout) => {
        const date = new Date(workout.date);
        // Reset time to start of day for consistent comparison
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )
  ).sort((a, b) => b - a); // Most recent first

  if (workoutDates.length === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTime = yesterday.getTime();

  // Check if the most recent workout is today or yesterday
  const mostRecentWorkoutTime = workoutDates[0];
  if (mostRecentWorkoutTime !== todayTime && mostRecentWorkoutTime !== yesterdayTime) {
    // If the most recent workout is not today or yesterday, streak is broken
    return 0;
  }

  // Calculate consecutive days
  let streak = 1;
  let expectedNextDate = mostRecentWorkoutTime;

  for (let i = 1; i < workoutDates.length; i++) {
    const currentWorkoutTime = workoutDates[i];
    expectedNextDate -= 24 * 60 * 60 * 1000; // Subtract one day

    if (currentWorkoutTime === expectedNextDate) {
      streak++;
    } else {
      // Gap in consecutive days, streak ends
      break;
    }
  }

  return streak;
}

/**
 * Calculate total number of workouts completed
 */
export function getTotalWorkoutCount(workoutHistory: WorkoutHistory[]): number {
  return workoutHistory?.length || 0;
}

/**
 * Get the date of the first workout (when user started using the app)
 */
export function getFirstWorkoutDate(workoutHistory: WorkoutHistory[]): Date | null {
  if (!workoutHistory || workoutHistory.length === 0) {
    return null;
  }

  // Find the earliest workout date
  const earliestWorkout = workoutHistory.reduce((earliest, current) => {
    return new Date(current.date) < new Date(earliest.date) ? current : earliest;
  });

  return new Date(earliestWorkout.date);
}

/**
 * Check if user is in the honeymoon period (first 2 weeks)
 */
export function isInHoneymoonPeriod(workoutHistory: WorkoutHistory[]): boolean {
  const firstWorkoutDate = getFirstWorkoutDate(workoutHistory);
  if (!firstWorkoutDate) {
    return false;
  }

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  return firstWorkoutDate > twoWeeksAgo;
}

/**
 * Check if user has completed 3-4 workouts within 14 days
 */
export function isAtHoneymoonPeak(workoutHistory: WorkoutHistory[]): boolean {
  const totalWorkouts = getTotalWorkoutCount(workoutHistory);
  const inHoneymoonPeriod = isInHoneymoonPeriod(workoutHistory);

  return inHoneymoonPeriod && totalWorkouts >= 3 && totalWorkouts <= 4;
}

/**
 * Check if user just achieved a 7-day streak
 */
export function hasAchievedSevenDayStreak(workoutHistory: WorkoutHistory[]): boolean {
  const currentStreak = calculateWorkoutStreak(workoutHistory);
  return currentStreak >= 7;
}
