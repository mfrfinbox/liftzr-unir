/**
 * My Exercises Settings
 * Main component for managing custom exercises
 */

import { useState } from 'react';

import { View, Pressable } from 'react-native';

import { Dumbbell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { CustomExerciseCreator } from '~/components/workout/custom-exercise-creator';
import { useExercises, useMuscleGroups } from '~/hooks/data';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

import {
  createEditHandler,
  createDeleteHandler,
  createCreateExerciseHandler,
  createUpdateExerciseHandler,
} from './my-exercises/exercise-handlers';
import { MyExercisesModal } from './my-exercises/my-exercises-modal';
import { useExerciseFilters } from './my-exercises/use-exercise-filters';

import type { ExerciseWithIds } from './my-exercises/types';

export function MyExercisesSettings() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const {
    exercises,
    isLoading: exercisesLoading,
    addExercise,
    updateExercise,
    deleteExercise,
  } = useExercises();
  const { muscleGroups } = useMuscleGroups();

  const [showMyExercises, setShowMyExercises] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseWithIds | null>(null);
  const [showCreateExercise, setShowCreateExercise] = useState(false);

  // Filter only custom exercises and cast to extended type
  const customExercises = exercises.filter((ex) => ex.isCustom) as ExerciseWithIds[];

  // Filter hook for search and type filtering
  const { searchQuery, setSearchQuery, selectedType, setSelectedType, filteredExercises } =
    useExerciseFilters({
      customExercises,
      muscleGroups,
    });

  // Create handlers
  const handleEdit = createEditHandler(setEditingExercise, setShowMyExercises);
  const handleDelete = createDeleteHandler(deleteExercise, t);
  const handleCreateExercise = createCreateExerciseHandler(
    addExercise,
    setShowCreateExercise,
    setShowMyExercises,
    t
  );
  const handleUpdateExercise = createUpdateExerciseHandler(
    updateExercise,
    setEditingExercise,
    setShowMyExercises,
    t
  );

  if (exercisesLoading) {
    return (
      <View className="mb-6">
        <Text className="mb-3 text-base font-medium text-foreground">
          {t('settings.myExercises.title')}
        </Text>
        <Text className="text-muted-foreground">{t('common.loading')}</Text>
      </View>
    );
  }

  const hasSearchOrFilter = searchQuery !== '' || selectedType !== 'all';

  return (
    <>
      <View>
        <Pressable
          className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
          onPress={() => setShowMyExercises(!showMyExercises)}
          testID="settings-custom-exercises">
          <View className="flex-row items-center gap-3">
            <Dumbbell size={20} color={theme.colors.text + '80'} />
            <Text className="text-base text-foreground">
              {t('settings.myExercises.customExercises')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-base text-muted-foreground">
              {customExercises.length === 0 ? t('common.none') : customExercises.length}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Exercise Management Modal */}
      <MyExercisesModal
        visible={showMyExercises}
        onClose={() => setShowMyExercises(false)}
        onAddExercise={() => {
          setShowMyExercises(false);
          setShowCreateExercise(true);
        }}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        selectedType={selectedType}
        onChangeType={setSelectedType}
        filteredExercises={filteredExercises}
        onEditExercise={handleEdit}
        onDeleteExercise={handleDelete}
        hasSearchOrFilter={hasSearchOrFilter}
      />

      {/* Edit Modal using CustomExerciseCreator - outside the list modal to avoid nesting */}
      {editingExercise && (
        <CustomExerciseCreator
          mode="edit"
          isOpen={!!editingExercise}
          onClose={() => {
            setEditingExercise(null);
            // Re-open the list modal when closing edit without saving
            setShowMyExercises(true);
          }}
          editingExercise={editingExercise}
          onUpdateExercise={handleUpdateExercise}
          existingExercises={exercises}
        />
      )}

      {/* Create Modal using CustomExerciseCreator - outside the list modal to avoid nesting */}
      {showCreateExercise && (
        <CustomExerciseCreator
          mode="create"
          isOpen={showCreateExercise}
          onClose={() => {
            setShowCreateExercise(false);
            // Re-open the list modal when closing create without saving
            setShowMyExercises(true);
          }}
          onCreateCustomExercise={handleCreateExercise}
          existingExercises={exercises}
        />
      )}
    </>
  );
}
