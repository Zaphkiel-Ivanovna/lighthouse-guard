import { Buffer } from 'buffer';
import { Device } from 'react-native-ble-plx';
import {
  LighthouseCharacteristicCapabilities,
  LighthouseMetadata,
  LighthousePowerCommand,
  LighthouseState,
} from '../types/lighthouse.types';
import { Logger } from '../utils/logger';
import { wait } from '../utils/time';
import {
  ErrorCallback,
  ScanCallback,
  StopScanCallback,
} from './lighthouse.service';

const logger = new Logger('MockLighthouseService');

const MOCK_COMMAND_DELAY_MS = 500;
const MOCK_STATE_TRANSITION_DELAY_MS = 2000; // Simulate realistic state changes
const MOCK_IDENTIFY_DELAY_MS = 1000;
const MOCK_SCAN_TIMEOUT_MS = 10000;
const STATUS_POLLING_INTERVAL_MS = 1000;

export class MockLighthouseService {
  private mockDevices: Map<string, MockDevice> = new Map();
  private deviceCounter = 0;

  constructor() {
    logger.info('🎭 Mock Lighthouse Service initialized');
  }

  createFakeDevice(customName?: string): Device {
    this.deviceCounter++;
    const deviceId = `MOCK-LHB-${this.deviceCounter
      .toString()
      .padStart(4, '0')}`;
    const deviceName =
      customName ||
      `LHB-${this.deviceCounter.toString(16).toUpperCase().padStart(8, '0')}`;

    const mockDevice: MockDevice = {
      id: deviceId,
      name: deviceName,
      localName: deviceName,
      isConnectable: true,
      rssi: -50 - Math.floor(Math.random() * 30), // Random signal strength
      mtu: 185,
      txPowerLevel: 0,
      manufacturerData: Buffer.from([0x5d, 0x05, 0x00, 0x00]).toString(
        'base64'
      ),
      serviceData: {},
      serviceUUIDs: ['00001523-1212-efde-1523-785feabcd124'], // Lighthouse V2 service
      solicitedServiceUUIDs: [],
      overflowServiceUUIDs: [],
      // Mock-specific properties
      currentState: LighthouseState.STANDBY,
      isConnected: false,
      transitioningToState: null,
      transitionStartTime: null,
    };

    this.mockDevices.set(deviceId, mockDevice);
    logger.debug(`Created fake device: ${deviceName} (${deviceId})`);

    return this.toDevice(mockDevice);
  }

  private toDevice(mockDevice: MockDevice): Device {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const device: any = {
      id: mockDevice.id,
      name: mockDevice.name,
      localName: mockDevice.localName || null,
      isConnectable: mockDevice.isConnectable,
      rssi: mockDevice.rssi || null,
      mtu: mockDevice.mtu ?? 0,
      txPowerLevel: mockDevice.txPowerLevel || null,
      manufacturerData: mockDevice.manufacturerData || null,
      serviceData: mockDevice.serviceData || null,
      serviceUUIDs: mockDevice.serviceUUIDs || null,
      solicitedServiceUUIDs: mockDevice.solicitedServiceUUIDs || null,
      overflowServiceUUIDs: mockDevice.overflowServiceUUIDs || null,
      // Mock BLE methods
      isConnected: async () => mockDevice.isConnected,
      connect: async () => {
        await wait(100);
        mockDevice.isConnected = true;
        logger.debug(`Connected to ${mockDevice.name}`);
        return device;
      },
      cancelConnection: async () => {
        await wait(50);
        mockDevice.isConnected = false;
        logger.debug(`Disconnected from ${mockDevice.name}`);
        return device;
      },
      discoverAllServicesAndCharacteristics: async () => {
        await wait(200);
        logger.debug(`Discovered services for ${mockDevice.name}`);
        return device;
      },
      readCharacteristicForService: async () => {
        await wait(50);
        const powerByte = this.stateToPowerByte(mockDevice.currentState);
        return {
          value: Buffer.from([powerByte]).toString('base64'),
        };
      },
      writeCharacteristicWithResponseForService: async (
        _serviceUUID: string,
        characteristicUUID: string,
        value: string
      ) => {
        await wait(50);

        // Handle identify characteristic
        if (characteristicUUID === '00008421-1212-efde-1523-785feabcd124') {
          logger.info(`🔦 ${mockDevice.name} LED blinking (identify)`);
          return;
        }

        // Handle power characteristic
        const command = Buffer.from(value, 'base64')[0];
        logger.debug(`Command ${command} sent to ${mockDevice.name}`);

        if (command === undefined) {
          return;
        }

        // Start state transition
        const targetState = this.commandToTargetState(command);
        this.startStateTransition(mockDevice.id, targetState);
      },
    };

    return device as Device;
  }

