import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { InteractionManager, BackHandler, StyleSheet, Dimensions, Platform } from 'react-native';

import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';

import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface BottomSheetProps {
  /**
   * Whether the bottom sheet is visible
   */
  visible: boolean;
  /**
   * Callback when requesting to close the bottom sheet
   */
  onClose: () => void;
  /**
   * Content to be displayed in the bottom sheet
   */
  children: React.ReactNode;
  /**
   * Snap points for the bottom sheet, in percentages or points
   * Not required when enableDynamicSizing is true
   * @default ["50%", "80%"]
   */
  snapPoints?: (string | number)[];
  /**
   * Initial snap index to show
   * @default 0
   */
  initialIndex?: number;
  /**
   * Whether backdrop can be pressed to dismiss the sheet
   * @default true
   */
  backdropDismissible?: boolean;
  /**
   * Whether to show handle indicator at the top of sheet
   * @default true
   */
  showIndicator?: boolean;
  /**
   * Whether to enable pan gesture to close the sheet
   * @default true
   */
  enablePanDownToClose?: boolean;
  /**
   * Whether to use a controlled approach for visibility
   * @default true
   */
  useControlledVisibility?: boolean;
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
  /**
   * Keyboard behavior when text input is focused
   * - 'interactive': Sheet expands to fill screen (default for most cases)
   * - 'extend': Sheet extends only enough to show input above keyboard (best for fixed snap points)
   * - 'fillParent': Sheet fills entire parent container
   * @default "interactive"
   */
  keyboardBehavior?: 'interactive' | 'extend' | 'fillParent';
  /**
   * Android-specific keyboard input mode
   * - 'adjustPan': Keyboard pans the content
   * - 'adjustResize': Keyboard resizes the content (recommended for preventing sheet from expanding)
   * @default undefined (uses library default)
   */
  android_keyboardInputMode?: 'adjustPan' | 'adjustResize';
}

