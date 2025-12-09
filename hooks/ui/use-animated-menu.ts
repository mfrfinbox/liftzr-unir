import { useState, useRef, useCallback, useEffect } from 'react';

import { Animated, View } from 'react-native';

interface MenuPosition {
  top: number;
  right: number;
}

export function useAnimatedMenu() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, right: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const showMenu = useCallback(
    (targetRef: View | null, callback?: () => void) => {
      if (!targetRef) return;

      targetRef.measure((x, y, width, height, pageX, pageY) => {
        setMenuPosition({
          top: pageY + height + 4,
          right: 10,
        });
        setMenuVisible(true);

        // Cancel any existing animation
        if (animationRef.current) {
          animationRef.current.stop();
        }

        // Animate in
        animationRef.current = Animated.parallel([
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
        ]);

        animationRef.current.start(() => {
          animationRef.current = null;
          if (callback) callback();
        });
      });
    },
    [fadeAnim, scaleAnim]
  );

  const closeMenu = useCallback(
    (callback?: () => void) => {
      // Cancel any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Animate out
      animationRef.current = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]);

      animationRef.current.start(() => {
        animationRef.current = null;
        setMenuVisible(false);
        if (callback) callback();
      });
    },
    [fadeAnim, scaleAnim]
  );

  const getMenuStyle = useCallback(
    () => ({
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }],
    }),
    [fadeAnim, scaleAnim]
  );

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      // Reset animation values to prevent memory leaks
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, [fadeAnim, scaleAnim]);

  return {
    menuVisible,
    menuPosition,
    showMenu,
    closeMenu,
    getMenuStyle,
  };
}
