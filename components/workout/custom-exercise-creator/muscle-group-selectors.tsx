import React, { useRef } from 'react';

import { View, Pressable } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import type { MuscleGroup } from '~/lib/legend-state/stores/muscleGroupsStore';

interface MuscleGroupSelectorProps {
  primaryMuscleGroup: string;
  setPrimaryMuscleGroup: (id: string) => void;
  muscleGroups: MuscleGroup[];
}

export function PrimaryMuscleGroupSelector({
  primaryMuscleGroup,
  setPrimaryMuscleGroup,
  muscleGroups,
}: MuscleGroupSelectorProps) {
  const { t } = useTranslation();

  const getMuscleButtonStyle = (muscleId: string) => {
    return primaryMuscleGroup === muscleId
      ? 'border-primary bg-primary/10'
      : 'border-border bg-card';
  };

  const getMuscleTextStyle = (muscleId: string) => {
    return primaryMuscleGroup === muscleId ? 'text-primary font-semibold' : 'text-foreground';
  };

  return (
    <View className="mb-8">
      <View className="mb-4 flex-row items-center gap-2">
        <Text className="text-sm font-medium text-muted-foreground">
          {t('customExercise.primaryMuscleGroup')} <Text className="text-destructive">{t('customExercise.primaryMuscleRequired')}</Text>
        </Text>
      </View>
      <Text className="mb-4 text-xs text-muted-foreground">
        {t('customExercise.selectPrimaryHint')}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {muscleGroups.map((muscle: MuscleGroup) => (
          <Pressable
            key={muscle.id}
            onPress={() => setPrimaryMuscleGroup(muscle.id)}
            className={`rounded-md border-2 px-4 py-3 ${getMuscleButtonStyle(muscle.id)}`}
            testID={`primary-muscle-${muscle.name.toLowerCase().replace(/\s+/g, '-')}${primaryMuscleGroup === muscle.id ? '-selected' : '-unselected'}`}>
            <Text className={getMuscleTextStyle(muscle.id)}>{muscle.displayName}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface SecondaryMuscleGroupSelectorProps {
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  setSecondaryMuscleGroups: (groups: string[]) => void;
  muscleGroups: MuscleGroup[];
}

export function SecondaryMuscleGroupSelector({
  primaryMuscleGroup,
  secondaryMuscleGroups,
  setSecondaryMuscleGroups,
  muscleGroups,
}: SecondaryMuscleGroupSelectorProps) {
  const { t } = useTranslation();
  const lastTapTime = useRef<number | null>(null);

  const toggleSecondaryMuscleGroup = (muscleId: string) => {
    if (muscleId === primaryMuscleGroup) {
      return;
    }

    setSecondaryMuscleGroups(
      secondaryMuscleGroups.includes(muscleId)
        ? secondaryMuscleGroups.filter((id) => id !== muscleId)
        : [...secondaryMuscleGroups, muscleId]
    );
  };

  const getMuscleButtonStyle = (muscleId: string) => {
    const isSelected = secondaryMuscleGroups.includes(muscleId);
    const isDisabled = muscleId === primaryMuscleGroup;

    if (isDisabled) {
      return 'border-border bg-muted/30 opacity-50';
    }

    return isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card';
  };

  const getMuscleTextStyle = (muscleId: string) => {
    const isSelected = secondaryMuscleGroups.includes(muscleId);
    const isDisabled = muscleId === primaryMuscleGroup;

    if (isDisabled) {
      return 'text-muted-foreground';
    }

    return isSelected ? 'text-primary font-semibold' : 'text-foreground';
  };

  return (
    <View className="mb-8">
      <Pressable
        className="mb-4 flex-row items-center gap-2"
        onPress={() => {
          if (primaryMuscleGroup) {
            const tapTime = Date.now();
            if (lastTapTime.current && tapTime - lastTapTime.current < 500) {
              const allSecondaryMuscles = muscleGroups
                .filter((mg) => mg.id !== primaryMuscleGroup)
                .map((mg) => mg.id);
              setSecondaryMuscleGroups(allSecondaryMuscles);
              lastTapTime.current = null;
            } else {
              lastTapTime.current = tapTime;
            }
          }
        }}
        testID="secondary-muscles-header">
        <Text className="text-sm font-medium text-muted-foreground">
          {t('customExercise.secondaryMuscleGroups')}
        </Text>
      </Pressable>
      <Text className="mb-4 text-xs text-muted-foreground">
        {t('customExercise.selectSecondaryHint', { count: secondaryMuscleGroups.length })}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {muscleGroups.map((muscle: MuscleGroup) => (
          <Pressable
            key={muscle.id}
            onPress={() => toggleSecondaryMuscleGroup(muscle.id)}
            disabled={muscle.id === primaryMuscleGroup}
            className={`rounded-md border-2 px-4 py-3 ${getMuscleButtonStyle(muscle.id)}`}
            testID={`secondary-muscle-${muscle.name.toLowerCase().replace(/\s+/g, '-')}${secondaryMuscleGroups.includes(muscle.id) ? '-selected' : '-unselected'}`}>
            <Text className={getMuscleTextStyle(muscle.id)}>{muscle.displayName}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
