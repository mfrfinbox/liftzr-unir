import React from 'react';

import { StyleSheet, View, Pressable } from 'react-native';

import * as Haptics from 'expo-haptics';

import { Medal, CheckCircle, XCircle, Info, X } from 'lucide-react-native';
import Toast, { ToastConfig, ToastConfigParams } from 'react-native-toast-message';

import { TOAST_DURATION } from '~/lib/constants';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

import { Text } from './text';

// Toast types we support
export type ToastType = 'success' | 'error' | 'info' | 'pr';

// Define the toast positions
export type ToastPosition = 'top' | 'bottom';

// Define toast parameters
export interface ToastParams {
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  duration?: number;
  subtitle?: string;
  onHide?: () => void;
}

// Toast type definitions with icons only (colors will come from theme)
const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  pr: Medal,
};

/**
 * Custom Toast Base component that all toast types will use
 */
const ThemedToast = ({
  text1,
  text2,
  toastType = 'info',
  icon,
  iconBg,
  ...props
}: ToastConfigParams<any> & {
  toastType?: ToastType;
  icon?: React.ComponentType<{ size: number; color: string }>;
  iconBg?: boolean;
}) => {
  const { theme } = useAppTheme();

  // Get icon from predefined icons
  const IconComponent = icon || TOAST_ICONS[toastType];

  // Set color based on toast type using theme colors
  let accentColor: string;
  switch (toastType) {
    case 'success':
      // Use primary color for success
      accentColor = theme.colors.primary;
      break;
    case 'error':
      // Use notification/destructive color for errors
      accentColor = theme.colors.notification;
      break;
    case 'pr':
      // Use primary color for PR
      accentColor = theme.colors.primary;
      break;
    case 'info':
    default:
      // Use primary color for info as well
      accentColor = theme.colors.primary;
      break;
  }

  return (
    <View
      testID={`toast-${toastType}`}
      style={[
        styles.baseToast,
        {
          backgroundColor: theme.colors.card,
        },
      ]}>
      <View style={styles.iconContainer} testID={`toast-${toastType}-icon-container`}>
        {toastType === 'pr' ? (
          iconBg ? (
            <View
              style={[
                styles.iconBackground,
                {
                  backgroundColor: accentColor,
                  borderColor: 'transparent',
                },
              ]}>
              <Medal size={16} color="white" />
            </View>
          ) : (
            <Medal size={22} color={accentColor} />
          )
        ) : iconBg ? (
          <View
            style={[
              styles.iconBackground,
              {
                backgroundColor: accentColor,
                borderColor: 'transparent',
              },
            ]}>
            <IconComponent size={16} color="white" />
          </View>
        ) : (
          <IconComponent size={22} color={accentColor} />
        )}
      </View>
      <View style={styles.textContainer} testID={`toast-${toastType}-text-container`}>
        <Text className="font-medium text-foreground" testID={`toast-${toastType}-title`}>
          {text1}
        </Text>
        {text2 ? (
          <Text className="text-sm text-muted-foreground" testID={`toast-${toastType}-subtitle`}>
            {text2}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => props.hide && props.hide()}
        style={styles.closeButton}
        testID={`toast-${toastType}-close-button`}>
        <X size={16} color={theme.colors.text + '80'} />
      </Pressable>
    </View>
  );
};

/**
 * Custom PR Toast component with trophy icon
 */
const PRToast = (props: ToastConfigParams<any>) => {
  return <ThemedToast {...props} toastType="pr" iconBg={true} />;
};

/**
 * The main toast component to be rendered at the app's root
 */
export function ToastMessage() {
  // Define custom toast configurations
  const toastConfig: ToastConfig = {
    success: (props) => <ThemedToast {...props} toastType="success" />,
    error: (props) => <ThemedToast {...props} toastType="error" />,
    info: (props) => <ThemedToast {...props} toastType="info" />,
    pr: PRToast,
  };

  return <Toast config={toastConfig} />;
}

// Helper to show toast messages - now checks preference globally
export function showToast({
  message,
  type = 'info',
  position = 'top',
  duration = TOAST_DURATION.short,
  subtitle,
  onHide,
}: ToastParams) {
  // Regular toasts are disabled - only PR toasts are shown
  checkToastPreference().then((shouldShowToasts) => {
    if (shouldShowToasts) {
      Toast.show({
        type,
        text1: message,
        text2: subtitle,
        position,
        visibilityTime: duration,
        autoHide: true,
        topOffset: 60,
        bottomOffset: 60,
        onHide,
      });
    }
  });
}

// Helper function to check toast preference from AsyncStorage
async function checkToastPreference(): Promise<boolean> {
  // Toast messages are now disabled globally except for PR toasts
  return false;
}

// Helper to hide toast
export function hideToast() {
  Toast.hide();
}

// Usage hook for easy imports
export function useToastMessage() {
  return {
    showToast,
    hideToast,
    // Specialized methods for common toast types
    showSuccessToast: (message: string, subtitle?: string, duration?: number) =>
      showToast({ message, subtitle, type: 'success', duration }),
    showErrorToast: (message: string, subtitle?: string, duration?: number) =>
      showToast({ message, subtitle, type: 'error', duration }),
    showInfoToast: (message: string, subtitle?: string, duration?: number) =>
      showToast({ message, subtitle, type: 'info', duration }),
    showPRToast: async (exerciseName: string, prDetail: string, duration?: number) => {
      // PR toasts are always shown regardless of settings
      const shouldShowToasts = true; // Always show PR toasts
      if (shouldShowToasts) {
        // Trigger a powerful celebratory haptic feedback sequence for PR achievement
        const triggerHapticSequence = async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await new Promise((resolve) => setTimeout(resolve, 100));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await new Promise((resolve) => setTimeout(resolve, 150));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (_error) {}
        };

        triggerHapticSequence();

        Toast.show({
          type: 'pr',
          text1: exerciseName,
          text2: prDetail,
          position: 'top',
          visibilityTime: duration || TOAST_DURATION.long,
          autoHide: true,
          topOffset: 60,
          bottomOffset: 60,
        });
      }
    },
  };
}

// Styled components
const styles = StyleSheet.create({
  baseToast: {
    height: 'auto',
    minHeight: 60,
    width: '90%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconBackground: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