  private startStateTransition(deviceId: string, targetState: LighthouseState) {
    const mockDevice = this.mockDevices.get(deviceId);
    if (!mockDevice) return;

    mockDevice.transitioningToState = targetState;
    mockDevice.transitionStartTime = Date.now();

    // Immediate transition to BOOTING for ON command
    if (
      targetState === LighthouseState.ON &&
      mockDevice.currentState !== LighthouseState.ON
    ) {
      mockDevice.currentState = LighthouseState.BOOTING;
      logger.debug(`${mockDevice.name} -> BOOTING`);

      // After delay, transition to ON
      setTimeout(() => {
        if (mockDevice.transitioningToState === LighthouseState.ON) {
          mockDevice.currentState = LighthouseState.ON;
          mockDevice.transitioningToState = null;
          mockDevice.transitionStartTime = null;
          logger.info(`${mockDevice.name} -> ON`);
        }
      }, MOCK_STATE_TRANSITION_DELAY_MS);
    } else {
      // Direct transition for SLEEP/STANDBY
      setTimeout(() => {
        mockDevice.currentState = targetState;
        mockDevice.transitioningToState = null;
        mockDevice.transitionStartTime = null;
        logger.info(`${mockDevice.name} -> ${targetState.toUpperCase()}`);
      }, MOCK_STATE_TRANSITION_DELAY_MS);
    }
  }

  private stateToPowerByte(state: LighthouseState): number {
    switch (state) {
      case LighthouseState.SLEEP:
        return 0x00;
      case LighthouseState.STANDBY:
        return 0x02;
      case LighthouseState.BOOTING:
        return 0x01;
      case LighthouseState.ON:
        return 0x0b;
      default:
        return 0xff;
    }
  }

