import React from 'react';

import { View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Dumbbell } from 'lucide-react-native';

export function ExerciseSeparator() {
  const { colors } = useTheme();

  return (
    <View className="mt-6 flex-row items-center">
      <View className="flex-1 border-t border-border" />
      <View className="mx-4">
        <Dumbbell size={16} color={colors.border} />
      </View>
      <View className="flex-1 border-t border-border" />
    </View>
  );
}
