// Loaded from the app entry (index.ts) before expo-router, and from jest.setup.ts.
import { StyleSheet } from 'react-native-unistyles';

import { breakpoints } from './breakpoints';
import { useThemePreferenceStore } from './theme-preference';
import { darkTheme, lightTheme } from './themes';

const themes = { light: lightTheme, dark: darkTheme };

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  /* eslint-disable @typescript-eslint/no-empty-object-type -- Unistyles module augmentation */
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  /* eslint-enable @typescript-eslint/no-empty-object-type */
}

const { preference } = useThemePreferenceStore.getState();

StyleSheet.configure({
  themes,
  breakpoints,
  settings: preference === 'system' ? { adaptiveThemes: true } : { initialTheme: preference },
});
