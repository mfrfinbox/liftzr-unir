import React, { useEffect, useState, useRef } from 'react';

import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  DimensionValue,
  BackHandler,
  Platform,
  InteractionManager,
} from 'react-native';

import { useTheme } from '@react-navigation/native';

interface ModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;
  /**
   * Callback when requesting to close the modal (backdrop press or hardware back)
   */
  onClose: () => void;
  /**
   * Content to be displayed in the modal
   */
  children: React.ReactNode;
  /**
   * Animation type when showing/hiding the modal
   * @default "slide"
   */
  animationType?: 'none' | 'slide' | 'fade';
  /**
   * Modal content container style
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Modal backdrop style
   */
  backdropStyle?: StyleProp<ViewStyle>;
  /**
   * Height of the modal content (e.g., "60%", 500)
   * @default undefined (auto height)
   */
  modalHeight?: DimensionValue;
  /**
   * Whether the modal has a rounded top (for bottom sheet style modals)
   * @default true
   */
  roundedTop?: boolean;
  /**
   * Whether the backdrop can be pressed to dismiss the modal
   * @default true
   */
  backdropDismissible?: boolean;
  /**
   * Whether the modal is rendered over the status bar
   * @default true
   */
  statusBarTranslucent?: boolean;
  /**
   * Whether to use a controlled internal visible state (helps with iOS modal stacking issues)
   * @default true on iOS, false on other platforms
   */
  useControlledVisibility?: boolean;
  /**
   * Delay (ms) before closing the modal internally after onClose is called
   * @default 300
   */
  dismissDelay?: number;
}

/**
 * A consistent modal component for use throughout the app.
 * Handles touch events properly and applies consistent styling.
 * Prevents common issues with modal stacking on iOS.
 */
export function Modal({
  visible,
  onClose,
  children,
  animationType = 'slide',
  contentContainerStyle,
  backdropStyle,
  modalHeight,
  roundedTop = true,
  backdropDismissible = true,
  statusBarTranslucent = true,
  useControlledVisibility = Platform.OS === 'ios', // Default to controlled visibility on iOS
  dismissDelay = 300,
}: ModalProps) {
  const { colors } = useTheme();

  // Use controlled internal state for iOS to prevent modal stacking issues
  const [internalVisible, setInternalVisible] = useState(false);

  // Track if a dismiss operation is in progress to prevent multiple simultaneous dismissals
  const isDismissing = useRef(false);

  // Track if user interaction with modal is in progress
  const isInteractionInProgress = useRef(false);

  // Sync internal state with prop when modal should open
  useEffect(() => {
    if (useControlledVisibility) {
      if (visible && !internalVisible && !isDismissing.current) {
        setInternalVisible(true);
      }
    }
  }, [visible, internalVisible, useControlledVisibility]);

  // Handle modal closing with proper cleanup
  useEffect(() => {
    if (useControlledVisibility && !visible && internalVisible) {
      // If modal should close and we're using controlled visibility
      if (!isDismissing.current) {
        isDismissing.current = true;

        // Allow animations to complete before actually removing the modal
        const timeout = setTimeout(() => {
          setInternalVisible(false);

          // Use InteractionManager to ensure UI is responsive after closing
          InteractionManager.runAfterInteractions(() => {
            isDismissing.current = false;
            isInteractionInProgress.current = false;
          });
        }, dismissDelay);

        return () => clearTimeout(timeout);
      }
    }
  }, [visible, internalVisible, useControlledVisibility, dismissDelay]);

  // Handle back button press
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && backdropDismissible && !isDismissing.current) {
        handleClose();
        return true; // Prevent default back action
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, backdropDismissible]);

  // Clean up state when component unmounts
  useEffect(() => {
    return () => {
      // Ensure cleanup happens when component unmounts
      isDismissing.current = false;
      isInteractionInProgress.current = false;
      if (useControlledVisibility) {
        setInternalVisible(false);
      }
    };
  }, [useControlledVisibility]);

  // Safely handle closing to prevent multiple simultaneous close attempts
  const handleClose = () => {
    if (!backdropDismissible || isDismissing.current || isInteractionInProgress.current) {
      return;
    }

    isInteractionInProgress.current = true;
    isDismissing.current = true;

    onClose();

    // We'll rely on the effect to actually hide the modal
    // This prevents the issue where onClose triggers state updates that might
    // try to present another modal before this one has finished dismissing
  };

  // Create content styles with height if provided
  const containerStyle: StyleProp<ViewStyle> = [
    styles.modalContainer,
    { backgroundColor: colors.card },
    roundedTop && styles.roundedTop,
  ];

  // Add height if specified
  if (modalHeight) {
    containerStyle.push({ height: modalHeight });
  }

  return (
    <RNModal
      visible={useControlledVisibility ? internalVisible : visible}
      animationType={animationType}
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={statusBarTranslucent}
      supportedOrientations={['portrait', 'landscape']}
      hardwareAccelerated={true}>
      {/* Backdrop - Entire screen touchable area */}
      <Pressable
        style={[styles.backdrop, backdropStyle]}
        onPress={handleClose}
        accessible={backdropDismissible}
        accessibilityRole={backdropDismissible ? 'button' : undefined}
        accessibilityLabel={backdropDismissible ? 'Close modal' : undefined}>
        {/* Modal content container - prevent touch propagation */}
        <Pressable
          style={[containerStyle, contentContainerStyle]}
          onPress={(e) => e.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#121212',
    paddingBottom: 16,
    overflow: 'hidden',
  },
  roundedTop: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
