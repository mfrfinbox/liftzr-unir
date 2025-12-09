import { useState, useEffect } from 'react';

import { WORKOUT_FIELDS } from '~/lib/constants';
import type { Exercise } from '~/types';

interface UseFormStateProps {
  isOpen: boolean;
  editingExercise?: Exercise & {
    primaryMuscleGroupId?: string;
    secondaryMuscleGroupIds?: string[];
  };
  mode: 'create' | 'edit';
}

export function useFormState({ isOpen, editingExercise, mode }: UseFormStateProps) {
  const [exerciseType, setExerciseType] = useState<'reps' | 'time' | 'distance'>(
    WORKOUT_FIELDS.REPS
  );
  const [primaryMuscleGroup, setPrimaryMuscleGroup] = useState<string>('');
  const [secondaryMuscleGroups, setSecondaryMuscleGroups] = useState<string[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  const [usesPlates, setUsesPlates] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setPrimaryMuscleGroup('');
    setSecondaryMuscleGroups([]);
    setExerciseType(WORKOUT_FIELDS.REPS);
    setExerciseName('');
    setUsesPlates(false);
    setValidationError(null);
  };

  useEffect(() => {
    if (isOpen && editingExercise && mode === 'edit') {
      setExerciseName(editingExercise.name);
      setExerciseType(editingExercise.type);
      setUsesPlates(editingExercise.usesPlates || false);
      const primaryId =
        editingExercise.primaryMuscleGroupId ||
        (editingExercise.primaryMuscleGroup && editingExercise.primaryMuscleGroup) ||
        '';
      setPrimaryMuscleGroup(primaryId);
      const secondaryIds =
        editingExercise.secondaryMuscleGroupIds || editingExercise.secondaryMuscleGroups || [];
      setSecondaryMuscleGroups(secondaryIds);
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, editingExercise, mode]);

  return {
    exerciseType,
    setExerciseType,
    primaryMuscleGroup,
    setPrimaryMuscleGroup,
    secondaryMuscleGroups,
    setSecondaryMuscleGroups,
    exerciseName,
    setExerciseName,
    usesPlates,
    setUsesPlates,
    validationError,
    setValidationError,
    resetForm,
  };
}
