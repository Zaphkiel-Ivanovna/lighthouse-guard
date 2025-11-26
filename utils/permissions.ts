import * as ExpoDevice from 'expo-device';
import { PermissionsAndroid, Platform } from 'react-native';
import { Logger } from './logger';

const logger = new Logger('Permissions');

/**
 * Request BLE permissions for Android 12+ (API 31+)
 * @returns {Promise<boolean>} True if all required permissions are granted, false otherwise
 */
const requestAndroid31Permissions = async (): Promise<boolean> => {
  try {
    logger.info('Requesting Android 31+ BLE permissions');
    const locationResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires location access',
        buttonPositive: 'OK',
      }
    );
    logger.debug('Location permission result:', locationResult);

    const scanResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Bluetooth Scan Permission',
        message:
          'This app needs Bluetooth access to scan for Lighthouse devices',
        buttonPositive: 'OK',
      }
    );
    logger.debug('Scan permission result:', scanResult);

    const connectResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Bluetooth Connect Permission',
        message:
          'This app needs Bluetooth access to connect to Lighthouse devices',
        buttonPositive: 'OK',
      }
    );
    logger.debug('Connect permission result:', connectResult);

    logger.debug('All permission results:', {
      location: locationResult,
      scan: scanResult,
      connect: connectResult,
    });

    const allGranted = [locationResult, scanResult, connectResult].every(
      (result) => result === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allGranted) {
      logger.warn('Not all permissions granted', {
        location: locationResult,
        scan: scanResult,
        connect: connectResult,
      });

      // Check if user selected "never ask again"
      const neverAskAgainPermissions: string[] = [];
      if (locationResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        neverAskAgainPermissions.push('Location');
      }
      if (scanResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        neverAskAgainPermissions.push('Bluetooth Scan');
      }
      if (connectResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        neverAskAgainPermissions.push('Bluetooth Connect');
      }

      if (neverAskAgainPermissions.length > 0) {
        logger.error(
          `User blocked permissions (never ask again): ${neverAskAgainPermissions.join(
            ', '
          )}`
        );
      }
    } else {
      logger.info('All Android 31+ permissions granted');
    }

    return allGranted;
  } catch (error) {
    logger.error('Error requesting Android 31+ permissions:', error);
    return false;
  }
};

/**
 * Request BLE permissions based on platform and Android API level
 * @returns {Promise<boolean>} True if all required permissions are granted, false otherwise
 */
export const requestBLEPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    logger.debug('Non-Android platform, skipping permission request');
    return true;
  }

  const apiLevel = ExpoDevice.platformApiLevel ?? -1;
  logger.info(`Android API level: ${apiLevel}`);

  if (apiLevel < 31) {
    logger.info('Requesting Android <31 BLE permissions (location only)');
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires location access',
        buttonPositive: 'OK',
      }
    );
    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
    logger.debug(`Location permission result: ${granted}`);
    return isGranted;
  }

  return requestAndroid31Permissions();
};
