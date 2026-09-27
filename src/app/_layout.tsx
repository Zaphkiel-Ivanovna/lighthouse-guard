import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

import { AnimatedSplash } from '@/shared/ui';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: false });

export default function RootLayout() {
  const { theme, rt } = useUnistyles();
  const isDark = rt.themeName === 'dark';
  const base = isDark ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  useEffect(() => {
    UnistylesRuntime.setRootViewBackgroundColor(theme.colors.background);
  }, [theme.colors.background]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      <AnimatedSplash />
    </ThemeProvider>
  );
}
