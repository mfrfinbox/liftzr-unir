import { View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { User, Check, Plus } from 'lucide-react-native';

import { Card, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Exercise } from '~/types';

interface AvailableExerciseItemProps {
  exercise: Exercise;
  isAlreadyAdded: boolean;
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise?: (exerciseId: string) => void;
}

export function AvailableExerciseItem({
  exercise,
  isAlreadyAdded,
  onAddExercise,
  onRemoveExercise,
}: AvailableExerciseItemProps) {
  const { colors } = useTheme();

  const toggleExercise = () => {
    if (isAlreadyAdded) {
      onRemoveExercise?.(exercise.id);
    } else {
      onAddExercise(exercise);
    }
  };

  return (
    <Pressable onPress={toggleExercise}>
      <Card className={`mb-2 border ${isAlreadyAdded ? 'border-primary' : 'border-border'}`}>
        <CardContent className="px-4 py-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-medium text-foreground">{exercise.name}</Text>
              {exercise.isCustom && (
                <View className="mt-1 flex-row items-center">
                  <View className="flex-row items-center rounded-full bg-primary/10 px-2 py-0.5">
                    <User size={12} color={colors.primary} />
                    <Text className="ml-1 text-xs font-medium text-primary">Custom</Text>
                  </View>
                </View>
              )}
            </View>

            <View
              className={`items-center justify-center rounded-full p-2 ${
                isAlreadyAdded ? 'bg-primary' : 'bg-muted'
              }`}
              style={{ width: 28, height: 28 }}>
              {isAlreadyAdded ? (
                <Check size={16} color="white" />
              ) : (
                <Plus size={16} color={colors.text} />
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
