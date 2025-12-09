import { useState, useCallback } from 'react';

import { View } from 'react-native';

import { useRouter } from 'expo-router';

import { ModalHeader } from '~/components/layout/modal-header';
import { Screen } from '~/components/layout/screen';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { KeyboardAwareWrapper } from '~/components/ui/keyboard-aware-wrapper';
import { Text } from '~/components/ui/text';

const screenStyle = { paddingTop: 0 };

export default function CreateWorkoutModal() {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState('');

  const handleCreateWorkout = useCallback(() => {
    if (!workoutName.trim()) return;

    // Navigate to select exercises screen with the workout name
    router.push({
      pathname: '/(app)/(modals)/select-exercises',
      params: { workoutName: workoutName.trim(), flow: 'create' },
    });
  }, [workoutName, router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const onChangeText = useCallback((text: string) => {
    setWorkoutName(text);
  }, []);

  return (
    <KeyboardAwareWrapper>
      <Screen
        scrollable={false}
        withTabBarPadding={false}
        style={screenStyle}
        testID="modal-create-workout">
        <ModalHeader title="Create New Workout" onClose={handleClose} />

        {/* Content */}
        <View className="p-4">
          <Text className="mb-2 text-foreground" id="workoutNameLabel">
            Workout Name
          </Text>
          <Input
            placeholder="Enter workout name"
            className="mb-6 bg-input px-4 py-3 text-foreground"
            value={workoutName}
            onChangeText={onChangeText}
            autoFocus
            autoCorrect={false}
            spellCheck={false}
            testID="workout-name-input"
          />

          <Button
            className="w-full rounded-md bg-primary py-3"
            onPress={handleCreateWorkout}
            disabled={!workoutName.trim()}
            testID="next-button">
            <Text className="text-center font-medium text-white">Next</Text>
          </Button>
        </View>
      </Screen>
    </KeyboardAwareWrapper>
  );
}
