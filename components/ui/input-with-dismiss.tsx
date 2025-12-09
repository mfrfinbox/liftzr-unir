import * as React from 'react';

import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';

import { Input } from './input';
import { KeyboardDismissButton } from './keyboard-dismiss-button';

interface InputWithDismissProps extends TextInputProps {
  inputRef?: React.RefObject<TextInput>;
  buttonPosition?: 'topRight' | 'bottomRight';
  buttonSize?: number;
  buttonStyle?: object;
  containerStyle?: object;
}

export function InputWithDismiss({
  inputRef,
  buttonPosition,
  buttonSize,
  buttonStyle,
  containerStyle,
  ...props
}: InputWithDismissProps) {
  const localInputRef = React.useRef<TextInput>(null);
  const ref = inputRef || localInputRef;

  return (
    <View style={[styles.container, containerStyle]}>
      <Input ref={ref} {...props} />
      <KeyboardDismissButton
        position={buttonPosition}
        size={buttonSize ?? 30}
        style={{
          ...buttonStyle,
          // Make sure button is visible and properly positioned
          position: 'absolute',
          right: 10,
          top: buttonPosition === 'topRight' ? -12 : undefined,
          bottom: buttonPosition === 'bottomRight' ? -12 : undefined,
          zIndex: 10000,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 10, // Add margin to make space for the button
  },
});
