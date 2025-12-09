import React from 'react';

import { ExerciseDetailsModal } from '~/components/workout/exercise-details-modal';
import type { Exercise } from '~/types';

interface ExerciseItemModalsProps {
  detailsModalVisible: boolean;
  onCloseDetailsModal: () => void;
  exercise: Exercise;
}

export function ExerciseItemModals({
  detailsModalVisible,
  onCloseDetailsModal,
  exercise,
}: ExerciseItemModalsProps) {
  if (!exercise) return null;

  return (
    <ExerciseDetailsModal
      visible={detailsModalVisible}
      onClose={onCloseDetailsModal}
      exercise={exercise}
    />
  );
}
