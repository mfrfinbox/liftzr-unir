import { Modal, Pressable, Animated, View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { SEPARATOR_STYLE } from '~/lib/constants/ui';

export type ExerciseSortMethod =
  | 'manual'
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'muscle-group'
  | 'type-reps-time-distance';

interface ExerciseSortMenuProps {
  visible: boolean;
  position: { top: number; right: number };
  animatedStyle: any;
  sortMethod: ExerciseSortMethod;
  onClose: (callback?: () => void) => void;
  onSortMethodChange: (method: ExerciseSortMethod) => void;
  onOpenReorderModal: () => void;
}

export function ExerciseSortMenu({
  visible,
  position,
  animatedStyle,
  sortMethod,
  onClose,
  onSortMethodChange,
  onOpenReorderModal,
}: ExerciseSortMenuProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const MenuItem = ({
    method,
    label,
    onPress,
  }: {
    method?: ExerciseSortMethod;
    label: string;
    onPress: () => void;
  }) => (
    <Pressable
      className="flex-row items-center px-4 py-3"
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      style={{ backgroundColor: colors.card }}
      onPress={onPress}
      testID={method ? `exercise-sort-menu-${method}` : `exercise-sort-menu-item`}>
      <Text
        className="text-sm text-foreground"
        testID={method ? `exercise-sort-menu-${method}-text` : `exercise-sort-menu-item-text`}>
        {label}
      </Text>
      {method && sortMethod === method && (
        <Check
          size={16}
          color={colors.primary}
          style={{ marginLeft: 'auto' }}
          testID={`exercise-sort-menu-${method}-check`}
        />
      )}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View
      className="px-4 py-2"
      testID={`exercise-sort-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <Text
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        testID={`exercise-sort-section-${title.toLowerCase().replace(/\s+/g, '-')}-text`}>
        {title}
      </Text>
    </View>
  );

  const Divider = () => <View className={`mx-2 ${SEPARATOR_STYLE}`} />;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => onClose()}
      testID="exercise-sort-menu-modal">
      <Pressable
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onPress={() => onClose()}
        testID="exercise-sort-menu-overlay">
        <Pressable onPress={(e) => e.stopPropagation()} testID="exercise-sort-menu-container">
          <Animated.View
            className="absolute overflow-hidden rounded-md"
            style={{
              top: position.top,
              right: position.right,
              backgroundColor: colors.card,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 3,
              width: 240,
              borderWidth: 0.5,
              borderColor: 'rgba(150,150,150,0.2)',
              ...animatedStyle,
            }}
            testID="exercise-sort-menu-content">
            {/* Menu Header */}
            <View className="border-b border-border px-4 py-2" testID="exercise-sort-menu-header">
              <Text
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                testID="exercise-sort-menu-header-text">
                {t('workout.sortExercises')}
              </Text>
            </View>

            {/* Manual Sort */}
            <MenuItem
              method="manual"
              label={t('workout.sort.manual')}
              onPress={() => {
                onClose(() => {
                  setTimeout(() => {
                    onOpenReorderModal();
                  }, 100);
                });
              }}
            />

            <View testID="exercise-sort-menu-divider-1">
              <Divider />
            </View>

            {/* Alphabetical Group */}
            <SectionHeader title={t('workout.sort.alphabetical')} />
            <MenuItem
              method="alphabetical-asc"
              label={t('workout.sort.aToZ')}
              onPress={() => {
                onSortMethodChange('alphabetical-asc');
                onClose();
              }}
            />
            <MenuItem
              method="alphabetical-desc"
              label={t('workout.sort.zToA')}
              onPress={() => {
                onSortMethodChange('alphabetical-desc');
                onClose();
              }}
            />

            <View testID="exercise-sort-menu-divider-2">
              <Divider />
            </View>

            {/* Exercise Type Group */}
            <SectionHeader title={t('workout.sort.exerciseType')} />
            <MenuItem
              method="type-reps-time-distance"
              label={t('workout.sort.repsTimeDistance')}
              onPress={() => {
                onSortMethodChange('type-reps-time-distance');
                onClose();
              }}
            />

            <View testID="exercise-sort-menu-divider-3">
              <Divider />
            </View>

            {/* Muscle Group */}
            <SectionHeader title={t('workout.sort.muscleGroup')} />
            <MenuItem
              method="muscle-group"
              label={t('workout.sort.byMuscleGroup')}
              onPress={() => {
                onSortMethodChange('muscle-group');
                onClose();
              }}
            />
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
