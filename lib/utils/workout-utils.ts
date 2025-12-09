import type { WorkoutStatsMap } from '~/hooks/data/use-workout-history';
import i18n from '~/lib/config/i18n';
import { Workout } from '~/types';

// Format the date
export const formatDate = (dateString: string) => {
  if (!dateString) return i18n.t('home.never');
  const date = new Date(dateString);
  // Use the current locale from i18n
  const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};

// Count exercises in a workout
export const getExerciseCount = (workout: Workout) => {
  if (!workout.exercises) {
    return 0;
  }
  return workout.exercises.length;
};

// Format completion status
export const getCompletionStatus = (workout: Workout, workoutCompletionStats: WorkoutStatsMap) => {
  const stats = workoutCompletionStats[workout.id];
  if (!stats || !stats.lastCompleted) {
    return i18n.t('home.neverDone');
  }
  return i18n.t('home.lastDone', { date: formatDate(stats.lastCompleted) });
};

// Format completion count
export const getCompletionCount = (workout: Workout, workoutCompletionStats: WorkoutStatsMap) => {
  const stats = workoutCompletionStats[workout.id];
  if (!stats || stats.completionCount === 0) {
    return i18n.t('home.neverDone');
  }
  const timeWord = stats.completionCount === 1 ? i18n.t('home.time') : i18n.t('home.times');
  return `${i18n.t('home.done')} ${stats.completionCount} ${timeWord}`;
};

/**
 * Generate unique workout name to avoid duplicates
 */
export const generateUniqueWorkoutName = (
  baseName: string,
  existingWorkouts: Workout[]
): string => {
  const baseTitle = baseName || 'Quick Workout';

  // Check if the base name already exists
  const existingWorkout = existingWorkouts.find((w) => w.title === baseTitle);
  if (!existingWorkout) {
    return baseTitle; // Name is unique, use it as-is
  }

  // If base name exists, find the next available number
  let counter = 2;
  let uniqueName = `${baseTitle} (${counter})`;

  while (existingWorkouts.some((w) => w.title === uniqueName)) {
    counter++;
    uniqueName = `${baseTitle} (${counter})`;
  }

  return uniqueName;
};
