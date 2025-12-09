import { useRef } from 'react';

import { TextInput, View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';

import { INPUT_STYLE } from '~/lib/constants/ui';

interface WeightInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  editable?: boolean;
  testID?: string;
  isCompleted?: boolean;
}

export function WeightInput({
  value,
  onChange,
  onBlur,
  placeholder = '-',
  editable = true,
  testID,
  isCompleted = false,
}: WeightInputProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      disabled={!editable || isCompleted}
      testID={testID ? `${testID}-pressable` : undefined}>
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
          keyboardType="numeric"
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
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
