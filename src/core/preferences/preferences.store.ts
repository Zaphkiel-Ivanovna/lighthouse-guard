import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

export const OFF_MODES = ['sleep', 'standby'] as const;
export type OffMode = (typeof OFF_MODES)[number];

export const SORT_ORDERS = ['name', 'state', 'signal'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const LANGUAGE_PREFERENCES = ['system', 'en', 'fr'] as const;
export type LanguagePreference = (typeof LANGUAGE_PREFERENCES)[number];

export const SCAN_DURATIONS = [5, 10, 20] as const;
export type ScanDuration = (typeof SCAN_DURATIONS)[number];

export type Preferences = {
  readonly offMode: OffMode;
  readonly confirmTurnOffAll: boolean;
  readonly haptics: boolean;
  readonly autoScanOnLaunch: boolean;
  readonly refreshOnForeground: boolean;
  readonly scanDurationSeconds: ScanDuration;
  readonly hiddenLighthouses: Readonly<Record<string, string>>;
  readonly sortOrder: SortOrder;
  readonly showChannelOnCards: boolean;
  readonly showSignalOnCards: boolean;
  readonly language: LanguagePreference;
  readonly launchAnimation: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  offMode: 'sleep',
  confirmTurnOffAll: false,
  haptics: true,
  autoScanOnLaunch: true,
  refreshOnForeground: true,
  scanDurationSeconds: 10,
  hiddenLighthouses: {},
  sortOrder: 'name',
  showChannelOnCards: false,
  showSignalOnCards: true,
  language: 'system',
  launchAnimation: true,
};

export const usePreferencesStore = create<Preferences>()(
  persist(() => DEFAULT_PREFERENCES, {
    name: 'preferences',
    version: 1,
    storage: createJSONStorage(() => mmkvStateStorage),
    merge: (persisted, current) => ({ ...current, ...(persisted as Partial<Preferences> | undefined) }),
  }),
);

export function usePreference<K extends keyof Preferences>(key: K): Preferences[K] {
  return usePreferencesStore((state) => state[key]);
}

export function getPreference<K extends keyof Preferences>(key: K): Preferences[K] {
  return usePreferencesStore.getState()[key];
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]): void {
  usePreferencesStore.setState({ [key]: value } as Pick<Preferences, K>);
}

export function hideLighthouse(id: string, name: string): void {
  usePreferencesStore.setState((state) => ({ hiddenLighthouses: { ...state.hiddenLighthouses, [id]: name } }));
}

export function showLighthouse(id: string): void {
  usePreferencesStore.setState((state) => {
    const { [id]: _shown, ...hiddenLighthouses } = state.hiddenLighthouses;
    return { hiddenLighthouses };
  });
}

export function replacePreferences(preferences: Partial<Preferences>): void {
  usePreferencesStore.setState({ ...DEFAULT_PREFERENCES, ...preferences }, true);
}

export function resetPreferences(): void {
  usePreferencesStore.setState(DEFAULT_PREFERENCES, true);
}
