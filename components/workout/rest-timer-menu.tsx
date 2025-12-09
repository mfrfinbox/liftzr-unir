import React from 'react';

import { Modal, Pressable, Animated } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Copy } from 'lucide-react-native';

import { Text } from '~/components/ui/text';

interface RestTimerMenuProps {
  visible: boolean;
  position: { top: number; left: number };
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  onClose: () => void;
  onPropagate: () => void;
}

export function RestTimerMenu({
  visible,
  position,
  fadeAnim,
  scaleAnim,
  onClose,
  onPropagate,
}: RestTimerMenuProps) {
  const { colors } = useTheme();

  if (!visible) return null;

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
            left: position.left,
            backgroundColor: colors.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
            width: 200,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            borderWidth: 0.5,
            borderColor: 'rgba(150,150,150,0.2)',
          }}>
          <Pressable
            className="flex-row items-center px-4 py-3"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            style={{
              backgroundColor: colors.card,
            }}
            onPress={onPropagate}>
            <Copy size={18} color={colors.text + '80'} />
            <Text className="ml-3 text-sm text-foreground">Apply to All Exercises</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
