import { POWER_COMMAND_BYTE, POWER_STATE_BYTE } from '../constants';
import {
  decodePowerState,
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
    [POWER_STATE_BYTE.bootingSpinUp, 'booting'],
    [POWER_STATE_BYTE.bootingLaser, 'booting'],
    [POWER_STATE_BYTE.on, 'on'],
  ])('decodes power byte 0x%s as %s', (byte, state) => {
    expect(decodePowerState([byte])).toBe(state);
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
});
