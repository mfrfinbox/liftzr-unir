import React, { useState, useRef, useEffect } from 'react';

import { View, Pressable } from 'react-native';

import { Search, XCircle } from 'lucide-react-native';

import { Input } from '~/components/ui/input';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface WorkoutHistorySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function WorkoutHistorySearchBar({
  value,
  onChangeText,
  placeholder = 'Search workouts, exercises...',
  autoFocus = false,
}: WorkoutHistorySearchBarProps) {
  const { theme } = useAppTheme();
  const inputRef = useRef<any>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-focus when component mounts if requested
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View>
      <View
        className={`flex-row items-center rounded-md border px-3 ${
          isFocused ? 'border-primary' : 'border-border'
        } bg-input`}
        style={{ height: 44 }}>
        <Search
          size={18}
          color={isFocused ? theme.colors.primary : theme.colors.text + '80'}
          style={{ marginRight: 8 }}
        />
        <Input
          ref={inputRef}
          className="flex-1 border-0 bg-transparent px-0 text-base text-foreground"
          style={{ paddingVertical: 0 }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text + '60'}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCorrect={false}
          spellCheck={false}
          testID="input-workout-history-search"
        />
        {value.length > 0 && (
          <Pressable onPress={handleClear} className="p-1" testID="button-clear-search">
            <XCircle size={18} color={theme.colors.text + '60'} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
