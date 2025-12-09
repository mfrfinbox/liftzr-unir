/**
 * Workout Card Header Component
 * Displays date, time, and PR badge for workout card
 */

import React from 'react';

import { View } from 'react-native';

import { useTheme } from '@react-navigation/native';

import { Text } from '~/components/ui/text';

import { PRBadge } from './pr-badge';

interface WorkoutCardHeaderProps {
  date: string;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  prCount: number;
  index: number;
}

export function WorkoutCardHeader({
  date,
  formatDate,
  formatTime,
  prCount,
  index,
}: WorkoutCardHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className="mb-2 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Text className="text-lg font-semibold text-foreground" testID={`workout-${index}-date`}>
          {formatDate(date)}
        </Text>
        <PRBadge prCount={prCount} index={index} />
      </View>
      <Text
        className="text-sm"
        style={{ color: colors.text + '60' }}
        testID={`workout-${index}-time`}>
        {formatTime(date)}
      </Text>
    </View>
  );
}
