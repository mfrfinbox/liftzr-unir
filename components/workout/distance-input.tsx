import { useState, useRef } from 'react';

import { TextInput, View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';

import { INPUT_STYLE } from '~/lib/constants/ui';

interface DistanceInputProps {
  value: string; // Distance in meters as string
  onChange: (meters: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  editable?: boolean;
  testID?: string;
  isCompleted?: boolean;
}

export function DistanceInput({
  value,
  onChange,
  onBlur,
  placeholder = '-',
  editable = true,
  testID,
  isCompleted = false,
}: DistanceInputProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [editingValue, setEditingValue] = useState<string | null>(null);

  // Convert meters to km for display
  const metersToKm = (meters: string | number): string => {
    const m = parseFloat(String(meters)) || 0;
    const km = m / 1000;

    // If it's a whole number, show without decimals
    if (km % 1 === 0) {
      return km.toString();
    }

    // Otherwise show appropriate decimal places
    // Show 2 decimal places if less than 10km, 1 if more
    return km < 10 ? km.toFixed(2) : km.toFixed(1);
  };

  // Convert km input to meters for storage
  const kmToMeters = (km: string): string => {
    const kmValue = parseFloat(km) || 0;
    return Math.round(kmValue * 1000).toString();
  };

  // Display value in km
  const displayValue =
    editingValue !== null ? editingValue : value && value !== '0' ? metersToKm(value) : placeholder;

  const handleFocus = () => {
    // When focusing, show the current km value for editing
    if (value && value !== '0') {
      setEditingValue(metersToKm(value));
    } else {
      setEditingValue('');
    }
  };

  const handleChangeText = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;

    setEditingValue(formatted);

    // Convert to meters and update
    if (formatted) {
      onChange(kmToMeters(formatted));
    } else {
      onChange('0');
    }
  };

  const handleBlur = () => {
    setEditingValue(null);
    onBlur?.();
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} disabled={!editable || isCompleted}>
      <View
        className={`${isCompleted ? INPUT_STYLE.backgroundColor.completed : INPUT_STYLE.backgroundColor.active} ${INPUT_STYLE.container}`}
        style={{ minWidth: 75, height: 38 }}>
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
          keyboardType="decimal-pad"
          value={displayValue}
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
