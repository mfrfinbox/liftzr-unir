import React, { useEffect } from 'react';

import { View, Pressable, StyleSheet, Dimensions } from 'react-native';

import { useTheme } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
}

export function Sheet({ isOpen, onClose, children, snapPoints = [300] }: SheetProps) {
  const { colors } = useTheme();
  const { height } = Dimensions.get('window');
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(height - snapPoints[0], {
        damping: 20,
        stiffness: 90,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(
        height,
        {
          duration: 250,
          easing: Easing.bezier(0.36, 0.66, 0.04, 1),
        },
        () => {
          if (onClose) {
            runOnJS(onClose)();
          }
        }
      );
    }
  }, [isOpen, height, snapPoints, opacity, translateY, onClose]);

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="box-none">
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0,0,0,0.5)' },
          backdropAnimatedStyle,
        ]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { backgroundColor: colors.card }, sheetAnimatedStyle]}>
        <View style={styles.handle}>
          <View style={[styles.indicator, { backgroundColor: colors.border }]} />
        </View>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 50,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  handle: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
});
