import { Buffer } from 'buffer';
import { BleManager, Device } from 'react-native-ble-plx';
import {
  LighthouseDevice,
  LighthouseMetadata,
  LighthousePowerCommand,
  LighthouseState,
} from '../types/lighthouse.types';
import { ensureDeviceConnected, handleScanError } from '../utils/ble';
import {
  LIGHTHOUSE_DEVICE_INFO_SERVICE,
  LIGHTHOUSE_FIRMWARE_REVISION,
  LIGHTHOUSE_MANUFACTURER_NAME,
  LIGHTHOUSE_MODEL_NUMBER,
  LIGHTHOUSE_POWER_BYTE_TO_STATE,
  LIGHTHOUSE_SERIAL_NUMBER,
  LIGHTHOUSE_V2_CONTROL_SERVICE,
  LIGHTHOUSE_V2_IDENTIFY_CHARACTERISTIC,
  LIGHTHOUSE_V2_POWER_CHARACTERISTIC,
  STATUS_POLLING_INTERVAL_MS,
  STATUS_POLLING_TIMEOUT_MS,
} from '../utils/constants';
import { Logger } from '../utils/logger';
import { wait } from '../utils/time';

const logger = new Logger('LighthouseService');

const SCAN_TIMEOUT_MS = 10000;
const COMMAND_DELAY_MS = 500;
const IDENTIFY_DELAY_MS = 1000;

export type PollingState = {
  intervalId: ReturnType<typeof setInterval>;
  targetState?: LighthouseState;
  startTime: number;
};

export type ScanCallback = (device: Device) => Promise<void>;
export type ErrorCallback = (error: string | null) => void;
export type StopScanCallback = () => void;

export class LighthouseService {
  private bleManager: BleManager;

  constructor(bleManager: BleManager) {
    this.bleManager = bleManager;
  }

  isLightHouseDevice(device: Device) {
    return device.name?.includes('LHB');
  }

  mapCommandToTargetState(command: LighthousePowerCommand): LighthouseState {
    switch (command) {
      case LighthousePowerCommand.ON:
        return LighthouseState.ON;
      case LighthousePowerCommand.SLEEP:
        return LighthouseState.SLEEP;
      case LighthousePowerCommand.STANDBY:
        return LighthouseState.STANDBY;
      default:
        return LighthouseState.UNKNOWN;
    }
  }

  async getLighthouseStatus(device: Device): Promise<LighthouseState> {
    try {
      const isConnected = await device.isConnected();
      if (!isConnected) {
        await device.connect({ timeout: 10000 });
        await device.discoverAllServicesAndCharacteristics();
      }

      const characteristic = await device.readCharacteristicForService(
        LIGHTHOUSE_V2_CONTROL_SERVICE,
        LIGHTHOUSE_V2_POWER_CHARACTERISTIC
      );

      if (!characteristic.value) {
        throw new Error('Characteristic value is null');
      }

      const powerByte = Buffer.from(characteristic.value, 'base64')[0];

      if (powerByte === undefined) {
        throw new Error('Power byte is null');
      }

      return (
        LIGHTHOUSE_POWER_BYTE_TO_STATE[powerByte] || LighthouseState.UNKNOWN
      );
    } catch (error) {
      logger.error('Error reading status:', error);
      return LighthouseState.ERROR;
    }
  }

  async getLighthouseMetadata(device: Device): Promise<LighthouseMetadata> {
    try {
      await ensureDeviceConnected(device);

      const [firmwareRevision, modelNumber, manufacturerName, serialNumber] =
        await Promise.all([
          this.readCharacteristic(device, LIGHTHOUSE_FIRMWARE_REVISION),
          this.readCharacteristic(device, LIGHTHOUSE_MODEL_NUMBER),
          this.readCharacteristic(device, LIGHTHOUSE_MANUFACTURER_NAME),
          this.readCharacteristic(device, LIGHTHOUSE_SERIAL_NUMBER),
        ]);

      return {
        firmwareRevision: firmwareRevision.replace(/\s/g, ' ').trim(),
        modelNumber: modelNumber.replace(/\s/g, '').trim(),
        manufacturerName: manufacturerName.trim(),
        serialNumber: serialNumber.trim(),
      };
    } catch (error) {
      logger.error('Error reading metadata:', error);
      return {
        firmwareRevision: '',
        modelNumber: '',
        manufacturerName: '',
        serialNumber: '',
      };
    }
  }

  async readCharacteristic(device: Device, characteristicUUID: string) {
    const characteristic = await device.readCharacteristicForService(
      LIGHTHOUSE_DEVICE_INFO_SERVICE,
      characteristicUUID
    );
    return Buffer.from(characteristic.value || '', 'base64').toString('utf-8');
  }

