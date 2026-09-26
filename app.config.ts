import type { ExpoConfig } from 'expo/config';

const BLUETOOTH_USAGE = 'Lighthouse Guard uses Bluetooth to find and control your SteamVR base stations.';

const config: ExpoConfig = {
  name: 'Lighthouse Guard',
  slug: 'lighthouse-guard',
  version: '2.0.0',
  scheme: 'lighthouse-guard',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  platforms: ['ios', 'android'],
  ios: {
    bundleIdentifier: 'fr.zaphkiel.lighthouseguard',
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'fr.zaphkiel.lighthouseguard',
    adaptiveIcon: {
      backgroundColor: '#0B0E13',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-status-bar',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#F5F6F8',
        dark: { backgroundColor: '#0B0E13' },
      },
    ],
    [
      'react-native-ble-nitro',
      {
        // Foreground-only for now. Add `isBackgroundEnabled` + `modes: ['central']` for background automations.
        isBackgroundEnabled: false,
        // Android 12+: scan without location permission (lighthouses are not used to derive location).
        neverForLocation: true,
        bluetoothAlwaysPermission: BLUETOOTH_USAGE,
        // iOS: defer the Bluetooth permission prompt until the first scan instead of app launch.
        iOSLazyInit: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: 'd877401b-24c6-457e-8776-dc192fc80db7',
    },
  },
};

export default config;
