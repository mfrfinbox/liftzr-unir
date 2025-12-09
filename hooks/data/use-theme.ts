import { useSelector } from '@legendapp/state/react';

import { themeStore$, themeOperations } from '~/lib/legend-state/stores/themeStore';

export function useTheme() {
  const colorScheme = useSelector(themeStore$.colorScheme);

  return {
    colorScheme,
    setColorScheme: themeOperations.setColorScheme,
    toggleColorScheme: themeOperations.toggleColorScheme,
  };
}
