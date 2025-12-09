import React from 'react';

import { View, Pressable } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { WORKOUT_FIELDS } from '~/lib/constants';

interface ExerciseNameInputProps {
  exerciseName: string;
  setExerciseName: (name: string) => void;
  setValidationError: (error: string | null) => void;
}

export function ExerciseNameInput({
  exerciseName,
  setExerciseName,
  setValidationError,
}: ExerciseNameInputProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-8">
      <Text className="mb-3 text-sm font-medium text-muted-foreground">{t('customExercise.exerciseName')}</Text>
      <Input
        value={exerciseName}
        onChangeText={(text) => {
          setExerciseName(text);
          setValidationError(null);
        }}
        placeholder={t('workout.enterExerciseName')}
        className="text-lg font-semibold text-foreground"
        autoCorrect={false}
        spellCheck={false}
        testID="exercise-name-input"
      />
    </View>
  );
}

interface ExerciseTypePickerProps {
  exerciseType: 'reps' | 'time' | 'distance';
  setExerciseType: (type: 'reps' | 'time' | 'distance') => void;
}

export function ExerciseTypePicker({ exerciseType, setExerciseType }: ExerciseTypePickerProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-8">
      <Text className="mb-4 text-sm font-medium text-muted-foreground">{t('customExercise.exerciseType')}</Text>
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => setExerciseType(WORKOUT_FIELDS.REPS)}
          className={`flex-1 flex-row items-center justify-center rounded-md border-2 px-4 py-4 ${
            exerciseType === WORKOUT_FIELDS.REPS
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card'
          }`}
          testID="exercise-type-reps">
          <Text
            className={`text-sm font-semibold ${
              exerciseType === WORKOUT_FIELDS.REPS ? 'text-primary' : 'text-foreground'
            }`}>
            {t('customExercise.reps')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setExerciseType(WORKOUT_FIELDS.TIME)}
          className={`flex-1 flex-row items-center justify-center rounded-md border-2 px-4 py-4 ${
            exerciseType === WORKOUT_FIELDS.TIME
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card'
          }`}
          testID="exercise-type-time">
          <Text
            className={`text-sm font-semibold ${
              exerciseType === WORKOUT_FIELDS.TIME ? 'text-primary' : 'text-foreground'
            }`}>
            {t('customExercise.time')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setExerciseType(WORKOUT_FIELDS.DISTANCE)}
          className={`flex-1 flex-row items-center justify-center rounded-md border-2 px-4 py-4 ${
            exerciseType === WORKOUT_FIELDS.DISTANCE
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card'
          }`}
          testID="exercise-type-distance">
          <Text
            className={`text-sm font-semibold ${
              exerciseType === WORKOUT_FIELDS.DISTANCE ? 'text-primary' : 'text-foreground'
            }`}>
            {t('customExercise.distance')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface UsesPlatesToggleProps {
  usesPlates: boolean;
  setUsesPlates: (value: boolean) => void;
  exerciseType: 'reps' | 'time' | 'distance';
}

export function UsesPlatesToggle({
  usesPlates,
  setUsesPlates,
  exerciseType,
}: UsesPlatesToggleProps) {
  const { t } = useTranslation();

  if (exerciseType !== WORKOUT_FIELDS.REPS) {
    return null;
  }

  return (
    <View className="mb-8">
      <Text className="mb-4 text-sm font-medium text-muted-foreground">{t('customExercise.equipmentOptions')}</Text>
      <Pressable
        onPress={() => setUsesPlates(!usesPlates)}
        className={`flex-row items-center justify-center rounded-md border-2 px-4 py-4 ${
          usesPlates ? 'border-primary bg-primary/10' : 'border-border bg-card'
        }`}
        testID="uses-plates-toggle">
        <Text
          className={`text-sm font-semibold ${usesPlates ? 'text-primary' : 'text-foreground'}`}>
          {t('customExercise.usesPlates')}
        </Text>
      </Pressable>
    </View>
  );
}
