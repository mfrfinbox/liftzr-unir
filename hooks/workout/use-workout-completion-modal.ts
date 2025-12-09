/**
 * Workout Completion Modal State
 * Modal management and cleanup for workout completion
 */

import { useCallback, useRef, useEffect } from 'react';

export function useWorkoutCompletionModal() {
  const isModalInteractionInProgress = useRef(false);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const handleCloseModal = useCallback(
    (modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
      modalSetter(false);

      // Clear any existing timeout
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }

      modalTimeoutRef.current = setTimeout(() => {
        isModalInteractionInProgress.current = false;
        modalTimeoutRef.current = null;
      }, 250);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear timeout if component unmounts
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    isModalInteractionInProgress,
    handleCloseModal,
    isMountedRef,
    modalTimeoutRef,
  };
}
