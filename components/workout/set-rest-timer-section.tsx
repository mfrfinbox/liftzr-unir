import React from 'react';

import { View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Timer, MoreVertical } from 'lucide-react-native';

import { Text } from '~/components/ui/text';

interface SetRestTimerSectionProps {
  restTime: number;
  onRestTimeChange: (seconds: number) => void;
  onShowMenu?: () => void;
  menuButtonRef?: React.RefObject<View>;
  showMenuButton?: boolean;
}

export function SetRestTimerSection({
  restTime,
  onRestTimeChange,
  onShowMenu,
  menuButtonRef,
  showMenuButton = false,
}: SetRestTimerSectionProps) {
  const { colors } = useTheme();

  const incrementRest = (currentValue: number, increment: number) => {
    return Math.max(0, currentValue + increment);
  };

  return (
    <View className="mb-3 flex-row items-center py-1">
      <Timer size={18} color={colors.primary} />
      <Text className="ml-2 text-sm font-medium text-foreground">
        Set Rest: {restTime > 0 ? `${restTime}s` : 'Off'}
      </Text>

      {showMenuButton && onShowMenu && menuButtonRef && (
        <View ref={menuButtonRef} collapsable={false} className="ml-2">
          <Pressable onPress={onShowMenu} className="p-1" testID="set-rest-timer-menu-button">
            <MoreVertical size={16} color={colors.text + '60'} />
          </Pressable>
        </View>
      )}

      <View className="ml-auto flex-row items-center">
        {restTime > 0 ? (
          <>
            <Pressable
              onPress={() => onRestTimeChange(incrementRest(restTime, -15))}
              className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-muted/80">
              <Text className="text-sm font-medium text-foreground">-</Text>
            </Pressable>

            <Pressable
              onPress={() => onRestTimeChange(incrementRest(restTime, 15))}
              className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-muted/80">
              <Text className="text-sm font-medium text-foreground">+</Text>
            </Pressable>

            <Pressable
              onPress={() => onRestTimeChange(0)}
              className="rounded-md bg-muted px-3 py-1.5 active:bg-muted/80">
              <Text className="text-sm text-foreground">Off</Text>
            </Pressable>
          </>
        ) : (
          <View className="flex-row gap-1">
            <Pressable
              onPress={() => onRestTimeChange(30)}
              className="rounded-md bg-primary/10 px-3 py-1.5 active:bg-primary/20">
              <Text className="text-sm text-primary">30s</Text>
            </Pressable>
            <Pressable
              onPress={() => onRestTimeChange(60)}
              className="rounded-md bg-primary/10 px-3 py-1.5 active:bg-primary/20">
              <Text className="text-sm text-primary">60s</Text>
            </Pressable>
            <Pressable
              onPress={() => onRestTimeChange(90)}
              className="rounded-md bg-primary/10 px-3 py-1.5 active:bg-primary/20">
              <Text className="text-sm text-primary">90s</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
