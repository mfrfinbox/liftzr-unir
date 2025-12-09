/**
 * List Empty Component
 * Empty state view for workout history
 */

import { View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { History } from 'lucide-react-native';

import { Text } from '~/components/ui/text';

import type { ListEmptyProps } from './types';

/**
 * Empty state component for workout history list
 */
export function ListEmpty({ hasActiveSearchOrFilter }: ListEmptyProps) {
  const { colors } = useTheme();

  return (
    <View className="items-center justify-center pb-20 pt-10" testID="workout-history-empty-state">
      <History size={40} color={colors.text + '80'} />
      {hasActiveSearchOrFilter ? (
        <>
          <Text className="mt-3 text-center text-muted-foreground" testID="no-search-results-text">
            No matching workouts found
          </Text>
          <Text
            className="text-center text-xs text-muted-foreground"
            testID="no-search-results-hint">
            Try a different search term or adjust your filters
          </Text>
        </>
      ) : (
        <>
          <Text className="mt-3 text-center text-muted-foreground" testID="no-history-text">
            No workout history yet
          </Text>
          <Text className="text-center text-xs text-muted-foreground" testID="no-history-hint">
            Complete a workout to see your statistics
          </Text>
        </>
      )}
    </View>
  );
}
