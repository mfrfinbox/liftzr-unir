import * as React from 'react';

import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { X } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { APP_PADDING } from '~/lib/constants';

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
}

export function ModalHeader({ title, onClose, style, rightElement }: ModalHeaderProps) {
  const { colors } = useTheme();
  const modalId = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <View
      style={[styles.header, { borderBottomColor: colors.border }, style]}
      testID={`modal-header-${modalId}`}
      accessible={true}
      accessibilityRole="header">
      {onClose ? (
        <Pressable
          onPress={onClose}
          hitSlop={8}
          testID="button-modal-close"
          accessible={true}
          accessibilityLabel="Close modal"
          accessibilityRole="button">
          <X size={24} color={colors.text + '80'} />
        </Pressable>
      ) : (
        <View style={{ width: 24 }} />
      )}

      <Text className="text-xl font-bold text-foreground" testID={`modal-title-${modalId}`}>
        {title}
      </Text>

      {rightElement || <View style={{ width: 24 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: APP_PADDING.horizontal,
    paddingVertical: APP_PADDING.vertical,
    borderBottomWidth: 1,
  },
});
