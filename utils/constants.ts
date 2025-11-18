import { LighthouseState } from '../types/lighthouse.types';

export const LIGHTHOUSE_POWER_BYTE_TO_STATE: Record<number, LighthouseState> = {
  0x00: LighthouseState.SLEEP,
  0x02: LighthouseState.STANDBY,
  0x01: LighthouseState.BOOTING,
  0x08: LighthouseState.BOOTING,
  0x09: LighthouseState.BOOTING,
  0x0b: LighthouseState.ON,
  0xff: LighthouseState.UNKNOWN,
};

export const LIGHTHOUSE_V2_CONTROL_SERVICE =
  '00001523-1212-efde-1523-785feabcd124';
export const LIGHTHOUSE_V2_POWER_CHARACTERISTIC =
  '00001525-1212-efde-1523-785feabcd124';
export const LIGHTHOUSE_V2_CHANNEL_CHARACTERISTIC =
  '00001524-1212-efde-1523-785feabcd124';
export const LIGHTHOUSE_V2_IDENTIFY_CHARACTERISTIC =
  '00008421-1212-efde-1523-785feabcd124';

export const STATUS_POLLING_INTERVAL_MS = 1000;
export const STATUS_POLLING_MIN_INTERVAL_MS = 1000;
export const STATUS_POLLING_TIMEOUT_MS = 15000;
