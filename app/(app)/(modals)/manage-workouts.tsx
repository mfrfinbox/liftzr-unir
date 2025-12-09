import { useCallback } from 'react';

import { View, FlatList } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';

import { ModalHeader } from '~/components/layout/modal-header';
import { Screen } from '~/components/layout/screen';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { useWorkouts, useDeleteWorkout } from '~/hooks/data';
import { Workout } from '~/types'; // Keep type import only

export default function ManageWorkoutsModal() {
  const router = useRouter();
  const { colors } = useTheme();

  // 🚀 MIGRATED: Now using database hooks instead of AsyncStorage
  const { workouts, isLoading: workoutsLoading } = useWorkouts();
  const { deleteWorkout } = useDeleteWorkout();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeleteWorkout = useCallback(
    async (workoutId: string) => {
      try {
        // 🚀 MIGRATED: Using database hook - no need to update local state
        // Database provides real-time updates automatically
        await deleteWorkout(workoutId);
      } catch (_error) {
        // TODO: Show error toast to user
      }
    },
    [deleteWorkout]
  );

  const renderWorkoutItem = useCallback(
    ({ item }: { item: Workout }) => (
      <Card key={item.id} className="mb-3 border-border">
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{item.title}</Text>
            <Text className="text-sm text-muted-foreground">
              {item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Button
            variant="destructive"
            className="bg-transparent"
            onPress={() => handleDeleteWorkout(item.id)}
            testID={`button-delete-workout-${item.id}`}>
            <Trash2 size={20} color={colors.notification} />
          </Button>
        </View>
      </Card>
    ),
    [handleDeleteWorkout]
  );

  return (
    <Screen
      scrollable={false}
      withTabBarPadding={false}
      style={{ paddingTop: 0 }}
      testID="modal-manage-workouts">
      <ModalHeader title="Delete Workouts" onClose={handleClose} />

      <View className="flex-1 p-4">
        {workoutsLoading ? (
          <View className="items-center justify-center py-8">
            <Text className="text-center text-muted-foreground">Loading workouts...</Text>
          </View>
        ) : workouts.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-center text-muted-foreground">No workouts to delete.</Text>
          </View>
        ) : (
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}
