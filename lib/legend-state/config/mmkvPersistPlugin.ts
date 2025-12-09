import { Platform } from 'react-native';

import { MMKV } from 'react-native-mmkv';

import { logger } from '~/lib/utils/logger';

// Lazy initialization of MMKV storage to avoid build-time errors
let storage: MMKV | null = null;

const getStorage = () => {
  // Only initialize MMKV in React Native runtime (not during SSR/build)
  if (typeof window !== 'undefined' && Platform.OS !== 'web') {
    if (!storage) {
      storage = new MMKV({
        id: 'liftzr-legend-state-storage',
      });
    }
    return storage;
  }
  return null;
};

/**
 * MMKV persistence plugin for Legend-State
 * Provides fast, synchronous storage for offline-first functionality
 */
export const ObservablePersistMMKV = {
  get(key: string) {
    const storageInstance = getStorage();
    if (!storageInstance) {
      return undefined;
    }

    try {
      const value = storageInstance.getString(key);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      logger.error('Failed to parse MMKV storage value', error, {
        context: { key, storageId: 'liftzr-legend-state-storage' },
      });
      return undefined;
    }
  },

  set(key: string, value: any) {
    const storageInstance = getStorage();
    if (!storageInstance) {
      return;
    }

    try {
      if (value === undefined || value === null) {
        storageInstance.delete(key);
      } else {
        storageInstance.set(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error('Failed to save value to MMKV storage', error, {
        context: { key, storageId: 'liftzr-legend-state-storage' },
      });
    }
  },

  delete(key: string) {
    const storageInstance = getStorage();
    if (!storageInstance) {
      return;
    }
    storageInstance.delete(key);
  },

  getKeys() {
    const storageInstance = getStorage();
    if (!storageInstance) {
      return [];
    }
    return storageInstance.getAllKeys();
  },

  clear() {
    const storageInstance = getStorage();
    if (!storageInstance) {
      return;
    }
    storageInstance.clearAll();
  },
};
