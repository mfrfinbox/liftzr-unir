import { observable } from '@legendapp/state';

export type ColorScheme = 'dark';

// Create the observable store for theme - always dark
export const themeStore$ = observable({
  colorScheme: 'dark' as ColorScheme,
  isInitialized: true,
});

// No persistence needed - always dark theme
export function setupThemeSync() {
  // No-op - theme is always dark
}

// Operations for theme (simplified - always dark)
export const themeOperations = {
  getColorScheme: (): ColorScheme => 'dark',
  setColorScheme: (_scheme: ColorScheme): void => {
    // No-op - always dark
  },
  toggleColorScheme: (): void => {
    // No-op - always dark
  },
};

// Debug utilities
export const themeDebug = {
  logState: () => {
    // Debug logging removed for production
  },
};
