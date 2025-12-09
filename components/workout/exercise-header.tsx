import React from 'react';

import { View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { History, ArrowUpDown, MoreVertical } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { useMuscleGroups } from '~/hooks/data/use-muscle-groups';
import { Exercise } from '~/types';

interface ExerciseHeaderProps {
  exercise: Exercise;
  index?: number;
  onOpenDetails: () => void;
  onShowMenu: () => void;
  onReplaceExercise?: () => void;
  menuButtonRef: React.RefObject<View | null>;
}

export function ExerciseHeader({
  exercise,
  index,
  onOpenDetails,
  onShowMenu,
  onReplaceExercise,
  menuButtonRef,
}: ExerciseHeaderProps) {
  const { colors } = useTheme();
  const { muscleGroups } = useMuscleGroups();

  // Resolve muscle group ID to display name
  const primaryMuscleGroupName = React.useMemo(() => {
    const primaryId = exercise.primaryMuscleGroup;
    if (!primaryId) return 'Unknown';

    // If muscle groups haven't loaded yet, return loading or the ID as fallback
    if (!muscleGroups || muscleGroups.length === 0) {
      // Check if primaryId looks like a display name already (for custom exercises)
      if (!primaryId.includes('-')) {
        return primaryId; // It's probably already a display name
      }
      return 'Loading...';
    }

    const muscleGroup = muscleGroups.find((mg) => mg.id === primaryId);
    return muscleGroup?.displayName || 'Unknown';
  }, [exercise.primaryMuscleGroup, muscleGroups]);

  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Pressable
        className="flex-1"
        onPress={onOpenDetails}
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}>
        <View className="flex-1 flex-row items-center">
          <View className="flex-1">
            <Text
              className="font-medium text-foreground"
              testID={
                index !== undefined
                  ? `exercise-text-${index}`
                  : `exercise-name-${exercise.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, '')}`
              }>
              {exercise.name}
            </Text>
            <Text
              className="text-sm text-muted-foreground"
              testID={`exercise-muscle-${exercise.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')}`}>
              {primaryMuscleGroupName}
            </Text>
          </View>
          <History size={18} color={colors.text + '60'} style={{ marginLeft: 8 }} />
        </View>
      </Pressable>
      <View className="flex-row items-center">
        {onReplaceExercise && (
          <Pressable
            onPress={onReplaceExercise}
            className="ml-2 p-2"
            testID={`exercise-replace-button-${exercise.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')}`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Replace ${exercise.name}`}>
            <ArrowUpDown size={18} color={colors.text + '80'} />
          </Pressable>
        )}
        <View ref={menuButtonRef} collapsable={false}>
          <Pressable
            onPress={onShowMenu}
            className="ml-2 p-2"
            testID={`exercise-menu-button-${exercise.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')}`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${exercise.name} menu`}>
            <MoreVertical size={18} color={colors.text + '80'} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
