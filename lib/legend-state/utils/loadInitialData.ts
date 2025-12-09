import exercisesData from '~/data/exercises.json';
import muscleGroupsData from '~/data/muscle_groups.json';
import type { Exercise } from '~/types';

import { exercisesStore$ } from '../stores/exercisesStore';
import { muscleGroupsStore$ } from '../stores/muscleGroupsStore';

import type { MuscleGroup } from '../stores/muscleGroupsStore';

/**
 * Compare two arrays of objects by their properties (excluding custom exercises)
 * Optimized for small datasets (< 1000 items)
 */
function arraysEqual<T extends Record<string, any>>(
  arr1: T[],
  arr2: T[],
  compareKey: keyof T
): boolean {
  if (arr1.length !== arr2.length) return false;

  // Quick length check first (most common case)
  if (arr1.length === 0) return true;

  // Sort both arrays by compareKey for consistent comparison
  const sorted1 = [...arr1].sort((a, b) =>
    String(a[compareKey]).localeCompare(String(b[compareKey]))
  );
  const sorted2 = [...arr2].sort((a, b) =>
    String(a[compareKey]).localeCompare(String(b[compareKey]))
  );

  // JSON comparison is efficient for small datasets like exercises (~134 items)
  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
}

/**
 * Load initial data from JSON files into Legend State stores
 * Compares persisted data with JSON files and updates if different
 */
export function loadInitialData() {
  // Check if we already have exercises loaded
  const existingExercises = exercisesStore$.exercises.peek();

  // Extract only default (non-custom) exercises from existing data
  const existingDefaultExercises = existingExercises?.filter((ex) => !ex.isCustom) || [];

  // Extract only custom exercises to preserve them
  const existingCustomExercises =
    existingExercises?.filter(
      (ex) => ex.isCustom && ex.primaryMuscleGroup && Array.isArray(ex.primaryMuscleGroup)
    ) || [];

  // Always compare with JSON data to detect changes
  const jsonExercises = exercisesData as Exercise[];
  const exercisesNeedUpdate = !arraysEqual(existingDefaultExercises, jsonExercises, 'id');

  // Load if empty, corrupted, or different from JSON
  if (!existingExercises || existingExercises.length === 0 || exercisesNeedUpdate) {
    // Loading initial exercises from JSON or updating if changes detected

    // Merge JSON data with existing custom exercises
    const mergedExercises = [...jsonExercises, ...existingCustomExercises];
    exercisesStore$.exercises.set(mergedExercises);

    // Successfully loaded/updated exercises
  } else {
    // Exercises already loaded with valid data (no changes detected)
  }

  // Load muscle groups with comparison
  const existingMuscleGroups = muscleGroupsStore$.muscleGroups.peek() || [];
  const jsonMuscleGroups = muscleGroupsData as MuscleGroup[];
  const muscleGroupsNeedUpdate = !arraysEqual(existingMuscleGroups, jsonMuscleGroups, 'id');

  if (!existingMuscleGroups || existingMuscleGroups.length === 0 || muscleGroupsNeedUpdate) {
    // Loading initial muscle groups from JSON or updating if changes detected

    muscleGroupsStore$.muscleGroups.set(jsonMuscleGroups);
    // Successfully updated muscle groups
  } else {
    // Muscle groups already loaded (no changes detected)
  }
}
