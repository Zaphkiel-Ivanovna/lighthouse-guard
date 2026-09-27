import { POWER_COMMAND_BYTE, POWER_STATE_BYTE } from '../constants';
import {
  decodeChannel,
  decodePowerState,
  decodeText,
  encodeIdentify,
  encodePowerCommand,
  isLighthouseName,
  targetStateFor,
} from '../lighthouse-v2';

describe('Lighthouse V2 protocol', () => {
  it.each([
    [POWER_STATE_BYTE.sleep, 'sleep'],
    [POWER_STATE_BYTE.standby, 'standby'],
    [POWER_STATE_BYTE.booting, 'booting'],
    [POWER_STATE_BYTE.awake, 'on'],
    [POWER_STATE_BYTE.awakeFromSleep, 'on'],
    [POWER_STATE_BYTE.awakeFromStandby, 'on'],
  ])('decodes power byte 0x%s as %s', (byte, state) => {
    expect(decodePowerState([byte])).toBe(state);
  });

  it('reports a station woken by SteamVR from sleep (0x09) as on, not booting', () => {
    expect(decodePowerState([0x09])).toBe('on');
  });

  it('decodes unknown or empty payloads as unknown instead of throwing', () => {
    expect(decodePowerState([0xff])).toBe('unknown');
    expect(decodePowerState([])).toBe('unknown');
  });

  it('encodes power commands as a single byte', () => {
    expect(encodePowerCommand('on')).toEqual([POWER_COMMAND_BYTE.on]);
    expect(encodePowerCommand('standby')).toEqual([POWER_COMMAND_BYTE.standby]);
    expect(encodePowerCommand('sleep')).toEqual([POWER_COMMAND_BYTE.sleep]);
  });

  it('encodes identify as 0x00', () => {
    expect(encodeIdentify()).toEqual([0x00]);
  });

  it('maps each command to the state the lighthouse settles in', () => {
    expect(targetStateFor('on')).toBe('on');
    expect(targetStateFor('standby')).toBe('standby');
    expect(targetStateFor('sleep')).toBe('sleep');
  });

  it('recognises lighthouses by their LHB- advertised name', () => {
    expect(isLighthouseName('LHB-1A2B3C4D')).toBe(true);
    expect(isLighthouseName('HTC BS 1234')).toBe(false);
    expect(isLighthouseName(null)).toBe(false);
  });

  it.each([
    [[0x01], 1],
    [[0x10], 16],
    [[0x00], null],
    [[0x11], null],
    [[], null],
  ])('decodes channel bytes %j as %p', (bytes, channel) => {
    expect(decodeChannel(bytes)).toBe(channel);
  });

  it('decodes device information strings, dropping padding and control bytes', () => {
    expect(decodeText([0x31, 0x2e, 0x32, 0x00, 0x00])).toBe('1.2');
    expect(decodeText([0x20, 0x56, 0x0a, 0x61, 0x20, 0x20, 0x6c, 0x76, 0x65, 0x20])).toBe('Va lve');
    expect(decodeText([0x00, 0xff])).toBeNull();
  });
});
