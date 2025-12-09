import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { Tabs, useRouter } from 'expo-router';

import { useTheme } from '@react-navigation/native';
import { House, ChartNoAxesColumn, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarStyle: { backgroundColor: colors.background, borderTopWidth: 0 },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'Statistics',
            tabBarIcon: ({ color, size }) => <ChartNoAxesColumn size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* Invisible squares below each tab for E2E Maestro testing */}
      <View style={styles.testContainer}>
        <TouchableOpacity
          testID="home-tab"
          style={styles.testButton}
          onPress={() => router.push('/home' as any)}
        />
        <TouchableOpacity
          testID="statistics-tab"
          style={styles.testButton}
          onPress={() => router.push('/statistics' as any)}
        />
        <TouchableOpacity
          testID="settings-tab"
          style={styles.testButton}
          onPress={() => router.push('/settings' as any)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  testContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    flexDirection: 'row',
  },
  testButton: {
    flex: 1,
    height: 10,
    backgroundColor: 'transparent',
  },
});
