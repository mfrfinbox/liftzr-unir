/**
 * Reorder Exercise Animations
 * Animation utilities for highlighting moved exercises
 */

import { useCallback, useRef, MutableRefObject } from 'react';

import { Animated } from 'react-native';

export interface HighlightAnimations {
  [key: string]: Animated.Value;
}

export function useHighlightAnimations() {
  const highlightAnimations = useRef<HighlightAnimations>({});

  const getHighlightAnimation = useCallback((exerciseId: string) => {
    if (!highlightAnimations.current[exerciseId]) {
      highlightAnimations.current[exerciseId] = new Animated.Value(0);
    }
    return highlightAnimations.current[exerciseId];
  }, []);

  const animateHighlight = useCallback(
    (exerciseId: string) => {
      const animation = getHighlightAnimation(exerciseId);

      // Reset and animate
      animation.setValue(1);
      Animated.timing(animation, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    },
    [getHighlightAnimation]
  );

  return {
    highlightAnimations: highlightAnimations as MutableRefObject<HighlightAnimations>,
    getHighlightAnimation,
    animateHighlight,
  };
}

export function createAnimatedStyle(
  highlightAnimation: Animated.Value,
  theme: { colors: { card: string; primary: string } }
) {
  return {
    borderColor: highlightAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.card, theme.colors.primary],
    }),
    borderWidth: highlightAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 2],
    }),
  };
}
