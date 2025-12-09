/**
 * My Exercises Modal
 * Modal for managing custom exercises with search and filters
 */

import { View, Modal, KeyboardAvoidingView, Platform, Pressable, FlatList } from 'react-native';

import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Input } from '~/components/ui/input';
import { KeyboardAwareWrapper } from '~/components/ui/keyboard-aware-wrapper';
import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

import { ExerciseEmptyState, SearchEmptyState } from './exercise-empty-states';
import { ExerciseItem } from './exercise-item';

import type { ExerciseWithIds, ExerciseTypeFilter } from './types';

interface MyExercisesModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExercise: () => void;
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  selectedType: ExerciseTypeFilter;
  onChangeType: (type: ExerciseTypeFilter) => void;
  filteredExercises: ExerciseWithIds[];
  onEditExercise: (exercise: ExerciseWithIds) => void;
  onDeleteExercise: (exercise: ExerciseWithIds) => void;
  hasSearchOrFilter: boolean;
}

export function MyExercisesModal({
  visible,
  onClose,
  onAddExercise,
  searchQuery,
  onChangeSearch,
  selectedType,
  onChangeType,
  filteredExercises,
  onEditExercise,
  onDeleteExercise,
  hasSearchOrFilter,
}: MyExercisesModalProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAwareWrapper>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="flex-1 bg-background" testID="my-exercises-modal">
            {/* Header */}
            <View className="border-b border-border bg-card">
              <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable onPress={onClose} hitSlop={10} testID="my-exercises-done-button">
                  <Text className="text-base font-medium text-primary">{t('common.done')}</Text>
                </Pressable>
                <Text className="text-xl font-bold text-foreground">
                  {t('settings.myExercises.title')}
                </Text>
                <Pressable onPress={onAddExercise} hitSlop={10} testID="my-exercises-add-button">
                  <Plus size={24} color={theme.colors.primary} />
                </Pressable>
              </View>
            </View>

            <View className="flex-1 px-6 py-6">
              {/* Search Input */}
              <View className="mb-6">
                <Text className="mb-3 text-sm font-medium text-muted-foreground">
                  {t('settings.myExercises.searchExercises').toUpperCase()}
                </Text>
                <Input
                  value={searchQuery}
                  onChangeText={onChangeSearch}
                  placeholder={t('settings.myExercises.searchPlaceholder')}
                  className="text-base"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="search"
                  autoFocus
                  testID="my-exercises-search-input"
                />
              </View>

              {/* Type Filter Pills */}
              <View className="mb-4 flex-row">
                {(['all', 'reps', 'time', 'distance'] as const).map((type, index) => (
                  <Pressable
                    key={type}
                    onPress={() => onChangeType(type)}
                    className={`flex-1 ${index > 0 ? 'ml-2' : ''} rounded-md border-2 py-3 ${
                      selectedType === type
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                    testID={`my-exercises-filter-${type}`}>
                    <Text
                      className={`text-center text-sm font-semibold ${
                        selectedType === type ? 'text-primary' : 'text-foreground'
                      }`}>
                      {type === 'all' ? t('common.all') : t(`exercise.type.${type}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Exercise List */}
              {filteredExercises.length === 0 ? (
                hasSearchOrFilter ? (
                  <SearchEmptyState />
                ) : (
                  <ExerciseEmptyState onCreateExercise={onAddExercise} />
                )
              ) : (
                <FlatList
                  data={filteredExercises}
                  renderItem={({ item, index }) => (
                    <ExerciseItem
                      exercise={item}
                      onEdit={onEditExercise}
                      onDelete={onDeleteExercise}
                      index={index}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </KeyboardAwareWrapper>
    </Modal>
  );
}
