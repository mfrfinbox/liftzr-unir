import { Modal, Pressable, Animated, View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';

interface WorkoutActionMenuProps {
  visible: boolean;
  position: { top: number; right: number };
  animatedStyle: any;
  onClose: () => void;
  onDeleteWorkout: () => void;
  workoutIndex?: number;
}

export function WorkoutActionMenu({
  visible,
  position,
  animatedStyle,
  onClose,
  onDeleteWorkout,
  workoutIndex,
}: WorkoutActionMenuProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      testID="workout-action-menu-modal">
      <Pressable
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onPress={onClose}
        testID="workout-action-menu-overlay">
        <Animated.View
          className="absolute overflow-hidden rounded-md"
          testID="workout-action-menu-container"
          style={{
            top: position.top,
            right: position.right,
            backgroundColor: colors.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
            width: 180,
            borderWidth: 0.5,
            borderColor: 'rgba(150,150,150,0.2)',
            ...animatedStyle,
          }}>
          <Pressable
            className="flex-row items-center px-4 py-3"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            style={{
              backgroundColor: colors.card,
            }}
            testID={
              workoutIndex !== undefined
                ? `button-delete-workout-${workoutIndex}`
                : 'button-delete-workout'
            }
            onPress={onDeleteWorkout}>
            <View className="flex-row items-center">
              <Trash2 size={18} color={colors.notification} />
              <Text className="ml-3 text-sm text-foreground">{t('workoutMenu.deleteWorkout')}</Text>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
