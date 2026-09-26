/** SteamVR Base Station 2.0 ("Lighthouse V2") GATT protocol. See docs/ble-protocol.md. */

export const LIGHTHOUSE_NAME_PREFIX = 'LHB-';

export const LIGHTHOUSE_V2_SERVICE = '00001523-1212-efde-1523-785feabcd124';

export const LIGHTHOUSE_V2_CHARACTERISTICS = {
  power: '00001525-1212-efde-1523-785feabcd124',
  channel: '00001524-1212-efde-1523-785feabcd124',
  identify: '00008421-1212-efde-1523-785feabcd124',
} as const;

/** Bytes written to the power characteristic. */
export const POWER_COMMAND_BYTE = {
  sleep: 0x00,
  on: 0x01,
  standby: 0x02,
} as const;

/** Bytes read back from the power characteristic. Anything else is `unknown`. */
export const POWER_STATE_BYTE = {
  sleep: 0x00,
  booting: 0x01,
  standby: 0x02,
  bootingSpinUp: 0x08,
  bootingLaser: 0x09,
  on: 0x0b,
} as const;

export const IDENTIFY_BYTE = 0x00;

export const TIMING = {
  scanDurationMs: 10_000,
  /** Time allowed for the adapter to leave `unknown` (iOS permission prompt included). */
  adapterReadyTimeoutMs: 30_000,
  connectTimeoutMs: 10_000,
  operationTimeoutMs: 5_000,
  pollIntervalMs: 1_000,
  pollTimeoutMs: 15_000,
} as const;
