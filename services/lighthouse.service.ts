import { Buffer } from 'buffer';
import { BleManager, Device } from 'react-native-ble-plx';
import {
  CharacteristicCapabilities,
  LighthouseCharacteristicCapabilities,
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
  LIGHTHOUSE_V2_CHANNEL_CHARACTERISTIC,
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

  /**
   * Detect capabilities for a specific characteristic
   */
  private async detectCharacteristicCapabilities(
    device: Device,
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<CharacteristicCapabilities> {
    try {
      const characteristics = await device.characteristicsForService(
        serviceUUID
      );
      const characteristic = characteristics.find(
        (c) => c.uuid.toLowerCase() === characteristicUUID.toLowerCase()
      );

      if (!characteristic) {
        logger.warn(
          `[${device.localName}]`,
          `Characteristic ${characteristicUUID} not found`
        );
        return { canRead: false, canWrite: false, canNotify: false };
      }

      const capabilities = {
        canRead: characteristic.isReadable,
        canWrite:
          characteristic.isWritableWithResponse ||
          characteristic.isWritableWithoutResponse,
        canNotify: characteristic.isNotifiable,
      };

      logger.debug(
        `[${device.localName}]`,
        `Characteristic ${characteristicUUID} capabilities:`,
        capabilities
      );

      return capabilities;
    } catch (error) {
      logger.error(
        `Error detecting capabilities for ${characteristicUUID}:`,
        error
      );
      return { canRead: false, canWrite: false, canNotify: false };
    }
  }

  /**
   * Detect all characteristic capabilities for a Lighthouse device
   */
  async detectAllCapabilities(
    device: Device
  ): Promise<LighthouseCharacteristicCapabilities> {
    try {
      await ensureDeviceConnected(device);

      logger.debug(
        `[${device.localName}]`,
        'Detecting characteristic capabilities...'
      );

      const [
        power,
        identify,
        channel,
        firmwareRevision,
        modelNumber,
        manufacturerName,
        serialNumber,
      ] = await Promise.all([
        this.detectCharacteristicCapabilities(
          device,
          LIGHTHOUSE_V2_CONTROL_SERVICE,
          LIGHTHOUSE_V2_POWER_CHARACTERISTIC
        ),
        this.detectCharacteristicCapabilities(
          device,
          LIGHTHOUSE_V2_CONTROL_SERVICE,
          LIGHTHOUSE_V2_IDENTIFY_CHARACTERISTIC
        ),
        this.detectCharacteristicCapabilities(
          device,
          LIGHTHOUSE_V2_CONTROL_SERVICE,
          LIGHTHOUSE_V2_CHANNEL_CHARACTERISTIC
        ),
        this.detectCharacteristicCapabilities(
          device,
          LIGHTHOUSE_DEVICE_INFO_SERVICE,
          LIGHTHOUSE_FIRMWARE_REVISION
        ),
        this.detectCharacteristicCapabilities(
          device,
          LIGHTHOUSE_DEVICE_INFO_SERVICE,
          LIGHTHOUSE_MODEL_NUMBER
        ),
        this.detectCharacteristicCapabilities(
          device,
          LIGHTHOUSE_DEVICE_INFO_SERVICE,
          LIGHTHOUSE_MANUFACTURER_NAME
        ),
        this.detectCharacteristicCapabilities(
          device,
          LIGHTHOUSE_DEVICE_INFO_SERVICE,
          LIGHTHOUSE_SERIAL_NUMBER
        ),
      ]);

      const capabilities = {
        power,
        identify,
        channel,
        firmwareRevision,
        modelNumber,
        manufacturerName,
        serialNumber,
      };

      logger.info(
        `[${device.localName}]`,
        'Capabilities detected:',
        capabilities
      );

      return capabilities;
    } catch (error) {
      logger.error('Error detecting all capabilities:', error);
      // Return default capabilities (all disabled)
      return {
        power: { canRead: false, canWrite: false, canNotify: false },
        identify: { canRead: false, canWrite: false, canNotify: false },
        channel: { canRead: false, canWrite: false, canNotify: false },
        firmwareRevision: { canRead: false, canWrite: false, canNotify: false },
        modelNumber: { canRead: false, canWrite: false, canNotify: false },
        manufacturerName: { canRead: false, canWrite: false, canNotify: false },
        serialNumber: { canRead: false, canWrite: false, canNotify: false },
      };
    }
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

  async getLighthouseStatus(
    device: Device,
    capabilities?: LighthouseCharacteristicCapabilities
  ): Promise<LighthouseState> {
    try {
      await ensureDeviceConnected(device);

      // Pre-check: Verify read capability
      if (capabilities && !capabilities.power.canRead) {
        logger.warn(
          `[${device.localName}]`,
          'Cannot read power characteristic - read capability not available'
        );
        return LighthouseState.UNKNOWN;
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

  async getLighthouseMetadata(
    device: Device,
    capabilities?: LighthouseCharacteristicCapabilities
  ): Promise<LighthouseMetadata> {
    try {
      await ensureDeviceConnected(device);

      const firmwareRevision = await this.readCharacteristic(
        device,
        LIGHTHOUSE_FIRMWARE_REVISION,
        capabilities?.firmwareRevision
      );

      const modelNumber = await this.readCharacteristic(
        device,
        LIGHTHOUSE_MODEL_NUMBER,
        capabilities?.modelNumber
      );

      const manufacturerName = await this.readCharacteristic(
        device,
        LIGHTHOUSE_MANUFACTURER_NAME,
        capabilities?.manufacturerName
      );

      const serialNumber = await this.readCharacteristic(
        device,
        LIGHTHOUSE_SERIAL_NUMBER,
        capabilities?.serialNumber
      );

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

  async readCharacteristic(
    device: Device,
    characteristicUUID: string,
    capability?: CharacteristicCapabilities
  ) {
    // Pre-check: Verify read capability
    if (capability && !capability.canRead) {
      logger.warn(
        `[${device.localName}]`,
        `Cannot read characteristic ${characteristicUUID} - read capability not available`
      );
      return '';
    }

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

  async processDevice(device: Device): Promise<{
    state: LighthouseState;
    metadata: LighthouseMetadata;
    capabilities: LighthouseCharacteristicCapabilities;
  }> {
    try {
      // Detect capabilities first
      const capabilities = await this.detectAllCapabilities(device);

      // Use capabilities for subsequent operations
      const state = await this.getLighthouseStatus(device, capabilities);
      const metadata = await this.getLighthouseMetadata(device, capabilities);

      return { state, metadata, capabilities };
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
    command: LighthousePowerCommand,
    capabilities?: LighthouseCharacteristicCapabilities
  ): Promise<LighthouseState> {
    try {
      const device = await this.bleManager
        .devices([deviceId])
        .then((d) => d[0]);
      if (!device) {
        throw new Error('Device not found');
      }

      // Pre-check: Verify write capability
      if (capabilities && !capabilities.power.canWrite) {
        logger.warn(
          `[${device.localName}]`,
          'Cannot write to power characteristic - write capability not available'
        );
        throw new Error(
          'Write capability not available for power characteristic'
        );
      }

      await ensureDeviceConnected(device);
      await device.writeCharacteristicWithResponseForService(
        LIGHTHOUSE_V2_CONTROL_SERVICE,
        LIGHTHOUSE_V2_POWER_CHARACTERISTIC,
        Buffer.from([command]).toString('base64')
      );

      await wait(COMMAND_DELAY_MS);

      logger.debug(
        `[${device.localName}]`,
        `Power command sent to ${deviceId}: ${command}`
      );

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

  async identifyDevice(
    deviceId: string,
    capabilities?: LighthouseCharacteristicCapabilities
  ): Promise<void> {
    let device: Device | undefined;
    try {
      device = await this.bleManager.devices([deviceId]).then((d) => d[0]);
      if (!device) {
        throw new Error('Device not found');
      }

      // Pre-check: Verify write capability
      if (capabilities && !capabilities.identify.canWrite) {
        logger.warn(
          `[${device.localName}]`,
          'Cannot write to identify characteristic - write capability not available'
        );
        throw new Error(
          'Write capability not available for identify characteristic'
        );
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
    targetState?: LighthouseState,
    capabilities?: LighthouseCharacteristicCapabilities
  ): Promise<LighthouseState> {
    try {
      const device = await this.bleManager
        .devices([deviceId])
        .then((d) => d[0]);
      if (!device) {
        throw new Error(`Device ${deviceId} not found during polling`);
      }

      const newState = await this.getLighthouseStatus(device, capabilities);

      logger.debug(
        `[${device.localName}]`,
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
