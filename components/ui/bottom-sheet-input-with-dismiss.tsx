import * as React from 'react';

import { View, StyleSheet, type TextInputProps } from 'react-native';

import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';

import { cn } from '~/lib/utils';

import { KeyboardDismissButton } from './keyboard-dismiss-button';

interface BottomSheetInputWithDismissProps extends TextInputProps {
  buttonPosition?: 'topRight' | 'bottomRight';
  buttonSize?: number;
  buttonStyle?: object;
  containerStyle?: object;
}

export function BottomSheetInputWithDismiss({
  buttonPosition,
  buttonSize,
  buttonStyle,
  containerStyle,
  className,
  placeholderClassName,
  selectTextOnFocus = true,
  ...props
}: BottomSheetInputWithDismissProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <BottomSheetTextInput
        className={cn(
          'native:h-12 native:text-lg native:leading-[1.25] h-10 rounded-md border border-input bg-background px-3 text-base text-foreground file:border-0 file:bg-transparent file:font-medium web:flex web:w-full web:py-2 web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 lg:text-sm',
          props.editable === false && 'opacity-50 web:cursor-not-allowed',
          className
        )}
        placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
        selectTextOnFocus={selectTextOnFocus}
        style={{ color: colors.text }}
        {...props}
      />
      <KeyboardDismissButton
        position={buttonPosition}
        size={buttonSize ?? 24}
        style={{
          ...buttonStyle,
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
    marginVertical: 10,
  },
});
