import '~/global.css';
import '~/lib/config/i18n';

import { useEffect } from 'react';

import { View } from 'react-native';

import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { KeyboardAwareWrapper } from '~/components/ui/keyboard-aware-wrapper';
import { ToastMessage } from '~/components/ui/toast-message';
import { AdvancedSettingsProvider } from '~/lib/contexts/AdvancedSettingsContext';
import { DatabaseProvider } from '~/lib/contexts/DatabaseContext';
import { DefaultRestProvider } from '~/lib/contexts/DefaultRestContext';
import { MeasurementProvider } from '~/lib/contexts/MeasurementContext';
import { NotificationsProvider } from '~/lib/contexts/NotificationsContext';
import { AppThemeProvider, useAppTheme } from '~/lib/contexts/ThemeContext';
import { WeekStartProvider } from '~/lib/contexts/WeekStartContext';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

function AppContent({ theme, colorScheme }: { theme: any; colorScheme: string }) {
  return (
    <ThemeProvider value={theme}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <View className={`flex-1 ${colorScheme !== 'light' ? colorScheme : ''}`}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <ToastMessage />
      </View>
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { theme, colorScheme } = useAppTheme();

  return (
    <DatabaseProvider>
      <MeasurementProvider>
        <WeekStartProvider>
          <DefaultRestProvider>
            <AdvancedSettingsProvider>
              <KeyboardProvider>
                <NotificationsProvider>
                  <SafeAreaProvider>
                    <BottomSheetModalProvider>
                      <KeyboardAwareWrapper>
                        <AppContent theme={theme} colorScheme={colorScheme} />
                      </KeyboardAwareWrapper>
                    </BottomSheetModalProvider>
                  </SafeAreaProvider>
                </NotificationsProvider>
              </KeyboardProvider>
            </AdvancedSettingsProvider>
          </DefaultRestProvider>
        </WeekStartProvider>
      </MeasurementProvider>
    </DatabaseProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <ThemedApp />
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
