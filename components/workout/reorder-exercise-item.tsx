/**
 * Reorder Exercise Item
 * Individual exercise item component with move controls
 */

import React, { useMemo } from 'react';

import { View, Pressable, Animated, StyleSheet } from 'react-native';

import { ChevronUp, ChevronDown } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import type { ExerciseWithDetails } from '~/types';

interface ReorderExerciseItemProps {
  item: ExerciseWithDetails;
  index: number;
  total: number;
  muscleGroupName: string;
  animatedStyle: Animated.WithAnimatedValue<any>;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ReorderExerciseItem({
  item,
  index,
  total,
  muscleGroupName,
  animatedStyle,
  onMoveUp,
  onMoveDown,
}: ReorderExerciseItemProps) {
  const { theme } = useAppTheme();

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        listItem: {
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          marginBottom: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        normalText: {
          color: theme.colors.text,
        },
        secondaryText: {
          color: theme.colors.text + 'aa',
          fontSize: 14,
        },
        moveButton: {
          padding: 8,
          marginLeft: 8,
        },
        moveButtonDisabled: {
          opacity: 0.3,
        },
      }),
    [theme]
  );

  return (
    <Animated.View style={[styles.listItem, animatedStyle]} testID={`exercise-${index}`}>
      <View className="flex-1">
        <Text
          style={styles.normalText}
          className="text-base font-medium"
          testID={`exercise-text-${index}`}>
          {item.details.name}
        </Text>
        <Text className="text-xs text-muted-foreground" testID={`exercise-info-${index}`}>
          {item.setsData?.length || 0} {(item.setsData?.length || 0) === 1 ? 'set' : 'sets'} ·{' '}
          {muscleGroupName}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Pressable
          onPress={onMoveUp}
          disabled={isFirst}
          style={[styles.moveButton, isFirst && styles.moveButtonDisabled]}
          testID={`move-up-${index}`}>
          <ChevronUp size={24} color={isFirst ? theme.colors.text + '30' : theme.colors.primary} />
        </Pressable>

        <Pressable
          onPress={onMoveDown}
          disabled={isLast}
          style={[styles.moveButton, isLast && styles.moveButtonDisabled]}
          testID={`move-down-${index}`}>
          <ChevronDown size={24} color={isLast ? theme.colors.text + '30' : theme.colors.primary} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default ReorderExerciseItem;
