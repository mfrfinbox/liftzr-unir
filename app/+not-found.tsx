import { StyleSheet, View } from 'react-native';

import { Link, Stack } from 'expo-router';

import { useTheme } from '@react-navigation/native';

import { Text } from '~/components/ui/text';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text className="mb-2 text-2xl font-bold">Page not found</Text>
        <Text className="mb-6">The requested page couldn{"'"}t be found.</Text>
        <Link href="/(app)/(tabs)/home" className="text-primary">
          <Text style={{ color: colors.primary }}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
