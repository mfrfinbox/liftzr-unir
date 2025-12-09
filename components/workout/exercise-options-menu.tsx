import React from 'react';

import { Modal, Pressable, Animated } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { ArrowUpDown, Trash2 } from 'lucide-react-native';

import { Text } from '~/components/ui/text';

interface ExerciseOptionsMenuProps {
  visible: boolean;
  position: { top: number; right: number };
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  onClose: () => void;
  onDelete: () => void;
  onReorder?: () => void;
  showReorderOption: boolean;
}

export function ExerciseOptionsMenu({
  visible,
  position,
  fadeAnim,
  scaleAnim,
  onClose,
  onDelete,
  onReorder,
  showReorderOption,
}: ExerciseOptionsMenuProps) {
  const { colors } = useTheme();

  return (
    <Modal transparent={true} visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onPress={onClose}>
        <Animated.View
          className="absolute overflow-hidden rounded-md"
          style={{
            top: position.top,
            right: position.right,
            backgroundColor: colors.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
            width: 180,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            borderWidth: 0.5,
            borderColor: 'rgba(150,150,150,0.2)',
          }}>
          {showReorderOption && onReorder && (
            <Pressable
              className="flex-row items-center px-4 py-3"
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
              style={{
                backgroundColor: colors.card,
              }}
              onPress={onReorder}
              testID="sort-exercises-menu-item"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sort Exercises">
              <ArrowUpDown size={18} color={colors.text + '80'} />
              <Text className="ml-3 text-sm text-foreground" testID="sort-exercises-text">
                Sort Exercises
              </Text>
            </Pressable>
          )}

          <Pressable
            className="flex-row items-center px-4 py-3"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            style={{
              backgroundColor: colors.card,
              borderTopWidth: showReorderOption ? 0.5 : 0,
              borderTopColor: 'rgba(150,150,150,0.2)',
            }}
            onPress={onDelete}
            testID="delete-exercise-menu-item"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete Exercise">
            <Trash2 size={18} color={colors.notification} />
            <Text className="ml-3 text-sm text-foreground" testID="delete-exercise-text">
              Delete Exercise
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
