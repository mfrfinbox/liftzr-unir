import { useRef, useEffect } from 'react';

import { View, Pressable } from 'react-native';

import { Search, XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Input } from '~/components/ui/input';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface ExerciseSearchBarProps {
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onClearSearch: () => void;
}

export function ExerciseSearchBar({
  searchQuery,
  onChangeSearchQuery,
  onClearSearch,
}: ExerciseSearchBarProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const inputRef = useRef<any>(null);

  // Auto-focus the input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Small delay to ensure the component is fully rendered

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="px-4 pb-3">
      <View className="flex-row items-center rounded-md bg-input px-3 py-1">
        <Search size={20} color={theme.colors.text + '80'} />
        <Input
          ref={inputRef}
          className="flex-1 border-0 bg-transparent px-2 py-2 text-foreground"
          placeholder={t('workout.searchExercises')}
          placeholderTextColor={theme.colors.text}
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          autoCorrect={false}
          spellCheck={false}
          testID="input-exercise-search"
          accessible={true}
          accessibilityLabel={t('workout.searchExercises')}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={onClearSearch}
            testID="button-clear-search"
            accessible={true}
            accessibilityLabel={t('common.clearSearch')}
            accessibilityRole="button">
            <XCircle size={20} color={theme.colors.text + '80'} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
