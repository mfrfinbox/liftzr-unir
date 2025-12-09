import { useMemo } from 'react';

import { View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { ArrowDownAZ } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '~/components/home/empty-state';
import { createDeleteHandler, createStartWorkoutHandlers } from '~/components/home/home-handlers';
import { TopActionLinks } from '~/components/home/top-action-links';
import { useHomeMenu } from '~/components/home/use-home-menu';
import { useReorderNavigation } from '~/components/home/use-reorder-navigation';
import { WorkoutCard } from '~/components/home/workout-card';
import { Screen } from '~/components/layout/screen';
import { Text } from '~/components/ui/text';
import { ActiveWorkoutIndicator } from '~/components/workout/active-workout-indicator';
import { WorkoutActionMenu } from '~/components/workout/workout-action-menu';
import {
  useWorkoutCompletionStats,
  useDeleteWorkout,
  useUpdateWorkout,
  useWorkouts,
} from '~/hooks/data';
import { useActiveWorkoutGuards } from '~/hooks/workout/use-active-workout-guards';
import { useWorkoutActions } from '~/hooks/workout/use-workout-actions';
import { useWorkoutRecovery } from '~/hooks/workout/use-workout-recovery';
import { useWorkoutSorting } from '~/hooks/workout/use-workout-sorting';
import { APP_PADDING } from '~/lib/constants';

export default function Home() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Database hooks
  const { workouts, isLoading: workoutsLoading } = useWorkouts();
  const { deleteWorkout } = useDeleteWorkout();
  const { reorderWorkouts } = useUpdateWorkout();
  const workoutCompletionStats = useWorkoutCompletionStats();

  // Custom hooks
  const { recoveryData, setRecoveryData } = useWorkoutRecovery({ isLoaded: true });
  const { confirmStartNewWorkout } = useActiveWorkoutGuards();

  const {
    handleStartWorkout: originalHandleStartWorkout,
    handleStartQuickWorkout: originalHandleStartQuickWorkout,
    handleOpenCreateWorkout,
    handleOpenWorkoutDetails,
  } = useWorkoutActions({
    recoveryData,
    setRecoveryData,
    canStartOnWatch: false,
    startWorkoutOnWatch: undefined,
  });

  const {
    sortMethod: _sortMethod,
    setSortMethod: _setSortMethod,
    handleSortMethodChange: _handleSortMethodChange,
  } = useWorkoutSorting({
    workouts,
    workoutCompletionStats,
    reorderWorkouts,
  });

  // Extracted hooks
  const menu = useHomeMenu();
  const { handleOpenReorderModal } = useReorderNavigation({ workouts });

  // Create handlers
  const { handleStartWorkout, handleStartQuickWorkout } = createStartWorkoutHandlers(
    confirmStartNewWorkout,
    originalHandleStartWorkout,
    originalHandleStartQuickWorkout
  );

  const handleDeleteWorkout = createDeleteHandler(
    menu.selectedWorkout,
    menu.closeMenu,
    deleteWorkout,
    t
  );

  // Memoize style object to prevent recreation
  const screenContentStyle = useMemo(
    () => ({
      paddingHorizontal: APP_PADDING.horizontal,
    }),
    []
  );

  // Handle loading state
  if (workoutsLoading) {
    return (
      <Screen
        title={t('screens.home')}
        contentContainerStyle={screenContentStyle}
        scrollable={true}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">{t('home.loadingWorkouts')}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title={t('screens.home')}
      contentContainerStyle={screenContentStyle}
      scrollable={workouts.length > 0}
      testID="screen-home"
      rightElement={
        workouts.length > 1 ? (
          <Pressable
            onPress={handleOpenReorderModal}
            className="p-2"
            testID="button-home-sort"
            accessible={true}
            accessibilityLabel={t('home.sortWorkouts')}
            accessibilityRole="button">
            <ArrowDownAZ size={20} color={colors.text + '80'} />
          </Pressable>
        ) : undefined
      }>
      {workouts.length === 0 ? (
        <EmptyState
          onCreateWorkout={handleOpenCreateWorkout}
          onStartQuickWorkout={handleStartQuickWorkout}
        />
      ) : (
        <>
          {/* Active Workout Indicator - shows above action links */}
          <ActiveWorkoutIndicator />

          {/* Top action links - only shown when workouts exist */}
          <TopActionLinks
            onStartQuickWorkout={handleStartQuickWorkout}
            onCreateNew={handleOpenCreateWorkout}
          />

          {/* Workout Cards */}
          <View className="mb-4 flex-col gap-4">
            {workouts
              .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
              .map((w, index) => {
                const completionStats = workoutCompletionStats[w.id] || null;

                return (
                  <WorkoutCard
                    key={w.id}
                    workout={w}
                    index={index}
                    onPress={() => handleOpenWorkoutDetails(w)}
                    onMenuPress={(e) => {
                      e.stopPropagation();
                      menu.showMenu(w, w.id, index);
                    }}
                    onStartPress={(e) => {
                      e.stopPropagation();
                      handleStartWorkout(w);
                    }}
                    completionStats={completionStats}
                    menuButtonRef={(ref) => {
                      if (ref) {
                        menu.menuButtonRefs.current[w.id] = ref;
                      }
                    }}
                  />
                );
              })}
          </View>
        </>
      )}

      {/* Options Menu */}
      <WorkoutActionMenu
        visible={menu.menuVisible}
        position={menu.menuPosition}
        animatedStyle={menu.getMenuStyle()}
        onClose={menu.closeMenu}
        onDeleteWorkout={handleDeleteWorkout}
        workoutIndex={menu.selectedWorkoutIndex}
      />
    </Screen>
  );
}
