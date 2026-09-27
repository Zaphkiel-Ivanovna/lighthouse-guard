import {
  CHANNEL_RANGE,
  type DEVICE_INFORMATION_CHARACTERISTICS,
  IDENTIFY_BYTE,
  LIGHTHOUSE_NAME_PREFIX,
  POWER_COMMAND_BYTE,
  POWER_STATE_BYTE,
} from './constants';
import type { Bytes } from '../transport/ble-transport';

export type PowerState = 'on' | 'standby' | 'sleep' | 'booting' | 'unknown';
export type PowerCommand = keyof typeof POWER_COMMAND_BYTE;
export type DeviceInformationField = keyof typeof DEVICE_INFORMATION_CHARACTERISTICS;

export type LighthouseStatus = {
  readonly power: PowerState;
  readonly channel: number | null;
};

export type LighthouseDetails = { readonly channel: number | null } & {
  readonly [field in DeviceInformationField]: string | null;
};

const PRINTABLE_ASCII = { min: 0x20, max: 0x7e } as const;

const STATE_BY_BYTE: ReadonlyMap<number, PowerState> = new Map([
  [POWER_STATE_BYTE.sleep, 'sleep'],
  [POWER_STATE_BYTE.standby, 'standby'],
  [POWER_STATE_BYTE.booting, 'booting'],
  [POWER_STATE_BYTE.awake, 'on'],
  [POWER_STATE_BYTE.awakeFromSleep, 'on'],
  [POWER_STATE_BYTE.awakeFromStandby, 'on'],
]);

export function isLighthouseName(name: string | null | undefined): name is string {
  return typeof name === 'string' && name.startsWith(LIGHTHOUSE_NAME_PREFIX);
}

export function decodePowerState(bytes: Bytes): PowerState {
  const [first] = bytes;
  return first === undefined ? 'unknown' : (STATE_BY_BYTE.get(first) ?? 'unknown');
}

export function decodeChannel(bytes: Bytes): number | null {
  const [first] = bytes;
  return first !== undefined && first >= CHANNEL_RANGE.min && first <= CHANNEL_RANGE.max ? first : null;
}

export function decodeText(bytes: Bytes): string | null {
  const printable = bytes.filter((byte) => byte >= PRINTABLE_ASCII.min && byte <= PRINTABLE_ASCII.max);
  const text = String.fromCharCode(...printable)
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 0 ? text : null;
}

export function encodePowerCommand(command: PowerCommand): Bytes {
  return [POWER_COMMAND_BYTE[command]];
}

export function encodeIdentify(): Bytes {
  return [IDENTIFY_BYTE];
}

export function targetStateFor(command: PowerCommand): PowerState {
  return command;
}
