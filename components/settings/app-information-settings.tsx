import { View } from 'react-native';

import Constants from 'expo-constants';

import { Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

export function AppInformationSettings() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  // Get the app version from app.json (accessible through expo-constants)
  const appVersion = Constants.expoConfig?.version || '0.0.0';

  return (
    <View>
      <View className="flex-row items-center gap-3 px-4 py-3.5">
        <Info size={20} color={theme.colors.text + '80'} />
        <Text className="text-base text-foreground">
          {t('settings.appInformation.version')} {appVersion}
        </Text>
      </View>
    </View>
  );
}
