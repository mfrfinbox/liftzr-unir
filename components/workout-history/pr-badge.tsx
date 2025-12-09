/**
 * PR Badge Component
 * Displays personal record count badge for workout entries
 */

import React from 'react';

import { View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Medal } from 'lucide-react-native';

import { Text } from '~/components/ui/text';

interface PRBadgeProps {
  prCount: number;
  index: number;
}

export function PRBadge({ prCount, index }: PRBadgeProps) {
  const { colors } = useTheme();

  if (prCount === 0) return null;

  return (
    <View className="ml-2" testID={`workout-${index}-pr-badge`}>
      <View
        className="h-6 flex-row items-center justify-center rounded-sm px-2"
        style={{
          backgroundColor: colors.primary,
        }}>
        <Medal size={12} color="white" />
        <Text
          className="ml-1 text-[9px] font-semibold"
          style={{ color: 'white' }}
          testID={`workout-${index}-pr-count`}>
          {prCount === 1 ? 'PR' : `PR ×${prCount}`}
        </Text>
      </View>
    </View>
  );
}
