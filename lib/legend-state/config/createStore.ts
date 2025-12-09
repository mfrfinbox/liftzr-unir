import { observable } from '@legendapp/state';

import { ObservablePersistMMKV } from './mmkvPersistPlugin';

export interface PendingOperation<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete';
  timestamp: number;
  data?: Partial<T>;
}

export interface BaseStore<T> {
  items: T[];
  isLoading: boolean;
  isOffline: boolean;
  pendingOperations: PendingOperation<T>[];
  lastSyncTime: number | null;
}

/**
 * Factory function to create a Legend-State store with offline support
 * This reduces boilerplate when creating stores for different entities
 */
export function createStore<T>(storeName: string) {
  // Create the observable store
  const store$ = observable<BaseStore<T>>({
    items: [] as T[],
    isLoading: false,
    isOffline: false,
    pendingOperations: [] as PendingOperation<T>[],
    lastSyncTime: null,
  });

  // Setup persistence with MMKV
  setupStorePersistence(store$, storeName);

  return store$;
}

/**
 * Setup automatic persistence for a store
 * Saves to MMKV on every change for offline support
 */
export function setupStorePersistence<T>(
  store$: ReturnType<typeof observable<BaseStore<T>>>,
  storeName: string
) {
  // Helper to extract value from stored data (handles legacy format)
  const getValue = (data: any, defaultValue: any) => {
    if (data?.value !== undefined) return data.value;
    return data !== undefined ? data : defaultValue;
  };

  // Load persisted data on initialization
  const loadPersistedData = () => {
    const stored = {
      items: getValue(ObservablePersistMMKV.get(`${storeName}-items`), []),
      pending: getValue(ObservablePersistMMKV.get(`${storeName}-pending`), []),
      offline: getValue(ObservablePersistMMKV.get(`${storeName}-offline`), false),
      syncTime: getValue(ObservablePersistMMKV.get(`${storeName}-sync`), null),
    };

    // Initialize store with persisted data
    store$.items.set(Array.isArray(stored.items) ? stored.items : []);
    store$.pendingOperations.set(Array.isArray(stored.pending) ? stored.pending : []);
    store$.isOffline.set(typeof stored.offline === 'boolean' ? stored.offline : false);
    store$.lastSyncTime.set(stored.syncTime);
  };

  // Load data immediately
  loadPersistedData();

  // Setup auto-save on changes
  store$.items.onChange(() => {
    ObservablePersistMMKV.set(`${storeName}-items`, store$.items.peek());
  });

  store$.pendingOperations.onChange(() => {
    ObservablePersistMMKV.set(`${storeName}-pending`, store$.pendingOperations.peek());
  });

  store$.isOffline.onChange(() => {
    ObservablePersistMMKV.set(`${storeName}-offline`, store$.isOffline.peek());
  });

  store$.lastSyncTime.onChange(() => {
    ObservablePersistMMKV.set(`${storeName}-sync`, store$.lastSyncTime.peek());
  });
}

/**
 * Helper to create CRUD operations for a store
 * Can be extended by specific stores for custom logic
 */
export function createStoreOperations<T extends { id: string }>(
  store$: ReturnType<typeof observable<BaseStore<T>>>
) {
  return {
    // Add item to store
    add: (item: T) => {
      store$.items.push(item);

      if (store$.isOffline.peek()) {
        store$.pendingOperations.push({
          id: item.id,
          type: 'create',
          timestamp: Date.now(),
          data: item,
        });
      }
    },

    // Update item in store
    update: (id: string, updates: Partial<T>) => {
      const items = store$.items.peek();
      const index = items.findIndex((item: any) => item.id === id);

      if (index !== -1) {
        const updatedItems = [...items];
        updatedItems[index] = { ...(items[index] as any), ...updates } as T;
        (store$.items as any).set(updatedItems);

        if (store$.isOffline.peek()) {
          store$.pendingOperations.push({
            id,
            type: 'update',
            timestamp: Date.now(),
            data: updates,
          });
        }
      }
    },

    // Delete item from store
    delete: (id: string) => {
      const items = store$.items.peek();
      const filtered = items.filter((item: any) => item.id !== id);
      (store$.items as any).set(filtered);

      if (store$.isOffline.peek()) {
        store$.pendingOperations.push({
          id,
          type: 'delete',
          timestamp: Date.now(),
        });
      }
    },

    // Clear all pending operations
    clearPendingOperations: () => {
      store$.pendingOperations.set([]);
    },

    // Get pending operations count
    getPendingCount: () => {
      return store$.pendingOperations.peek().length;
    },
  };
}
