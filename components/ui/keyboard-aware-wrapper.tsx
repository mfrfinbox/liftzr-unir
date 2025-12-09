import React, { useState, useEffect } from 'react';

import { Keyboard, Animated, StyleSheet, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { KeyboardOff } from 'lucide-react-native';

interface KeyboardAwareWrapperProps {
  children: React.ReactNode;
}

export function KeyboardAwareWrapper({ children }: KeyboardAwareWrapperProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { colors } = useTheme();

  // Animation for the dismiss button
  const buttonOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    // For Android, which doesn't have willShow/willHide
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [buttonOpacity]);

  const handleDismiss = () => {
    Keyboard.dismiss();
  };

  // Position the button above the keyboard
  const buttonPosition = {
    bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 0,
  };

  return (
    <>
      {children}

      {/* Keyboard dismiss button */}
      <Animated.View
        style={[styles.buttonContainer, buttonPosition, { opacity: buttonOpacity }]}
        pointerEvents={keyboardVisible ? 'auto' : 'none'}>
        <Pressable
          onPress={handleDismiss}
          testID="keyboard-dismiss-wrapper-button"
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? colors.card : colors.primary,
              borderColor: colors.border,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}>
          <KeyboardOff size={26} color="white" />
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    right: 16,
    bottom: 0, // Will be adjusted based on keyboard height
    marginBottom: 8,
    zIndex: 9999,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
});
