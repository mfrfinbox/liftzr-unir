import type { Exercise } from '~/types';

interface ValidateFormParams {
  exerciseName: string;
  primaryMuscleGroup: string;
  mode: 'create' | 'edit';
  editingExercise?: Exercise;
  existingExercises: Exercise[];
}

export function validateForm({
  exerciseName,
  primaryMuscleGroup,
  mode,
  editingExercise,
  existingExercises,
}: ValidateFormParams): string | null {
  if (!exerciseName.trim()) {
    return 'Please enter a valid exercise name';
  }

  if (!primaryMuscleGroup) {
    return 'Please select a primary muscle group';
  }

  if (mode === 'create' || (mode === 'edit' && editingExercise?.name !== exerciseName.trim())) {
    const duplicateExists = existingExercises.some(
      (e) => e.name.toLowerCase() === exerciseName.trim().toLowerCase() && e.isCustom
    );

    if (duplicateExists) {
      return `You already have a custom exercise named "${exerciseName.trim()}". Please choose a different name.`;
    }
  }

  return null;
}
