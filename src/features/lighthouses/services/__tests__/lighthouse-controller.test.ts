import { getLighthouseClient, setTransportMode } from '@/core/ble';
import { DEFAULT_PREFERENCES, hideLighthouse, setPreference, usePreferencesStore } from '@/core/preferences';

import { initialLighthousesState, setLighthouseState, useLighthousesStore } from '../../store/lighthouses.store';
import { loadDetails, refreshPowerState, setPower, setPowerAll, startScan, stopScan } from '../lighthouse-controller';

const SLEEPING = 'MOCK-LHB-1A2B3C4D';

describe('lighthouse controller (debug mode)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setTransportMode('mock');
    useLighthousesStore.setState(initialLighthousesState, true);
    usePreferencesStore.setState(DEFAULT_PREFERENCES, true);
  });

  afterEach(() => {
    stopScan();
    setTransportMode('native');
    jest.useRealTimers();
  });

  it('discovers the simulated lighthouses and reads their power state', async () => {
    const scan = startScan();
    expect(useLighthousesStore.getState().scan.status).toBe('scanning');

    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    const { devices, scan: status } = useLighthousesStore.getState();
    expect(status).toEqual({ status: 'idle', error: null });
    expect(Object.values(devices).map((d) => [d.name, d.state])).toEqual([
      ['LHB-1A2B3C4D', 'sleep'],
      ['LHB-5E6F7A8B', 'standby'],
      ['LHB-9C0D1E2F', 'on'],
    ]);
  });

  it('tracks a power command until the lighthouse is on', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    const command = setPower(SLEEPING, 'on');
    expect(useLighthousesStore.getState().commands[SLEEPING]?.status).toBe('pending');

    await jest.advanceTimersByTimeAsync(10_000);
    await command;

    const state = useLighthousesStore.getState();
    expect(state.devices[SLEEPING]?.state).toBe('on');
    expect(state.commands[SLEEPING]).toEqual({ status: 'idle', error: null });
  });

  it('turns every lighthouse on at once, then goes back to idle', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    const all = setPowerAll('on');
    expect(useLighthousesStore.getState().fleet).toMatchObject({ status: 'pending', command: 'on' });
    await jest.advanceTimersByTimeAsync(15_000);
    await all;

    const { devices, fleet, commands } = useLighthousesStore.getState();
    expect(Object.values(devices).map((device) => device.state)).toEqual(['on', 'on', 'on']);
    expect(fleet).toEqual({ status: 'idle', command: null, scopeIds: [] });
    expect(Object.values(commands).every((command) => command.status === 'idle')).toBe(true);
  });

  it('only commands the lighthouses of the given scope', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;
    const writePower = jest.spyOn(getLighthouseClient(), 'writePower');

    const group = setPowerAll('on', [SLEEPING, 'MOCK-LHB-9C0D1E2F', 'gone']);
    expect(useLighthousesStore.getState().fleet.scopeIds).toEqual([SLEEPING, 'MOCK-LHB-9C0D1E2F']);
    await jest.advanceTimersByTimeAsync(15_000);
    await group;

    expect(writePower).toHaveBeenCalledTimes(1);
    expect(writePower).toHaveBeenCalledWith(SLEEPING, 'on');
    expect(useLighthousesStore.getState().devices['MOCK-LHB-5E6F7A8B']?.state).toBe('standby');
    writePower.mockRestore();
  });

  it('reads the details of a lighthouse once per session unless forced', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;
    const readDetails = jest.spyOn(getLighthouseClient(), 'readDetails');

    const first = loadDetails(SLEEPING);
    expect(useLighthousesStore.getState().details[SLEEPING]?.status).toBe('loading');
    await jest.advanceTimersByTimeAsync(2_000);
    await first;
    await loadDetails(SLEEPING);

    expect(readDetails).toHaveBeenCalledTimes(1);
    expect(useLighthousesStore.getState().details[SLEEPING]).toEqual({
      status: 'ready',
      data: expect.objectContaining({ channel: 1, serial: 'FB01A2B3C4 V001017-20.A' }),
    });

    const forced = loadDetails(SLEEPING, { force: true });
    await jest.advanceTimersByTimeAsync(2_000);
    await forced;
    expect(readDetails).toHaveBeenCalledTimes(2);
    readDetails.mockRestore();
  });

  it('stores the channel read with the power state', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    expect(useLighthousesStore.getState().devices[SLEEPING]?.channel).toBe(1);
    expect(useLighthousesStore.getState().devices['MOCK-LHB-9C0D1E2F']?.channel).toBe(3);
  });

  it('never connects to hidden lighthouses while scanning', async () => {
    hideLighthouse(SLEEPING, 'LHB-1A2B3C4D');
    const readStatus = jest.spyOn(getLighthouseClient(), 'readStatus');

    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    expect(readStatus).not.toHaveBeenCalledWith(SLEEPING);
    expect(readStatus).toHaveBeenCalledTimes(2);
    readStatus.mockRestore();
  });

  it('honours the scan duration preference', async () => {
    setPreference('scanDurationSeconds', 5);
    const scan = startScan();

    await jest.advanceTimersByTimeAsync(5_500);

    expect(useLighthousesStore.getState().scan.status).toBe('idle');
    await scan;
  });

  it('marks every lighthouse of a fleet command pending before writing', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    const all = setPowerAll('on', [SLEEPING, 'MOCK-LHB-5E6F7A8B']);
    const { commands } = useLighthousesStore.getState();
    expect(commands[SLEEPING]?.status).toBe('pending');
    expect(commands['MOCK-LHB-5E6F7A8B']?.status).toBe('pending');
    await jest.advanceTimersByTimeAsync(15_000);
    await all;
  });

  it('keeps the previous details and reports an error when reading again fails', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;
    const first = loadDetails(SLEEPING);
    await jest.advanceTimersByTimeAsync(2_000);
    await first;
    const previous = useLighthousesStore.getState().details[SLEEPING]?.data;
    const readDetails = jest.spyOn(getLighthouseClient(), 'readDetails').mockRejectedValueOnce(new Error('lost'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await loadDetails(SLEEPING, { force: true });

    expect(previous).toEqual(expect.objectContaining({ serial: 'FB01A2B3C4 V001017-20.A' }));
    expect(useLighthousesStore.getState().details[SLEEPING]).toEqual({ status: 'error', data: previous });
    readDetails.mockRestore();
    warn.mockRestore();
  });

  it('stops a fleet command when switching between real and simulated stations', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;

    const all = setPowerAll('on');
    await jest.advanceTimersByTimeAsync(200);
    setTransportMode('native');
    await jest.advanceTimersByTimeAsync(20_000);
    await all;

    expect(useLighthousesStore.getState()).toMatchObject({ devices: {}, commands: {}, fleet: { status: 'idle' } });
    setTransportMode('mock');
  });

  it('refreshes lighthouses already listed when scanning again', async () => {
    const firstScan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await firstScan;
    setLighthouseState(SLEEPING, 'unknown');

    const secondScan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await secondScan;

    expect(useLighthousesStore.getState().devices[SLEEPING]?.state).toBe('sleep');
  });

  it('keeps at most one state read in flight per lighthouse', async () => {
    const readStatus = jest.spyOn(getLighthouseClient(), 'readStatus');

    const first = refreshPowerState(SLEEPING);
    const second = refreshPowerState(SLEEPING);
    await jest.advanceTimersByTimeAsync(2_000);
    await Promise.all([first, second]);

    expect(readStatus).toHaveBeenCalledTimes(1);
    readStatus.mockRestore();
  });

  it('reports an error when a power command never reaches its target', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;
    const setPowerSpy = jest.spyOn(getLighthouseClient(), 'setPower').mockResolvedValueOnce('standby');

    await setPower(SLEEPING, 'on');

    expect(useLighthousesStore.getState().commands[SLEEPING]).toEqual({ status: 'error', error: 'notReached' });
    setPowerSpy.mockRestore();
  });

  it('treats a lighthouse still booting as progressing and reads it again later', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;
    const setPowerSpy = jest.spyOn(getLighthouseClient(), 'setPower').mockResolvedValueOnce('booting');
    const readStatus = jest.spyOn(getLighthouseClient(), 'readStatus');

    await setPower(SLEEPING, 'on');
    expect(useLighthousesStore.getState().commands[SLEEPING]).toEqual({ status: 'idle', error: null });

    await jest.advanceTimersByTimeAsync(6_000);
    expect(readStatus).toHaveBeenCalledWith(SLEEPING);
    setPowerSpy.mockRestore();
    readStatus.mockRestore();
  });

  it('reports a fleet station that never reaches its target', async () => {
    const scan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await scan;
    const readPowerState = jest.spyOn(getLighthouseClient(), 'readPowerState').mockResolvedValue('standby');

    const all = setPowerAll('on', [SLEEPING]);
    await jest.advanceTimersByTimeAsync(20_000);
    await all;

    expect(useLighthousesStore.getState().commands[SLEEPING]).toEqual({ status: 'error', error: 'notReached' });
    readPowerState.mockRestore();
  });

  it('keeps a command from a previous transport session out of the next one', async () => {
    const firstScan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await firstScan;
    const stale = setPower(SLEEPING, 'on');
    await jest.advanceTimersByTimeAsync(200);

    setTransportMode('native');
    setTransportMode('mock');
    const secondScan = startScan();
    await jest.advanceTimersByTimeAsync(12_000);
    await Promise.all([stale, secondScan]);

    const state = useLighthousesStore.getState();
    expect(state.devices[SLEEPING]?.state).toBe('sleep');
    expect(state.commands[SLEEPING]).toBeUndefined();
  });
});