/**
 * A standardized bottom sheet component using @gorhom/bottom-sheet
 * Uses Tailwind classes for theming to match the app's design system
 * Handles interaction properly and prevents common issues with modal stacking
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints,
  initialIndex = 0,
  backdropDismissible = true,
  showIndicator = true,
  enablePanDownToClose = true,
  enableDynamicSizing = false,
  maxDynamicContentSize = Math.round(Dimensions.get('window').height * 0.9),
  keyboardBehavior = 'interactive',
  android_keyboardInputMode,
}: BottomSheetProps) {
  useTheme(); // Just for context, not using colors
  const { theme } = useAppTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Track if a dismiss operation is in progress
  const isDismissing = useRef(false);
  const isPresenting = useRef(false);
  const wasVisible = useRef(false);

  // Track timeout IDs for cleanup
  const timeoutIds = useRef<Set<NodeJS.Timeout>>(new Set());

  // Memoize snap points - use default if not provided and dynamic sizing is disabled
  const memoizedSnapPoints = useMemo(() => {
    if (enableDynamicSizing) {
      // For dynamic sizing, we must NOT provide snap points
      // The library will calculate height automatically
      return undefined;
    }
    return snapPoints || ['50%', '80%'];
  }, [snapPoints, enableDynamicSizing]);

  // Create memoized styles that depend on the theme
  const styles = useMemo(
    () =>
      StyleSheet.create({
        backgroundStyle: {
          backgroundColor: theme.colors.background,
        },
        handleIndicatorStyle: {
          backgroundColor:
            theme.dark === true
              ? theme.colors.border + '80' // More visible in dark mode (50% opacity)
              : theme.colors.border + '60', // Less visible in light mode (38% opacity)
          width: 36,
          height: 4,
          borderRadius: 2,
        },
        backdropStyle: {
          backgroundColor:
            theme.dark === true
              ? 'rgba(0, 0, 0, 0.8)' // Darker backdrop for dark mode
              : 'rgba(0, 0, 0, 0.6)', // Lighter backdrop for light mode
        },
      }),
    [theme]
  );

  // Present the bottom sheet
  const presentBottomSheet = useCallback(() => {
    if (isPresenting.current || !bottomSheetModalRef.current) return;

    isPresenting.current = true;
    try {
      bottomSheetModalRef.current.present();
      // Reset the presenting flag after animation completes
      const timeoutId = setTimeout(() => {
        isPresenting.current = false;
        timeoutIds.current.delete(timeoutId);
      }, 300);
      timeoutIds.current.add(timeoutId);
    } catch {
      isPresenting.current = false;
      onClose(); // Notify parent component
    }
  }, [onClose]);

  // Dismiss the bottom sheet
  const dismissBottomSheet = useCallback(() => {
    if (isDismissing.current || !bottomSheetModalRef.current) return;

    isDismissing.current = true;
    try {
      bottomSheetModalRef.current.dismiss();
      // Reset dismissing flag after animation completes
      const timeoutId = setTimeout(() => {
        isDismissing.current = false;
        timeoutIds.current.delete(timeoutId);
      }, 300);
      timeoutIds.current.add(timeoutId);
    } catch {
      isDismissing.current = false;
    }
  }, []);

  // Present or dismiss based on visible prop
  useEffect(() => {
    // Only trigger if visibility has changed
    if (visible !== wasVisible.current) {
      wasVisible.current = visible;

      if (visible) {
        // We need a small delay to let the component fully mount
        const timeoutId = setTimeout(() => {
          presentBottomSheet();
          timeoutIds.current.delete(timeoutId);
        }, 50);
        timeoutIds.current.add(timeoutId);
      } else {
        dismissBottomSheet();
      }
    }
  }, [visible, presentBottomSheet, dismissBottomSheet]);

  // Handle back button press
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && backdropDismissible && !isDismissing.current && enablePanDownToClose) {
        // Inline the close logic to avoid forward reference issues
        if (!backdropDismissible || isDismissing.current || !enablePanDownToClose) {
          return false;
        }

        isDismissing.current = true;

        if (bottomSheetModalRef.current) {
          try {
            bottomSheetModalRef.current.dismiss();
            // We'll call onClose in the onChange handler
          } catch {
            // If we can't close through the ref, still call onClose to update parent state
            isDismissing.current = false;
            onClose();
          }
        } else {
          // If the ref is null, still call onClose to update parent state
          isDismissing.current = false;
          onClose();
        }
        return true; // Prevent default back action
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, backdropDismissible, enablePanDownToClose, onClose]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clear all pending timeouts
      timeoutIds.current.forEach((id) => clearTimeout(id));
      timeoutIds.current.clear();

      // Only try to dismiss if the ref is valid
      if (bottomSheetModalRef.current) {
        try {
          bottomSheetModalRef.current.dismiss();
        } catch {
          // Ignore errors during cleanup
        }
      }
      isDismissing.current = false;
      isPresenting.current = false;
    };
  }, []);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      // If sheet is fully closed (index -1), call onClose
      if (index === -1 && !isDismissing.current) {
        isDismissing.current = true;

        // Use InteractionManager to ensure UI thread is free
        InteractionManager.runAfterInteractions(() => {
          onClose();

          // Reset dismissing flag after a short delay to prevent quick re-opening
          const timeoutId = setTimeout(() => {
            isDismissing.current = false;
            timeoutIds.current.delete(timeoutId);
          }, 300);
          timeoutIds.current.add(timeoutId);
        });
      }
    },
    [onClose]
  );

  // Backdrop render function for the bottom sheet
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={backdropDismissible && enablePanDownToClose ? 'close' : 'none'} // Only allow closing when both conditions are met
        opacity={theme.dark === true ? 0.8 : 0.6} // Different opacity based on theme
        style={styles.backdropStyle}
      />
    ),
    [backdropDismissible, enablePanDownToClose, theme, styles.backdropStyle]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={initialIndex}
      snapPoints={memoizedSnapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={enablePanDownToClose}
      enableDismissOnClose
      enableDynamicSizing={enableDynamicSizing}
      maxDynamicContentSize={enableDynamicSizing ? maxDynamicContentSize : undefined}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior="none"
      android_keyboardInputMode={android_keyboardInputMode}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.backgroundStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      handleComponent={showIndicator ? undefined : () => null}
      enableContentPanningGesture={false}
      enableOverDrag={false}
      enableHandlePanningGesture={enablePanDownToClose}
      accessible={Platform.select({ ios: false, default: true })}>
      {children}
    </BottomSheetModal>
  );
}
