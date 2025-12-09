import { useState, useRef } from 'react';

import { View } from 'react-native';

export interface ExerciseItemState {
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  menuPosition: { top: number; right: number };
  setMenuPosition: (position: { top: number; right: number }) => void;
  detailsModalVisible: boolean;
  setDetailsModalVisible: (visible: boolean) => void;
  restMenuVisible: boolean;
  setRestMenuVisible: (visible: boolean) => void;
  nextRestMenuVisible: boolean;
  setNextRestMenuVisible: (visible: boolean) => void;
  menuButtonRef: React.RefObject<View | null>;
}

/**
 * Manages all state for the ExerciseItem component
 */
export function useExerciseItemState(): ExerciseItemState {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [restMenuVisible, setRestMenuVisible] = useState(false);
  const [nextRestMenuVisible, setNextRestMenuVisible] = useState(false);

  const menuButtonRef = useRef<View>(null);

  return {
    menuVisible,
    setMenuVisible,
    menuPosition,
    setMenuPosition,
    detailsModalVisible,
    setDetailsModalVisible,
    restMenuVisible,
    setRestMenuVisible,
    nextRestMenuVisible,
    setNextRestMenuVisible,
    menuButtonRef,
  };
}
