import { BleErrorCode, Device } from 'react-native-ble-plx';
import { Logger } from './logger';
import { requestBLEPermissions } from './permissions';

const logger = new Logger('BLE');

export const ensureDeviceConnected = async (device: Device): Promise<void> => {
  const isConnected = await device.isConnected();
  if (!isConnected) {
    await device.connect();
    await device.discoverAllServicesAndCharacteristics();
  }
};

export const handleScanError = (
  error: { errorCode: BleErrorCode; message: string },
  onError: (error: string) => void,
  onStopScan: () => void
): void => {
  onStopScan();

  if (error.errorCode === BleErrorCode.BluetoothUnauthorized) {
    onError('Bluetooth permissions are required. Please grant permissions.');
    requestBLEPermissions();
    return;
  }

  if (error.errorCode === BleErrorCode.BluetoothPoweredOff) {
    onError(
      'Bluetooth is turned off. Please enable Bluetooth to scan for devices.'
    );
    logger.warn('Bluetooth is powered off');
    return;
  }

  const errorMessage = error.message || 'An unknown Bluetooth error occurred';
  onError(`Bluetooth error: ${errorMessage}`);
  logger.error('BLE scan error:', error, error.errorCode);
};
