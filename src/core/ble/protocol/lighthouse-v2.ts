import { IDENTIFY_BYTE, LIGHTHOUSE_NAME_PREFIX, POWER_COMMAND_BYTE, POWER_STATE_BYTE } from './constants';
import type { Bytes } from '../transport/ble-transport';

export type PowerState = 'on' | 'standby' | 'sleep' | 'booting' | 'unknown';
export type PowerCommand = keyof typeof POWER_COMMAND_BYTE;

const STATE_BY_BYTE: ReadonlyMap<number, PowerState> = new Map([
  [POWER_STATE_BYTE.sleep, 'sleep'],
  [POWER_STATE_BYTE.standby, 'standby'],
  [POWER_STATE_BYTE.booting, 'booting'],
  [POWER_STATE_BYTE.bootingSpinUp, 'booting'],
  [POWER_STATE_BYTE.bootingLaser, 'booting'],
  [POWER_STATE_BYTE.on, 'on'],
]);

export function isLighthouseName(name: string | null | undefined): name is string {
  return typeof name === 'string' && name.startsWith(LIGHTHOUSE_NAME_PREFIX);
}

/** Total decoder: empty or unrecognised payloads map to `unknown`. */
export function decodePowerState(bytes: Bytes): PowerState {
  const [first] = bytes;
  return first === undefined ? 'unknown' : (STATE_BY_BYTE.get(first) ?? 'unknown');
}

export function encodePowerCommand(command: PowerCommand): Bytes {
  return [POWER_COMMAND_BYTE[command]];
}

export function encodeIdentify(): Bytes {
  return [IDENTIFY_BYTE];
}

/** The state a lighthouse settles in once `command` has been applied. */
export function targetStateFor(command: PowerCommand): PowerState {
  return command;
}
