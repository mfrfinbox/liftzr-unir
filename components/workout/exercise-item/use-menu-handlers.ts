import type { ExerciseItemProps } from './types';

interface UseMenuHandlersProps {
  index: number;
  item: ExerciseItemProps['item'];
  onRemoveExercise?: ExerciseItemProps['onRemoveExercise'];
  onReplaceExercise?: ExerciseItemProps['onReplaceExercise'];
  onShowReorderModal?: ExerciseItemProps['onShowReorderModal'];
  onPropagateSetRest?: ExerciseItemProps['onPropagateSetRest'];
  onPropagateNextRest?: ExerciseItemProps['onPropagateNextRest'];
  animateClose: (callback: () => void) => void;
  closeSetRestMenu: (callback: () => void) => void;
  closeNextRestMenu: (callback: () => void) => void;
  setMenuVisible: (visible: boolean) => void;
  setSetRestMenuVisible: (visible: boolean) => void;
  setNextRestMenuVisible: (visible: boolean) => void;
  setDetailsModalVisible: (visible: boolean) => void;
}

export function useMenuHandlers({
  index,
  item,
  onRemoveExercise,
  onReplaceExercise,
  onShowReorderModal,
  onPropagateSetRest,
  onPropagateNextRest,
  animateClose,
  closeSetRestMenu,
  closeNextRestMenu,
  setMenuVisible,
  setSetRestMenuVisible,
  setNextRestMenuVisible,
  setDetailsModalVisible,
}: UseMenuHandlersProps) {
  const closeMenu = () => {
    animateClose(() => setMenuVisible(false));
  };

  const handleDeletePress = () => {
    closeMenu();
    if (onRemoveExercise) {
      setTimeout(() => onRemoveExercise(item.workoutExerciseId || item.id), 100);
    }
  };

  const handleReorderPress = () => {
    closeMenu();
    setTimeout(() => onShowReorderModal?.(), 100);
  };

  const handleOpenDetailsModal = () => {
    setDetailsModalVisible(true);
  };

  const handleReplaceExercise = () => {
    onReplaceExercise?.(index);
  };

  const handleCloseSetRestMenu = () => {
    closeSetRestMenu(() => setSetRestMenuVisible(false));
  };

  const handleCloseNextRestMenu = () => {
    closeNextRestMenu(() => setNextRestMenuVisible(false));
  };

  const handlePropagateSetRest = () => {
    handleCloseSetRestMenu();
    setTimeout(() => onPropagateSetRest?.(item.rest || 0), 100);
  };

  const handlePropagateNextRest = () => {
    handleCloseNextRestMenu();
    setTimeout(() => onPropagateNextRest?.(item.nextExerciseRest || 0), 100);
  };

  return {
    closeMenu,
    handleDeletePress,
    handleReorderPress,
    handleOpenDetailsModal,
    handleReplaceExercise,
    handleCloseSetRestMenu,
    handleCloseNextRestMenu,
    handlePropagateSetRest,
    handlePropagateNextRest,
  };
}
