import React from 'react';

import { View, Pressable, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import type { MuscleGroup } from '~/lib/legend-state/stores/muscleGroupsStore';

import { ExerciseNameInput, ExerciseTypePicker, UsesPlatesToggle } from './exercise-form-fields';
import { PrimaryMuscleGroupSelector, SecondaryMuscleGroupSelector } from './muscle-group-selectors';

interface ExerciseFormModalProps {
  showModal: boolean;
  mode: 'create' | 'edit';
  validationError: string | null;
  exerciseName: string;
  setExerciseName: (name: string) => void;
  setValidationError: (error: string | null) => void;
  exerciseType: 'reps' | 'time' | 'distance';
  setExerciseType: (type: 'reps' | 'time' | 'distance') => void;
  usesPlates: boolean;
  setUsesPlates: (value: boolean) => void;
  primaryMuscleGroup: string;
  setPrimaryMuscleGroup: (id: string) => void;
  secondaryMuscleGroups: string[];
  setSecondaryMuscleGroups: (groups: string[]) => void;
  muscleGroups: MuscleGroup[];
  onSave: () => void;
  onCancel: () => void;
}

export function ExerciseFormModal({
  showModal,
  mode,
  validationError,
  exerciseName,
  setExerciseName,
  setValidationError,
  exerciseType,
  setExerciseType,
  usesPlates,
  setUsesPlates,
  primaryMuscleGroup,
  setPrimaryMuscleGroup,
  secondaryMuscleGroups,
  setSecondaryMuscleGroups,
  muscleGroups,
  onSave,
  onCancel,
}: ExerciseFormModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="border-b border-border bg-card">
            <View className="flex-row items-center justify-between px-6 py-4">
              <Pressable onPress={onCancel} hitSlop={10} testID="modal-cancel-button">
                <Text className="text-base font-medium text-primary">{t('common.cancel')}</Text>
              </Pressable>
              <Text className="text-xl font-bold text-foreground">
                {mode === 'edit' ? t('customExercise.editTitle') : t('customExercise.createTitle')}
              </Text>
              <Pressable onPress={onSave} hitSlop={10} testID="modal-save-button">
                <Text className="text-base font-semibold text-primary">
                  {mode === 'edit' ? t('common.save') : t('customExercise.create')}
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            <View className="px-6 py-6">
              {/* Validation Error */}
              {validationError && (
                <View className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 p-4">
                  <View className="flex-row items-center">
                    <AlertCircle size={20} color={colors.notification} />
                    <Text className="ml-2 font-medium text-destructive">{validationError}</Text>
                  </View>
                </View>
              )}

              {/* Exercise Name */}
              <ExerciseNameInput
                exerciseName={exerciseName}
                setExerciseName={setExerciseName}
                setValidationError={setValidationError}
              />

              {/* Exercise Type */}
              <ExerciseTypePicker exerciseType={exerciseType} setExerciseType={setExerciseType} />

              {/* Uses Plates Toggle */}
              <UsesPlatesToggle
                usesPlates={usesPlates}
                setUsesPlates={setUsesPlates}
                exerciseType={exerciseType}
              />

              {/* Primary Muscle Group */}
              <PrimaryMuscleGroupSelector
                primaryMuscleGroup={primaryMuscleGroup}
                setPrimaryMuscleGroup={setPrimaryMuscleGroup}
                muscleGroups={muscleGroups}
              />

              {/* Secondary Muscle Groups */}
              <SecondaryMuscleGroupSelector
                primaryMuscleGroup={primaryMuscleGroup}
                secondaryMuscleGroups={secondaryMuscleGroups}
                setSecondaryMuscleGroups={setSecondaryMuscleGroups}
                muscleGroups={muscleGroups}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
