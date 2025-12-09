import { useEffect, useRef } from 'react';

import { InteractionManager } from 'react-native';

export function useModalLifecycle(visible: boolean, exercise?: any) {
  const isClosingRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Reset refs when modal becomes visible
  useEffect(() => {
    if (visible && exercise) {
      isClosingRef.current = false;
      isLoadingRef.current = false;
    }
  }, [visible, exercise]);

  // Cleanup when modal is dismissed
  useEffect(() => {
    if (!visible) {
      const interactionCleanup = InteractionManager.runAfterInteractions(() => {
        isClosingRef.current = false;
        isLoadingRef.current = false;
      });

      return () => {
        interactionCleanup.cancel();
      };
    }
  }, [visible]);

  // Complete cleanup when component unmounts
  useEffect(() => {
    return () => {
      isClosingRef.current = false;
      isLoadingRef.current = false;
    };
  }, []);

  return { isClosingRef };
}
