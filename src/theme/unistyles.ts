import { StyleSheet } from 'react-native-unistyles';

import { applyAccent } from './accents';
import { breakpoints } from './breakpoints';
import { applyNativeColorScheme, useThemePreferenceStore } from './theme-preference';
import { darkTheme, lightTheme, type AppTheme } from './themes';

const { preference, accent } = useThemePreferenceStore.getState();

const themes: { light: AppTheme; dark: AppTheme } = {
  light: applyAccent(lightTheme, 'light', accent),
  dark: applyAccent(darkTheme, 'dark', accent),
};

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes,
  breakpoints,
  settings: preference === 'system' ? { adaptiveThemes: true } : { initialTheme: preference },
});

applyNativeColorScheme(preference);
