import type { ExpoConfig } from 'expo/config';

import { ALTERNATE_APP_ICONS, iconAssetFolder, nativeIconName } from './src/core/app-icon/app-icon-names.ts';
import { SPLASH } from './src/theme/splash.ts';

const BLUETOOTH_USAGE = 'Lighthouse Guard uses Bluetooth to find and control your SteamVR base stations.';

const alternateAppIcons = ALTERNATE_APP_ICONS.map((name) => {
  const folder = `./assets/images/app-icons/${iconAssetFolder(name)}`;
  return {
    name: nativeIconName(name),
    ios: { light: `${folder}/ios-light.png`, dark: `${folder}/ios-dark.png`, tinted: `${folder}/ios-tinted.png` },
    android: { foregroundImage: `${folder}/android-foreground.png`, backgroundColor: '#F8FAFC' },
  };
});

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
    bundleIdentifier: 'dev.zaphkiel.lighthouseguard',
    appleTeamId: '2APB3NHX44',
    supportsTablet: true,
    icon: {
      light: './assets/images/icon.png',
      dark: './assets/images/icon-dark.png',
      tinted: './assets/images/icon-tinted.png',
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'dev.zaphkiel.lighthouseguard',
    adaptiveIcon: {
      backgroundColor: '#F8FAFC',
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
        image: './assets/images/splash-blank.png',
        imageWidth: SPLASH.logoSize,
        backgroundColor: SPLASH.background.light,
        dark: { backgroundColor: SPLASH.background.dark },
      },
    ],
    ['expo-alternate-app-icons', alternateAppIcons],
    [
      'react-native-ble-nitro',
      {
        isBackgroundEnabled: false,
        neverForLocation: true,
        bluetoothAlwaysPermission: BLUETOOTH_USAGE,
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
      projectId: '3c5e0a2e-eae1-4448-b3aa-2a0b964f74fc',
    },
  },
};

export default config;
