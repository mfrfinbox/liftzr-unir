import { Modal, Pressable, Animated, View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Check } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { SortMethod } from '~/hooks/workout/use-workout-sorting';
import { SEPARATOR_STYLE } from '~/lib/constants/ui';

interface WorkoutSortMenuProps {
  visible: boolean;
  position: { top: number; right: number };
  animatedStyle: any;
  sortMethod: SortMethod;
  onClose: (callback?: () => void) => void;
  onSortMethodChange: (method: SortMethod) => void;
  onOpenReorderModal: () => void;
}

export function WorkoutSortMenu({
  visible,
  position,
  animatedStyle,
  sortMethod,
  onClose,
  onSortMethodChange,
  onOpenReorderModal,
}: WorkoutSortMenuProps) {
  const { colors } = useTheme();

  const MenuItem = ({
    method,
    label,
    onPress,
  }: {
    method?: SortMethod;
    label: string;
    onPress: () => void;
  }) => (
    <Pressable
      className="flex-row items-center px-4 py-3"
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      style={{ backgroundColor: colors.card }}
      onPress={onPress}
      testID={method ? `workout-sort-menu-${method}` : `workout-sort-menu-item`}>
      <Text
        className="text-sm text-foreground"
        testID={method ? `workout-sort-menu-${method}-text` : `workout-sort-menu-item-text`}>
        {label}
      </Text>
      {method && sortMethod === method && (
        <Check
          size={16}
          color={colors.primary}
          style={{ marginLeft: 'auto' }}
          testID={`workout-sort-menu-${method}-check`}
        />
      )}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-4 py-2">
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </Text>
    </View>
  );

  const Divider = () => <View className={`mx-2 ${SEPARATOR_STYLE}`} />;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={() => onClose()}
      testID="workout-sort-menu-modal">
      <Pressable
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onPress={() => onClose()}
        testID="workout-sort-menu-overlay">
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
          testID="workout-sort-menu-container">
          {/* Menu Header */}
          <View className="border-b border-border px-4 py-2" testID="workout-sort-menu-header">
            <Text
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              testID="workout-sort-menu-header-text">
              Sort by
            </Text>
          </View>

          {/* Manual Sort */}
          <MenuItem
            method="manual"
            label="Manual"
            onPress={() => {
              onClose(() => {
                setTimeout(() => {
                  onOpenReorderModal();
                }, 100);
              });
            }}
          />

          <Divider />

          {/* Alphabetical Group */}
          <SectionHeader title="Alphabetical" />
          <MenuItem
            method="alphabetical-asc"
            label="A → Z"
            onPress={() => {
              onSortMethodChange('alphabetical-asc');
              onClose();
            }}
          />
          <MenuItem
            method="alphabetical-desc"
            label="Z → A"
            onPress={() => {
              onSortMethodChange('alphabetical-desc');
              onClose();
            }}
          />

          <Divider />

          {/* Last Completed Group */}
          <SectionHeader title="Last Completed" />
          <MenuItem
            method="completion-recent"
            label="Recent First"
            onPress={() => {
              onSortMethodChange('completion-recent');
              onClose();
            }}
          />
          <MenuItem
            method="completion-oldest"
            label="Oldest First"
            onPress={() => {
              onSortMethodChange('completion-oldest');
              onClose();
            }}
          />

          <Divider />

          {/* Date Created Group */}
          <SectionHeader title="Date Created" />
          <MenuItem
            method="created-newest"
            label="Newest First"
            onPress={() => {
              onSortMethodChange('created-newest');
              onClose();
            }}
          />
          <MenuItem
            method="created-oldest"
            label="Oldest First"
            onPress={() => {
              onSortMethodChange('created-oldest');
              onClose();
            }}
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
