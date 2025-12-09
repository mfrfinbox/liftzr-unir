/**
 * Unsynced Changes Modal
 * Warns user about unsynced changes before disabling backup
 * Provides options to sync before disabling or disable without syncing
 */

import { View, Pressable, Modal, ActivityIndicator } from 'react-native';

import { AlertTriangle, X, CloudOff, CheckCircle2 } from 'lucide-react-native';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface UnsyncedChangesModalProps {
  visible: boolean;
  minutesSinceSync: number | null;
  onSyncAndDisable: () => void;
  onDisableWithoutSync: () => void;
  onCancel: () => void;
  isSyncing?: boolean;
}

export function UnsyncedChangesModal({
  visible,
  minutesSinceSync,
  onSyncAndDisable,
  onDisableWithoutSync,
  onCancel,
  isSyncing = false,
}: UnsyncedChangesModalProps) {
  const { theme } = useAppTheme();

  const formatTimeSinceSync = (minutes: number | null) => {
    if (minutes === null) return 'Never synced';
    if (minutes < 1) return 'Less than a minute ago';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View
          className="w-full max-w-md rounded-2xl p-6"
          style={{ backgroundColor: theme.colors.card }}>
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={24} color="#f59e0b" />
              <Text className="text-xl font-bold text-foreground">Unsynced Changes</Text>
            </View>
            <Pressable
              testID="unsynced-modal-close"
              onPress={onCancel}
              className="active:opacity-70"
              disabled={isSyncing}>
              <X size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Warning Message */}
          <View className="mb-6 rounded-xl bg-orange-500/10 p-4">
            <Text className="mb-2 text-sm font-medium text-foreground">
              You have unsynced changes
            </Text>
            <Text className="text-sm text-muted-foreground">
              Last synced: {formatTimeSinceSync(minutesSinceSync)}
            </Text>
            <Text className="mt-2 text-sm text-muted-foreground">
              If you disable cloud backup without syncing, your recent changes will not be backed up
              to the cloud.
            </Text>
          </View>

          {/* Sync & Disable Option (Recommended) */}
          <View className="mb-4 rounded-xl border-2 border-primary bg-background p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <CheckCircle2 size={20} color={theme.colors.primary} />
              <Text className="text-base font-semibold text-foreground">
                Sync Now & Disable (Recommended)
              </Text>
            </View>
            <Text className="mb-3 text-sm text-muted-foreground">
              Sync your latest changes to the cloud before disabling backup. This ensures all your
              data is safely backed up.
            </Text>
            <Button
              testID="sync-and-disable-button"
              onPress={onSyncAndDisable}
              disabled={isSyncing}
              className="w-full">
              {isSyncing ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="font-semibold text-primary-foreground">Syncing...</Text>
                </View>
              ) : (
                <Text className="font-semibold text-primary-foreground">Sync & Disable</Text>
              )}
            </Button>
          </View>

          {/* Disable Without Sync Option (Risky) */}
          <View className="mb-4 rounded-xl border-2 border-border bg-background p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <CloudOff size={20} color="#ef4444" />
              <Text className="text-base font-semibold text-foreground">
                Disable Without Syncing
              </Text>
            </View>
            <Text className="mb-3 text-sm text-muted-foreground">
              Your recent changes will not be backed up to the cloud. Use this only if you
              don&apos;t need cloud backup of your latest changes.
            </Text>
            <Button
              testID="disable-anyway-button"
              variant="outline"
              onPress={onDisableWithoutSync}
              disabled={isSyncing}
              className="w-full border-red-500">
              <Text className="font-semibold" style={{ color: '#ef4444' }}>
                Disable Anyway
              </Text>
            </Button>
          </View>

          {/* Cancel Button */}
          <Button
            testID="unsynced-modal-cancel"
            variant="ghost"
            onPress={onCancel}
            disabled={isSyncing}
            className="mt-2">
            <Text className="text-muted-foreground">Cancel</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
