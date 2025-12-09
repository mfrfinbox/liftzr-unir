import React from 'react';

import { View, FlatList, TouchableOpacity } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { APP_PADDING } from '~/lib/constants';
import type { Exercise } from '~/types';

import { AvailableExerciseItem } from '../available-exercise-item';
import { CustomExerciseCreator } from '../custom-exercise-creator';
import { ExerciseSearchBar } from '../exercise-search-bar';

interface ExerciseSelectionViewProps {
  filteredExercises: Exercise[];
  selectedExerciseIds: Set<string>;
  searchQuery: string;
  exerciseCount: number;
  onChangeSearchQuery: (query: string) => void;
  onClearSearch: () => void;
  cancelExerciseSelection: () => void;
  applyExerciseSelection: () => void;
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise?: (exerciseId: string) => void;
  onCreateCustomExercise?: (exercise: Omit<Exercise, 'id'>) => void;
  onToggleExercise: (exercise: Exercise) => void;
}

export function ExerciseSelectionView({
  filteredExercises,
  selectedExerciseIds,
  searchQuery,
  exerciseCount,
  onChangeSearchQuery,
  onClearSearch,
  cancelExerciseSelection,
  applyExerciseSelection,
  onAddExercise,
  onRemoveExercise,
  onCreateCustomExercise,
}: ExerciseSelectionViewProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <View className="border-b border-border">
        <View className="px-4 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={cancelExerciseSelection}
              className="z-10"
              testID="button-cancel-exercise-selection"
              accessible={true}
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button">
              <Text className="text-primary">{t('common.cancel')}</Text>
            </TouchableOpacity>

            <Text className="absolute left-0 right-0 text-center text-lg font-semibold text-foreground">
              {t('addExercises.selectExercises')}
            </Text>

            <TouchableOpacity
              onPress={applyExerciseSelection}
              className="z-10"
              testID="button-apply-exercise-selection"
              accessible={true}
              accessibilityLabel={t('addExercises.apply')}
              accessibilityRole="button">
              <Text className="text-primary">{t('addExercises.apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="pt-4">
        <ExerciseSearchBar
          searchQuery={searchQuery}
          onChangeSearchQuery={onChangeSearchQuery}
          onClearSearch={onClearSearch}
        />

        {exerciseCount > 0 && (
          <View className="mx-4 mt-3 flex-row items-center justify-center rounded-md bg-primary/10 px-3 py-2">
            <CheckCircle size={16} color={colors.primary} />
            <Text className="ml-2 text-sm font-medium text-primary">
              {t('addExercises.exercisesInWorkout', { count: exerciseCount })}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={filteredExercises}
        renderItem={({ item }) => (
          <AvailableExerciseItem
            exercise={item}
            isAlreadyAdded={selectedExerciseIds.has(item.id)}
            onAddExercise={onAddExercise}
            onRemoveExercise={onRemoveExercise}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: APP_PADDING.horizontal,
          paddingTop: APP_PADDING.vertical,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={
          searchQuery ? (
            <View>
              {onCreateCustomExercise && (
                <CustomExerciseCreator
                  searchQuery={searchQuery}
                  onCreateCustomExercise={onCreateCustomExercise}
                  existingExercises={filteredExercises}
                />
              )}

              {!onCreateCustomExercise && (
                <View className="items-center py-8">
                  <Text className="text-center text-muted-foreground">
                    {t('addExercises.noExercisesFound')}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="text-center text-muted-foreground">{t('addExercises.noExercisesAvailable')}</Text>
            </View>
          )
        }
      />
    </>
  );
}
