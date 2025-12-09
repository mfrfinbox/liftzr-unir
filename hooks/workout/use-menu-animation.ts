import { useRef, useEffect } from 'react';

import { Animated } from 'react-native';

export function useMenuAnimation(visible: boolean) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const animateVisibility = (isVisible: boolean) => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  };

  const animateClose = (onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(onComplete);
  };

  useEffect(() => {
    animateVisibility(visible);
  }, [visible]);

  return {
    fadeAnim,
    scaleAnim,
    animateClose,
  };
}
