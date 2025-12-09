import * as React from 'react';

import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { APP_PADDING } from '~/lib/constants';

interface ScreenHeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
  showBackButton?: boolean;
}

export function ScreenHeader({
  title,
  style,
  rightElement,
  showBackButton = false,
}: ScreenHeaderProps) {
  const screenId = title.toLowerCase().replace(/\s+/g, '-');
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, style]}
      testID={`header-${screenId}`}
      accessible={true}
      accessibilityRole="header">
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {showBackButton && (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginRight: 6 }}
                testID="header-back-button">
                <ChevronLeft size={28} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text
              className="text-3xl font-extrabold text-foreground"
              testID={`header-title-${screenId}`}>
              {title}
            </Text>
          </View>
        </View>
        {rightElement && <View style={styles.rightContainer}>{rightElement}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: APP_PADDING.horizontal,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightContainer: {
    justifyContent: 'center',
  },
});
