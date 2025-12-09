import { Stack } from 'expo-router';

export default function AppLayout() {
  // NO authentication required - app works offline-first
  // Login is only needed for optional cloud backup (handled in settings)

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(stacks)/workout-details" options={{ headerShown: false }} />
      <Stack.Screen
        name="(stacks)/active-workout"
        options={{
          headerShown: false,
          gestureEnabled: false,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="(modals)/create-workout"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(modals)/select-exercises"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(modals)/reorder-exercises"
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="(modals)/reorder-workouts"
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="(modals)/manage-workouts"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(modals)/all-personal-records"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(modals)/add-exercises-to-workout"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(modals)/replace-exercise"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
