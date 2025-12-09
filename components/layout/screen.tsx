import * as React from 'react';

import { View, ScrollView, ViewStyle, StyleProp, RefreshControl } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '~/components/layout/screen-header';
import { APP_PADDING } from '~/lib/constants';

// Moved Container outside and added necessary props
interface ContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  insets: { top: number; bottom: number; left: number; right: number }; // Use specific type for insets
  backgroundColor: string; // Explicitly pass backgroundColor
}

const Container = ({
  children,
  style,
  insets,
  backgroundColor,
  testID,
}: ContainerProps & { testID?: string }) => {
  const containerStyle = React.useMemo(
    () => ({
      flex: 1,
      paddingTop: insets.top,
      backgroundColor: backgroundColor,
    }),
    [insets.top, backgroundColor]
  );

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {children}
    </View>
  );
};

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Set to true to add bottom padding to compensate for tab bar */
  withTabBarPadding?: boolean;
  rightElement?: React.ReactNode;
  testID?: string;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  showBackButton?: boolean;
}

export const Screen = ({
  children,
  title,
  scrollable = true,
  contentContainerStyle,
  style,
  withTabBarPadding = true,
  rightElement,
  testID,
  onRefresh,
  refreshing = false,
  showBackButton = false,
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Memoize style objects to prevent recreation on every render
  const scrollViewContentStyle = React.useMemo(
    () => ({
      paddingHorizontal: APP_PADDING.horizontal,
      paddingBottom: withTabBarPadding ? insets.bottom || 10 : 0,
    }),
    [withTabBarPadding, insets.bottom]
  );

  const viewContentStyle = React.useMemo(
    () => ({
      flex: 1,
      paddingHorizontal: APP_PADDING.horizontal,
      paddingBottom: withTabBarPadding ? insets.bottom || 8 : 8,
    }),
    [withTabBarPadding, insets.bottom]
  );

  // Header with title
  const Header = title ? (
    <ScreenHeader title={title} rightElement={rightElement} showBackButton={showBackButton} />
  ) : (
    <React.Fragment />
  );

  if (scrollable) {
    return (
      <Container style={style} insets={insets} backgroundColor={colors.background} testID={testID}>
        {Header}
        <ScrollView
          className="flex-1"
          contentContainerStyle={[scrollViewContentStyle, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }>
          {children}
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container style={style} insets={insets} backgroundColor={colors.background} testID={testID}>
      {Header}
      <View style={[viewContentStyle, contentContainerStyle]}>{children}</View>
    </Container>
  );
};
