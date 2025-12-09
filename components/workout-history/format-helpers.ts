/**
 * Format Helpers
 * Formatting utility functions for workout history display
 */

import { WORKOUT_FIELDS } from '~/lib/constants';
import type { Exercise } from '~/types';

/**
 * Get exercise type from ID
 */
export function getExerciseType(exerciseId: string, exercises: Exercise[]) {
  const exercise = exercises.find((ex) => ex.id === exerciseId);
  return exercise?.type || WORKOUT_FIELDS.REPS;
}

/**
 * Get exercise name from ID
 */
export function getExerciseName(exerciseId: string, exercises: Exercise[]) {
  const exercise = exercises.find((ex) => ex.id === exerciseId);
  return exercise ? exercise.name : 'Unknown Exercise';
}

/**
 * Format time value for time-based exercises
 */
export function formatTimeValue(seconds: number) {
  if (!seconds || seconds === 0) return '-';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date string
 */
export function formatDate(dateString: string, locale: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time string
 */
export function formatTime(dateString: string, locale: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration in seconds
 */
export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }
  return minutes > 0 ? `${minutes} min` : '<1 min';
}
