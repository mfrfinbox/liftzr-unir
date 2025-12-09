import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Screen } from '~/components/layout/screen';
import { AppInformationSettings } from '~/components/settings/app-information-settings';
import { BasicPreferencesSettings } from '~/components/settings/basic-preferences-settings';
import { DataManagementSettings } from '~/components/settings/data-management-settings';
import { MyExercisesSettings } from '~/components/settings/my-exercises-settings';
import { RestTimesSettings } from '~/components/settings/rest-times-settings';
import { Text } from '~/components/ui/text';
import { APP_PADDING } from '~/lib/constants';
import { SEPARATOR_STYLE } from '~/lib/constants/ui';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

function SettingsSection({
  title,
  children,
  isLast = false,
  testID,
}: {
  title?: string;
  children: React.ReactNode;
  isLast?: boolean;
  testID?: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View className={`${!isLast ? 'mb-6' : 'mb-4'}`} testID={testID}>
      {title && (
        <Text
          className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: theme.colors.text + '60' }}>
          {title}
        </Text>
      )}
      <View className="rounded-md bg-card">{children}</View>
    </View>
  );
}

export default function Settings() {
  const { t } = useTranslation();

  return (
    <Screen
      title={t('screens.settings')}
      contentContainerStyle={{ paddingHorizontal: APP_PADDING.horizontal }}
      scrollable
      testID="screen-settings">
      {/* GENERAL SECTION */}
      <SettingsSection title={t('settings.sectionTitles.general')}>
        <BasicPreferencesSettings />
      </SettingsSection>

      {/* WORKOUT SECTION */}
      <SettingsSection title={t('settings.sectionTitles.workout')}>
        <MyExercisesSettings />
        <View className={SEPARATOR_STYLE} />
        <RestTimesSettings />
      </SettingsSection>

      {/* ABOUT SECTION */}
      <SettingsSection title={t('settings.sectionTitles.about')}>
        <AppInformationSettings />
      </SettingsSection>

      {/* DANGER ZONE */}
      <SettingsSection title={t('settings.sectionTitles.dangerZone')} isLast>
        <DataManagementSettings />
      </SettingsSection>
    </Screen>
  );
}
