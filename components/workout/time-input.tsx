import { useState, useRef, useEffect } from 'react';

import { TextInput, View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';

import { INPUT_STYLE } from '~/lib/constants/ui';

interface TimeInputProps {
  value: string; // Time in seconds as string
  onChange: (seconds: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  editable?: boolean;
  testID?: string;
  isCompleted?: boolean;
}

export function TimeInput({
  value,
  onChange,
  onBlur,
  placeholder = '-',
  editable = true,
  testID,
  isCompleted = false,
}: TimeInputProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [rawInput, setRawInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Convert seconds to display format
  const formatDisplay = (totalSeconds: number, raw: string = ''): string => {
    if (isFocused && raw) {
      // While focused, show the raw input with formatting
      const padded = raw.padStart(4, '0');
      if (raw.length > 4) {
        // HHMMSS format: H:MM:SS or HH:MM:SS
        const hours = raw.slice(0, -4);
        const mins = raw.slice(-4, -2);
        const secs = raw.slice(-2);
        return `${parseInt(hours)}:${mins}:${secs}`;
      } else {
        // MMSS format: MM:SS
        const mins = padded.slice(0, 2);
        const secs = padded.slice(2, 4);
        return `${parseInt(mins)}:${secs}`;
      }
    }

    // When not focused, show clean format
    if (totalSeconds === 0) return '';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Convert raw digits to seconds
  const digitsToSeconds = (digits: string): number => {
    if (!digits) return 0;

    if (digits.length <= 4) {
      // MMSS format
      const padded = digits.padStart(4, '0');
      const mins = parseInt(padded.slice(0, 2)) || 0;
      const secs = parseInt(padded.slice(2, 4)) || 0;
      return mins * 60 + secs;
    } else {
      // HHMMSS format
      const hours = parseInt(digits.slice(0, -4)) || 0;
      const mins = parseInt(digits.slice(-4, -2)) || 0;
      const secs = parseInt(digits.slice(-2)) || 0;
      return hours * 3600 + mins * 60 + secs;
    }
  };

  // Initialize from value
  useEffect(() => {
    if (!isFocused) {
      const totalSeconds = parseInt(value) || 0;
      if (totalSeconds === 0) {
        setRawInput('');
      } else {
        // Convert back to raw digits for editing
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
          setRawInput(
            `${hours}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`
          );
        } else {
          setRawInput(
            `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`
          );
        }
      }
    }
  }, [value, isFocused]);

  const handleChangeText = (text: string) => {
    // Extract only the new digit (last character)
    const currentLength = formatDisplay(0, rawInput).length;
    const newLength = text.length;

    if (newLength > currentLength) {
      // Adding a digit
      const newChar = text.replace(/[^\d]/g, '').slice(-1);
      if (newChar && /\d/.test(newChar)) {
        const newRaw = rawInput + newChar;
        setRawInput(newRaw);

        // Update seconds in real-time
        const totalSeconds = digitsToSeconds(newRaw);
        onChange(totalSeconds.toString());
      }
    } else if (newLength < currentLength) {
      // Removing a digit (backspace)
      const newRaw = rawInput.slice(0, -1);
      setRawInput(newRaw);

      const totalSeconds = digitsToSeconds(newRaw);
      onChange(totalSeconds.toString());
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Clear the input when focused
    setRawInput('');
  };

  const handleBlur = () => {
    setIsFocused(false);

    // If nothing was entered, restore the original value
    if (!rawInput) {
      const totalSeconds = parseInt(value) || 0;
      if (totalSeconds > 0) {
        // Restore the original raw digits
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
          setRawInput(
            `${hours}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`
          );
        } else {
          setRawInput(
            `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`
          );
        }
      }
    }

    onBlur?.();
  };

  const totalSeconds = parseInt(value) || 0;
  const displayValue = formatDisplay(totalSeconds, rawInput);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} disabled={!editable || isCompleted}>
      <View
        className={`${isCompleted ? INPUT_STYLE.backgroundColor.completed : INPUT_STYLE.backgroundColor.active} ${INPUT_STYLE.container}`}
        style={{ minWidth: 85, height: 38 }}>
        <TextInput
          ref={inputRef}
          className={`text-center font-medium text-foreground ${isCompleted ? 'opacity-60' : ''}`}
          style={{
            color: colors.text,
            flex: 1,
            fontSize: 16,
            lineHeight: 18,
            paddingTop: 10,
            paddingBottom: 10,
            paddingHorizontal: 8,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
          keyboardType="number-pad"
          value={displayValue || ''}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.text + '40'}
          selectTextOnFocus={true}
          editable={editable && !isCompleted}
          testID={testID}
        />
      </View>
    </Pressable>
  );
}
