import React from 'react';

import { StyleSheet } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * A wrapper component that provides the necessary providers for bottom sheets to work correctly.
 * Use this component to wrap bottom sheets when they're having issues with gesture handling.
 */
export function BottomSheetWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
