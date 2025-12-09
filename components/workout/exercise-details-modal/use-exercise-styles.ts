import { useMemo } from 'react';

import { StyleSheet } from 'react-native';

import { useAppTheme } from '~/lib/contexts/ThemeContext';

export function useExerciseStyles() {
  const { theme } = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        headerBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '35',
        },
        sectionBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '25',
        },
        actionText: {
          color: theme.colors.primary + 'cc',
          fontWeight: '500',
        },
        titleText: {
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: '500',
        },
        normalText: {
          color: theme.colors.text,
        },
        secondaryText: {
          color: theme.colors.text + 'aa',
          fontSize: 14,
        },
        statValue: {
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: 'bold',
        },
        statLabel: {
          color: theme.colors.text + '80',
          fontSize: 14,
        },
        setText: {
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: '600',
        },
      }),
    [theme]
  );
}
