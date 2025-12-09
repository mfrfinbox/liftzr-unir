import { useSelector } from '@legendapp/state/react';

import { muscleGroupsStore$ } from '~/lib/legend-state/stores/muscleGroupsStore';

export function useMuscleGroups() {
  const muscleGroups = useSelector(muscleGroupsStore$.muscleGroups);

  return {
    muscleGroups,
    isLoading: false,
  };
}
