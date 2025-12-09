import * as React from 'react';

import { Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { KeyboardOff } from 'lucide-react-native';

interface KeyboardDismissButtonProps {
  position?: 'topRight' | 'bottomRight';
  size?: number;
  style?: object;
}

export function KeyboardDismissButton({
  position = 'bottomRight',
  size = 36,
  style,
}: KeyboardDismissButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    Keyboard.dismiss();
  };

  const positionStyle = position === 'topRight' ? styles.topRight : styles.bottomRight;

  return (
    <View style={[styles.container, positionStyle, style]}>
      <Pressable
        onPress={handlePress}
        testID="keyboard-dismiss-button"
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? colors.card : colors.primary,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}>
        <KeyboardOff size={26} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  topRight: {
    top: 8,
    right: 8,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
});
