import React, { useState } from 'react';

import { View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useMuscleGroups } from '~/hooks/data';
import type { Exercise } from '~/types';

import { ExerciseFormModal } from './exercise-form-modal';
import { validateForm } from './form-validation';
import { useFormState } from './use-form-state';

import type { CustomExerciseCreatorProps } from './types';

export function CustomExerciseCreator({
  searchQuery = '',
  onCreateCustomExercise,
  onUpdateExercise,
  onClearSearch,
  editingExercise,
  isOpen = false,
  onClose,
  mode = 'create',
  existingExercises = [],
}: CustomExerciseCreatorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { muscleGroups, isLoading } = useMuscleGroups();
  const [showModal, setShowModal] = useState(isOpen);

  const {
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
  } = useFormState({ isOpen, editingExercise, mode });

  const handleCreateExercise = async () => {
    setExerciseName(searchQuery);
    setShowModal(true);
  };

  const handleSaveExercise = () => {
    setValidationError(null);

    const error = validateForm({
      exerciseName,
      primaryMuscleGroup,
      mode,
      editingExercise,
      existingExercises,
    });

    if (error) {
      setValidationError(error);
      return;
    }

    if (mode === 'edit' && editingExercise) {
      onUpdateExercise?.({
        id: editingExercise.id,
        name: exerciseName.trim(),
        type: exerciseType,
        primaryMuscleGroup: primaryMuscleGroup,
        secondaryMuscleGroups: secondaryMuscleGroups,
        usesPlates: exerciseType === 'reps' ? usesPlates : false,
      });
    } else {
      const newExercise: Omit<Exercise, 'id'> = {
        name: exerciseName.trim(),
        primaryMuscleGroup: primaryMuscleGroup,
        secondaryMuscleGroups: secondaryMuscleGroups.length > 0 ? secondaryMuscleGroups : undefined,
        type: exerciseType,
        isCustom: true,
        usesPlates: exerciseType === 'reps' ? usesPlates : false,
      };
      onClearSearch?.(exerciseName);
      onCreateCustomExercise?.(newExercise);
    }

    setShowModal(false);
    onClose?.();
    resetForm();
  };

  const handleCancel = () => {
    setShowModal(false);
    onClose?.();
    resetForm();
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-muted-foreground">{t('workoutHistory.loadingMuscleGroups')}</Text>
      </View>
    );
  }

  if (mode === 'edit') {
    return (
      <ExerciseFormModal
        showModal={showModal}
        mode={mode}
        validationError={validationError}
        exerciseName={exerciseName}
        setExerciseName={setExerciseName}
        setValidationError={setValidationError}
        exerciseType={exerciseType}
        setExerciseType={setExerciseType}
        usesPlates={usesPlates}
        setUsesPlates={setUsesPlates}
        primaryMuscleGroup={primaryMuscleGroup}
        setPrimaryMuscleGroup={setPrimaryMuscleGroup}
        secondaryMuscleGroups={secondaryMuscleGroups}
        setSecondaryMuscleGroups={setSecondaryMuscleGroups}
        muscleGroups={muscleGroups}
        onSave={handleSaveExercise}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <>
      <View>
        <Button
          variant="outline"
          className="flex-row items-center justify-center border-primary/30 bg-primary/5 py-4"
          onPress={handleCreateExercise}
          testID="create-custom-exercise-button">
          <View className="flex-row items-center gap-3">
            <Plus size={20} color={colors.primary} />
            <Text className="text-primary">{t('customExercise.createCustomExercise')}</Text>
          </View>
        </Button>

        {searchQuery && (
          <View className="mt-3 items-center">
            <Text className="text-center text-sm text-muted-foreground">
              {t('workoutHistory.cantFind', { query: searchQuery })}
            </Text>
          </View>
        )}
      </View>

      <ExerciseFormModal
        showModal={showModal}
        mode={mode}
        validationError={validationError}
        exerciseName={exerciseName}
        setExerciseName={setExerciseName}
        setValidationError={setValidationError}
        exerciseType={exerciseType}
        setExerciseType={setExerciseType}
        usesPlates={usesPlates}
        setUsesPlates={setUsesPlates}
        primaryMuscleGroup={primaryMuscleGroup}
        setPrimaryMuscleGroup={setPrimaryMuscleGroup}
        secondaryMuscleGroups={secondaryMuscleGroups}
        setSecondaryMuscleGroups={setSecondaryMuscleGroups}
        muscleGroups={muscleGroups}
        onSave={handleSaveExercise}
        onCancel={handleCancel}
      />
    </>
  );
}

// Re-export types for backward compatibility
export type { CustomExerciseCreatorProps } from './types';
