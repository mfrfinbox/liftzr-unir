import { View, Pressable } from 'react-native';

import { Languages, Weight, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { SEPARATOR_STYLE } from '~/lib/constants/ui';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import { useWeekStart } from '~/lib/contexts/WeekStartContext';

export function BasicPreferencesSettings() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { unit, toggleUnit } = useMeasurement();
  const { weekStartDay, toggleWeekStart } = useWeekStart();

  return (
    <View>
      <View>
        {/* Language Setting - Display only (Spanish is the only language) */}
        <View className="flex-row items-center justify-between px-4 py-3.5">
          <View className="flex-row items-center gap-3">
            <Languages size={20} color={theme.colors.text + '80'} />
            <Text className="text-base text-foreground">{t('settings.preferences.language')}</Text>
          </View>
          <Text className="text-base text-muted-foreground">Español</Text>
        </View>

        {/* Divider */}
        <View className={SEPARATOR_STYLE} />

        {/* Weight Unit Setting */}
        <Pressable
          className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
          testID="weight-unit-setting"
          onPress={toggleUnit}>
          <View className="flex-row items-center gap-3">
            <Weight size={20} color={theme.colors.text + '80'} />
            <Text className="text-base text-foreground">
              {t('settings.preferences.weightUnit')}
            </Text>
          </View>
          <Text className="text-base text-muted-foreground" testID={`weight-unit-${unit}`}>
            {unit === 'kg' ? t('settings.preferences.kilograms') : t('settings.preferences.pounds')}
          </Text>
        </Pressable>

        {/* Divider */}
        <View className={SEPARATOR_STYLE} />

        {/* Week Start Setting */}
        <Pressable
          className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
          testID="week-start-setting"
          onPress={toggleWeekStart}>
          <View className="flex-row items-center gap-3">
            <Calendar size={20} color={theme.colors.text + '80'} />
            <Text className="text-base text-foreground">
              {t('settings.preferences.weekStarts')}
            </Text>
          </View>
          <Text className="text-base text-muted-foreground" testID={`week-start-${weekStartDay}`}>
            {weekStartDay === 'sunday'
              ? t('settings.preferences.sunday')
              : t('settings.preferences.monday')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
