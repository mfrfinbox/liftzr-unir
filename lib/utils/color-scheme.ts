// Color scheme utilities for theme management

import { useEffect, useState } from 'react';

import { Appearance } from 'react-native';

export type ColorScheme = 'light' | 'dark' | 'system';

/**
 * Get the current system color scheme
 */
export function getSystemColorScheme(): 'light' | 'dark' {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

/**
 * Resolve a color scheme to actual light/dark value
 */
export function resolveColorScheme(scheme: ColorScheme): 'light' | 'dark' {
  if (scheme === 'system') {
    return getSystemColorScheme();
  }
  return scheme;
}

/**
 * Listen to system color scheme changes
 */
export function addColorSchemeListener(listener: (colorScheme: 'light' | 'dark') => void) {
  return Appearance.addChangeListener(({ colorScheme }) => {
    listener(colorScheme === 'dark' ? 'dark' : 'light');
  });
}

/**
 * Hook to get and listen to color scheme changes
 */
export function useColorScheme(): 'light' | 'dark' | null {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription.remove();
  }, []);

  return colorScheme;
}
