import { Device } from 'react-native-ble-plx';

/**
 * BLE Characteristic capabilities
 */
export interface CharacteristicCapabilities {
  canRead: boolean;
  canWrite: boolean;
  canNotify: boolean;
}

/**
 * Capabilities for all Lighthouse characteristics
 */
export interface LighthouseCharacteristicCapabilities {
  power: CharacteristicCapabilities;
  identify: CharacteristicCapabilities;
  channel: CharacteristicCapabilities;
  firmwareRevision: CharacteristicCapabilities;
  modelNumber: CharacteristicCapabilities;
  manufacturerName: CharacteristicCapabilities;
  serialNumber: CharacteristicCapabilities;
}

export enum LighthousePowerCommand {
  ON = 0x01,
  SLEEP = 0x00,
  STANDBY = 0x02,
}

/**
 * Loading states for device commands
 */
export interface DeviceCommandState {
  isLoading: boolean;
  error?: string;
}

export type DeviceCommandStates = Record<string, DeviceCommandState>;

export enum LighthouseState {
  BOOTING = 'booting',
  STANDBY = 'standby',
  ON = 'on',
  SLEEP = 'sleep',
  OFF = 'off',
  UNKNOWN = 'unknown',
  ERROR = 'error',
}

export type LighthouseDevice = Device &
  LighthouseMetadata & {
    readonly state: LighthouseState;
    readonly canControl: boolean;
    readonly capabilities?: LighthouseCharacteristicCapabilities;
  };

export type LighthouseMetadata = {
  readonly firmwareRevision: string;
  readonly modelNumber: string;
  readonly manufacturerName: string;
  readonly serialNumber: string;
};

export enum LighthouseCapabilitiesAccess {
  READ = 'read',
  WRITE = 'write',
  NOTIFY = 'notify',
}

export type LighthouseCapabilityError = {
  characteristic: string;
  missingCapabilities: LighthouseCapabilitiesAccess[];
  severity: 'critical' | 'warning';
};
