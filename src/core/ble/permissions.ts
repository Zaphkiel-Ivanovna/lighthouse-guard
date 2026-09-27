import { PermissionsAndroid, Platform, type Permission } from 'react-native';

import { BleError } from './errors';

const ANDROID_12_API_LEVEL = 31;

function requiredAndroidPermissions(): Permission[] {
  const { BLUETOOTH_SCAN, BLUETOOTH_CONNECT, ACCESS_FINE_LOCATION } = PermissionsAndroid.PERMISSIONS;
  return Number(Platform.Version) >= ANDROID_12_API_LEVEL
    ? [BLUETOOTH_SCAN, BLUETOOTH_CONNECT]
    : [ACCESS_FINE_LOCATION];
}

export async function ensureBlePermissions(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const results = await PermissionsAndroid.requestMultiple(requiredAndroidPermissions());
  const denied = Object.entries(results).filter(([, result]) => result !== PermissionsAndroid.RESULTS.GRANTED);
  if (denied.length > 0) {
    throw new BleError('permissionDenied', `Denied: ${denied.map(([permission]) => permission).join(', ')}`);
  }
}
