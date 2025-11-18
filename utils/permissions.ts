import * as ExpoDevice from 'expo-device';
import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request BLE permissions for Android 12+ (API 31+)
 */
const requestAndroid31Permissions = async (): Promise<boolean> => {
  const permissions = await Promise.all([
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
      title: 'Bluetooth Permission',
      message: 'This app needs Bluetooth access to scan for Lighthouse devices',
      buttonPositive: 'OK',
    }),
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
      title: 'Bluetooth Permission',
      message: 'This app needs Bluetooth access to connect to Lighthouse devices',
      buttonPositive: 'OK',
    }),
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
      title: 'Location Permission',
      message: 'Bluetooth Low Energy requires location access',
      buttonPositive: 'OK',
    }),
  ]);

  return permissions.every((p) => p === 'granted');
};

/**
 * Request BLE permissions based on platform and Android API level
 */
export const requestBLEPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const apiLevel = ExpoDevice.platformApiLevel ?? -1;

  if (apiLevel < 31) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires location access',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return requestAndroid31Permissions();
};
