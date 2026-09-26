import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * App-wide MMKV instance. When widgets / App Intents land, move it to the
 * shared App Group container so extensions can read the same data.
 */
export const storage = createMMKV({ id: 'lighthouse-guard' });

/** zustand `persist` adapter: `createJSONStorage(() => mmkvStateStorage)`. */
export const mmkvStateStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
