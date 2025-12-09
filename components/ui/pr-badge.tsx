import { View, ViewProps } from 'react-native';

import { Dumbbell, Medal, RefreshCw, TrendingUp } from 'lucide-react-native';

import { useAppTheme } from '~/lib/contexts/ThemeContext';
import { PRType } from '~/lib/services/pr-tracking/types';

import { Text } from './text';

interface PRBadgeProps extends ViewProps {
  type?: PRType | 'all';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function PRBadge({
  type = 'all',
  size = 'md',
  showText = false,
  style,
  ...props
}: PRBadgeProps) {
  const { theme } = useAppTheme();
  // Determine badge size
  const badgeSizes = {
    sm: {
      container: 'h-5 w-5',
      icon: 12,
      text: 'text-[8px]',
    },
    md: {
      container: 'h-6 w-6',
      icon: 14,
      text: 'text-[10px]',
    },
    lg: {
      container: 'h-8 w-8',
      icon: 18,
      text: 'text-xs',
    },
  };

  // Size properties
  const { container, icon, text } = badgeSizes[size];

  // Get badge color based on PR type - using primary color instead of bright yellow
  const getBadgeColor = () => {
    switch (type) {
      case 'weight':
        return theme.colors.primary; // Use primary color instead of amber
      case 'reps':
        return '#4CAF50'; // Keep green for reps
      case 'volume':
        return '#2196F3'; // Keep blue for volume
      case 'all':
      default:
        return theme.colors.primary; // Use primary color instead of gold
    }
  };

  // Get icon component based on PR type
  const getBadgeIcon = () => {
    switch (type) {
      case 'weight':
        return <Dumbbell size={icon} color="white" />;
      case 'reps':
        return <RefreshCw size={icon} color="white" />;
      case 'volume':
        return <TrendingUp size={icon} color="white" />;
      case 'all':
      default:
        return <Medal size={icon} color="white" />;
    }
  };

  // Get text based on PR type
  const getBadgeText = () => {
    switch (type) {
      case 'weight':
        return 'W';
      case 'reps':
        return 'R';
      case 'volume':
        return 'V';
      case 'all':
      default:
        return 'PR';
    }
  };

  return (
    <View
      className={`items-center justify-center rounded-full ${container}`}
      style={[
        {
          backgroundColor: getBadgeColor(), // Solid background
        },
        style,
      ]}
      {...props}>
      {showText ? (
        <Text className={`font-semibold ${text}`} style={{ color: 'white' }}>
          {getBadgeText()}
        </Text>
      ) : (
        getBadgeIcon()
      )}
    </View>
  );
}
