import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { View, Pressable, StyleSheet, Dimensions } from 'react-native';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LucideIcon } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { APP_PADDING } from '~/lib/constants';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

import { BottomSheet } from './bottom-sheet';

interface ModalSheetProps {
  /**
   * Whether the sheet is visible
   */
  visible: boolean;
  /**
   * Callback to close the sheet
   */
  onClose: () => void;
  /**
   * Title to display in the header
   */
  title: string;
  /**
   * Primary action text (right button)
   * @default "Done"
   */
  primaryActionText?: string;
  /**
   * Secondary action text (left button)
   * @default "Cancel"
   */
  secondaryActionText?: string;
  /**
   * Callback when primary action is pressed
   * @default onClose
   */
  onPrimaryAction?: () => void;
  /**
   * Callback when secondary action is pressed
   * @default onClose
   */
  onSecondaryAction?: () => void;
  /**
   * Whether the sheet can be panned down to close
   * @default true
   */
  enablePanDownToClose?: boolean;
  /**
   * Whether the backdrop can be tapped to dismiss
   * @default true
   */
  backdropDismissible?: boolean;
  /**
   * Content to display in the sheet
   */
  children: React.ReactNode;
  /**
   * Optional instruction text to display below the header
   */
  instructionText?: string;
  /**
   * Snap points for the bottom sheet
   * @default ["60%"]
   */
  snapPoints?: (string | number)[];
  /**
   * Initial snap index
   * @default 0
   */
  initialIndex?: number;
  /**
   * Whether interaction is disabled (e.g., during drag operations)
   * This disables backdrop dismissal and pan to close
   * @default false
   */
  disableInteraction?: boolean;
  /**
   * Test ID for the modal sheet container
   */
  testID?: string;
  /**
   * Test ID for the primary action button
   */
  primaryActionTestID?: string;
  /**
   * Test ID for the secondary action button
   */
  secondaryActionTestID?: string;
  /**
   * Enable dynamic sizing based on content height
   * When true, sheet adapts to content size automatically
   * @default false
   */
  enableDynamicSizing?: boolean;
  /**
   * Maximum height for dynamic sizing in pixels
   * Only used when enableDynamicSizing is true
   * Must be a number (not percentage string)
   * @default 90% of screen height
   */
  maxDynamicContentSize?: number;
}

/**
 * A standardized modal sheet component that combines BottomSheet with common header patterns
 * This component enforces consistent styling and behavior across all modals in the app
 */
