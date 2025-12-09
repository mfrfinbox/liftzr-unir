import React from 'react';

import { View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { ArrowRightCircle, MoreVertical } from 'lucide-react-native';

import { Text } from '~/components/ui/text';

interface BetweenExerciseRestSectionProps {
  nextExerciseRest: number;
  onNextRestTimeChange: (seconds: number) => void;
  onShowMenu?: () => void;
  menuButtonRef?: React.RefObject<View>;
  showMenuButton?: boolean;
}

export function BetweenExerciseRestSection({
  nextExerciseRest,
  onNextRestTimeChange,
  onShowMenu,
  menuButtonRef,
  showMenuButton = false,
}: BetweenExerciseRestSectionProps) {
  const { colors } = useTheme();

  const incrementRest = (currentValue: number, increment: number) => {
    return Math.max(0, currentValue + increment);
  };

  return (
    <View className="mb-2 mt-4 flex-row items-center py-1">
      <ArrowRightCircle size={18} color={colors.primary} />
      <Text className="ml-2 text-sm font-medium text-foreground">
        Rest Before Next: {nextExerciseRest > 0 ? `${nextExerciseRest}s` : 'Off'}
      </Text>

      {showMenuButton && onShowMenu && menuButtonRef && (
        <View ref={menuButtonRef} collapsable={false} className="ml-2">
          <Pressable
            onPress={onShowMenu}
            className="p-1"
            testID="between-exercise-rest-menu-button">
            <MoreVertical size={16} color={colors.text + '60'} />
          </Pressable>
        </View>
      )}

      <View className="ml-auto flex-row items-center">
        {nextExerciseRest > 0 ? (
          <>
            <Pressable
              onPress={() => onNextRestTimeChange(incrementRest(nextExerciseRest, -15))}
              className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-muted/80">
              <Text className="text-sm font-medium text-foreground">-</Text>
            </Pressable>

            <Pressable
              onPress={() => onNextRestTimeChange(incrementRest(nextExerciseRest, 15))}
              className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-muted/80">
              <Text className="text-sm font-medium text-foreground">+</Text>
            </Pressable>

            <Pressable
              onPress={() => onNextRestTimeChange(0)}
              className="rounded-md bg-muted px-3 py-1.5 active:bg-muted/80">
              <Text className="text-sm text-foreground">Off</Text>
            </Pressable>
          </>
        ) : (
          <View className="flex-row gap-1">
            <Pressable
              onPress={() => onNextRestTimeChange(60)}
              className="rounded-md bg-primary/10 px-3 py-1.5 active:bg-primary/20">
              <Text className="text-sm text-primary">1m</Text>
            </Pressable>
            <Pressable
              onPress={() => onNextRestTimeChange(120)}
              className="rounded-md bg-primary/10 px-3 py-1.5 active:bg-primary/20">
              <Text className="text-sm text-primary">2m</Text>
            </Pressable>
            <Pressable
              onPress={() => onNextRestTimeChange(180)}
              className="rounded-md bg-primary/10 px-3 py-1.5 active:bg-primary/20">
              <Text className="text-sm text-primary">3m</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
