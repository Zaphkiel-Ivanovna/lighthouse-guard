import { create } from 'zustand';

interface SettingsStoreState {
  // Debug mode enables mock lighthouse devices
  isDebugMode: boolean;

  // Actions
  setDebugMode: (enabled: boolean) => void;
  toggleDebugMode: () => void;
}

/**
 * Settings store for managing app-wide settings
 * Persisted to MMKV storage
 */
export const useSettingsStore = create<SettingsStoreState>()((set) => ({
  isDebugMode: false,

  setDebugMode: (enabled: boolean) => {
    set({ isDebugMode: enabled });
  },

  toggleDebugMode: () => {
    set((state) => ({ isDebugMode: !state.isDebugMode }));
  },
}));
