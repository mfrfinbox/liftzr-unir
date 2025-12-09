/**
 * Exercise Empty States
 * Empty state components for custom exercises list
 */

import { View } from 'react-native';

import { Dumbbell, PlusCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface ExerciseEmptyStateProps {
  onCreateExercise: () => void;
}

/**
 * Empty state when no custom exercises exist yet
 */
export function ExerciseEmptyState({ onCreateExercise }: ExerciseEmptyStateProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ marginTop: -60 }}>
      <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Dumbbell size={32} color={theme.colors.text + '60'} />
      </View>
      <Text className="mb-3 text-lg font-medium text-foreground">
        {t('settings.myExercises.noCustomExercisesYet')}
      </Text>
      <Text className="mb-8 text-center text-sm text-muted-foreground">
        {t('settings.myExercises.createExercisePrompt')}
      </Text>
      <Button
        variant="outline"
        className="border-primary/30 bg-primary/5"
        onPress={onCreateExercise}>
        <View className="flex-row items-center gap-2">
          <PlusCircle size={18} color={theme.colors.primary} />
          <Text className="font-medium text-primary">
            {t('settings.myExercises.createFirstExercise')}
          </Text>
        </View>
      </Button>
    </View>
  );
}

/**
 * Empty state when search/filter returns no results
 */
export function SearchEmptyState() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="mb-2 text-lg font-medium text-foreground">
        {t('settings.myExercises.noExercisesFound')}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">
        {t('settings.myExercises.adjustSearchPrompt')}
      </Text>
    </View>
  );
}
