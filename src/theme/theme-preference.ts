import { Appearance } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

import { applyAccent, DEFAULT_ACCENT, isAccentName, type AccentName } from './accents';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemePreferenceState = {
  readonly preference: ThemePreference;
  readonly accent: AccentName;
};

export const useThemePreferenceStore = create<ThemePreferenceState>()(
  persist((): ThemePreferenceState => ({ preference: 'system', accent: DEFAULT_ACCENT }), {
    name: 'theme-preference',
    version: 2,
    storage: createJSONStorage(() => mmkvStateStorage),
    migrate: (persisted) => {
      const state = (persisted ?? {}) as Partial<ThemePreferenceState>;
      return {
        preference: state.preference ?? 'system',
        accent: isAccentName(state.accent) ? state.accent : DEFAULT_ACCENT,
      };
    },
  }),
);

export const useThemePreference = () => useThemePreferenceStore((state) => state.preference);

export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

export const isThemePreference = (value: unknown): value is ThemePreference =>
  THEME_PREFERENCES.some((preference) => preference === value);

export function getAppearance(): { readonly theme: ThemePreference; readonly accent: AccentName } {
  const { preference, accent } = useThemePreferenceStore.getState();
  return { theme: preference, accent };
}
export const useAccent = () => useThemePreferenceStore((state) => state.accent);

export function applyNativeColorScheme(preference: ThemePreference): void {
  Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
}

export function setThemePreference(preference: ThemePreference): void {
  useThemePreferenceStore.setState({ preference });
  applyNativeColorScheme(preference);
  if (preference === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
    return;
  }
  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme(preference);
}

export function setAccent(accent: AccentName): void {
  useThemePreferenceStore.setState({ accent });
  UnistylesRuntime.updateTheme('light', (theme) => applyAccent(theme, 'light', accent));
  UnistylesRuntime.updateTheme('dark', (theme) => applyAccent(theme, 'dark', accent));
}
