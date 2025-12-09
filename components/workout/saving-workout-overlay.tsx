import React from 'react';

import { View, Modal } from 'react-native';

import { Loader2 } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface SavingWorkoutOverlayProps {
  visible: boolean;
  testID?: string;
}

export function SavingWorkoutOverlay({ visible, testID }: SavingWorkoutOverlayProps) {
  const { theme } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent testID={testID}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="items-center rounded-2xl bg-card px-8 py-6 shadow-2xl">
          <Loader2 size={40} color={theme.colors.primary} className="mb-3 animate-spin" />
          <Text className="text-center text-base font-medium text-foreground">
            Completing workout...
          </Text>
        </View>
      </View>
    </Modal>
  );
}
