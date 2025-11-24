import { Device } from 'react-native-ble-plx';

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

export type LighthouseDevice = Device & {
  state: LighthouseState;
  canControl: boolean;
};
