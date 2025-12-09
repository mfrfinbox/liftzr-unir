import type { ExerciseWithDetails } from '~/types';

interface HandlersParams {
  item: ExerciseWithDetails;
  index: number;
  onRemoveExercise?: (exerciseId: string) => void;
  onReplaceExercise?: (exerciseIndex: number) => void;
  onShowReorderModal?: () => void;
  onAddSet?: (exerciseIndex: number) => void;
  onAddSetWithPreviousPerformance?: (exerciseIndex: number, previousPerformance: any) => void;
  onPropagateSetRest?: (restTime: number) => void;
  onPropagateNextRest?: (restTime: number) => void;
  previousPerformance?: any;
  animateClose: (callback: () => void) => void;
  closeSetRestMenu: (callback: () => void) => void;
  closeNextRestMenu: (callback: () => void) => void;
  setMenuVisible: (visible: boolean) => void;
  setDetailsModalVisible: (visible: boolean) => void;
  setMenuPosition: (position: { top: number; right: number }) => void;
  menuButtonRef: React.RefObject<any>;
}

/**
 * Creates all event handlers for the ExerciseItem component
 */
export function createHandlers({
  item,
  index,
  onRemoveExercise,
  onReplaceExercise,
  onShowReorderModal,
  onAddSet,
  onAddSetWithPreviousPerformance,
  onPropagateSetRest,
  onPropagateNextRest,
  previousPerformance,
  animateClose,
  closeSetRestMenu,
  closeNextRestMenu,
  setMenuVisible,
  setDetailsModalVisible,
  setMenuPosition,
  menuButtonRef,
}: HandlersParams) {
  const showMenu = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measure(
        (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          setMenuPosition({
            top: pageY + height + 5,
            right: 10,
          });
          setMenuVisible(true);
        }
      );
    }
  };

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
    closeSetRestMenu(() => {});
  };

  const handleCloseNextRestMenu = () => {
    closeNextRestMenu(() => {});
  };

  const handlePropagateSetRest = () => {
    handleCloseSetRestMenu();
    setTimeout(() => onPropagateSetRest?.(item.rest || 0), 100);
  };

  const handlePropagateNextRest = () => {
    handleCloseNextRestMenu();
    setTimeout(() => onPropagateNextRest?.(item.nextExerciseRest || 0), 100);
  };

  const handleAddSet = () => {
    if (onAddSetWithPreviousPerformance && previousPerformance?.lastSets?.length > 0) {
      const currentSetCount = item.setsData?.length || 0;
      if (currentSetCount === 0 || currentSetCount < previousPerformance.lastSets.length) {
        return onAddSetWithPreviousPerformance(index, previousPerformance);
      }
    }
    if (onAddSet) {
      onAddSet(index);
    }
  };

  return {
    showMenu,
    closeMenu,
    handleDeletePress,
    handleReorderPress,
    handleOpenDetailsModal,
    handleReplaceExercise,
    handleCloseSetRestMenu,
    handleCloseNextRestMenu,
    handlePropagateSetRest,
    handlePropagateNextRest,
    handleAddSet,
  };
}
