/**
 * Exercise Item Component
 * Displays a single exercise in the custom exercises list
 */

import { View, Pressable } from 'react-native';

import { Dumbbell, MinusCircle, Clock, TrendingUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { useMuscleGroups } from '~/hooks/data';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

import type { ExerciseItemProps } from './types';

/**
 * Get exercise type icon
 */
function getTypeIcon(type: string, iconColor: string, iconSize: number): React.ReactNode {
  switch (type) {
    case 'reps':
      return <Dumbbell size={iconSize} color={iconColor} />;
    case 'time':
      return <Clock size={iconSize} color={iconColor} />;
    case 'distance':
      return <TrendingUp size={iconSize} color={iconColor} />;
    default:
      return <Dumbbell size={iconSize} color={iconColor} />;
  }
}

export function ExerciseItem({ exercise, onEdit, onDelete, index }: ExerciseItemProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { muscleGroups } = useMuscleGroups();

  // Resolve muscle group IDs to display names
  const primaryMuscleGroupNames = exercise.primaryMuscleGroup
    ? muscleGroups.find((mg) => mg.id === exercise.primaryMuscleGroup)?.displayName ||
      exercise.primaryMuscleGroup
    : 'None';

  const iconColor = theme.colors.text + '60';
  const iconSize = 20;

  return (
    <Pressable
      onPress={() => onEdit(exercise)}
      className="mb-2 flex-row items-center justify-between rounded-md border border-border bg-card px-4 py-3 active:opacity-70"
      testID={`my-exercise-item-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}>
      <View className="flex-1 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-muted">
          {getTypeIcon(exercise.type, iconColor, iconSize)}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-medium text-foreground" numberOfLines={1}>
              {exercise.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-muted-foreground">
              {primaryMuscleGroupNames || t('settings.myExercises.noMuscleGroups')}
            </Text>
            {exercise.secondaryMuscleGroups && exercise.secondaryMuscleGroups.length > 0 && (
              <>
                <Text className="text-xs text-muted-foreground">•</Text>
                <Text className="text-xs text-muted-foreground">
                  +{exercise.secondaryMuscleGroups.length} {t('settings.myExercises.more')}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onDelete(exercise);
          }}
          className="rounded-md p-2"
          testID={`delete-exercise-${index}`}>
          <MinusCircle size={20} color={'#ef4444'} />
        </Pressable>
      </View>
    </Pressable>
  );
}
