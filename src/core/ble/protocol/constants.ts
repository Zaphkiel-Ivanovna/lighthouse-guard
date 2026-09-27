export const LIGHTHOUSE_NAME_PREFIX = 'LHB-';

export const LIGHTHOUSE_V2_SERVICE = '00001523-1212-efde-1523-785feabcd124';

export const LIGHTHOUSE_V2_CHARACTERISTICS = {
  power: '00001525-1212-efde-1523-785feabcd124',
  channel: '00001524-1212-efde-1523-785feabcd124',
  identify: '00008421-1212-efde-1523-785feabcd124',
} as const;

export const DEVICE_INFORMATION_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb';

export const DEVICE_INFORMATION_CHARACTERISTICS = {
  model: '00002a24-0000-1000-8000-00805f9b34fb',
  serial: '00002a25-0000-1000-8000-00805f9b34fb',
  firmware: '00002a26-0000-1000-8000-00805f9b34fb',
  hardware: '00002a27-0000-1000-8000-00805f9b34fb',
  manufacturer: '00002a29-0000-1000-8000-00805f9b34fb',
} as const;

export const CHANNEL_RANGE = { min: 1, max: 16 } as const;

export const POWER_COMMAND_BYTE = {
  sleep: 0x00,
  on: 0x01,
  standby: 0x02,
} as const;

export const POWER_STATE_BYTE = {
  sleep: 0x00,
  standby: 0x02,
  booting: 0x08,
  awake: 0x01,
  awakeFromSleep: 0x09,
  awakeFromStandby: 0x0b,
} as const;

export const IDENTIFY_BYTE = 0x00;

export const TIMING = {
  scanDurationMs: 10_000,
  adapterReadyTimeoutMs: 30_000,
  connectTimeoutMs: 10_000,
  operationTimeoutMs: 5_000,
  pollIntervalMs: 1_000,
  pollTimeoutMs: 15_000,
  settleReads: 15,
  settleFollowUpMs: 5_000,
} as const;