  private commandToTargetState(command: number): LighthouseState {
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

  isLightHouseDevice(device: Device) {
    return device.name?.includes('LHB') || false;
  }

  mapCommandToTargetState(command: LighthousePowerCommand): LighthouseState {
    return this.commandToTargetState(command);
  }

  async getLighthouseStatus(device: Device): Promise<LighthouseState> {
    await wait(100); // Simulate BLE delay

    const mockDevice = this.mockDevices.get(device.id);
    if (!mockDevice) {
      throw new Error('Mock device not found');
    }

    return mockDevice.currentState;
  }

  async getLighthouseMetadata(device: Device): Promise<LighthouseMetadata> {
    await wait(100); // Simulate BLE delay

    const mockDevice = this.mockDevices.get(device.id);
    if (!mockDevice) {
      throw new Error('Mock device not found');
    }

    return {
      firmwareRevision: '1.0.0',
      modelNumber: 'LHB-0001',
      manufacturerName: 'Mock Manufacturer',
      serialNumber: 'MOCK-SN-001',
    };
  }

  /**
   * Mock capabilities - all features enabled for testing
   */
  async detectAllCapabilities(
    _device: Device
  ): Promise<LighthouseCharacteristicCapabilities> {
    await wait(50); // Simulate detection delay

    // Return full capabilities for mock devices
    return {
      power: { canRead: true, canWrite: true, canNotify: true },
      identify: { canRead: false, canWrite: true, canNotify: false },
      channel: { canRead: true, canWrite: true, canNotify: false },
      firmwareRevision: { canRead: true, canWrite: false, canNotify: false },
      modelNumber: { canRead: true, canWrite: false, canNotify: false },
      manufacturerName: { canRead: true, canWrite: false, canNotify: false },
      serialNumber: { canRead: true, canWrite: false, canNotify: false },
    };
  }

  async getDeviceStatus(device: Device): Promise<LighthouseState> {
    return this.getLighthouseStatus(device);
  }

  async processDevice(device: Device): Promise<{
    state: LighthouseState;
    metadata: LighthouseMetadata;
    capabilities: LighthouseCharacteristicCapabilities;
  }> {
    try {
      const capabilities = await this.detectAllCapabilities(device);
      const state = await this.getLighthouseStatus(device);
      const metadata = await this.getLighthouseMetadata(device);
      return { state, metadata, capabilities };
    } catch (error) {
      logger.error('Failed to get lighthouse status:', error);
      throw error;
    }
  }

  startDeviceScan(
    onDeviceFound: ScanCallback,
    onError: ErrorCallback,
    onScanStop: StopScanCallback,
    processingDevices: Set<string>,
    existingDeviceIds: Set<string>
  ): void {
    logger.debug('🔍 Mock scan started (no devices will be auto-discovered)');
    logger.debug('💡 Use "Add Fake Device" button to add mock devices');

    // Mock scan doesn't auto-discover devices
    // Users explicitly add fake devices via UI
  }

  stopDeviceScan(): void {
    logger.debug('Mock scan stopped');
  }

  async sendPowerCommand(
    deviceId: string,
    command: LighthousePowerCommand,
    _capabilities?: LighthouseCharacteristicCapabilities
  ): Promise<LighthouseState> {
    try {
      const mockDevice = this.mockDevices.get(deviceId);
      if (!mockDevice) {
        throw new Error('Mock device not found');
      }

      const device = this.toDevice(mockDevice);
      await device.connect();

      // Write command (triggers state transition)
      await device.writeCharacteristicWithResponseForService!(
        '00001523-1212-efde-1523-785feabcd124',
        '00001525-1212-efde-1523-785feabcd124',
        Buffer.from([command]).toString('base64')
      );

      await wait(MOCK_COMMAND_DELAY_MS);

      logger.debug(`Power command sent to ${deviceId}: ${command}`);

      return this.mapCommandToTargetState(command);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending power command:', error);
      throw new Error(errorMessage);
    }
  }

  async identifyDevice(
    deviceId: string,
    _capabilities?: LighthouseCharacteristicCapabilities
  ): Promise<void> {
    try {
      const mockDevice = this.mockDevices.get(deviceId);
      if (!mockDevice) {
        throw new Error('Mock device not found');
      }

      const device = this.toDevice(mockDevice);
      await device.connect();

      // Trigger identify (LED blink simulation)
      await device.writeCharacteristicWithResponseForService!(
        '00001523-1212-efde-1523-785feabcd124',
        '00008421-1212-efde-1523-785feabcd124',
        Buffer.from([0x00]).toString('base64')
      );

      logger.info(
        `Identify command sent to ${mockDevice.name} - LED should blink`
      );

      await wait(MOCK_IDENTIFY_DELAY_MS);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending identify command:', error);
      throw new Error(errorMessage);
    }
  }

  async pollDeviceStatus(
    deviceId: string,
    targetState?: LighthouseState,
    _capabilities?: LighthouseCharacteristicCapabilities
  ): Promise<LighthouseState> {
    try {
      const mockDevice = this.mockDevices.get(deviceId);
      if (!mockDevice) {
        throw new Error(`Mock device ${deviceId} not found during polling`);
      }

      const device = this.toDevice(mockDevice);
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
    const timeout = 15000; // 15 seconds
    if (elapsed > timeout) {
      logger.warn(`Polling timeout after ${elapsed}ms`);
      return true;
    }
    return false;
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    const mockDevice = this.mockDevices.get(deviceId);
    if (mockDevice) {
      mockDevice.isConnected = false;
      logger.debug(`Disconnected ${mockDevice.name}`);
    }
  }

  getPollingInterval(): number {
    return STATUS_POLLING_INTERVAL_MS;
  }

  getScanTimeout(): number {
    return MOCK_SCAN_TIMEOUT_MS;
  }

  removeMockDevice(deviceId: string): void {
    this.mockDevices.delete(deviceId);
    logger.debug(`Removed mock device: ${deviceId}`);
  }

  clearAllMockDevices(): void {
    this.mockDevices.clear();
    this.deviceCounter = 0;
    logger.debug('Cleared all mock devices');
  }
}

interface MockDevice {
  // BLE Device properties
  id: string;
  name: string;
  localName?: string;
  isConnectable: boolean;
  rssi?: number | null;
  mtu?: number | null;
  txPowerLevel?: number | null;
  manufacturerData?: string;
  serviceData?: Record<string, string>;
  serviceUUIDs?: string[];
  solicitedServiceUUIDs?: string[];
  overflowServiceUUIDs?: string[];

  // Mock-specific state
  currentState: LighthouseState;
  isConnected: boolean;
  transitioningToState: LighthouseState | null;
  transitionStartTime: number | null;
}
