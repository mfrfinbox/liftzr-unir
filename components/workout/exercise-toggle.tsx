import { Pressable, View } from 'react-native';

import { CheckCircle, PlusCircle } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface ExerciseToggleProps {
  isAddingExercises: boolean;
  onToggle: () => void;
}

export function ExerciseToggle({ isAddingExercises, onToggle }: ExerciseToggleProps) {
  const { theme } = useAppTheme();

  return (
    <View className="px-4 py-2">
      <Pressable onPress={onToggle} className="flex-row items-center">
        <Text className="font-medium text-primary">
          {isAddingExercises ? 'Done Adding' : 'Add Exercises'}
        </Text>
        {isAddingExercises ? (
          <CheckCircle size={18} color={theme.colors.primary} style={{ marginLeft: 4 }} />
        ) : (
          <PlusCircle size={18} color={theme.colors.primary} style={{ marginLeft: 4 }} />
        )}
      </Pressable>
    </View>
  );
}
