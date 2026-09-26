import { UnistylesRuntime } from 'react-native-unistyles';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemePreferenceState = { readonly preference: ThemePreference };

/** Hydrates synchronously (MMKV), so `unistyles.ts` can read it before the first render. */
export const useThemePreferenceStore = create<ThemePreferenceState>()(
  persist(() => ({ preference: 'system' as ThemePreference }), {
    name: 'theme-preference',
    version: 1,
    storage: createJSONStorage(() => mmkvStateStorage),
  }),
);

export const useThemePreference = () => useThemePreferenceStore((state) => state.preference);

export function setThemePreference(preference: ThemePreference): void {
  useThemePreferenceStore.setState({ preference });
  if (preference === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
    return;
  }
  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme(preference);
}
