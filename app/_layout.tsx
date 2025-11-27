import '../tamagui-web.css';

import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { Provider } from 'components/Provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://f25b6917b223f813cd607007d4f2c1c2@sentry.zaphkiel.dev/11',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();
Appearance.setColorScheme('dark');

export default Sentry.wrap(function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  );
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style='light' />
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: '#000000',
            },
          }}
        >
          <Stack.Screen
            name='(tabs)'
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: '#000000',
              },
            }}
          />

          <Stack.Screen
            name='modal'
            options={{
              title: 'Tamagui + Expo',
              presentation: 'modal',
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              contentStyle: {
                backgroundColor: 'transparent',
              },
            }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