export function ModalSheet({
  visible,
  onClose,
  title,
  primaryActionText = 'Done',
  secondaryActionText = 'Cancel',
  onPrimaryAction,
  onSecondaryAction,
  enablePanDownToClose = true,
  backdropDismissible = true,
  children,
  instructionText,
  snapPoints = ['60%'],
  initialIndex = 0,
  disableInteraction = false,
  testID,
  primaryActionTestID,
  secondaryActionTestID,
  enableDynamicSizing = false,
  maxDynamicContentSize = Math.round(Dimensions.get('window').height * 0.9),
}: ModalSheetProps) {
  const { theme } = useAppTheme();
  const isDismissing = useRef(false);

  // Default the primary and secondary actions to onClose if not provided
  const handlePrimaryAction = useCallback(() => {
    if (isDismissing.current) return;
    isDismissing.current = true;

    // Call the provided action handler
    if (onPrimaryAction) {
      onPrimaryAction();
    } else {
      // Default to close if no action provided
      onClose();
    }

    // Reset the dismissing flag after a delay
    setTimeout(() => {
      isDismissing.current = false;
    }, 300);
  }, [onPrimaryAction, onClose]);

  const handleSecondaryAction = useCallback(() => {
    if (isDismissing.current) return;
    isDismissing.current = true;

    // Call the provided action handler
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      // Default to close if no action provided
      onClose();
    }

    // Reset the dismissing flag after a delay
    setTimeout(() => {
      isDismissing.current = false;
    }, 300);
  }, [onSecondaryAction, onClose]);

  // Ensure we reset the dismissing flag when unmounting
  useEffect(() => {
    return () => {
      isDismissing.current = false;
    };
  }, []);

  // Create memoized styles for consistent theming
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '35', // 35 = 21% opacity - more subtle
        },
        sectionBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '25', // 25 = 15% opacity - even more subtle
        },
        titleText: {
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: '500',
        },
        actionText: {
          color: theme.colors.primary + (theme.dark ? 'EE' : 'DD'),
          fontWeight: '500',
        },
        instructionText: {
          color: theme.colors.text + '80', // 80 = 50% opacity
          fontSize: 14,
        },
      }),
    [theme]
  );

  // When dynamic sizing is enabled, wrap everything in BottomSheetView for proper measurement
  const content = (
    <>
      {/* Header */}
      <View
        style={styles.headerBorder}
        className="flex-row items-center p-4"
        testID={testID ? `${testID}-header` : undefined}>
        {/* Left button - flex-1 to take equal space */}
        <View className="flex-1 items-start">
          {secondaryActionText ? (
            <Pressable
              onPress={handleSecondaryAction}
              hitSlop={10}
              className="px-2"
              testID={secondaryActionTestID}>
              <Text style={styles.actionText}>{secondaryActionText}</Text>
            </Pressable>
          ) : (
            <View className="px-2" />
          )}
        </View>

        {/* Centered title */}
        <Text
          style={styles.titleText}
          className="font-medium"
          testID={testID ? `${testID}-title` : undefined}>
          {title}
        </Text>

        {/* Right button - flex-1 to take equal space */}
        <View className="flex-1 items-end">
          {primaryActionText ? (
            <Pressable
              onPress={handlePrimaryAction}
              hitSlop={10}
              className="px-2"
              testID={primaryActionTestID}>
              <Text style={styles.actionText}>{primaryActionText}</Text>
            </Pressable>
          ) : (
            <View className="px-2" />
          )}
        </View>
      </View>

      {/* Optional Instruction Text */}
      {instructionText && (
        <View
          style={styles.sectionBorder}
          className="py-2"
          testID={testID ? `${testID}-instruction` : undefined}>
          <Text style={styles.instructionText} className="text-center text-sm">
            {instructionText}
          </Text>
        </View>
      )}

      {/* Content - only use flex-1 when NOT using dynamic sizing */}
      <View
        className={enableDynamicSizing ? '' : 'flex-1'}
        testID={testID ? `${testID}-content` : undefined}>
        {children}
      </View>
    </>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={snapPoints}
      initialIndex={initialIndex}
      backdropDismissible={disableInteraction ? false : backdropDismissible}
      enablePanDownToClose={disableInteraction ? false : enablePanDownToClose}
      enableDynamicSizing={enableDynamicSizing}
      maxDynamicContentSize={maxDynamicContentSize}
      showIndicator={true}>
      {enableDynamicSizing ? <BottomSheetScrollView>{content}</BottomSheetScrollView> : content}
    </BottomSheet>
  );
}

/**
 * Component for creating consistent action buttons in ModalSheet
 */
export function ModalSheetButton({
  onPress,
  icon,
  text,
  visible = true,
}: {
  onPress: () => void;
  icon?: LucideIcon;
  text: string;
  visible?: boolean;
}) {
  const { theme } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttonBackground: {
          backgroundColor:
            theme.dark === true
              ? theme.colors.text + '1A' // 1A = 10% opacity (darker than before)
              : theme.colors.card + 'F5', // F5 = 96% opacity (more visible)
          borderRadius: 8,
        },
        buttonText: {
          color: theme.colors.primary + (theme.dark ? 'EE' : 'DD'),
          fontWeight: '500',
        },
        buttonIcon: {
          color: theme.colors.primary + (theme.dark ? 'EE' : 'DD'),
          opacity: 0.95,
        },
      }),
    [theme]
  );

  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.buttonBackground,
        {
          paddingHorizontal: APP_PADDING.horizontal,
          paddingVertical: APP_PADDING.vertical,
          borderRadius: 8,
        },
      ]}
      className="mx-1 flex-row items-center">
      {icon &&
        React.createElement(icon, {
          size: 16,
          color: styles.buttonIcon.color,
          style: { marginRight: 6, opacity: 0.95 },
        })}
      <Text style={styles.buttonText} className="text-sm">
        {text}
      </Text>
    </Pressable>
  );
}

/**
 * Container for buttons in a modal sheet
 */
export function ModalSheetButtonContainer({ children }: { children: React.ReactNode }) {
  return <View className="flex-row justify-center p-3">{children}</View>;
}
