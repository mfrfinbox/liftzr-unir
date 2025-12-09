import { Redirect } from 'expo-router';

export default function Index() {
  // Always redirect to home - no authentication required
  // App works offline-first without login
  return <Redirect href="/(app)/(tabs)/home" />;
}
