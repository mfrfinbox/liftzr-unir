/**
 * ThemeContext - Simplified for dark theme only
 */
import { createContext, useContext, ReactNode } from 'react';

import { Theme, DarkTheme } from '@react-navigation/native';

import { NAV_THEME } from '~/lib/constants';

export const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export type ColorScheme = 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  theme: Theme;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  // Always use dark theme
  const colorScheme: ColorScheme = 'dark';
  const theme = DARK_THEME;

  // No-op functions for compatibility
  const setColorScheme = () => {};
  const toggleColorScheme = () => {};

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, theme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
};