  async getDeviceStatus(device: Device): Promise<LighthouseState> {
    try {
      const state = await this.getLighthouseStatus(device);
      return state;
    } catch (error) {
      logger.error('Failed to get lighthouse status:', error);
      throw error;
    }
  }

  async processDevice(
    device: Device
  ): Promise<{ state: LighthouseState; metadata: LighthouseMetadata }> {
    try {
      const state = await this.getLighthouseStatus(device);
      const metadata = await this.getLighthouseMetadata(device);
      return { state, metadata };
    } catch (error) {
      logger.error('Failed to get lighthouse status:', error);
      throw error;
    } finally {
      try {
        await device.cancelConnection();
      } catch (disconnectError) {
        logger.warn('Error disconnecting device after scan:', disconnectError);
      }
    }
  }

  startDeviceScan(
    onDeviceFound: ScanCallback,
    onError: ErrorCallback,
    onScanStop: StopScanCallback,
    processingDevices: Set<string>,
    existingDeviceIds: Set<string>
  ): void {
    logger.debug('Starting scan');

    this.bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        handleScanError(error, onError, onScanStop);
        return;
      }

      if (
        device &&
        this.isLightHouseDevice(device) &&
        !processingDevices.has(device.id) &&
        !existingDeviceIds.has(device.id)
      ) {
        onDeviceFound(device);
      }
    });
  }

  stopDeviceScan(): void {
    this.bleManager.stopDeviceScan();
  }

  async sendPowerCommand(
    deviceId: string,
    command: LighthousePowerCommand
  ): Promise<LighthouseState> {
    try {
      const device = await this.bleManager
        .devices([deviceId])
        .then((d) => d[0]);
      if (!device) {
        throw new Error('Device not found');
      }

      await ensureDeviceConnected(device);
      await device.writeCharacteristicWithResponseForService(
        LIGHTHOUSE_V2_CONTROL_SERVICE,
        LIGHTHOUSE_V2_POWER_CHARACTERISTIC,
        Buffer.from([command]).toString('base64')
      );

      await wait(COMMAND_DELAY_MS);

      logger.debug(`Power command sent to ${deviceId}: ${command}`);

      return this.mapCommandToTargetState(command);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending power command:', error);

      try {
        const device = await this.bleManager
          .devices([deviceId])
          .then((d) => d[0]);
        if (device) {
          await device.cancelConnection();
        }
      } catch (disconnectError) {
        logger.warn('Error disconnecting device after error:', disconnectError);
      }

      throw new Error(errorMessage);
    }
  }

  async identifyDevice(deviceId: string): Promise<void> {
    let device: Device | undefined;
    try {
      device = await this.bleManager.devices([deviceId]).then((d) => d[0]);
      if (!device) {
        throw new Error('Device not found');
      }

      await ensureDeviceConnected(device);
      await device.writeCharacteristicWithResponseForService(
        LIGHTHOUSE_V2_CONTROL_SERVICE,
        LIGHTHOUSE_V2_IDENTIFY_CHARACTERISTIC,
        Buffer.from([0x00]).toString('base64')
      );

      logger.info(`Identify command sent to ${device.name} - LED should blink`);

      await wait(IDENTIFY_DELAY_MS);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending identify command:', error);
      throw new Error(errorMessage);
    } finally {
      if (device) {
        try {
          await device.cancelConnection();
        } catch (disconnectError) {
          logger.warn('Error disconnecting device:', disconnectError);
        }
      }
    }
  }

  async pollDeviceStatus(
    deviceId: string,
    targetState?: LighthouseState
  ): Promise<LighthouseState> {
    try {
      const device = await this.bleManager
        .devices([deviceId])
        .then((d) => d[0]);
      if (!device) {
        throw new Error(`Device ${deviceId} not found during polling`);
      }

      const newState = await this.getLighthouseStatus(device);

      logger.debug(
        `Polling ${deviceId}: ${newState}${
          targetState ? ` → ${targetState}` : ''
        }`
      );

      if (targetState && newState === targetState) {
        logger.info(`Device ${deviceId} reached target state: ${newState}`);
      }

      return newState;
    } catch (error) {
      logger.error(`Error polling device ${deviceId}:`, error);
      throw error;
    }
  }

  hasPollingTimedOut(startTime: number): boolean {
    const elapsed = Date.now() - startTime;
    if (elapsed > STATUS_POLLING_TIMEOUT_MS) {
      logger.warn(`Polling timeout after ${elapsed}ms`);
      return true;
    }
    return false;
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    try {
      const device = await this.bleManager
        .devices([deviceId])
        .then((d) => d[0]);
      if (device) {
        await device.cancelConnection();
      }
    } catch (disconnectError) {
      logger.warn('Error disconnecting device:', disconnectError);
    }
  }

  getPollingInterval(): number {
    return STATUS_POLLING_INTERVAL_MS;
  }

  getScanTimeout(): number {
    return SCAN_TIMEOUT_MS;
  }
}
